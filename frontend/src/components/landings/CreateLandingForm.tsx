"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Rocket, BookOpen, Wrench, Package, Calendar, Sparkles } from "lucide-react";
import { landingsApi } from "@/api/landings";
import type { LandingFormData } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ─── Zod schema ─────────────────────────────────────────────────────────────

const schema = z.object({
  sphere: z.enum(["saas", "course", "services", "product", "event", "other"]),
  product_name: z.string().min(1, "Введите название").max(100),
  description: z
    .string()
    .min(10, "Минимум 10 символов")
    .max(500, "Максимум 500 символов"),
  target_audience: z
    .string()
    .min(5, "Минимум 5 символов")
    .max(200, "Максимум 200 символов"),
  price: z.string().max(50).optional(),
  cta_text: z.string().max(50).default("Попробовать"),
  advantages: z.array(z.string()).max(3).default([]),
  tone: z.enum(["professional", "friendly", "aggressive"]),
  color_scheme: z.enum(["blue", "dark", "light", "green"]),
});

type FormValues = z.infer<typeof schema>;

// ─── Step config ─────────────────────────────────────────────────────────────

const SPHERES = [
  { value: "saas", label: "SaaS", icon: Rocket },
  { value: "course", label: "Курс", icon: BookOpen },
  { value: "services", label: "Услуги", icon: Wrench },
  { value: "product", label: "Товар", icon: Package },
  { value: "event", label: "Событие", icon: Calendar },
  { value: "other", label: "Другое", icon: Sparkles },
] as const;

const TONES = [
  { value: "professional", label: "💼 Профессиональный" },
  { value: "friendly", label: "🤝 Дружелюбный" },
  { value: "aggressive", label: "🔥 Агрессивный" },
] as const;

const COLOR_SCHEMES = [
  {
    value: "blue",
    label: "Синяя",
    color: "#0066FF",
    description: "Технологичная",
  },
  {
    value: "dark",
    label: "Тёмная",
    color: "#171717",
    description: "Премиальная",
  },
  {
    value: "light",
    label: "Светлая",
    color: "#f5f5f7",
    description: "Минималистичная",
    border: true,
  },
  {
    value: "green",
    label: "Зелёная",
    color: "#10b981",
    description: "Органическая",
  },
] as const;

const STEPS = ["О продукте", "Детали", "Стиль"] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateLandingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sphere: "saas",
      tone: "professional",
      color_scheme: "blue",
      cta_text: "Попробовать",
      advantages: ["", "", ""],
    },
  });

  const sphere = watch("sphere");
  const tone = watch("tone");
  const colorScheme = watch("color_scheme");

  const validateStep = async (currentStep: number): Promise<boolean> => {
    const fields: (keyof FormValues)[][] = [
      ["sphere", "product_name", "description", "target_audience"],
      ["price", "cta_text", "advantages"],
      ["tone", "color_scheme"],
    ];
    return trigger(fields[currentStep] as (keyof FormValues)[]);
  };

  const nextStep = async () => {
    const valid = await validateStep(step);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: FormValues) => {
    setGenerating(true);
    try {
      const form_data: LandingFormData = {
        ...data,
        advantages: (data.advantages || []).filter(Boolean),
        price: data.price || undefined,
      };
      await landingsApi.create(form_data);
      toast.success("Лендинг создан! 🎉");
      router.push("/landings");
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Ошибка при создании лендинга";
      toast.error(msg);
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-[#0066FF]/20 border-t-[#0066FF] animate-spin" />
          <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#0066FF]" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-[#171717]">
            AI создаёт ваш лендинг...
          </p>
          <p className="text-sm text-[#8e8e93] mt-1">
            Обычно занимает 20–40 секунд
          </p>
        </div>
        <div className="w-64 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-[#0066FF] rounded-full animate-[progress_30s_linear_forwards]" />
        </div>
        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 95%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    i < step
                      ? "bg-[#0066FF] text-white"
                      : i === step
                      ? "bg-[#0066FF] text-white"
                      : "bg-black/[0.06] text-[#8e8e93]"
                  )}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    i <= step ? "text-[#171717]" : "text-[#8e8e93]"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px",
                    i < step ? "bg-[#0066FF]" : "bg-black/[0.08]"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ── Step 1 ── */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-[#171717] mb-3 block">
                Сфера *
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {SPHERES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("sphere", value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all",
                      sphere === value
                        ? "border-[#0066FF] bg-blue-50 text-[#0066FF]"
                        : "border-black/[0.07] bg-white text-[#616161] hover:border-black/20 hover:text-[#171717]"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label
                htmlFor="product_name"
                className="text-sm font-medium text-[#171717] mb-1.5 block"
              >
                Название продукта *
              </Label>
              <Input
                id="product_name"
                {...register("product_name")}
                placeholder="Например: TurboSEO Pro"
              />
              {errors.product_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.product_name.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-[#171717] mb-1.5 block"
              >
                Описание продукта *{" "}
                <span className="text-[#9e9e93] font-normal">(10–500 симв.)</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Что делает ваш продукт? Какую проблему решает?"
                className="resize-none h-24"
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="target_audience"
                className="text-sm font-medium text-[#171717] mb-1.5 block"
              >
                Целевая аудитория *
              </Label>
              <Textarea
                id="target_audience"
                {...register("target_audience")}
                placeholder="Кто ваш клиент? Например: B2B стартапы с командой 5-50 человек"
                className="resize-none h-20"
              />
              {errors.target_audience && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.target_audience.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label
                htmlFor="price"
                className="text-sm font-medium text-[#171717] mb-1.5 block"
              >
                Цена{" "}
                <span className="text-[#9e9e93] font-normal">(необязательно)</span>
              </Label>
              <Input
                id="price"
                {...register("price")}
                placeholder="990₽/мес или Бесплатно"
              />
            </div>

            <div>
              <Label
                htmlFor="cta_text"
                className="text-sm font-medium text-[#171717] mb-1.5 block"
              >
                Текст кнопки CTA
              </Label>
              <Input
                id="cta_text"
                {...register("cta_text")}
                placeholder="Попробовать бесплатно"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-[#171717] mb-1.5 block">
                Ключевые преимущества{" "}
                <span className="text-[#9e9e93] font-normal">
                  (до 3, необязательно)
                </span>
              </Label>
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Input
                    key={i}
                    {...register(`advantages.${i}`)}
                    placeholder={
                      i === 0
                        ? "Запуск за 1 день"
                        : i === 1
                        ? "Без кредитной карты"
                        : "Поддержка 24/7"
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-[#171717] mb-3 block">
                Тон общения *
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("tone", value)}
                    className={cn(
                      "rounded-xl border p-3 text-sm font-medium transition-all text-center",
                      tone === value
                        ? "border-[#0066FF] bg-blue-50 text-[#0066FF]"
                        : "border-black/[0.07] bg-white text-[#616161] hover:border-black/20"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-[#171717] mb-3 block">
                Цветовая схема *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_SCHEMES.map(
                  ({ value, label, color, description, border }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue("color_scheme", value)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-all text-left",
                        colorScheme === value
                          ? "border-[#0066FF] bg-blue-50"
                          : "border-black/[0.07] bg-white hover:border-black/20"
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-full shrink-0"
                        style={{
                          backgroundColor: color,
                          border: border
                            ? "1px solid rgba(0,0,0,0.1)"
                            : undefined,
                        }}
                      />
                      <div>
                        <div
                          className={cn(
                            "font-medium",
                            colorScheme === value
                              ? "text-[#0066FF]"
                              : "text-[#171717]"
                          )}
                        >
                          {label}
                        </div>
                        <div className="text-xs text-[#8e8e93]">
                          {description}
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/[0.06]">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
            >
              Назад
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white"
            >
              Далее
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Создать лендинг
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
