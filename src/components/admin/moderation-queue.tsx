"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Camera,
  Check,
  MessageSquare,
  User,
  X,
} from "lucide-react";

/**
 * ModerationQueue is a placeholder component for content moderation.
 * In production, this would connect to a dedicated moderation API.
 * Currently it shows the UI structure for Photos / Messages / Profiles tabs.
 */
export function ModerationQueue() {
  const [activeTab, setActiveTab] = useState("photos");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/[0.04] border border-white/[0.06]">
          <TabsTrigger
            value="photos"
            className="gap-2 text-xs data-[state=active]:bg-[#c2185b]/20 data-[state=active]:text-[#c2185b]"
          >
            <Camera className="h-3.5 w-3.5" />
            Photos
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="gap-2 text-xs data-[state=active]:bg-[#c2185b]/20 data-[state=active]:text-[#c2185b]"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Messages
          </TabsTrigger>
          <TabsTrigger
            value="profiles"
            className="gap-2 text-xs data-[state=active]:bg-[#c2185b]/20 data-[state=active]:text-[#c2185b]"
          >
            <User className="h-3.5 w-3.5" />
            Profiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <EmptyModerationState
            icon={Camera}
            label="No photos pending review"
            description="All photos have been reviewed. New uploads will appear here."
          />
        </TabsContent>

        <TabsContent value="messages">
          <EmptyModerationState
            icon={MessageSquare}
            label="No reported messages"
            description="Reported messages will appear here for review."
          />
        </TabsContent>

        <TabsContent value="profiles">
          <EmptyModerationState
            icon={User}
            label="No flagged profiles"
            description="Flagged profiles will appear here for review."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyModerationState({
  icon: Icon,
  label,
  description,
}: {
  icon: typeof Camera;
  label: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] py-16">
      <div className="rounded-full bg-white/[0.04] p-4">
        <Icon className="h-8 w-8 text-zinc-600" />
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-400">{label}</p>
      <p className="mt-1 text-xs text-zinc-600">{description}</p>
    </div>
  );
}
