import { apiClient } from "./client";
import type { CourseAccess, CourseInfo, Payment, Plan, Subscription } from "@/types";

export const billingApi = {
  async listPlans(): Promise<Plan[]> {
    const r = await apiClient.get("/api/v1/billing/plans");
    return r.data;
  },

  async getSubscription(): Promise<Subscription | null> {
    const r = await apiClient.get("/api/v1/billing/subscription");
    return r.data;
  },

  async subscribe(
    plan_id: string,
    provider: "robokassa" | "stripe" = "robokassa",
  ): Promise<{ payment_url: string; payment_id: string }> {
    const r = await apiClient.post("/api/v1/billing/subscribe", {
      plan_id,
      provider,
    });
    return r.data;
  },

  async listPayments(): Promise<Payment[]> {
    const r = await apiClient.get("/api/v1/billing/payments");
    return r.data;
  },

  async cancel(): Promise<Subscription> {
    const r = await apiClient.post("/api/v1/billing/cancel");
    return r.data;
  },

  async getCourseInfo(): Promise<CourseInfo> {
    const r = await apiClient.get("/api/v1/billing/course/info");
    return r.data;
  },

  async getCourse(): Promise<CourseAccess> {
    const r = await apiClient.get("/api/v1/billing/course");
    return r.data;
  },

  async buyCourse(): Promise<{ payment_url: string; payment_id: string }> {
    const r = await apiClient.post("/api/v1/billing/course/buy");
    return r.data;
  },
};
