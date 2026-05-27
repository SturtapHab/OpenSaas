"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Globe,
  GlobeLock,
  Loader2,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { landingsApi } from "@/api/landings";
import type { Landing } from "@/types";
import { cn } from "@/lib/utils";
import { SectionRegenModal } from "./SectionRegenModal";

interface Props {
  landing: Landing;
  onBack: () => void;
}

export function LandingPreview({ landing: initialLanding, onBack }: Props) {
  const qc = useQueryClient();
  const [landing, setLanding] = useState(initialLanding);
  const [panelOpen, setPanelOpen] = useState(true);
  const [regenModal, setRegenModal] = useState<{
    open: boolean;
    sectionKey: string;
  }>({ open: false, sectionKey: "" });

  const regenMut = useMutation({
    mutationFn: () => landingsApi.regenerate(landing.id),
    onSuccess: (updated) => {
      setLanding(updated);
      qc.invalidateQueries({ queryKey: ["landings"] });
      toast.success("Лендинг перегенерирован!");
    },
    onError: () => toast.error("Ошибка перегенерации"),
  });

  const sectionRegenMut = useMutation({
    mutationFn: ({ sectionKey, instruction }: { sectionKey: string; instruction?: string }) =>
      landingsApi.regenerateSection(landing.id, sectionKey, instruction),
    onSuccess: (updated) => {
      setLanding(updated);
      qc.invalidateQueries({ queryKey: ["landings"] });
      setRegenModal({ open: false, sectionKey: "" });
      toast.success("Секция обновлена!");
    },
    onError: () => toast.error("Ошибка перегенерации секции"),
  });

  const publishMut = useMutation({
    mutationFn: () =>
      landing.status === "published"
        ? landingsApi.unpublish(landing.id)
        : landingsApi.publish(landing.id),
    onSuccess: (updated) => {
      setLanding(updated);
      qc.invalidateQueries({ queryKey: ["landings"] });
      toast.success(
        landing.status === "published" ? "Снято с публикации" : "Опубликовано!"
      );
    },
    onError: () => toast.error("Ошибка"),
  });

  const sections = landing.sections_json
    ? Object.keys(landing.sections_json)
    : [];

  const isLoading =
    regenMut.isPending || publishMut.isPending || sectionRegenMut.isPending;

  return (
    <div className="flex flex-col h-screen bg-[#f5f5f7]">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white border-b border-black/[0.06]"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-[#8e8e93] hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>

        <div className="h-4 w-px bg-black/10" />

        <span className="text-sm font-medium text-[#171717] truncate max-w-xs">
          {landing.title}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {landing.status === "published" && (
            <a
              href={`/pages/${landing.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#0066FF] hover:bg-blue-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Открыть страницу
            </a>
          )}

          <button
            onClick={() => regenMut.mutate()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#616161] hover:text-[#171717] bg-black/[0.04] hover:bg-black/[0.07] transition-colors"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", regenMut.isPending && "animate-spin")}
            />
            Перегенерировать всё
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
            {landing.status === "published" ? (
              <>
                <GlobeLock className="w-3.5 h-3.5" />
                Снять
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5" />
                Опубликовать
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* iframe */}
        <div className="flex-1 overflow-hidden relative">
          {regenMut.isPending && (
            <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
              <p className="text-sm font-medium text-[#171717]">
                AI перегенерирует лендинг...
              </p>
            </div>
          )}
          {landing.html_content ? (
            <iframe
              srcDoc={landing.html_content}
              className="w-full h-full border-0"
              title={landing.title}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#8e8e93] text-sm">
              HTML не сгенерирован
            </div>
          )}
        </div>

        {/* Side panel — sections */}
        {sections.length > 0 && (
          <div
            className={cn(
              "shrink-0 bg-white border-l border-black/[0.06] transition-all duration-200 overflow-hidden flex flex-col",
              panelOpen ? "w-56" : "w-8"
            )}
          >
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="flex items-center justify-center h-10 border-b border-black/[0.06] hover:bg-black/[0.03] transition-colors shrink-0"
            >
              {panelOpen ? (
                <ChevronRight className="w-4 h-4 text-[#8e8e93]" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-[#8e8e93]" />
              )}
            </button>

            {panelOpen && (
              <div className="overflow-y-auto flex-1 p-3 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#b0b0b8] px-2 pb-1">
                  Секции
                </p>
                {sections.map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-black/[0.04] group/section"
                  >
                    <span className="text-xs text-[#616161] truncate capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <button
                      onClick={() =>
                        setRegenModal({ open: true, sectionKey: key })
                      }
                      disabled={sectionRegenMut.isPending}
                      className="opacity-0 group-hover/section:opacity-100 p-1 rounded hover:bg-black/[0.06] transition-all"
                      title="Перегенерировать секцию"
                    >
                      <RefreshCw className="w-3 h-3 text-[#8e8e93]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section regen modal */}
      <SectionRegenModal
        open={regenModal.open}
        sectionKey={regenModal.sectionKey}
        isLoading={sectionRegenMut.isPending}
        onClose={() => setRegenModal({ open: false, sectionKey: "" })}
        onConfirm={(instruction) =>
          sectionRegenMut.mutate({ sectionKey: regenModal.sectionKey, instruction })
        }
      />
    </div>
  );
}
