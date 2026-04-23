import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, handleSubscriptionActive, handleSubscriptionCanceled } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';

/* ─────────────────────────────────────────────
   POST /api/payments/webhook
   Stripe webhook handler — NO auth check.
   Uses the admin (service-role) Supabase client.
   ───────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      /* ── Checkout completed ────────────────── */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const tierId = session.metadata?.tier_id;

        if (!userId || !tierId) {
          console.warn('Checkout session missing metadata:', session.id);
          break;
        }

        // Update subscription tier
        await (admin.from('profiles') as any)
          .update({ subscription_tier: tierId })
          .eq('id', userId);

        // Record payment
        await (admin.from('payments') as any).insert({
          profile_id: userId,
          stripe_payment_intent_id: session.payment_intent as string | null,
          stripe_customer_id: session.customer as string | null,
          amount_cents: session.amount_total ?? 0,
          currency: session.currency ?? 'usd',
          payment_type: 'subscription',
          reference_id: session.subscription as string | null,
          status: 'succeeded',
        });

        // Insert notification
        await (admin.from('notifications') as any).insert({
          user_id: userId,
          type: 'subscription_confirmed',
          title: 'Subscription Activated',
          body: `Your ${tierId.charAt(0).toUpperCase() + tierId.slice(1)} plan is now active. Welcome to the experience.`,
          data: { tier_id: tierId },
          created_at: new Date().toISOString(),
        });

        // If the subscription object is available, update expiry
        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(
              session.subscription as string,
            );
            await handleSubscriptionActive(sub, userId, tierId);
          } catch {
            // Expiry will be set on the next subscription.updated event
          }
        }
        break;
      }

      /* ── Subscription updated (plan change) ─ */
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const tierId = subscription.metadata?.tier_id;

        if (userId && tierId) {
          await handleSubscriptionActive(subscription, userId, tierId);
        }
        break;
      }

      /* ── Subscription deleted / canceled ──── */
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await handleSubscriptionCanceled(userId);

          // Notify user
          await (admin.from('notifications') as any).insert({
            user_id: userId,
            type: 'subscription_expiring',
            title: 'Subscription Ended',
            body: 'Your subscription has been canceled. You can re-subscribe any time from the pricing page.',
            data: {},
            created_at: new Date().toISOString(),
          });
        }
        break;
      }

      /* ── Invoice payment failed ────────────── */
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          // Look up user by stripe_customer_id in payments table
          const { data: payment } = await (admin.from('payments') as any)
            .select('profile_id')
            .eq('stripe_customer_id', customerId)
            .limit(1)
            .single();

          if (payment?.profile_id) {
            await (admin.from('notifications') as any).insert({
              user_id: payment.profile_id,
              type: 'payment_failed',
              title: 'Payment Failed',
              body: 'We could not process your subscription payment. Please update your payment method to continue your membership.',
              data: { invoice_id: invoice.id },
              created_at: new Date().toISOString(),
            });
          }
        }
        break;
      }

      default:
        // Unhandled event type — acknowledge and move on
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
