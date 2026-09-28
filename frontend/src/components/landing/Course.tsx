import Link from "next/link";
import { Check, PlayCircle } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { COURSE_PRICE, COURSE_URL } from "./site";

const modules = [
  { n: "01", title: "Как устроен ваш сервис", text: "Фронтенд, бэкенд, база, оплата — на примерах из жизни." },
  { n: "02", title: "Из шаблона — в продукт", text: "Упаковываем идею: что оставить, что убрать, что добавить." },
  { n: "03", title: "Почта и Робокасса", text: "Подключаем письма и приём денег, проводим первую оплату." },
  { n: "04", title: "Разработка с Claude Code", text: "Как ставить задачи агенту, чтобы он делал именно то, что нужно." },
  { n: "05", title: "Свой домен и дизайн", text: "Бренд, логотип, цвета и тексты — сервис выглядит как ваш." },
  { n: "06", title: "Поддержка и рост", text: "Обновления, бэкапы, аналитика, как не сломать работающее." },
];

const perks = ["Записанные уроки — смотрите в своём темпе", "Готовые промпты к каждому уроку", "Доступ навсегда и все будущие обновления"];

export function CourseSection() {
  return (
    <section id="course" className="relative overflow-hidden" style={{ background: "linear-gradient(180deg,#ffffff 0%,#eef3ff 40%,#ffffff 100%)", padding: "110px 0" }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
        <SectionHeading
          tag="Курс · что дальше"
          title={<>Запустили за 15 минут.<br /><span className="gradient-text">Теперь — развиваем</span></>}
          text="Шаблон бесплатный и таким останется. Курс — для тех, кто хочет превратить его в свой бизнес и уверенно дорабатывать через Claude Code."
        />

        <div className="mt-14 grid lg:grid-cols-[1.5fr_1fr] gap-5">
          <div className="bento-card p-7 sm:p-8">
            <div className="flex items-center gap-2 mb-6 text-[13px] font-semibold text-[#171717]">
              <PlayCircle size={17} className="text-[#8b5cf6]" /> Программа
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {modules.map((m) => (
                <div key={m.n} className="flex gap-3">
                  <span className="font-mono text-[12px] font-bold text-[#8b5cf6] pt-1 w-6 flex-none">{m.n}</span>
                  <div>
                    <div className="font-semibold text-[15px] text-[#171717] mb-0.5">{m.title}</div>
                    <div className="text-[13.5px] text-[#616161] leading-relaxed">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-[20px] p-8 flex flex-col text-white"
            style={{ background: "linear-gradient(160deg,#0066FF 0%,#4f46e5 60%,#6d28d9 100%)", boxShadow: "0 24px 60px rgba(79,70,229,0.35)" }}
          >
            <div className="text-[13px] font-semibold text-white/75 mb-2">Записанный курс</div>
            <div className="text-[44px] font-extrabold tracking-tight leading-none mb-1">{COURSE_PRICE}</div>
            <div className="text-[13px] text-white/70 mb-7">разовый платёж</div>
            <ul className="space-y-3 mb-8 flex-1">
              {perks.map((p) => (
                <li key={p} className="flex gap-2.5 text-[14.5px] text-white/90">
                  <Check size={17} className="flex-none mt-0.5" /> {p}
                </li>
              ))}
            </ul>
            <Link
              href={COURSE_URL}
              className="inline-flex items-center justify-center rounded-xl h-[52px] font-semibold text-[15px] text-[#3730a3] bg-white no-underline transition-transform hover:scale-[1.02]"
              style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.18)" }}
            >
              Купить курс
            </Link>
            <div className="text-center text-[12px] text-white/60 mt-3">Оплата картой через Робокассу</div>
          </div>
        </div>
      </div>
    </section>
  );
}
