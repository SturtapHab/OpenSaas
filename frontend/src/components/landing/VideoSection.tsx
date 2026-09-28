import { Clock, PlayCircle } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { VIDEO_URL } from "./site";

const chapters = [
  { t: "0:00", title: "Копируем репозиторий на GitHub" },
  { t: "1:30", title: "Регистрируемся в Timeweb и берём API-ключ" },
  { t: "3:00", title: "Открываем проект в Claude Code или Codex" },
  { t: "4:00", title: "Одно сообщение — и агент деплоит" },
  { t: "8:00", title: "Заходим в админку готового сервиса" },
];

export function VideoSection() {
  return (
    <section id="video" style={{ background: "linear-gradient(180deg,#ffffff 0%,#f5f5f7 14%,#f5f5f7 86%,#ffffff 100%)", padding: "110px 0" }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
        <SectionHeading
          tag="Видео · 10 минут"
          title="Как запустить свой первый SaaS"
          text="Повторяйте за экраном: от пустого аккаунта до работающего сайта с оплатой и админкой."
        />

        <div className="mt-12 grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
          <div
            className="relative rounded-[20px] overflow-hidden w-full min-w-0"
            style={{ aspectRatio: "16 / 9", background: "radial-gradient(ellipse at 30% 20%, #1b2a55 0%, #0b0b12 70%)", boxShadow: "0 24px 70px rgba(10,20,60,0.22)" }}
          >
            {VIDEO_URL ? (
              <iframe
                src={VIDEO_URL}
                title="Как запустить свой первый SaaS за 10 минут"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                    maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
                  }}
                />
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center mb-5 animate-pulse-glow" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <PlayCircle size={40} className="text-white" strokeWidth={1.5} />
                </div>
                <div className="relative inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold text-[#ffd48a] mb-3" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)" }}>
                  <Clock size={13} /> Видео скоро появится
                </div>
                <p className="relative text-white/60 text-[15px] max-w-sm">
                  Пока его нет — пролистайте ниже: там те же три шага текстом и готовые промпты.
                </p>
              </div>
            )}
          </div>

          <div className="bento-card p-7 flex flex-col">
            <div className="text-[13px] font-semibold text-[#171717] mb-4">Что в видео</div>
            <ol className="space-y-3.5 flex-1">
              {chapters.map((c) => (
                <li key={c.t} className="flex gap-3 text-[14.5px] text-[#3a3a3a]">
                  <span className="font-mono text-[12px] text-[#0066FF] pt-0.5 w-10 flex-none">{c.t}</span>
                  <span>{c.title}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 pt-5 border-t border-black/[0.06] text-[13px] text-[#8a8a92]">
              Понадобится: аккаунт GitHub, аккаунт Timeweb Cloud с балансом от 500 ₽ и Claude Code или Codex.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
