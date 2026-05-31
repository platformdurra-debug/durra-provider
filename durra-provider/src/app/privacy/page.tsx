"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const DEFAULT = `سياسة الخصوصية — بوابة المزوّد

١. البيانات التي نجمعها
- بيانات الحساب: الاسم، البريد، رقم الجوال
- بيانات المحل: الصور، الخدمات، الأسعار
- بيانات الاستلام البنكية: IBAN، اسم الحساب

٢. كيف نستخدم بياناتك
- معالجة الطلبات وتحويل الأرباح
- إرسال إشعارات بالطلبات الجديدة
- تحسين تجربة الاستخدام

٣. حماية البيانات
بيانات الاستلام البنكية محمية ولا تُشارك مع أطراف ثالثة.

٤. حقوقك
- طلب تعديل أو حذف بياناتك
- سحب موافقتك في أي وقت`;

export default function ProviderPrivacyPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  useEffect(() => {
    getDoc(doc(db, "settings", "legal"))
      .then(snap => setContent(snap.exists() ? (snap.data()?.providerPrivacy || snap.data()?.privacy || DEFAULT) : DEFAULT))
      .catch(() => setContent(DEFAULT));
  }, []);
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "var(--card)", padding: "52px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 20 }}>←</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>سياسة الخصوصية</div>
      </div>
      <div style={{ padding: "24px 20px" }}>
        <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 2, whiteSpace: "pre-wrap" }}>{content}</div>
      </div>
    </div>
  );
}
