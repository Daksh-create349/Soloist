"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border-tertiary/50 glass">
      <div className="max-content flex h-20 items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-bold text-text-primary tracking-tight hover:opacity-80 transition-opacity">
          Soloist
        </Link>
        
        <div className="hidden md:flex items-center gap-10 text-[13px] font-bold uppercase tracking-[0.15em] text-text-secondary">
          <Link href="#features" className="hover:text-solo-blue transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-solo-blue transition-all group-hover:w-full" />
          </Link>
          <Link href="#pricing" className="hover:text-solo-blue transition-colors relative group">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-solo-blue transition-all group-hover:w-full" />
          </Link>
          <Link href="#about" className="hover:text-solo-blue transition-colors relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-solo-blue transition-all group-hover:w-full" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={() => router.push('/onboarding')}
            className="bg-text-primary hover:bg-text-secondary text-white text-[12px] font-bold uppercase tracking-widest h-10 px-6 rounded-[4px] transition-all hover:scale-[1.05]"
          >
            Start Free
          </Button>
        </div>
      </div>
    </nav>
  );
}
