import { Brain, Lightbulb, ListChecks, MessageCircleQuestion } from "lucide-react";
import { BrandIcon } from "./BrandIcon";
import { PromptLine } from "./CopyButton";
import { SectionHeading } from "./SectionHeading";
import { EXPLAIN_PROMPT, MENTOR_SKILL_URL } from "./site";

const points = [
  { Icon: MessageCircleQuestion, title: "Объясняет простыми словами", text: "Без жаргона: что такое бэкенд, база, вебхук — через понятные аналогии." },
  { Icon: Lightbulb, title: "Подсказывает идеи", text: "Какие сервисы можно построить на этом шаблоне именно под вашу задачу." },
  { Icon: ListChecks, title: "Ведёт по шагам", text: "Хотите доработку — разобьёт на маленькие шаги и сделает вместе с вами." },
  { Icon: Brain, title: "Вы понимаете, что делаете", text: "Не жмёте кнопки вслепую: перед каждым изменением агент объясняет, зачем оно." },
];

export function MentorAgentSection() {
  return (
    <section id="mentor" className="relative overflow-hidden" style={{ background: "#0b0b12", padding: "120px 0" }}>
      <div aria-hidden className="absolute pointer-events-none" style={{ width: 700, height: 700, borderRadius: "50%", top: -260, right: -200, filter: "blur(80px)", background: "radial-gradient(circle, rgba(217,119,87,0.22) 0%, transparent 70%)" }} />
      <div aria-hidden className="absolute pointer-events-none" style={{ width: 600, height: 600, borderRadius: "50%", bottom: -300, left: -200, filter: "blur(80px)", background: "radial-gradient(circle, rgba(0,102,255,0.25) 0%, transparent 70%)" }} />

      <div className="relative mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center" style={{ maxWidth: 1200 }}>
        <div className="min-w-0">
          <SectionHeading
            align="left"
            dark
            tag="Встроенный наставник"
            title="В проект встроен агент, который учит"
            text="Скопировали репозиторий, открыли в Claude Code или Codex — и просто спросите. Включится агент-наставник: расскажет, как устроен ваш сервис, для чего каждая часть и что на нём можно построить."
          />

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {points.map(({ Icon, title, text }) => (
              <div key={title} className="rounded-2xl p-5 border border-white/[0.08] bg-white/[0.03]">
                <Icon size={20} className="text-[#D97757] mb-3" strokeWidth={1.75} />
                <div className="text-white font-semibold text-[15px] mb-1">{title}</div>
                <div className="text-white/55 text-[13.5px] leading-relaxed">{text}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 max-w-md">
            <PromptLine text={EXPLAIN_PROMPT} dark />
            <a href={MENTOR_SKILL_URL} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-[13px] text-white/45 no-underline hover:text-white">
              Инструкция наставника открыта — можно почитать →
            </a>
          </div>
        </div>

        {/* Диалог с наставником */}
        <div className="rounded-[20px] border border-white/[0.08] overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", boxShadow: "0 30px 90px rgba(0,0,0,0.4)" }}>
          <div className="flex items-center gap-2 px-5 h-12 border-b border-white/[0.07]">
            <BrandIcon name="claudecode" size={16} />
            <span className="text-[13px] text-white/60 font-medium">Наставник OpenSaaS</span>
          </div>
          <div className="p-6 space-y-5 text-[14.5px] leading-relaxed">
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-br-md px-4 py-2.5 text-white max-w-[85%]" style={{ background: "#0066FF" }}>
                Объясни, как работает этот проект
              </div>
            </div>
            <div className="text-white/80 space-y-3">
              <p>
                Представьте <b className="text-white">кафе</b>. Зал с меню, где сидят гости, — это <b className="text-[#7aa7ff]">фронтенд</b>: страницы, которые видит пользователь.
              </p>
              <p>
                Кухня, где готовят заказы, — <b className="text-[#7aa7ff]">бэкенд</b>. Он проверяет пароли, считает подписки, принимает оплату.
              </p>
              <p>
                Склад продуктов — <b className="text-[#7aa7ff]">база данных</b>: там хранятся пользователи и платежи. А <b className="text-[#7aa7ff]">Робокасса</b> — кассовый терминал, который приносит деньги прямо в ваш ресторан.
              </p>
              <p className="text-white/60">Хотите, покажу это на вашем сайте: что происходит, когда человек нажимает «Зарегистрироваться»?</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {["Да, покажи", "Что можно построить?", "Хочу добавить свою функцию"].map((c) => (
                <span key={c} className="rounded-full border border-white/15 px-3 py-1 text-[12.5px] text-white/70">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
