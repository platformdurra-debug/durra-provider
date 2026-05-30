"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const store = useAuthStore();
  const initCalled = useRef(false);

  useEffect(() => {
    if (!initCalled.current) {
      initCalled.current = true;
      store.init();
    }
  }, []);

  return store;
};
