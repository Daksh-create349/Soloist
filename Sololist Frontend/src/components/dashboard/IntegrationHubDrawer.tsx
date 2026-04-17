"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Mail, Table, Zap, ShieldCheck, ExternalLink, Loader2, Save, Globe, Key } from "lucide-react";
import { getProfile, updateProfile, UserConfigResponse } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface IntegrationHubDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntegrationHubDrawer({ isOpen, onOpenChange }: IntegrationHubDrawerProps) {
  const [profile, setProfile] = useState<UserConfigResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("notion");
  const [formData, setFormData] = useState({
    notion_api_key: "",
    notion_database_id: "",
    jira_url: "",
    jira_email: "",
    jira_api_token: "",
    gmail_user: "",
    gmail_app_password: ""
  });

  useEffect(() => {
    if (isOpen) {
      getProfile().then((data) => {
        setProfile(data);
        const integrations = data.integrations || {};
        setFormData({
          notion_api_key: integrations.notion_api_key || "",
          notion_database_id: integrations.notion_database_id || "",
          jira_url: integrations.jira_url || "",
          jira_email: integrations.jira_email || "",
          jira_api_token: integrations.jira_api_token || "",
          gmail_user: integrations.gmail_user || "",
          gmail_app_password: integrations.gmail_app_password || ""
        });
      });
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!profile) return;
      await updateProfile({
        integrations: formData
      });
      toast.success("Integration profile updated. Command Center recalibrating.");
      setTimeout(() => onOpenChange(false), 800);
    } catch (e) {
      toast.error("Failed to update integration matrix.");
    } finally {
      setIsSaving(false);
    }
  };

  const TABS = [
    { id: "notion", label: "Notion", icon: <Table className="w-4 h-4" /> },
    { id: "jira", label: "JIRA", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "email", label: "Gmail", icon: <Mail className="w-4 h-4" /> }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] bg-background-primary/95 backdrop-blur-2xl border-l border-white/20 p-0 overflow-hidden flex flex-col shadow-[-20px_0_80px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-solo-blue via-solo-teal to-solo-amber opacity-50" />
        
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-[12px] bg-solo-blue/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-solo-blue" />
            </div>
            <div>
              <SheetTitle className="font-serif text-[24px] font-bold text-text-primary tracking-tight">Integration Hub</SheetTitle>
              <SheetDescription className="text-[13px] font-medium text-text-tertiary">Configure your automation endpoints.</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* TAB NAV */}
        <div className="px-8 mb-6">
          <div className="bg-background-secondary/50 p-1.5 rounded-[16px] flex gap-1 border border-border-tertiary/10">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-[12px] font-bold transition-all ${activeTab === tab.id ? "bg-white shadow-xl shadow-black/5 text-solo-blue" : "text-text-tertiary hover:text-text-primary hover:bg-white/40"}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 space-y-8 pb-24">
          <AnimatePresence mode="wait">
            {activeTab === "notion" && (
              <motion.div
                key="notion"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary">Notion Configuration</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-text-secondary ml-1">Internal Integration Secret</label>
                      <Input 
                        type="password"
                        placeholder="secret_..." 
                        value={formData.notion_api_key}
                        onChange={(e) => setFormData({...formData, notion_api_key: e.target.value})}
                        className="h-12 bg-white/50 border-border-tertiary rounded-[12px] px-5 focus-visible:ring-solo-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-text-secondary ml-1">Database ID</label>
                      <Input 
                        placeholder="e.g. 59f2..." 
                        value={formData.notion_database_id}
                        onChange={(e) => setFormData({...formData, notion_database_id: e.target.value})}
                        className="h-12 bg-white/50 border-border-tertiary rounded-[12px] px-5 focus-visible:ring-solo-blue/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-solo-blue/5 border border-solo-blue/10 rounded-[14px] flex gap-3 items-start">
                   <Globe className="w-4 h-4 text-solo-blue mt-0.5 shrink-0" />
                   <p className="text-[12px] font-medium text-solo-blue/80 leading-relaxed">
                     Connect your Notion workspace to enable real-time project synchronization.
                   </p>
                </div>
              </motion.div>
            )}

            {activeTab === "jira" && (
              <motion.div
                key="jira"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary">Atlassian JIRA Config</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-text-secondary ml-1">Instance URL</label>
                      <Input 
                        placeholder="https://your-domain.atlassian.net" 
                        value={formData.jira_url}
                        onChange={(e) => setFormData({...formData, jira_url: e.target.value})}
                        className="h-12 bg-white/50 border-border-tertiary rounded-[12px] px-5 focus-visible:ring-solo-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-text-secondary ml-1">Email Address</label>
                      <Input 
                        type="email"
                        placeholder="your@email.com" 
                        value={formData.jira_email}
                        onChange={(e) => setFormData({...formData, jira_email: e.target.value})}
                        className="h-12 bg-white/50 border-border-tertiary rounded-[12px] px-5 focus-visible:ring-solo-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-text-secondary ml-1">API Token</label>
                      <Input 
                        type="password"
                        placeholder="Atlassian API Token" 
                        value={formData.jira_api_token}
                        onChange={(e) => setFormData({...formData, jira_api_token: e.target.value})}
                        className="h-12 bg-white/50 border-border-tertiary rounded-[12px] px-5 focus-visible:ring-solo-blue/20"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary">Gmail / SMTP Settings</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-text-secondary ml-1">Gmail User</label>
                      <Input 
                        placeholder="your-email@gmail.com" 
                        value={formData.gmail_user}
                        onChange={(e) => setFormData({...formData, gmail_user: e.target.value})}
                        className="h-12 bg-white/50 border-border-tertiary rounded-[12px] px-5 focus-visible:ring-solo-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-text-secondary ml-1">App Password</label>
                      <Input 
                        type="password"
                        placeholder="abcd-efgh-ijkl-mnop" 
                        value={formData.gmail_app_password}
                        onChange={(e) => setFormData({...formData, gmail_app_password: e.target.value})}
                        className="h-12 bg-white/50 border-border-tertiary rounded-[12px] px-5 focus-visible:ring-solo-blue/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-solo-amber/5 border border-solo-amber/10 rounded-[14px] space-y-2">
                    <div className="flex items-center gap-2 text-solo-amber">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Security Advisory</span>
                    </div>
                    <p className="text-[12px] font-medium text-solo-amber/80 leading-relaxed">
                        Use a Google <span className="font-bold underline">App Password</span> specifically for Soloist. Do not use your primary master password.
                    </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-border-tertiary/10 bg-white/50 backdrop-blur-xl absolute bottom-0 left-0 right-0">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-solo-blue hover:bg-solo-blue/90 text-white rounded-[16px] h-14 text-[14px] font-black shadow-xl shadow-solo-blue/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-40"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Persist Credentials</>}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
