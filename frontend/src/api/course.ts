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
  /** Куда ушло письмо с доступом, частично скрыто: sh***@gmail.com. */
  email: string | null;
}

/** Параметры, с которыми Робокасса возвращает покупателя на Success URL. */
export interface RobokassaReturn {
  OutSum: string;
  InvId: string;
  SignatureValue: string;
}

export interface CourseLesson {
  id: string;
  position: number;
  title: string;
  description: string;
  /** Для видео из S3 — временная ссылка, она перестаёт работать через пару часов. */
  video_url: string;
}

/** Курс: покупка без регистрации, уроки — в кабинете. См. backend/modules/course. */
export const courseApi = {
  async info(): Promise<CourseInfo> {
    const r = await apiClient.get("/api/v1/course/info");
    return r.data;
  },

  async buy(email: string): Promise<{ payment_url: string }> {
    const r = await apiClient.post("/api/v1/course/buy", { email });
    return r.data;
  },

  async order(params: RobokassaReturn): Promise<CourseOrderStatus> {
    const r = await apiClient.get("/api/v1/course/order", { params });
    return r.data;
  },

  async resend(params: RobokassaReturn): Promise<CourseOrderStatus> {
    const r = await apiClient.post("/api/v1/course/order/resend", params);
    return r.data;
  },

  async lessons(): Promise<CourseLesson[]> {
    const r = await apiClient.get("/api/v1/course/lessons");
    return r.data;
  },
};
