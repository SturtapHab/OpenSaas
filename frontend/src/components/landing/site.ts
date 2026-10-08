/**
 * Общие данные лендинга: ссылки и тексты промптов.
 * Меняйте здесь — они используются сразу в нескольких секциях.
 */

export const GITHUB_URL = "https://github.com/SturtapHab/OpenSaas";
export const SKILL_URL = `${GITHUB_URL}/tree/main/.claude/skills`;
export const DEPLOY_SKILL_URL = `${GITHUB_URL}/tree/main/.claude/skills/deploy-timeweb`;
export const MENTOR_SKILL_URL = `${GITHUB_URL}/tree/main/.claude/skills/opensaas-mentor`;
/** Автор шаблона: личный Telegram для вопросов и канал. */
export const AUTHOR_URL = "https://t.me/well_sh";
export const AUTHOR_HANDLE = "@well_sh";
export const CHANNEL_URL = "https://t.me/wellcome_ai";
export const CHANNEL_HANDLE = "@wellcome_ai";
export const TIMEWEB_URL = "https://timeweb.cloud";

/**
 * Курс покупается прямо с лендинга, без регистрации: кнопка сразу ведёт в Робокассу.
 * Цена — ENV COURSE_PRICE, ссылка на уроки — ENV COURSE_TELEGRAM_URL (видна только
 * после оплаты на /payment/success). В коде её нет специально: репозиторий открытый.
 */

/**
 * Ссылка на видео. Прямой файл (.mp4/.webm) показывается встроенным плеером,
 * любая другая ссылка (YouTube, VK, Rutube embed) — через iframe.
 * Пусто — показываем плашку «Видео скоро».
 */
export const VIDEO_URL =
  "https://s3.twcstorage.ru/85b42609-6dce-4d85-a0f3-62f70b497abd/%D0%98%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BA%D1%86%D0%B8%D1%8F%20OpenSaas.mp4";

export const DEPLOY_PROMPT = "Вот мой ключ от Timeweb — задеплой сервис: <ключ>";
export const EXPLAIN_PROMPT = "Объясни, как работает этот проект";

/** Наш CodingAgent — для тех, у кого нет подписки на Claude Code или Codex. Оплата в рублях. */
export const CODING_AGENT_URL = "https://77-232-135-253.sslip.io";
export const CODING_AGENT_DEPLOY_PRICE = "200 ₽";
export const CODING_AGENT_PROMPT = `Задеплой проект в Timeweb строго по DEPLOY.md.

Ветка: main
Почта администратора сайта: ваш@email.com
Расходы подтверждаю (~1500 ₽/мес, почасово), спрашивать согласие не нужно.
Создай новое приложение и новую базу с уникальным именем.

После деплоя пришли ссылку на сайт, логин и пароль админа и App ID.`;
