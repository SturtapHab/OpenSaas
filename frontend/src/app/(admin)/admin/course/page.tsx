"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ArrowDown, ArrowUp, BookOpen, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { adminApi, type LessonInput } from "@/api/admin";
import type { CourseLesson } from "@/api/course";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatMoney } from "@/lib/utils";

const EMPTY: LessonInput = { title: "", description: "", video_url: "" };

function errorText(e: unknown, fallback: string): string {
  const detail = (e as AxiosError<{ detail?: unknown }>).response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

export default function AdminCoursePage() {
  const qc = useQueryClient();
  const { data: lessons, isLoading } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: () => adminApi.listLessons(),
  });
  const { data: orders } = useQuery({
    queryKey: ["admin-course-orders"],
    queryFn: () => adminApi.listCourseOrders(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LessonInput>(EMPTY);
  const [grantEmail, setGrantEmail] = useState("");

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-lessons"] });

  const save = useMutation({
    mutationFn: () =>
      editingId ? adminApi.updateLesson(editingId, form) : adminApi.createLesson(form),
    onSuccess: () => {
      toast.success(editingId ? "Урок обновлён" : "Урок добавлен");
      setEditingId(null);
      setForm(EMPTY);
      refresh();
    },
    onError: (e) => toast.error(errorText(e, "Не удалось сохранить урок")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteLesson(id),
    onSuccess: () => {
      toast.success("Урок удалён");
      refresh();
    },
  });

  // Поменять местами с соседним уроком.
  const move = useMutation({
    mutationFn: async ({ a, b }: { a: CourseLesson; b: CourseLesson }) => {
      await adminApi.updateLesson(a.id, { position: b.position });
      await adminApi.updateLesson(b.id, { position: a.position });
    },
    onSuccess: refresh,
  });

  const grant = useMutation({
    mutationFn: () => adminApi.grantCourse(grantEmail.trim()),
    onSuccess: (r) => {
      toast.success(
        r.created
          ? `Создан аккаунт ${r.user.email}, письмо с доступом отправлено`
          : `Курс открыт для ${r.user.email}, письмо отправлено`,
      );
      setGrantEmail("");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => toast.error(errorText(e, "Проверьте email")),
  });

  function startEdit(l: CourseLesson) {
    setEditingId(l.id);
    setForm({ title: l.title, description: l.description, video_url: l.video_url });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div>
        <h1 className="font-display text-[28px] leading-tight sm:text-[32px]">Курс</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Уроки видят только те, кто купил курс. Доступ выдаётся навсегда.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Редактировать урок" : "Новый урок"}</CardTitle>
          <CardDescription>
            Видео загрузите в хранилище S3 Timeweb и вставьте сюда ссылку на файл. Если на сервере
            заданы ключи S3, ученики получают только временную ссылку, а сам бакет можно сделать приватным.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (form.title.trim()) save.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Урок 1. Как устроен ваш сервис"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="video">Ссылка на видео (.mp4)</Label>
              <Input
                id="video"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                placeholder="https://s3.twcstorage.ru/бакет/урок-1.mp4"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Описание, промпты, ссылки</Label>
              <Textarea
                id="desc"
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={save.isPending || !form.title.trim()}>
                {editingId ? "Сохранить" : "Добавить урок"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(EMPTY);
                  }}
                >
                  Отмена
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Уроки</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Загрузка...</div>
          ) : !lessons?.length ? (
            <EmptyState icon={BookOpen} title="Уроков пока нет" description="Добавьте первый урок формой выше" />
          ) : (
            <ol>
              {lessons.map((l, i) => (
                <li key={l.id} className="flex items-center gap-3 border-b px-6 py-3 last:border-0">
                  <span className="w-6 text-sm tabular-nums text-muted-foreground">{i + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{l.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{l.video_url || "без видео"}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" aria-label="Выше" disabled={i === 0 || move.isPending}
                      onClick={() => move.mutate({ a: l, b: lessons[i - 1] })}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Ниже" disabled={i === lessons.length - 1 || move.isPending}
                      onClick={() => move.mutate({ a: l, b: lessons[i + 1] })}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Изменить" onClick={() => startEdit(l)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Удалить"
                      onClick={() => {
                        if (window.confirm(`Удалить урок «${l.title}»?`)) remove.mutate(l.id);
                      }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Выдать курс</CardTitle>
          <CardDescription>
            Если аккаунта с этим email нет — он создастся. На почту уйдёт то же письмо, что после оплаты.
            Забрать курс можно в разделе «Пользователи».
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-wrap gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (grantEmail.trim()) grant.mutate();
            }}
          >
            <Input
              type="email"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              placeholder="student@mail.ru"
              className="max-w-xs"
              required
            />
            <Button type="submit" disabled={grant.isPending}>Выдать доступ</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Оплаты курса</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!orders?.length ? (
            <div className="p-6 text-sm text-muted-foreground">Пока нет оплат</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3">Заказ</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Сумма</th>
                  <th className="px-6 py-3">Оплачен</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.inv_id} className="border-b last:border-0">
                    <td className="px-6 py-3 tabular-nums">{o.inv_id}</td>
                    <td className="px-6 py-3">{o.email ?? "—"}</td>
                    <td className="px-6 py-3">{formatMoney(o.amount)}</td>
                    <td className="px-6 py-3 text-muted-foreground">{formatDateTime(o.paid_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
