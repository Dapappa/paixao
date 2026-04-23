"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportForm } from "@/components/safety/report-form";

export function ReportPageClient() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Back link */}
      <Link href="/safety">
        <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Safety Center
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#c2185b]" />
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Report an Issue
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your report is confidential. We take every report seriously and our
          moderation team will review it within 24 hours.
        </p>
      </div>

      {/* Full-page report form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
        <ReportForm asDialog={false} />
      </div>
    </motion.div>
  );
}
