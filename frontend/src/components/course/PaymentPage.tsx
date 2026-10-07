import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { LandingShell } from "@/components/landing/LandingShell";
import { AUTHOR_HANDLE, AUTHOR_URL, CHANNEL_HANDLE, CHANNEL_URL } from "@/components/landing/site";

/** Каркас страниц /payment/*: шапка, карточка по центру, контакты автора, футер. */
export function PaymentPage({ children }: { children: ReactNode }) {
  return (
    <LandingShell>
      <PublicHeader />
      <main className="px-4 sm:px-6" style={{ paddingTop: 140, paddingBottom: 80 }}>
        <div className="lx-card mx-auto p-8 sm:p-10 text-center" style={{ maxWidth: 560 }}>
          {children}
          <p className="mt-8 pt-6 border-t border-[var(--lx-line-2)] text-[14px] text-[var(--lx-ink-2)]">
            Вопросы по курсу:{" "}
            <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="lx-link font-medium">{AUTHOR_HANDLE}</a>
            {" · "}Канал автора:{" "}
            <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="lx-link font-medium">{CHANNEL_HANDLE}</a>
          </p>
        </div>
      </main>
      <Footer />
    </LandingShell>
  );
}
