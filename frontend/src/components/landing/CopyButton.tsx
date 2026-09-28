"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  dark?: boolean;
}

export function CopyButton({ text, label = "Скопировать", dark = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // буфер обмена недоступен (http, старый браузер) — просто ничего не делаем
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      className={
        dark
          ? "inline-flex items-center gap-1.5 rounded-lg px-2.5 h-8 text-[12px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          : "inline-flex items-center gap-1.5 rounded-lg px-2.5 h-8 text-[12px] font-medium text-[#616161] hover:text-[#171717] hover:bg-black/[0.05] transition-colors"
      }
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Скопировано" : label}
    </button>
  );
}

/** Строка с промптом, который человек копирует в своего агента. */
export function PromptLine({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <div
      className={
        dark
          ? "flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] pl-4 pr-1.5 py-1.5"
          : "flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-[#fafafa] pl-4 pr-1.5 py-1.5"
      }
    >
      <code
        className={
          dark
            ? "font-mono text-[13px] text-white/90 truncate"
            : "font-mono text-[13px] text-[#171717] truncate"
        }
      >
        <span className={dark ? "text-[#D97757] mr-2" : "text-[#0066FF] mr-2"}>&gt;</span>
        {text}
      </code>
      <CopyButton text={text} dark={dark} />
    </div>
  );
}
