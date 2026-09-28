"use client";

import Link from "next/link";
import { BrandIcon } from "./BrandIcon";
import { COURSE_URL, GITHUB_URL } from "./site";

export function CTA() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #b3ccff 0%, #8eb3f0 18%, #4a90e2 45%, #1a5fd4 72%, #0a3fa8 100%)",
        padding: "clamp(120px, 14vw, 180px) 24px clamp(100px, 12vw, 140px)",
        marginTop: "-1px",
        textAlign: "center",
      }}
    >
      <div aria-hidden className="absolute pointer-events-none" style={{ top: "28%", left: "12%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)", filter: "blur(70px)" }} />
      <div aria-hidden className="absolute pointer-events-none" style={{ bottom: -80, right: "8%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,87,0.28) 0%, transparent 70%)", filter: "blur(70px)" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 840, margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, color: "white", marginBottom: 16 }}>
          Каждый, у кого есть идея, заслуживает её запустить
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, maxWidth: 540, margin: "0 auto 40px" }}>
          Заберите код, дайте агенту ключ — и через 15 минут у вас свой работающий сервис.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-7">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#0a3fa8] rounded-xl px-7 h-[52px] text-[15px] font-semibold bg-white no-underline transition-all duration-200 hover:scale-[1.02]"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}
          >
            <BrandIcon name="github" size={17} color="#0a3fa8" />
            Забрать бесплатно
          </a>
          <Link
            href={COURSE_URL}
            className="inline-flex items-center gap-2 text-white rounded-xl px-7 h-[52px] text-[15px] font-semibold no-underline transition-all duration-200 hover:scale-[1.02] hover:bg-white/20"
            style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
          >
            Курс по развитию
          </Link>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Open source · MIT · Без подписки на шаблон</p>
      </div>
    </section>
  );
}
