"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { courseApi, coursePurchase } from "@/api/course";
import { formatMoney } from "@/lib/utils";
import { BrandIcon } from "./BrandIcon";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { AUTHOR_HANDLE, AUTHOR_URL, CHANNEL_HANDLE, CHANNEL_URL } from "./site";

const modules = [
  { n: "01", title: "Как устроен ваш сервис", text: "Фронтенд, бэкенд, база, оплата — на примерах из жизни." },
  { n: "02", title: "Из шаблона — в продукт", text: "Упаковываем идею: что оставить, что убрать, что добавить." },
  { n: "03", title: "Почта и Робокасса", text: "Подключаем письма и приём денег, проводим первую оплату." },
  { n: "04", title: "Разработка с Claude Code", text: "Как ставить задачи агенту, чтобы он делал именно то, что нужно." },
  { n: "05", title: "Свой домен и дизайн", text: "Бренд, логотип, цвета и тексты — сервис выглядит как ваш." },
  { n: "06", title: "Поддержка и рост", text: "Обновления, бэкапы, аналитика, как не сломать работающее." },
];

const perks = ["Записанные уроки — смотрите в своём темпе", "Готовые промпты к каждому уроку", "Доступ навсегда и все будущие обновления"];

export function CourseSection() {
  const { data: course } = useQuery({ queryKey: ["course-info"], queryFn: courseApi.info });
  // Продажа выключена (не задан COURSE_TELEGRAM_URL, например на форке) — ведём к автору.
  const canBuy = course?.enabled ?? true;

  // Уже купил в этом браузере — показываем вход в уроки вместо повторной покупки.
  const [purchasedUrl, setPurchasedUrl] = useState<string | null>(null);
  useEffect(() => {
    const saved = coursePurchase.get();
    if (saved) setPurchasedUrl(coursePurchase.url(saved));
  }, []);

  const buy = useMutation({
    mutationFn: courseApi.buy,
    onSuccess: (r) => {
      window.location.href = r.payment_url;
    },
    onError: (e) => {
      const err = e as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail ?? "Не удалось перейти к оплате. Попробуйте ещё раз.");
    },
  });

  return (
    <section id="course" className="lx-section lx-band">
      <div className="lx-container">
        <SectionHeading
          tag="Курс · что дальше"
          title={<>Запустили за 15 минут. <em>Теперь&nbsp;— развиваем</em></>}
          text="Шаблон бесплатный и таким останется. Курс — для тех, кто хочет превратить его в свой бизнес и уверенно дорабатывать через Claude Code."
        />

        <div className="mt-16 grid lg:grid-cols-[1.55fr_1fr] gap-6 items-stretch">
          <Stagger className="lx-card p-8 sm:p-10 grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {modules.map((m) => (
              <StaggerItem key={m.n} className="border-t border-[var(--lx-line-2)] pt-5">
                <div className="lx-display text-[var(--lx-clay)] text-[20px] leading-none mb-3">{m.n}</div>
                <div className="font-semibold text-[17px] mb-1.5">{m.title}</div>
                <div className="text-[14.5px] text-[var(--lx-ink-2)] leading-relaxed">{m.text}</div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1}>
            <div
              className="relative h-full rounded-[28px] p-9 flex flex-col overflow-hidden text-white"
              style={{ background: "linear-gradient(165deg,#221f19 0%,#16140f 100%)", boxShadow: "var(--lx-shadow-lg)" }}
            >
              <div aria-hidden className="absolute pointer-events-none" style={{ width: 420, height: 420, top: -180, right: -160, borderRadius: "50%", filter: "blur(60px)", background: "radial-gradient(circle, rgba(224,138,104,0.45) 0%, transparent 65%)" }} />
              <div className="relative text-[12px] font-semibold tracking-[0.16em] uppercase text-white/55 mb-5">Записанный курс</div>
              <div className="relative lx-display leading-none" style={{ fontSize: 54 }}>
                {course ? formatMoney(course.price, course.currency) : "\u00a0"}
              </div>
              <div className="relative text-[14px] text-white/55 mt-2 mb-9">разовый платёж</div>
              <ul className="relative space-y-4 mb-10 flex-1">
                {perks.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] text-white/85">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-none mt-0.5 bg-white/10"><Check size={12} strokeWidth={2.5} /></span>
                    {p}
                  </li>
                ))}
              </ul>
              {purchasedUrl ? (
                <>
                  <Link href={purchasedUrl} className="relative lx-btn w-full bg-white text-[var(--lx-ink)] hover:-translate-y-0.5" style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,.5)" }}>
                    Открыть уроки <ArrowRight size={17} />
                  </Link>
                  <div className="relative text-center text-[12.5px] text-white/45 mt-4">Вы уже купили курс в этом браузере</div>
                </>
              ) : canBuy ? (
                <>
                  <button
                    type="button"
                    onClick={() => buy.mutate()}
                    disabled={buy.isPending || buy.isSuccess}
                    className="relative lx-btn w-full bg-white text-[var(--lx-ink)] hover:-translate-y-0.5 disabled:opacity-80"
                    style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,.5)" }}
                  >
                    {buy.isPending || buy.isSuccess ? <Loader2 size={17} className="animate-spin" /> : <>Купить курс <ArrowRight size={17} /></>}
                  </button>
                  <div className="relative text-center text-[12.5px] text-white/45 mt-4">Без регистрации · оплата картой через Робокассу</div>
                </>
              ) : (
                <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="relative lx-btn w-full bg-white text-[var(--lx-ink)] hover:-translate-y-0.5" style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,.5)" }}>
                  Купить у автора <ArrowRight size={17} />
                </a>
              )}
              <div className="relative mt-6 pt-5 border-t border-white/10 text-[13.5px] text-white/60 space-y-2">
                <div className="flex items-center gap-2">
                  <BrandIcon name="telegram" size={15} color="rgba(255,255,255,.7)" />
                  <span>Вопросы автору:</span>
                  <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">{AUTHOR_HANDLE}</a>
                </div>
                <div className="flex items-center gap-2">
                  <BrandIcon name="telegram" size={15} color="rgba(255,255,255,.7)" />
                  <span>Канал автора:</span>
                  <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">{CHANNEL_HANDLE}</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
