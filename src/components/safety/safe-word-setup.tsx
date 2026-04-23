"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Info,
  Loader2,
  CheckCircle2,
  Trash2,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useSafety, type SafeWordRecord } from "@/lib/hooks/use-safety";
import type { SafeWordInput } from "@/lib/utils/validators";

/* ─────────────────────────────────────────────
   SafeWordSetup — configuration form
   ───────────────────────────────────────────── */

interface SafeWordSetupProps {
  className?: string;
}

export function SafeWordSetup({ className }: SafeWordSetupProps) {
  const { getSafeWords, updateSafeWord, loading } = useSafety();

  const [safeWord, setSafeWord] = useState("");
  const [actionOnTrigger, setActionOnTrigger] = useState<
    "alert" | "exit_event" | "notify_emergency"
  >("alert");
  const [contactName, setContactName] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "sms">("sms");
  const [contactValue, setContactValue] = useState("");
  const [existingWords, setExistingWords] = useState<SafeWordRecord[]>([]);
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const words = await getSafeWords();
      setExistingWords(words);

      // Pre-fill if there's an existing record
      if (words.length > 0) {
        const w = words[0];
        setSafeWord(w.safe_word_hash || "");
        setActionOnTrigger(
          (w.action_on_trigger as "alert" | "exit_event" | "notify_emergency") ||
            "alert"
        );
        setContactName(w.emergency_contact_name || "");
        setContactMethod(
          (w.emergency_contact_method as "email" | "sms") || "sms"
        );
        setContactValue(w.emergency_contact_value || "");
      }
      setInitialLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSuccess(false);

    const data: SafeWordInput = {
      safe_word: safeWord,
      action_on_trigger: actionOnTrigger,
      emergency_contact_name: contactName || undefined,
      emergency_contact_method:
        actionOnTrigger === "notify_emergency" ? contactMethod : undefined,
      emergency_contact_value:
        actionOnTrigger === "notify_emergency" ? contactValue || undefined : undefined,
    };

    const ok = await updateSafeWord(data);
    if (ok) {
      setSuccess(true);
      const words = await getSafeWords();
      setExistingWords(words);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (initialLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-[#c2185b]" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#d4a574]/20 bg-[#d4a574]/5 p-4"
      >
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a574]" />
          <div className="text-sm text-[#d4a574]/80">
            <p className="mb-1 font-medium text-[#d4a574]">
              How safe words work
            </p>
            <p>
              A safe word is a secret phrase you can use in conversations or at
              events to discreetly signal that you need help. When triggered,
              the system will take your chosen action automatically — whether
              that is alerting moderators, exiting an event, or notifying your
              emergency contact.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Safe word input */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="safe-word" className="text-foreground">
            Your Safe Word
          </Label>
          <Input
            id="safe-word"
            value={safeWord}
            onChange={(e) => setSafeWord(e.target.value)}
            placeholder="Enter your safe word..."
            maxLength={50}
            className="mt-1.5 border-zinc-800 bg-zinc-900/50 focus:border-[#c2185b]"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Choose something unique that you would not use in normal
            conversation.
          </p>
        </div>

        {/* Action on trigger */}
        <div>
          <Label className="text-foreground">Action When Triggered</Label>
          <Select
            value={actionOnTrigger}
            onValueChange={(v) =>
              setActionOnTrigger(
                v as "alert" | "exit_event" | "notify_emergency"
              )
            }
          >
            <SelectTrigger className="mt-1.5 border-zinc-800 bg-zinc-900/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-[#0a0a0a]">
              <SelectItem value="alert">
                Alert moderators
              </SelectItem>
              <SelectItem value="exit_event">
                Exit event immediately
              </SelectItem>
              <SelectItem value="notify_emergency">
                Notify emergency contact
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Emergency contact (shown when notify_emergency is selected) */}
        {actionOnTrigger === "notify_emergency" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4"
          >
            <h4 className="text-sm font-medium text-foreground">
              Emergency Contact
            </h4>

            <div>
              <Label htmlFor="contact-name" className="text-xs text-muted-foreground">
                Contact Name
              </Label>
              <Input
                id="contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Name"
                className="mt-1 border-zinc-800 bg-zinc-900/50"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">
                Contact Method
              </Label>
              <Select
                value={contactMethod}
                onValueChange={(v) => setContactMethod(v as "email" | "sms")}
              >
                <SelectTrigger className="mt-1 border-zinc-800 bg-zinc-900/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-[#0a0a0a]">
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contact-value" className="text-xs text-muted-foreground">
                {contactMethod === "sms" ? "Phone Number" : "Email Address"}
              </Label>
              <Input
                id="contact-value"
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  contactMethod === "sms"
                    ? "+1 (555) 000-0000"
                    : "email@example.com"
                }
                className="mt-1 border-zinc-800 bg-zinc-900/50"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={loading || !safeWord.trim()}
          className="bg-[#c2185b] text-white hover:bg-[#c2185b]/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Safe Word
            </>
          )}
        </Button>

        {success && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-sm text-emerald-400"
          >
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </motion.span>
        )}
      </div>

      {/* Existing safe words list */}
      {existingWords.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Your Safe Words
          </h4>
          {existingWords.map((word) => (
            <div
              key={word.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-[#c2185b]" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {word.safe_word_hash}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Action:{" "}
                    {word.action_on_trigger === "alert"
                      ? "Alert moderators"
                      : word.action_on_trigger === "exit_event"
                        ? "Exit event"
                        : "Notify emergency contact"}
                    {word.is_active ? (
                      <span className="ml-2 text-emerald-400">Active</span>
                    ) : (
                      <span className="ml-2 text-zinc-500">Inactive</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
