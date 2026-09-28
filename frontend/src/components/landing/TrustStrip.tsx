import { BrandIcon } from "./BrandIcon";
import type { BrandKey } from "./brand-icons-data";

const agents: { key: BrandKey; label: string; color?: string }[] = [
  { key: "claudecode", label: "Claude Code" },
  { key: "openai", label: "Codex", color: "#171717" },
  { key: "cursor", label: "Cursor", color: "#171717" },
  { key: "gemini", label: "Gemini CLI" },
  { key: "github", label: "GitHub", color: "#171717" },
];

const stack: { key: BrandKey; label: string }[] = [
  { key: "nextjs", label: "Next.js" },
  { key: "react", label: "React" },
  { key: "typescript", label: "TypeScript" },
  { key: "tailwind", label: "Tailwind" },
  { key: "python", label: "Python" },
  { key: "fastapi", label: "FastAPI" },
  { key: "postgresql", label: "PostgreSQL" },
  { key: "docker", label: "Docker" },
];

export function TrustStrip() {
  return (
    <section className="relative" style={{ background: "#ffffff", padding: "8px 0 72px" }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-black/[0.07] bg-[#fafafa] px-6 py-5">
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#9e9ea8] mb-4">Любой AI-агент</div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {agents.map((a) => (
                <span key={a.label} className="inline-flex items-center gap-2 text-[14px] font-medium text-[#3a3a3a]">
                  <BrandIcon name={a.key} size={20} color={a.color} />
                  {a.label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-black/[0.07] bg-[#fafafa] px-6 py-5">
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#9e9ea8] mb-4">Проверенный стек</div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {stack.map((s) => (
                <span key={s.label} className="tooltip inline-flex" data-tip={s.label}>
                  <BrandIcon name={s.key} size={24} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
