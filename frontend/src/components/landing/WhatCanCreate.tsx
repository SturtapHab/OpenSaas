"use client";

import { motion } from "framer-motion";
import { Bot, GraduationCap, KeyRound, Repeat, ShoppingBag, Users } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const examples = [
  { Icon: GraduationCap, color: "#8b5cf6", title: "Онлайн-школа или клуб", text: "Закрытые уроки по подписке, пробный период, приглашения друзей за бонус.", uses: ["Подписки", "Триал", "Рефералы"] },
  { Icon: Bot, color: "#D97757", title: "AI-сервис", text: "Генерация текстов, картинок, ответов по документам — с оплатой за тариф.", uses: ["Тарифы", "Лимиты", "API-ключи"] },
  { Icon: KeyRound, color: "#0066FF", title: "API для разработчиков", text: "Продавайте доступ к данным или функции по ключу — как делают большие сервисы.", uses: ["API-ключи", "Rate limit", "Биллинг"] },
  { Icon: Repeat, color: "#10b981", title: "Сервис подписок", text: "Шаблоны, чек-листы, база знаний, трекер — всё, за что платят каждый месяц.", uses: ["Подписки", "Кабинет", "Письма"] },
  { Icon: Users, color: "#f59e0b", title: "CRM для ниши", text: "Запись клиентов для салонов, учёт заявок для строителей, кабинет для репетиторов.", uses: ["Кабинет", "Админка", "Уведомления"] },
  { Icon: ShoppingBag, color: "#ec4899", title: "Маркетплейс услуг", text: "Исполнители и заказчики находят друг друга, платформа берёт подписку.", uses: ["Кабинет", "Оплата", "Партнёрка"] },
];

export function WhatCanCreate() {
  return (
    <section id="examples" style={{ background: "linear-gradient(180deg,#ffffff 0%,#f5f5f7 14%,#f5f5f7 86%,#ffffff 100%)", padding: "110px 0" }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
        <SectionHeading
          tag="Что можно создать"
          title="Одна основа — десятки бизнесов"
          text="Регистрация, оплата, кабинет и админка уже работают. Вы добавляете только свою идею — вместе с агентом."
        />

        <motion.div
          className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {examples.map(({ Icon, color, title, text, uses }) => (
            <motion.div
              key={title}
              className="bento-card p-7 flex flex-col"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-5" style={{ background: `${color}14` }}>
                <Icon size={22} color={color} strokeWidth={1.75} />
              </div>
              <h3 className="text-[18px] font-bold text-[#171717] tracking-tight mb-2">{title}</h3>
              <p className="text-[14.5px] text-[#616161] leading-relaxed mb-5 flex-1">{text}</p>
              <div className="flex flex-wrap gap-1.5">
                {uses.map((u) => (
                  <span key={u} className="text-[11.5px] font-medium rounded-md px-2 py-0.5 bg-black/[0.04] text-[#616161]">
                    ✓ {u}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
