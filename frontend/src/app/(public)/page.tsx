import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { VideoSection } from "@/components/landing/VideoSection";
import { HowToStartSection } from "@/components/landing/HowToStart";
import { MentorAgentSection } from "@/components/landing/MentorAgent";
import { WhatCanCreate } from "@/components/landing/WhatCanCreate";
import { WhatInside } from "@/components/landing/WhatInside";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { OpenSourceSection } from "@/components/landing/OpenSource";
import { CourseSection } from "@/components/landing/Course";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <Hero />
        <TrustStrip />
        <VideoSection />
        <HowToStartSection />
        <MentorAgentSection />
        <WhatCanCreate />
        <WhatInside />
        <LiveDemo />
        <OpenSourceSection />
        <CourseSection />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
