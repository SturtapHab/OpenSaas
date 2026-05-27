"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, RefreshCw, Trash2, Globe, GlobeLock, Eye } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { landingsApi } from "@/api/landings";
import type { Landing } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  landing: Landing;
  onPreview: (landing: Landing) => void;
}

export function LandingCard({ landing, onPreview }: Props) {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const publishMut = useMutation({
    mutationFn: () =>
      landing.status === "published"
        ? landingsApi.unpublish(landing.id)
        : landingsApi.publish(landing.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["landings"] });
      toast.success(
        landing.status === "published" ? "Снято с публикации" : "Опубликовано!"
      );
    },
    onError: (e: unknown) => {
      const msg =
        e instanceof Error ? e.message : "Ошибка при публикации";
      toast.error(msg);
    },
  });

  const regenMut = useMutation({
    mutationFn: () => landingsApi.regenerate(landing.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["landings"] });
      toast.success("Лендинг перегенерирован!");
    },
    onError: () => toast.error("Ошибка перегенерации"),
  });

  const deleteMut = useMutation({
    mutationFn: () => landingsApi.delete(landing.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["landings"] });
      toast.success("Лендинг удалён");
    },
    onError: () => toast.error("Ошибка удаления"),
  });

  const isLoading =
    publishMut.isPending || regenMut.isPending || deleteMut.isPending;

  const formattedDate = new Date(landing.created_at).toLocaleDateString(
    "ru-RU",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white p-5 transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        "border-black/[0.06]"
      )}
      style={{
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#171717] text-sm truncate leading-snug mb-1">
            {landing.title}
          </h3>
          <p className="text-xs text-[#8e8e93]">{formattedDate}</p>
        </div>
        <span
          className={cn(
            "shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            landing.status === "published"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          )}
        >
          {landing.status === "published" ? (
            <>
              <Globe className="w-3 h-3" />
              Опубликован
            </>
          ) : (
            <>
              <GlobeLock className="w-3 h-3" />
              Черновик
            </>
          )}
        </span>
      </div>

      {/* Public URL */}
      {landing.status === "published" && (
        <Link
          href={`/pages/${landing.slug}`}
          target="_blank"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#0066FF] hover:underline truncate"
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">/pages/{landing.slug}</span>
        </Link>
      )}

      {/* Divider */}
      <div className="border-t border-black/[0.06] my-3" />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onPreview(landing)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#171717] bg-black/[0.04] hover:bg-black/[0.07] transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Просмотр
        </button>

        <button
          onClick={() => publishMut.mutate()}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            landing.status === "published"
              ? "text-gray-600 bg-gray-100 hover:bg-gray-200"
              : "text-white bg-[#0066FF] hover:bg-[#0052CC]"
          )}
        >
          {landing.status === "published" ? "Снять" : "Опубликовать"}
        </button>

        <button
          onClick={() => regenMut.mutate()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#8e8e93] hover:text-[#171717] bg-black/[0.04] hover:bg-black/[0.07] transition-colors"
        >
          <RefreshCw
            className={cn("w-3.5 h-3.5", regenMut.isPending && "animate-spin")}
          />
          Перегенерировать
        </button>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={isLoading}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => deleteMut.mutate()}
              disabled={isLoading}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Удалить
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-[#8e8e93] hover:text-[#171717]"
            >
              Отмена
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
