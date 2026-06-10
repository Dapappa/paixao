"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, CaretDown } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

interface EventRulesDisplayProps {
  rules: string[];
  consentRequirements: string[];
  className?: string;
}

export function EventRulesDisplay({
  rules,
  consentRequirements,
  className,
}: EventRulesDisplayProps) {
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [consentExpanded, setConsentExpanded] = useState(false);

  const COLLAPSE_THRESHOLD = 5;

  const visibleRules =
    rulesExpanded || rules.length <= COLLAPSE_THRESHOLD
      ? rules
      : rules.slice(0, COLLAPSE_THRESHOLD);
  const visibleConsent =
    consentExpanded || consentRequirements.length <= COLLAPSE_THRESHOLD
      ? consentRequirements
      : consentRequirements.slice(0, COLLAPSE_THRESHOLD);

  if (rules.length === 0 && consentRequirements.length === 0) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Rules Section */}
      {rules.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield weight="duotone" className="h-5 w-5 text-[var(--color-accent)]" />
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Event Rules
            </h3>
          </div>

          <ol className="space-y-2">
            <AnimatePresence>
              {visibleRules.map((rule, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-3 rounded-lg bg-[var(--color-surface-elevated)] p-3 border border-border"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-xs font-bold text-[var(--color-accent)]">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-foreground leading-relaxed">
                    {rule}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>

          {rules.length > COLLAPSE_THRESHOLD && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRulesExpanded(!rulesExpanded)}
              className="mt-2 text-muted-foreground hover:text-foreground"
            >
              <CaretDown
                weight="bold"
                className={cn(
                  "mr-1 h-4 w-4 transition-transform",
                  rulesExpanded && "rotate-180"
                )}
              />
              {rulesExpanded
                ? "Show less"
                : `Show all ${rules.length} rules`}
            </Button>
          )}
        </div>
      )}

      {/* Consent Requirements Section */}
      {consentRequirements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle weight="duotone" className="h-5 w-5 text-[var(--color-gold)]" />
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Consent Requirements
            </h3>
          </div>

          <ul className="space-y-2">
            <AnimatePresence>
              {visibleConsent.map((req, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 rounded-lg bg-[var(--color-gold-muted)] p-3 border border-[var(--color-gold)]/20"
                >
                  <CheckCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold)]" />
                  <span className="text-sm text-foreground leading-relaxed">
                    {req}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {consentRequirements.length > COLLAPSE_THRESHOLD && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConsentExpanded(!consentExpanded)}
              className="mt-2 text-muted-foreground hover:text-foreground"
            >
              <CaretDown
                weight="bold"
                className={cn(
                  "mr-1 h-4 w-4 transition-transform",
                  consentExpanded && "rotate-180"
                )}
              />
              {consentExpanded
                ? "Show less"
                : `Show all ${consentRequirements.length} requirements`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
