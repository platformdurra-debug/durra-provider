import { create } from "zustand";
import { User } from "@/types";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const isDev = process.env.NODE_ENV === "development";
const APP_URLS: Record<string, string> = {
  customer:  isDev ? "http://localhost:3000" : (process.env.NEXT_PUBLIC_CUSTOMER_URL  || "https://durrahonline.com"),
  seller:    isDev ? "http://localhost:3001" : (process.env.NEXT_PUBLIC_SELLER_URL    || "https://seller.durrahonline.com"),
  provider:  isDev ? "http://localhost:3002" : (process.env.NEXT_PUBLIC_PROVIDER_URL  || "https://provider.durrahonline.com"),
  admin:     isDev ? "http://localhost:3003" : (process.env.NEXT_PUBLIC_ADMIN_URL     || "https://admin.durrahonline.com"),
  warehouse: isDev ? "http://localhost:3004" : (process.env.NEXT_PUBLIC_WAREHOUSE_URL || "https://warehouse.durrahonline.com"),
};

function setRoleCookie(role: string) {
  if (typeof document !== "undefined") {
    const domain = isDev ? "localhost" : ".durrahonline.com";
    document.cookie = `durra-role=${role};path=/;domain=${domain};max-age=604800;samesite=lax`;
  }
}

function clearRoleCookie() {
  if (typeof document !== "undefined") {
    const domain = isDev ? "localhost" : ".durrahonline.com";
    document.cookie = `durra-role=;path=/;domain=${domain};max-age=0`;
  }
}

function redirectToCorrectApp(role: string) {
  const targetUrl = APP_URLS[role] || APP_URLS.customer;
  if (typeof window === "undefined") return;
  const current = window.location.origin;
  const target = targetUrl.replace(/\/$/, "");
  if (!current.includes(target.replace("http://", "").replace("https://", "").split(":")[0])) {
    window.location.href = target;
  }
}

interface AuthStore {
  user: User | null; loading: boolean; error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null, loading: true, error: null,

  login: async (email, password) => {
    try {
      set({ error: null });
      const result = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", result.user.uid));
      const userData = snap.data() as User;
      set({ user: userData });
      setRoleCookie(userData.role);
      redirectToCorrectApp(userData.role);
    } catch (e: any) {
      const msg = e.code === "auth/wrong-password" || e.code === "auth/user-not-found"
        ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        : e.code === "auth/too-many-requests" ? "محاولات كثيرة — انتظري قليلاً" : e.message;
      set({ error: msg });
    }
  },

  register: async (email, password, name, phone) => {
    try {
      set({ error: null });
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = { uid: result.user.uid, email, displayName: name, phone, role: "customer", createdAt: new Date(), points: 0, level: "normal" };
      await setDoc(doc(db, "users", result.user.uid), newUser);
      set({ user: newUser });
      setRoleCookie("customer");
    } catch (e: any) {
      const msg = e.code === "auth/email-already-in-use" ? "هذا البريد مسجّل مسبقاً" : e.code === "auth/weak-password" ? "كلمة المرور ضعيفة" : e.message;
      set({ error: msg });
    }
  },

  logout: async () => {
    await signOut(auth);
    clearRoleCookie();
    set({ user: null });
    if (typeof window !== "undefined") window.location.href = "/auth";
  },

  init: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) { const u = snap.data() as User; set({ user: u, loading: false }); setRoleCookie(u.role); }
          else set({ user: null, loading: false });
        } catch { set({ user: null, loading: false }); }
      } else { set({ user: null, loading: false }); clearRoleCookie(); }
    });
  },
}));
