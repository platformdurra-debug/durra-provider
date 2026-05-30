"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const { user, loading, error, login, register, logout, init } = useAuthStore();
  useEffect(() => { init(); }, []);
  return { user, loading, error, login, register, logout };
};
