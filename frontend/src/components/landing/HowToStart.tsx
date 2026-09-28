import { BrandIcon } from "./BrandIcon";
import { PromptLine } from "./CopyButton";
import { SectionHeading } from "./SectionHeading";
import { DEPLOY_PROMPT, DEPLOY_SKILL_URL, GITHUB_URL, TIMEWEB_URL } from "./site";

export function HowToStartSection() {
  return (
    <section id="how-to-start" style={{ background: "#ffffff", padding: "110px 0" }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
        <SectionHeading
          tag="Как начать · 3 шага"
          title={<>Вы даёте ключ — <span className="gradient-text">агент делает остальное</span></>}
          text="Никаких серверов, консолей и настройки вручную. Инструкция для агента уже лежит в репозитории — он её прочитает сам."
        />

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {/* Шаг 1 */}
          <div className="bento-card p-7 flex flex-col">
            <StepNum n={1} />
            <h3 className="text-[19px] font-bold text-[#171717] tracking-tight mb-2">Скопируйте репозиторий</h3>
            <p className="text-[14.5px] text-[#616161] leading-relaxed mb-5 flex-1">
              Нажмите «Fork» на GitHub — у вас появится собственная копия проекта. Код полностью ваш.
            </p>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#171717] no-underline hover:text-[#0066FF] transition-colors">
              <BrandIcon name="github" size={16} color="currentColor" /> Открыть на GitHub →
            </a>
          </div>

          {/* Шаг 2 */}
          <div className="bento-card p-7 flex flex-col">
            <StepNum n={2} />
            <h3 className="text-[19px] font-bold text-[#171717] tracking-tight mb-2">Подключите агента</h3>
            <p className="text-[14.5px] text-[#616161] leading-relaxed mb-5 flex-1">
              Откройте свою копию в Claude Code (claude.ai/code) или Codex. Подойдёт и Cursor — агент сам найдёт инструкции в AGENTS.md.
            </p>
            <div className="flex items-center gap-4">
              <BrandIcon name="claudecode" size={26} />
              <BrandIcon name="openai" size={24} color="#171717" />
              <BrandIcon name="cursor" size={22} color="#171717" />
            </div>
          </div>

          {/* Шаг 3 */}
          <div className="bento-card p-7 flex flex-col" style={{ borderColor: "rgba(0,102,255,0.25)" }}>
            <StepNum n={3} />
            <h3 className="text-[19px] font-bold text-[#171717] tracking-tight mb-2">Отправьте ключ Timeweb</h3>
            <p className="text-[14.5px] text-[#616161] leading-relaxed mb-5 flex-1">
              Создайте API-ключ в <a href={TIMEWEB_URL} target="_blank" rel="noopener noreferrer" className="text-[#0066FF] no-underline hover:underline">Timeweb Cloud</a> и напишите агенту одну фразу. Через 10–15 минут у вас будет ссылка и пароль админа.
            </p>
            <a href={DEPLOY_SKILL_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#8a8a92] no-underline hover:text-[#0066FF]">
              Посмотреть, что делает агент →
            </a>
          </div>
        </div>

        <div className="mt-6 mx-auto" style={{ maxWidth: 720 }}>
          <PromptLine text={DEPLOY_PROMPT} />
          <p className="text-center text-[13px] text-[#8a8a92] mt-3">
            Перед созданием серверов агент покажет цену и спросит согласие. Ключ никуда не сохраняется.
          </p>
        </div>
      </div>
    </section>
  );
}

function StepNum({ n }: { n: number }) {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 font-bold text-[16px] text-white"
      style={{ background: "linear-gradient(135deg,#0066FF,#6366f1)", boxShadow: "0 6px 16px rgba(0,102,255,0.28)" }}
    >
      {n}
    </div>
  );
}
