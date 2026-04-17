"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Check, Rocket, Zap, Target, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STAGES = [
  { id: "identity", title: "Identity", description: "Define your solo presence." },
  { id: "niche", title: "Focus", description: "Where do you dominate?" },
  { id: "simulation", title: "Calibration", description: "AI is learning your patterns." },
  { id: "ready", title: "Launch", description: "Your OS is ready." }
];

import { updateProfile } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    agency: "",
    niche: "",
    goals: [] as string[]
  });

  const nextStep = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  // Simulate AI Calibration
  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => {
        nextStep();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleFinish = async () => {
    try {
      await updateProfile({
        name: formData.name,
        agency_name: formData.agency,
        niche: formData.niche,
        goals: formData.goals
      });
      toast.success("System ready. Welcome to Soloist.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save profile", error);
      toast.error("Profile save failed, but proceeding to dashboard...");
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-6 mesh-gradient overflow-hidden">
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-solo-blue/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-[600px] relative">
        {/* PROGRESS INDICATOR */}
        <div className="flex justify-between mb-12 relative px-4">
          <div className="absolute top-[22px] left-0 right-0 h-[1px] bg-border-tertiary z-0" />
          {STAGES.map((s, i) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${i <= step ? "bg-solo-blue border-solo-blue text-white shadow-lg shadow-solo-blue/20" : "bg-white border-border-tertiary text-text-tertiary"}`}>
                {i < step ? <Check className="w-5 h-5" /> : <span className="text-[14px] font-bold">{i + 1}</span>}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${i === step ? "text-solo-blue" : "text-text-tertiary"}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* CONTENT CARD */}
        <div className="bg-white border border-border-tertiary rounded-[32px] p-10 md:p-14 shadow-2xl shadow-black/[0.03] min-h-[460px] flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 50 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col h-full"
            >
              {step === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-3">
                    <h1 className="font-serif text-[32px] md:text-[42px] font-bold text-text-primary tracking-tight leading-none">
                      Who is at the helm?
                    </h1>
                    <p className="text-text-secondary text-[16px] leading-relaxed">
                      Every Soloist agent needs a commander. <br />First, let's identify your presence.
                    </p>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1">Your Major Alias</label>
                      <Input 
                        placeholder="e.g. Alex Rivera" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="h-14 bg-background-secondary border-border-tertiary rounded-[12px] text-[16px] px-5 focus-visible:ring-solo-blue/20 focus-visible:border-solo-blue transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1">Agency / Practice Name</label>
                      <Input 
                        placeholder="e.g. Design Lab OS" 
                        value={formData.agency}
                        onChange={(e) => setFormData({...formData, agency: e.target.value})}
                        className="h-14 bg-background-secondary border-border-tertiary rounded-[12px] text-[16px] px-5 focus-visible:ring-solo-blue/20 focus-visible:border-solo-blue transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8 h-full">
                   <div className="space-y-3">
                    <h1 className="font-serif text-[32px] md:text-[42px] font-bold text-text-primary tracking-tight leading-none">
                      Define your Niche.
                    </h1>
                    <p className="text-text-secondary text-[16px] leading-relaxed">
                      The AI surfaces opportunities based on your specific gravity. Which sector do you pull from?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {["B2B SaaS", "Fintech UX", "Web3 / Crypto", "Brand Systems", "AI Tooling", "Mobile Apps"].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFormData({...formData, niche: n})}
                        className={`h-14 rounded-[14px] border px-4 text-[14px] font-bold transition-all flex items-center justify-between ${formData.niche === n ? "bg-solo-blue/5 border-solo-blue text-solo-blue shadow-sm" : "bg-white border-border-tertiary text-text-secondary hover:border-solo-blue/40"}`}
                      >
                        {n}
                        {formData.niche === n && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center gap-3 text-[12px] font-medium text-text-tertiary italic">
                    <Sparkles className="w-3.5 h-3.5 text-solo-amber" />
                    AI uses this to filter the Opportunity Radar.
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-solo-blue/20 blur-2xl rounded-full animate-pulse" />
                    <div className="relative bg-white border border-border-tertiary w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl">
                      <Zap className="w-10 h-10 text-solo-blue animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-[28px] font-bold text-text-primary tracking-tight">
                      Calibrating your OS...
                    </h2>
                    <div className="flex flex-col gap-1 text-[13px] font-mono text-solo-blue font-bold tracking-tight opacity-70">
                      <span>{">"} Injecting sector intelligence: {formData.niche}</span>
                      <span>{">"} Configuring Ops automation...</span>
                      <span>{">"} Wiring Radar signals...</span>
                    </div>
                  </div>

                  <div className="w-full max-w-[240px] h-1.5 bg-background-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3.5, ease: "linear" }}
                      className="h-full bg-solo-blue"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in zoom-in-95 duration-700">
                  <div className="w-20 h-20 bg-solo-teal/10 border border-solo-teal/20 rounded-full flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-solo-teal" />
                  </div>

                  <div className="space-y-4">
                    <h1 className="font-serif text-[32px] md:text-[42px] font-bold text-text-primary tracking-tight leading-tight">
                      System Operational.
                    </h1>
                    <p className="text-text-secondary text-[16px] leading-relaxed max-w-[320px] mx-auto">
                      Your agency command center is live and calibrated for <strong>{formData.agency || "Soloist"}</strong>.
                    </p>
                  </div>

                  <Button 
                    onClick={handleFinish}
                    className="group bg-solo-blue hover:bg-solo-blue/90 text-white rounded-[12px] h-14 px-10 text-[16px] font-bold shadow-xl shadow-solo-blue/30 transition-all hover:scale-[1.05]"
                  >
                    Enter Command Center
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* NAV BUTTONS */}
          {step < 2 && (
            <div className="mt-12 flex items-center justify-between pt-8 border-t border-border-tertiary">
              <Button 
                variant="ghost" 
                onClick={prevStep}
                disabled={step === 0}
                className="text-[14px] font-bold text-text-tertiary hover:text-text-primary h-12"
              >
                Back
              </Button>
              <Button 
                onClick={nextStep}
                disabled={step === 0 ? !formData.name : step === 1 ? !formData.niche : false}
                className="bg-black hover:bg-black/90 text-white rounded-[10px] h-12 px-8 text-[14px] font-bold transition-all active:scale-95 disabled:opacity-30"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
           <p className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary opacity-40">
             Soloist Calibration v1.0.4 — © 2026 Antigravity
           </p>
        </div>
      </div>
    </main>
  );
}
