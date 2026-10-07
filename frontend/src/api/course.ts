import { apiClient } from "./client";

export interface CourseInfo {
  enabled: boolean;
  price: string;
  currency: string;
}

export interface CourseOrderStatus {
  is_course: boolean;
  paid: boolean;
  inv_id: string | null;
  telegram_url: string | null;
}

/** Параметры, с которыми Робокасса возвращает покупателя на Success URL. */
export interface RobokassaReturn {
  OutSum: string;
  InvId: string;
  SignatureValue: string;
}

/** Курс покупается без регистрации. См. backend/modules/course. */
export const courseApi = {
  async info(): Promise<CourseInfo> {
    const r = await apiClient.get("/api/v1/course/info");
    return r.data;
  },

  async buy(): Promise<{ payment_url: string }> {
    const r = await apiClient.post("/api/v1/course/buy");
    return r.data;
  },

  async order(params: RobokassaReturn): Promise<CourseOrderStatus> {
    const r = await apiClient.get("/api/v1/course/order", { params });
    return r.data;
  },
};

const PURCHASE_KEY = "opensaas_course_purchase";

/** Покупка запоминается в браузере: ссылку на уроки можно открыть снова с лендинга. */
export const coursePurchase = {
  get(): RobokassaReturn | null {
    try {
      const raw = window.localStorage.getItem(PURCHASE_KEY);
      return raw ? (JSON.parse(raw) as RobokassaReturn) : null;
    } catch {
      return null;
    }
  },
  set(value: RobokassaReturn) {
    try {
      window.localStorage.setItem(PURCHASE_KEY, JSON.stringify(value));
    } catch {
      // приватный режим: ссылка останется доступна по адресу страницы
    }
  },
  url(value: RobokassaReturn): string {
    return `/payment/success?${new URLSearchParams({ ...value }).toString()}`;
  },
};
