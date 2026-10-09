import { apiClient } from "./client";
import type { AdminStats, Payment, User } from "@/types";
import type { CourseLesson } from "./course";

export type LessonInput = Pick<CourseLesson, "title" | "description" | "video_url"> & {
  position?: number;
};

export interface AdminCourseOrder {
  inv_id: string;
  amount: string;
  email: string | null;
  user_id: string | null;
  paid_at: string | null;
}

export interface AdminReferralPayout {
  id: string;
  amount: string;
  status: "pending" | "approved" | "paid" | "rejected";
  paid_at: string | null;
  created_at: string;
  referrer_id: string;
  referred_user_id: string;
  payment_id: string;
}

export const adminApi = {
  async stats(): Promise<AdminStats> {
    const r = await apiClient.get("/api/v1/admin/stats");
    return r.data;
  },

  async listUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
  } = {}): Promise<User[]> {
    const r = await apiClient.get("/api/v1/admin/users", { params });
    return r.data;
  },

  async setRole(userId: string, role: "admin" | "user"): Promise<User> {
    const r = await apiClient.patch(`/api/v1/admin/users/${userId}/role`, {
      role,
    });
    return r.data;
  },

  async blockUser(userId: string): Promise<User> {
    const r = await apiClient.patch(`/api/v1/admin/users/${userId}/block`);
    return r.data;
  },

  async unblockUser(userId: string): Promise<User> {
    const r = await apiClient.patch(`/api/v1/admin/users/${userId}/unblock`);
    return r.data;
  },

  async listPayments(limit = 100): Promise<Payment[]> {
    const r = await apiClient.get("/api/v1/admin/payments", {
      params: { limit },
    });
    return r.data;
  },

  async listReferralPayouts(
    status?: string,
  ): Promise<AdminReferralPayout[]> {
    const r = await apiClient.get("/api/v1/admin/referrals/payouts", {
      params: status ? { status } : {},
    });
    return r.data;
  },

  async approvePayout(id: string): Promise<AdminReferralPayout> {
    const r = await apiClient.patch(
      `/api/v1/admin/referrals/payouts/${id}/approve`,
    );
    return r.data;
  },

  async markPayoutPaid(id: string): Promise<AdminReferralPayout> {
    const r = await apiClient.patch(
      `/api/v1/admin/referrals/payouts/${id}/mark-paid`,
    );
    return r.data;
  },

  async rejectPayout(id: string): Promise<AdminReferralPayout> {
    const r = await apiClient.patch(
      `/api/v1/admin/referrals/payouts/${id}/reject`,
    );
    return r.data;
  },

  async setCourseAccess(userId: string, has_course: boolean): Promise<User> {
    const r = await apiClient.patch(`/api/v1/admin/users/${userId}/course`, { has_course });
    return r.data;
  },

  /** Выдать курс по email: нет аккаунта — создаётся, на почту уходит письмо с доступом. */
  async grantCourse(email: string): Promise<{ user: User; created: boolean }> {
    const r = await apiClient.post("/api/v1/admin/course/grant", { email });
    return r.data;
  },

  async listCourseOrders(): Promise<AdminCourseOrder[]> {
    const r = await apiClient.get("/api/v1/admin/course/orders");
    return r.data;
  },

  async listLessons(): Promise<CourseLesson[]> {
    const r = await apiClient.get("/api/v1/admin/course/lessons");
    return r.data;
  },

  async createLesson(data: LessonInput): Promise<CourseLesson> {
    const r = await apiClient.post("/api/v1/admin/course/lessons", data);
    return r.data;
  },

  async updateLesson(id: string, data: Partial<LessonInput>): Promise<CourseLesson> {
    const r = await apiClient.patch(`/api/v1/admin/course/lessons/${id}`, data);
    return r.data;
  },

  async deleteLesson(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/course/lessons/${id}`);
  },
};
