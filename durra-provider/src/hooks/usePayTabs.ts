import { getFunctions, httpsCallable } from "firebase/functions";
import app from "@/lib/firebase";

const functions = getFunctions(app);

export const usePayTabs = () => {
  const createSession = async (params: {
    bookingId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  }) => {
    const createPayTabsSession = httpsCallable(functions, "createPayTabsSession");
    const result = await createPayTabsSession(params);
    return result.data as { redirect_url?: string; tran_ref?: string; status?: string };
  };

  return { createSession };
};
