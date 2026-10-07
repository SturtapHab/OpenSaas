"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ArrowUpRight, GraduationCap } from "lucide-react";

import { billingApi } from "@/api/billing";
import { useCourse } from "@/hooks/useBilling";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import {
  AUTHOR_HANDLE,
  AUTHOR_URL,
  CHANNEL_HANDLE,
  CHANNEL_URL,
} from "@/components/landing/site";

/**
 * Курс: разовая покупка. Оплатившим показываем ссылку на уроки в Telegram —
 * сервер отдаёт её только им (ENV COURSE_TELEGRAM_URL). Если продажа на сайте
 * выключена, карточку не показываем.
 */
export function CourseCard() {
  const { data: course } = useCourse();

  const buy = useMutation({
    mutationFn: () => billingApi.buyCourse(),
    onSuccess: (r) => {
      window.location.href = r.payment_url;
    },
    onError: (e) => {
      const err = e as AxiosError<{ detail?: string }>;
      toast.error(err.response?.data?.detail ?? "Не удалось создать платёж");
    },
  });

  if (!course || (!course.enabled && !course.purchased)) return null;

  return (
    <Card id="course" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-clay" strokeWidth={1.75} />
          Курс по развитию сервиса
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {course.purchased ? (
          <>
            <p className="text-muted-foreground">
              Курс оплачен. Уроки лежат в закрытой Telegram-группе — доступ навсегда.
            </p>
            {course.telegram_url ? (
              <Button asChild>
                <a href={course.telegram_url} target="_blank" rel="noopener noreferrer">
                  Открыть уроки в Telegram <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <p>Ссылка на уроки скоро появится. Напишите автору, если не дождались.</p>
            )}
          </>
        ) : (
          <>
            <p className="text-muted-foreground">
              Записанные уроки, готовые промпты и доступ навсегда. Разовый платёж{" "}
              <span className="font-medium text-foreground">
                {formatMoney(course.price, course.currency)}
              </span>
              , после оплаты здесь появится ссылка на уроки.
            </p>
            <Button onClick={() => buy.mutate()} disabled={buy.isPending}>
              Купить курс за {formatMoney(course.price, course.currency)}
            </Button>
          </>
        )}
        <p className="text-muted-foreground">
          Вопросы по курсу:{" "}
          <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-clay">
            {AUTHOR_HANDLE}
          </a>
          {" · "}Канал автора:{" "}
          <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-clay">
            {CHANNEL_HANDLE}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
