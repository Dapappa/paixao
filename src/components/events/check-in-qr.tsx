"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDots, QrCode } from "@phosphor-icons/react/ssr";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface CheckInQRProps {
  eventTitle: string;
  eventDate: string;
  checkInCode: string;
  className?: string;
}

export function CheckInQR({
  eventTitle,
  eventDate,
  checkInCode,
  className,
}: CheckInQRProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("w-full max-w-sm mx-auto", className)}
    >
      <Card className="overflow-hidden border-[var(--color-accent)]/30 bg-surface">
        {/* Header band */}
        <div className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] px-6 py-4">
          <div className="flex items-center gap-2 mb-1">
            <QrCode weight="light" className="h-4 w-4 text-white/80" />
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
              Check-in Pass
            </span>
          </div>
          <h3 className="font-serif text-lg font-bold text-white leading-tight line-clamp-2">
            {eventTitle}
          </h3>
        </div>

        <CardContent className="flex flex-col items-center gap-4 p-6">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDots className="h-3.5 w-3.5" />
            <span>
              {format(new Date(eventDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </span>
          </div>

          {/* QR Code */}
          <div className="rounded-xl bg-white p-4 shadow-lg">
            <QRCodeSVG
              value={checkInCode}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#0a0a0a"
              bgColor="#ffffff"
            />
          </div>

          {/* Check-in code text */}
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Check-in Code
            </p>
            <Badge
              variant="outline"
              className="font-mono text-sm px-3 py-1 border-border"
            >
              {checkInCode.slice(0, 8).toUpperCase()}
            </Badge>
          </div>

          {/* Instruction */}
          <p className="text-xs text-center text-muted-foreground mt-2">
            Show this QR code to the host at check-in
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
