"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Bell, Search, ExternalLink, MessageCircle, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Notification {
  id: number;
  type: 'lead' | 'message' | 'system';
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const sampleNotifications: Notification[] = [
  {
    id: 1,
    type: 'lead',
    title: 'High-Match Opportunity Found',
    description: 'A new "Senior UX Designer" role matching your profile was found on LinkedIn.',
    time: '12m ago',
    unread: true
  },
  {
    id: 2,
    type: 'message',
    title: 'New message from Sarah Chen',
    description: '"Hi! Loving the brand concepts. Can we discuss on Tuesday?"',
    time: '2h ago',
    unread: true
  },
  {
    id: 3,
    type: 'system',
    title: 'Weekly Report Ready',
    description: 'Your revenue and capacity report for the last week is now available.',
    time: '5h ago',
    unread: false
  }
];

interface NotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationSheet({ open, onOpenChange }: NotificationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[420px] p-0 border-l border-border-tertiary bg-white flex flex-col h-full right-0">
        <div className="p-6 border-b border-border-tertiary bg-white sticky top-0 z-10 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <SheetTitle className="font-serif text-[24px] font-bold text-text-primary tracking-tight">
              Signals
            </SheetTitle>
            <span className="bg-solo-blue/10 text-solo-blue text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
              {sampleNotifications.filter(n => n.unread).length} New
            </span>
          </div>
          <SheetDescription className="text-text-secondary text-[13px] font-medium">
            Real-time intelligence and account updates.
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-2">
          {sampleNotifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-6 border-b border-border-tertiary/50 transition-colors cursor-pointer hover:bg-background-secondary/50 group relative ${notif.unread ? "bg-solo-blue/[0.02]" : "bg-white"}`}
            >
              {notif.unread && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-solo-blue" />
              )}
              
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  notif.type === 'lead' ? 'bg-solo-teal/10 text-solo-teal' :
                  notif.type === 'message' ? 'bg-solo-blue/10 text-solo-blue' :
                  'bg-background-secondary text-text-tertiary'
                }`}>
                  {notif.type === 'lead' ? <TrendingUp className="w-5 h-5" /> :
                   notif.type === 'message' ? <MessageCircle className="w-5 h-5" /> :
                   <Bell className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[14px] font-bold text-text-primary truncate pr-4">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-bold text-text-tertiary uppercase whitespace-nowrap pt-0.5">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-text-secondary leading-relaxed line-clamp-2">
                    {notif.description}
                  </p>
                  
                  <div className="mt-3 flex items-center gap-3">
                    <button className="text-[11px] font-bold text-solo-blue uppercase tracking-widest hover:underline flex items-center gap-1">
                      View details <ExternalLink className="w-3 h-3" />
                    </button>
                    {notif.unread && (
                      <button className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest hover:text-text-primary">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border-tertiary bg-background-secondary/30 shrink-0">
          <button className="w-full py-2.5 text-[12px] font-bold text-text-secondary hover:text-text-primary transition-colors text-center uppercase tracking-widest">
            Clear all signals
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
