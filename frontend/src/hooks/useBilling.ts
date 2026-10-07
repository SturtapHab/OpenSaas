"use client";

import { useQuery } from "@tanstack/react-query";

import { billingApi } from "@/api/billing";

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: () => billingApi.listPlans(),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => billingApi.getSubscription(),
  });
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () => billingApi.listPayments(),
  });
}

export function useCourseInfo() {
  return useQuery({
    queryKey: ["course-info"],
    queryFn: () => billingApi.getCourseInfo(),
  });
}

export function useCourse() {
  return useQuery({
    queryKey: ["course"],
    queryFn: () => billingApi.getCourse(),
  });
}
