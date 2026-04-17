"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-16 border-t border-border-tertiary">
      <div className="max-content">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="font-serif text-2xl font-bold text-text-primary mb-4 block">
              Soloist
            </Link>
            <p className="text-text-secondary text-[14px] leading-[1.7] max-w-[300px]">
              The unified AI operating system for one-person agencies. Built for the future of independent work.
            </p>
          </div>
          
          <div>
            <h4 className="font-sans text-[13px] font-bold text-text-primary uppercase tracking-wider mb-6">
              Product
            </h4>
            <div className="flex flex-col gap-4 text-[14px] text-text-secondary font-medium">
              <Link href="#features" className="hover:text-text-primary transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
              <Link href="#about" className="hover:text-text-primary transition-colors">About</Link>
            </div>
          </div>

          <div>
            <h4 className="font-sans text-[13px] font-bold text-text-primary uppercase tracking-wider mb-6">
              Team
            </h4>
            <div className="flex flex-col gap-4 text-[14px] text-text-secondary font-medium">
              <Link href="#" className="hover:text-text-primary transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-text-primary transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border-tertiary flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-text-tertiary text-[12px]">
            © 2025 Soloist. All rights reserved. Built for the era of the individual.
          </p>
        </div>
      </div>
    </footer>
  );
}
