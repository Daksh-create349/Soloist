"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowRight, Check, Rocket, Zap, Target, Loader2, Wand2, ShieldCheck, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile, calibrateProfile } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const STAGES = [
  { id: "persona", title: "Persona", description: "Identify yourself." },
  { id: "calibration", title: "Intelligence", description: "AI is mapping your path." },
  { id: "review", title: "Review", description: "Verify your OS configuration." },
  { id: "ready", title: "Launch", description: "Terminal ready." }
];


export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    agency: "",
    niche: "",
    specialization: "",
    goals: [] as string[]
  });

  const handleCalibrate = async () => {
    setIsCalibrating(true);
    setStep(1);
    try {
      const result = await calibrateProfile({ name: formData.name, bio: formData.bio });
      setFormData(prev => ({
        ...prev,
        agency: result.agency_name,
        niche: result.niche,
        specialization: result.specialization,
        goals: result.goals
      }));
      // Smooth transition to review
      setTimeout(() => {
        setStep(2);
        setIsCalibrating(false);
      }, 2500);
    } catch (e) {
      console.error(e);
      toast.error("AI bridge interrupted. Using fallback calibration.");
      setFormData(prev => ({
        ...prev,
        agency: `${formData.name} Labs`,
        niche: "Independent Specialist",
        goals: ["Maximize billable rate", "Automate business ops", "Secure high-tier contracts"]
      }));
      setStep(2);
      setIsCalibrating(false);
    }
  };

  const handleFinish = async () => {
    const toastId = toast.loading("Finalizing your OS...");
    try {
      await updateProfile({
        name: formData.name,
        agency_name: formData.agency,
        niche: formData.niche,
        goals: formData.goals
      });
      toast.success("Command Center Operational", { id: toastId });
      router.push("/dashboard");
    } catch (error) {
       router.push("/dashboard");
    }
  };

  // Prefetch dashboard for instant transition
  useEffect(() => {
    if (step === 3) {
      router.prefetch("/dashboard");
    }
  }, [step, router]);

  return (
    <main className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-6 mesh-gradient overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-solo-blue/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-[650px] relative">
        {/* PROGRESS */}
        <div className="flex justify-between mb-16 relative px-4 max-w-[400px] mx-auto">
          <div className="absolute top-[22px] left-0 right-0 h-[1px] bg-border-tertiary z-0" />
          {STAGES.map((s, i) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${i <= step ? "bg-solo-blue border-solo-blue text-white shadow-lg shadow-solo-blue/20" : "bg-white border-border-tertiary text-text-tertiary"}`}>
                {i < step ? <Check className="w-5 h-5" /> : <span className="text-[14px] font-bold">{i + 1}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* CARD */}
        <div className="bg-white border border-border-tertiary rounded-[32px] p-10 md:p-14 shadow-2xl shadow-black/[0.03] min-h-[500px] flex flex-col relative overflow-hidden backdrop-blur-xl bg-white/80">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="space-y-4">
                  <h1 className="font-serif text-[38px] md:text-[48px] font-bold text-text-primary tracking-tight leading-[1.1]">
                    Initiate <span className="text-solo-blue">Soloist</span>.
                  </h1>
                  <p className="text-text-secondary text-[18px] leading-relaxed max-w-[450px]">
                    Tell us who you are and what you build. Our AI will calibrate your Command Center interface.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1">Real Name / Alias</label>
                    <Input 
                      placeholder="e.g. Daksh Shrivastav" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-14 bg-white/50 border-border-tertiary rounded-[16px] text-[16px] px-6 shadow-sm focus-visible:ring-solo-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1">The Mission (Bio/Goals)</label>
                    <Textarea 
                      placeholder="e.g. I'm a Senior QA Engineer specializing in automated CI/CD pipelines. I want to scale my high-tier architectural consulting." 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="min-h-[120px] bg-white/50 border-border-tertiary rounded-[16px] text-[16px] p-6 shadow-sm focus-visible:ring-solo-blue/20"
                    />
                  </div>
                </div>

                <Button 
                  disabled={!formData.name || !formData.bio || isCalibrating}
                  onClick={handleCalibrate}
                  className="w-full bg-solo-blue hover:bg-solo-blue/90 text-white rounded-[16px] h-16 text-[16px] font-bold shadow-xl shadow-solo-blue/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-40"
                >
                  {isCalibrating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Wand2 className="w-5 h-5" /> Calibrate My Workspace</>}
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[350px] text-center space-y-10"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-solo-blue/20 blur-3xl rounded-full animate-pulse" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="relative w-28 h-28 rounded-[32px] border-2 border-solo-blue/20 flex items-center justify-center"
                  >
                    <Zap className="w-12 h-12 text-solo-blue fill-current" />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <h2 className="font-serif text-[28px] font-bold text-text-primary tracking-tight">AI Calibration in Progress...</h2>
                  <div className="flex flex-col gap-2 text-[13px] font-mono text-solo-blue/70">
                    <p className="animate-pulse">{">"} Scraping market intelligence for 2026...</p>
                    <p className="animate-pulse delay-75">{">"} Structuring {formData.name}&apos;s agency profile...</p>
                    <p className="animate-pulse delay-150">{">"} Configuring sector: {formData.bio.slice(0, 20)}...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-solo-teal text-[12px] font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" /> AI Configuration Generated
                  </div>
                  <h2 className="font-serif text-[32px] font-bold text-text-primary tracking-tight">System Baseline Ready.</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-solo-blue/5 border border-solo-blue/10 rounded-[20px] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Agency Brand</span>
                    <p className="text-[18px] font-serif font-bold text-solo-blue">{formData.agency}</p>
                  </div>
                  <div className="p-6 bg-solo-teal/5 border border-solo-teal/10 rounded-[20px] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Primary Niche</span>
                    <p className="text-[18px] font-serif font-bold text-solo-teal">{formData.niche}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                   <span className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Targeted Strategic Goals</span>
                   <div className="space-y-3">
                     {formData.goals.map((goal, i) => (
                       <div key={i} className="flex items-center gap-4 p-4 bg-white border border-border-tertiary rounded-[14px] shadow-sm">
                         <div className="w-6 h-6 rounded-full bg-background-secondary flex items-center justify-center shrink-0">
                           <Trophy className="w-3 h-3 text-solo-amber" />
                         </div>
                         <span className="text-[14px] font-bold text-text-secondary leading-tight">{goal}</span>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="flex gap-4 pt-6">
                   <Button variant="ghost" onClick={() => setStep(0)} className="flex-1 h-14 rounded-[16px] text-[14px] font-bold text-text-tertiary hover:text-text-primary">
                     Recalibrate
                   </Button>
                   <Button onClick={handleFinish} className="flex-[2] bg-solo-blue hover:bg-solo-blue/90 text-white rounded-[16px] h-14 font-black shadow-xl shadow-solo-blue/20 flex items-center justify-center gap-2 group transition-all hover:scale-[1.02]">
                     Initiate Command Center <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-10 text-center">
           <div className="flex items-center justify-center gap-2 mb-2">
             <div className="w-1.5 h-1.5 rounded-full bg-solo-teal animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary">OS CALIBRATION v2.0 AI-DIRECTED</span>
           </div>
           <p className="text-[11px] font-medium text-text-tertiary/40">© 2026 ANTIGRAVITY OS • ALL SYSTEMS NOMINAL</p>
        </div>
      </div>
    </main>
  );
}
