"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayCircle, Star } from "lucide-react";
import { AgentDemo } from "./AgentDemo";
import { BrandIcon } from "./BrandIcon";
import { GITHUB_URL } from "./site";

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden noise" style={{ paddingTop: 140, paddingBottom: 96 }}>
      <div className="absolute inset-0 mesh-bg" style={{ zIndex: 0 }} />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 560, height: 560, borderRadius: "50%", top: -160, left: "-4%", zIndex: 0, filter: "blur(60px)",
          background: "radial-gradient(circle, rgba(0,102,255,0.30) 0%, rgba(0,102,255,0.08) 45%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: 520, height: 520, borderRadius: "50%", top: 40, right: "-6%", zIndex: 0, filter: "blur(60px)",
          background: "radial-gradient(circle, rgba(217,119,87,0.22) 0%, rgba(217,119,87,0.06) 45%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 items-center" style={{ maxWidth: 1200, zIndex: 1 }}>
        {/* Текст */}
        <div className="text-center lg:text-left min-w-0">
          <motion.div custom={0} variants={item} initial="hidden" animate="visible" className="flex justify-center lg:justify-start mb-7">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-black/10 rounded-full pl-1.5 pr-4 py-1 text-[13px] text-[#3a3a3a] bg-white/80 backdrop-blur-md no-underline hover:border-[#0066FF]/40 transition-colors"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-[#171717] text-white px-2 py-0.5 text-[11px] font-semibold">
                <BrandIcon name="github" size={11} color="#fff" /> MIT
              </span>
              100% Open Source · бесплатно навсегда
            </a>
          </motion.div>

          <motion.h1
            custom={0.05}
            variants={item}
            initial="hidden"
            animate="visible"
            style={{ fontSize: "clamp(2.05rem, 4vw, 3.4rem)", lineHeight: 1.04, letterSpacing: "-0.04em", fontWeight: 800, color: "#171717", marginBottom: 22 }}
          >
            Свой SaaS-сервис <span className="gradient-text whitespace-nowrap">за 15 минут</span>
            <br />
            одним сообщением агенту
          </motion.h1>

          <motion.p
            custom={0.15}
            variants={item}
            initial="hidden"
            animate="visible"
            className="mx-auto lg:mx-0"
            style={{ fontSize: 18, color: "#616161", maxWidth: 540, lineHeight: 1.65, marginBottom: 34 }}
          >
            Скопируйте репозиторий, откройте его в Claude Code или Codex и напишите:
            <span className="font-mono text-[15px] text-[#171717] bg-black/[0.05] rounded-md px-1.5 py-0.5 mx-1">
              «вот ключ Timeweb — задеплой»
            </span>
            Агент сам создаст базу, соберёт приложение и выдаст ссылку с паролем админа.
          </motion.p>

          <motion.div custom={0.25} variants={item} initial="hidden" animate="visible" className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn-primary-new" style={{ background: "#171717", boxShadow: "0 6px 20px rgba(0,0,0,0.22)" }}>
              <BrandIcon name="github" size={17} color="#fff" />
              Забрать код на GitHub
            </a>
            <Link href="#video" className="btn-secondary-new">
              <PlayCircle size={17} />
              Как запустить за 10 минут
            </Link>
          </motion.div>

          <motion.div custom={0.35} variants={item} initial="hidden" animate="visible" className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-[13px] text-[#8a8a92]">
            <span className="inline-flex items-center gap-2">
              <span className="text-[#b0b0b8]">Работает с</span>
              <BrandIcon name="claude" size={18} />
              <BrandIcon name="openai" size={17} color="#171717" />
              <BrandIcon name="cursor" size={16} color="#171717" />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star size={14} className="text-[#f59e0b]" fill="#f59e0b" /> Без скрытых платежей и привязки
            </span>
          </motion.div>
        </div>

        {/* Демо агента */}
        <motion.div custom={0.2} variants={item} initial="hidden" animate="visible" className="min-w-0">
          <AgentDemo />
        </motion.div>
      </div>
    </section>
  );
}
