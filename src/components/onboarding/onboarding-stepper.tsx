"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "@phosphor-icons/react/ssr";

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function OnboardingStepper({
  currentStep,
  totalSteps,
  labels,
}: OnboardingStepperProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="h-1 w-full rounded-full bg-[var(--color-border)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)]"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Step indicators */}
        <div className="absolute -top-3 left-0 right-0 flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                    backgroundColor: isCompleted
                      ? "var(--color-accent)"
                      : isCurrent
                      ? "var(--color-surface-elevated)"
                      : "var(--color-surface)",
                    borderColor: isCompleted || isCurrent
                      ? "var(--color-accent)"
                      : "var(--color-border)",
                  }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold"
                  )}
                >
                  {isCompleted ? (
                    <Check weight="bold" className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <span
                      className={cn(
                        isCurrent
                          ? "text-[var(--color-accent)]"
                          : "text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </motion.div>
                <span
                  className={cn(
                    "mt-2 text-[11px] font-medium hidden sm:block",
                    isCurrent
                      ? "text-[var(--color-accent)]"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {labels[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
