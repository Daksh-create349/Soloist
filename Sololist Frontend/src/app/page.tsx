import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { Pricing } from "@/components/sections/Pricing";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background-primary flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Hero />
        <Problem />
        <Solution />
        <Pricing />
      </div>
      <Footer />
    </main>
  );
}
