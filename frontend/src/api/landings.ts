import { apiClient } from "./client";
import type { Landing, LandingFormData } from "@/types";

export const landingsApi = {
  async list(): Promise<Landing[]> {
    const r = await apiClient.get("/api/v1/landings");
    return r.data;
  },

  async get(id: string): Promise<Landing> {
    const r = await apiClient.get(`/api/v1/landings/${id}`);
    return r.data;
  },

  async create(form_data: LandingFormData): Promise<Landing> {
    const r = await apiClient.post("/api/v1/landings", { form_data });
    return r.data;
  },

  async regenerate(id: string): Promise<Landing> {
    const r = await apiClient.post(`/api/v1/landings/${id}/regenerate`);
    return r.data;
  },

  async regenerateSection(
    id: string,
    section_key: string,
    instruction?: string
  ): Promise<Landing> {
    const r = await apiClient.post(
      `/api/v1/landings/${id}/regenerate-section`,
      { section_key, instruction }
    );
    return r.data;
  },

  async publish(id: string): Promise<Landing> {
    const r = await apiClient.post(`/api/v1/landings/${id}/publish`);
    return r.data;
  },

  async unpublish(id: string): Promise<Landing> {
    const r = await apiClient.post(`/api/v1/landings/${id}/unpublish`);
    return r.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/landings/${id}`);
  },
};
