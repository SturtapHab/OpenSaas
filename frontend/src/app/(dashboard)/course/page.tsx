"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CheckCircle2, GraduationCap, Lock, PlayCircle } from "lucide-react";

import { courseApi, type CourseLesson } from "@/api/course";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const WATCHED_KEY = "opensaas_course_watched";

function readWatched(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(WATCHED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export default function CoursePage() {
  const { data: lessons, isLoading, error, refetch } = useQuery({
    queryKey: ["course-lessons"],
    queryFn: courseApi.lessons,
    retry: false,
    // Ссылки на видео временные: обновляем список, пока страница открыта.
    refetchInterval: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [watched, setWatched] = useState<string[]>([]);
  const retriedFor = useRef<string | null>(null);

  useEffect(() => setWatched(readWatched()), []);
  useEffect(() => {
    if (lessons?.length && !lessons.some((l) => l.id === currentId)) setCurrentId(lessons[0].id);
  }, [lessons, currentId]);

  const forbidden = (error as AxiosError | null)?.response?.status === 403;
  const current = lessons?.find((l) => l.id === currentId) ?? null;
  const index = lessons && current ? lessons.indexOf(current) : -1;

  function markWatched(id: string) {
    if (watched.includes(id)) return;
    const next = [...watched, id];
    setWatched(next);
    try {
      window.localStorage.setItem(WATCHED_KEY, JSON.stringify(next));
    } catch {
      // приватный режим: отметки просто не сохранятся
    }
  }

  if (forbidden) {
    return (
      <Card>
        <EmptyState
          icon={Lock}
          title="Курс ещё не куплен"
          description="После оплаты уроки появятся здесь, а доступ придёт на почту."
          action={{ label: "Перейти к курсу", href: "/#course" }}
        />
      </Card>
    );
  }

  return (
    <>
      <PageHeader title="Мой курс" description="Смотрите в своём темпе — доступ навсегда." />

      {isLoading ? (
        <Skeleton className="aspect-video w-full rounded-2xl" />
      ) : !lessons?.length ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Уроки скоро появятся"
            description="Мы сообщим, когда первые уроки будут готовы."
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-4">
            {current && <LessonPlayer
              lesson={current}
              onEnded={() => markWatched(current.id)}
              onError={() => {
                // Временная ссылка истекла (вкладка была открыта долго) — берём новую один раз.
                if (retriedFor.current === current.id) return;
                retriedFor.current = current.id;
                void refetch();
              }}
            />}
            {current && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Урок {index + 1} из {lessons.length}
                  </div>
                  <h2 className="mt-2 font-display text-[22px] leading-tight">{current.title}</h2>
                  {current.description && (
                    <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
                      {current.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="h-fit">
            <CardContent className="p-2">
              <ol>
                {lessons.map((l, i) => {
                  const active = l.id === currentId;
                  const done = watched.includes(l.id);
                  return (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => setCurrentId(l.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                          active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                        ) : (
                          <PlayCircle className={cn("mt-0.5 h-4 w-4 shrink-0", active && "text-clay")} />
                        )}
                        <span>
                          <span className="mr-1 tabular-nums text-muted-foreground">{i + 1}.</span>
                          {l.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

function LessonPlayer({
  lesson,
  onEnded,
  onError,
}: {
  lesson: CourseLesson;
  onEnded: () => void;
  onError: () => void;
}) {
  if (!lesson.video_url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-secondary text-sm text-muted-foreground">
        Видео к этому уроку скоро появится
      </div>
    );
  }
  return (
    <video
      // Новый урок — новый плеер, чтобы видео начиналось сначала.
      key={lesson.id}
      src={lesson.video_url}
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      onEnded={onEnded}
      onError={onError}
      className="aspect-video w-full rounded-2xl bg-black"
    />
  );
}
