"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Layout, Loader2 } from "lucide-react";
import { landingsApi } from "@/api/landings";
import { LandingCard } from "@/components/landings/LandingCard";
import { LandingPreview } from "@/components/landings/LandingPreview";
import type { Landing } from "@/types";

const PLAN_LIMITS: Record<string, number> = {
  trial: 1,
  basic: 3,
  pro: 6,
};

export default function LandingsPage() {
  const [previewLanding, setPreviewLanding] = useState<Landing | null>(null);

  const { data: landings = [], isLoading } = useQuery({
    queryKey: ["landings"],
    queryFn: () => landingsApi.list(),
  });

  // If previewing, show preview fullscreen
  if (previewLanding) {
    return (
      <LandingPreview
        landing={previewLanding}
        onBack={() => setPreviewLanding(null)}
      />
    );
  }

  const count = landings.length;
  // Default to trial for display purposes (actual limit enforced on backend)
  const limit = PLAN_LIMITS["trial"];
  const limitReached = count >= limit;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#171717]">Лендинги</h1>
          <p className="text-sm text-[#8e8e93] mt-0.5">
            Используется{" "}
            <span className="font-medium text-[#171717]">{count}</span>{" "}
            лендинг(а)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {limitReached ? (
            <div className="relative group">
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-[#0066FF] opacity-50 cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Создать лендинг
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-[#171717] text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                Лимит достигнут.{" "}
                <Link href="/billing" className="underline">
                  Перейдите на Pro
                </Link>
              </div>
            </div>
          ) : (
            <Link
              href="/landings/new"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-[#0066FF] hover:bg-[#0052CC] transition-colors"
              style={{
                boxShadow: "0 1px 3px rgba(0,102,255,0.3)",
              }}
            >
              <Plus className="w-4 h-4" />
              Создать лендинг
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#8e8e93]" />
        </div>
      ) : landings.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(0,102,255,0.08)" }}
          >
            <Layout className="w-8 h-8 text-[#0066FF]" />
          </div>
          <h2 className="text-base font-semibold text-[#171717] mb-1">
            Нет лендингов
          </h2>
          <p className="text-sm text-[#8e8e93] max-w-sm mb-6">
            Создайте первый лендинг с помощью AI. Заполните форму — и через
            30 секунд получите готовую страницу.
          </p>
          <Link
            href="/landings/new"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-[#0066FF] hover:bg-[#0052CC] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Создать первый лендинг
          </Link>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {landings.map((landing) => (
            <LandingCard
              key={landing.id}
              landing={landing}
              onPreview={setPreviewLanding}
            />
          ))}
        </div>
      )}
    </div>
  );
}
