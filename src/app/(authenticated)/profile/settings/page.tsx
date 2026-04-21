"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/hooks/use-auth";
import { useProfile } from "@/lib/hooks/use-profile";
import { subscriptionTiers, formatPrice } from "@/config/subscription-tiers";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  CreditCard,
  Eye,
  Key,
  Lock,
  Mail,
  Shield,
  Sparkles,
  Star,
  Trash2,
  User,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();

  // Account
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Privacy
  const [visibility, setVisibility] = useState(
    profile?.profile_visibility || "visible"
  );

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Delete account
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEmailChange = async () => {
    if (!newEmail) return;
    setEmailSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setNewEmail("");
      alert("Check your new email for a confirmation link.");
    } catch (error) {
      console.error("Failed to update email:", error);
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    setPasswordSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password updated successfully.");
    } catch (error) {
      console.error("Failed to update password:", error);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleVisibilityChange = async (value: "visible" | "hidden" | "matches_only") => {
    setVisibility(value);
    try {
      await updateProfile({
        profile_visibility: value as "visible" | "hidden" | "matches_only",
      });
    } catch (error) {
      console.error("Failed to update visibility:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    try {
      // In production, this would call a server action that uses the admin client
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const currentTier = subscriptionTiers.find(
    (t) => t.id === (profile?.subscription_tier || "curious")
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6 lg:p-8 max-w-3xl"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </motion.div>

      {/* Subscription */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          {currentTier && currentTier.id !== "curious" && (
            <div className="h-1 w-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-gold)]" />
          )}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[var(--color-accent)]" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    currentTier?.color === "gold"
                      ? "bg-[var(--color-gold)]/15"
                      : currentTier?.color === "accent"
                      ? "bg-[var(--color-accent)]/15"
                      : "bg-[var(--color-surface-elevated)]"
                  )}
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      currentTier?.color === "gold"
                        ? "text-[var(--color-gold)]"
                        : currentTier?.color === "accent"
                        ? "text-[var(--color-accent)]"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {currentTier?.name || "Curious"} Tier
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentTier?.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {formatPrice(currentTier?.monthlyPrice || 0)}
                </p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </div>

            {currentTier?.id === "curious" && (
              <div className="rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                  <span className="text-sm font-semibold text-[var(--color-accent)]">
                    Upgrade to unlock more
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Get unlimited messages, priority matching, anonymous mode, and
                  more with the Desire tier.
                </p>
                <Button
                  size="sm"
                  className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                >
                  View Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Account */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--color-accent)]" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current email */}
            <div>
              <Label className="text-xs text-muted-foreground">
                Current Email
              </Label>
              <p className="text-sm text-foreground mt-1">
                {user?.email || "Not set"}
              </p>
            </div>

            <Separator className="bg-[var(--color-border)]" />

            {/* Change email */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Change Email
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="New email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
                />
                <Button
                  onClick={handleEmailChange}
                  disabled={!newEmail || emailSaving}
                  size="sm"
                  className="shrink-0 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                >
                  {emailSaving ? <LoadingSpinner size="sm" /> : "Update"}
                </Button>
              </div>
            </div>

            <Separator className="bg-[var(--color-border)]" />

            {/* Change password */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Key className="h-3.5 w-3.5" />
                Change Password
              </Label>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
                />
                <Button
                  onClick={handlePasswordChange}
                  disabled={!newPassword || !confirmPassword || passwordSaving}
                  size="sm"
                  className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                >
                  {passwordSaving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-[var(--color-accent)]" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <Select value={visibility} onValueChange={(val) => handleVisibilityChange(val as "visible" | "hidden" | "matches_only")}>
                <SelectTrigger className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                  <SelectItem value="visible">
                    Visible to all members
                  </SelectItem>
                  <SelectItem value="hidden">
                    Hidden (invisible to everyone)
                  </SelectItem>
                  <SelectItem value="matches_only">
                    Matches only
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Controls who can see your profile in search and browse.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-[var(--color-accent)]" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Email Notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Receive important updates via email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                className="data-[state=checked]:bg-[var(--color-accent)]"
              />
            </div>

            <Separator className="bg-[var(--color-border)]" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  New Matches
                </p>
                <p className="text-xs text-muted-foreground">
                  When someone matches with you
                </p>
              </div>
              <Switch
                checked={matchNotifications}
                onCheckedChange={setMatchNotifications}
                className="data-[state=checked]:bg-[var(--color-accent)]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Messages
                </p>
                <p className="text-xs text-muted-foreground">
                  When you receive a new message
                </p>
              </div>
              <Switch
                checked={messageNotifications}
                onCheckedChange={setMessageNotifications}
                className="data-[state=checked]:bg-[var(--color-accent)]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Events
                </p>
                <p className="text-xs text-muted-foreground">
                  Event reminders and updates
                </p>
              </div>
              <Switch
                checked={eventNotifications}
                onCheckedChange={setEventNotifications}
                className="data-[state=checked]:bg-[var(--color-accent)]"
              />
            </div>

            <Separator className="bg-[var(--color-border)]" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Marketing Emails
                </p>
                <p className="text-xs text-muted-foreground">
                  Tips, features, and community updates
                </p>
              </div>
              <Switch
                checked={marketingEmails}
                onCheckedChange={setMarketingEmails}
                className="data-[state=checked]:bg-[var(--color-accent)]"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={item}>
        <Card className="border-[var(--color-danger)]/20 bg-[var(--color-surface)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-[var(--color-danger)]">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-4">
              <p className="text-sm font-medium text-foreground mb-1">
                Delete Account
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Permanently delete your account, profile, photos, messages, and
                all associated data. This action cannot be undone.
              </p>
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      Are you absolutely sure?
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      This will permanently delete your account and all
                      associated data. Type <strong>DELETE</strong> to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]"
                  />
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowDeleteDialog(false);
                        setDeleteConfirmation("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== "DELETE"}
                      className="bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90"
                    >
                      Delete Forever
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
