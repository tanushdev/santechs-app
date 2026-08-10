"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, Check, Loader2, MessageSquare, ShieldCheck, Tag, Info, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsList() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "page", filter],
    queryFn: async () => {
      const url = filter === "unread" ? "/api/notifications?unread=true&limit=50" : "/api/notifications?limit=50";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (payload: { ids?: string[]; markAll?: boolean }) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleMarkAllRead = () => {
    markReadMutation.mutate({ markAll: true });
  };

  const handleMarkSingleRead = (id: string) => {
    markReadMutation.mutate({ ids: [id] });
  };

  const notifications: NotificationItem[] = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "SELLER_APPROVED":
      case "SELLER_REJECTED":
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case "NEW_ENQUIRY":
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case "DEAL_CLOSED":
        return <Tag className="w-5 h-5 text-[#ff7759]" />;
      default:
        return <Bell className="w-5 h-5 text-[#75758a]" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
            <Bell className="w-4 h-4 text-black" />
            <span>Alert Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-black font-sans">
            Notifications
          </h1>
          <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
            Keep track of broker deal updates, buyer messages, quotes requests, and account verification status logs.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            disabled={markReadMutation.isPending}
            variant="outline"
            className="rounded-full h-10 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer self-start sm:self-center"
          >
            {markReadMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            filter === "all"
              ? "border-[#ff7759] text-black"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            filter === "unread"
              ? "border-[#ff7759] text-black"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <Badge className="bg-[#ff7759] text-white border-0 text-[10px] h-5 min-w-5 flex items-center justify-center rounded-full p-0">
              {unreadCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff7759]" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 border border-[#e5e7eb] rounded-2xl bg-slate-50/50">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-black font-sans mb-1">All Caught Up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don&apos;t have any notifications at the moment. We&apos;ll alert you when updates arrive.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`border rounded-2xl p-5 transition-all flex gap-4 ${
                item.isRead
                  ? "bg-white border-[#e5e7eb] hover:border-slate-350"
                  : "bg-[#ff7759]/5 border-[#ff7759]/20 shadow-xs hover:border-[#ff7759]/30"
              }`}
            >
              {/* Icon Container */}
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                {getIcon(item.type)}
              </div>

              {/* Text Context */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-black font-sans leading-normal">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {item.message}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-1.5">
                  {item.link && (
                    <Link
                      href={item.link}
                      onClick={() => !item.isRead && handleMarkSingleRead(item._id)}
                      className="text-xs font-bold text-[#ff7759] hover:underline"
                    >
                      View Details →
                    </Link>
                  )}
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkSingleRead(item._id)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
