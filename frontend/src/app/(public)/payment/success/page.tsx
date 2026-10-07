"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";

import { courseApi, coursePurchase, type RobokassaReturn } from "@/api/course";
import { PaymentPage } from "@/components/course/PaymentPage";

const POLL_MS = 3000;
// Робокасса иногда присылает подтверждение (Result URL) чуть позже, чем возвращает покупателя.
const MAX_POLLS = 60;

function readParams(params: URLSearchParams): RobokassaReturn | null {
  const OutSum = params.get("OutSum");
  const InvId = params.get("InvId");
  const SignatureValue = params.get("SignatureValue");
  if (OutSum && InvId && SignatureValue) return { OutSum, InvId, SignatureValue };
  return coursePurchase.get();
}

function SuccessContent() {
  const router = useRouter();
  const search = useSearchParams();
  const ret = useMemo(() => readParams(new URLSearchParams(search.toString())), [search]);
  const polls = useRef(0);

  const { data, isError } = useQuery({
    queryKey: ["course-order", ret?.InvId],
    queryFn: () => {
      polls.current += 1;
      return courseApi.order(ret!);
    },
    enabled: Boolean(ret),
    retry: false,
    refetchInterval: (q) =>
      q.state.data && !q.state.data.paid && q.state.data.is_course && polls.current < MAX_POLLS
        ? POLL_MS
        : false,
  });

  useEffect(() => {
    if (!data || !ret) return;
    // Не курс — это оплата подписки из кабинета: возвращаем туда, как раньше.
    if (!data.is_course) router.replace("/billing?status=success");
    else if (data.paid) coursePurchase.set(ret);
  }, [data, ret, router]);

  if (!ret || isError) {
    return (
      <>
        <h1 className="lx-display text-[28px] leading-tight">Не нашли данные оплаты</h1>
        <p className="mt-4 text-[var(--lx-ink-2)]">
          Если вы оплатили курс, напишите автору — пришлите номер заказа из письма Робокассы,
          и мы дадим доступ.
        </p>
        <Link href="/#course" className="lx-btn lx-btn-ink mt-8">К курсу</Link>
      </>
    );
  }

  if (data?.is_course && data.paid) {
    return (
      <>
        <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--lx-clay)]" strokeWidth={1.5} />
        <h1 className="lx-display mt-5 text-[30px] leading-tight">Спасибо за покупку!</h1>
        <p className="mt-4 text-[var(--lx-ink-2)]">
          Уроки курса лежат в закрытой Telegram-группе. Доступ навсегда.
        </p>
        {data.telegram_url ? (
          <a href={data.telegram_url} target="_blank" rel="noopener noreferrer" className="lx-btn lx-btn-ink mt-8">
            Перейти к урокам в Telegram <ArrowUpRight size={17} />
          </a>
        ) : (
          <p className="mt-6 font-medium">Ссылка на уроки скоро появится — напишите автору.</p>
        )}
        <p className="mt-6 text-[13.5px] text-[var(--lx-ink-3)]">
          Заказ № {data.inv_id}. Сохраните эту страницу в закладки — по ней можно вернуться
          к ссылке. В этом браузере кнопка «Открыть уроки» появится и на главной.
        </p>
      </>
    );
  }

  const gaveUp = data?.is_course && !data.paid && polls.current >= MAX_POLLS;
  return (
    <>
      {gaveUp ? null : <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--lx-clay)]" />}
      <h1 className="lx-display mt-5 text-[26px] leading-tight">
        {gaveUp ? "Ждём подтверждение от Робокассы" : "Проверяем оплату…"}
      </h1>
      <p className="mt-4 text-[var(--lx-ink-2)]">
        {gaveUp
          ? "Подтверждение задерживается. Обновите страницу через пару минут или напишите автору — номер заказа: " + ret.InvId
          : "Обычно это занимает несколько секунд. Не закрывайте страницу."}
      </p>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <PaymentPage>
      <Suspense fallback={<Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--lx-clay)]" />}>
        <SuccessContent />
      </Suspense>
    </PaymentPage>
  );
}
