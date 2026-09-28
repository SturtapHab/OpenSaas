import { Eye, Lock, Scale, Wallet } from "lucide-react";
import { BrandIcon } from "./BrandIcon";
import { SectionHeading } from "./SectionHeading";
import { GITHUB_URL, SKILL_URL } from "./site";

const tree: { depth: number; name: string; note?: string; hl?: boolean }[] = [
  { depth: 0, name: "OpenSaas/" },
  { depth: 1, name: "AGENTS.md", note: "инструкции для любого агента", hl: true },
  { depth: 1, name: ".claude/skills/" },
  { depth: 2, name: "deploy-timeweb/", note: "деплой по одному ключу", hl: true },
  { depth: 2, name: "opensaas-mentor/", note: "агент-наставник", hl: true },
  { depth: 1, name: "backend/", note: "FastAPI · оплата, auth, API" },
  { depth: 1, name: "frontend/", note: "Next.js · сайт и кабинет" },
  { depth: 1, name: "docs/", note: "документация на русском" },
  { depth: 1, name: "LICENSE", note: "MIT" },
];

const facts = [
  { Icon: Scale, title: "Лицензия MIT", text: "Используйте в коммерческих проектах, меняйте, продавайте — без отчислений." },
  { Icon: Eye, title: "Весь код открыт", text: "Каждая строка на GitHub. Можно проверить, что внутри нет ничего лишнего." },
  { Icon: Lock, title: "Ваш сервер, ваши данные", text: "Сервис разворачивается в вашем аккаунте Timeweb. Доступ есть только у вас." },
  { Icon: Wallet, title: "Платите только хостингу", text: "Около 1 500 ₽ в месяц напрямую Timeweb. Нам — ничего, шаблон бесплатный." },
];

export function OpenSourceSection() {
  return (
    <section id="open-source" style={{ background: "#ffffff", padding: "110px 0" }}>
      <div className="mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-14 items-center" style={{ maxWidth: 1150 }}>
        <div className="min-w-0">
          <SectionHeading
            align="left"
            tag="Полностью open source"
            title="Никакой магии. Всё открыто и проверяемо"
            text="Навыки агента — это обычные текстовые инструкции в репозитории. Скачайте их и отдайте любому агенту: Claude Code, Codex, Cursor или Gemini."
          />
          <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-6">
            {facts.map(({ Icon, title, text }) => (
              <div key={title}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={17} className="text-[#0066FF]" strokeWidth={2} />
                  <span className="font-semibold text-[15px] text-[#171717]">{title}</span>
                </div>
                <p className="text-[14px] text-[#616161] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn-primary-new" style={{ background: "#171717", boxShadow: "0 6px 20px rgba(0,0,0,0.2)" }}>
              <BrandIcon name="github" size={17} color="#fff" /> Репозиторий
            </a>
            <a href={SKILL_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary-new">
              Скачать skills
            </a>
          </div>
        </div>

        {/* Дерево репозитория */}
        <div className="rounded-[20px] overflow-hidden border border-black/[0.08]" style={{ background: "#0b0b0f", boxShadow: "0 24px 70px rgba(10,20,60,0.18)" }}>
          <div className="flex items-center gap-2 px-5 h-11 border-b border-white/[0.07]">
            <BrandIcon name="github" size={15} color="rgba(255,255,255,0.7)" />
            <span className="font-mono text-[12px] text-white/50">SturtapHab / OpenSaas</span>
            <span className="ml-auto text-[11px] rounded-full px-2 py-0.5 border border-white/15 text-white/50">Public</span>
          </div>
          <div className="p-5 font-mono text-[13px] leading-[2]">
            {tree.map((r) => (
              <div key={r.name} className="flex items-center gap-3" style={{ paddingLeft: r.depth * 20 }}>
                <span className={"whitespace-nowrap " + (r.hl ? "text-[#f0a488]" : r.name.endsWith("/") ? "text-[#7aa7ff]" : "text-white/80")}>{r.name}</span>
                {r.note && <span className="hidden sm:inline text-white/30 text-[12px] truncate"># {r.note}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
