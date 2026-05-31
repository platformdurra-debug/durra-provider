"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const DEFAULT = `شروط الاستخدام — بوابة المزوّد

١. القبول بالشروط
باستخدامك لبوابة المزوّد في منصة درّة، فإنك توافق على الالتزام بهذه الشروط.

٢. الخدمات المقدمة
تتيح لك المنصة عرض خدماتك للزبائن وإدارة الطلبات وتتبع أرباحك.

٣. واجبات المزوّد
- تقديم خدمات بالجودة المعلنة
- الالتزام بمواعيد تنفيذ الطلبات
- التواصل الاحترافي مع الزبائن

٤. العمولات والاشتراكات
تأخذ درّة نسبة من كل طلب ناجح، إضافة لرسوم الاشتراك الشهري حسب الباقة.

٥. الشكاوى
تعالج درّة الشكاوى بموضوعية وتحتفظ بحق اتخاذ الإجراءات المناسبة.

٦. إنهاء الحساب
تحتفظ درّة بحق إيقاف أي حساب يخالف هذه الشروط.`;

export default function ProviderTermsPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  useEffect(() => {
    getDoc(doc(db, "settings", "legal"))
      .then(snap => setContent(snap.exists() ? (snap.data()?.providerTerms || snap.data()?.terms || DEFAULT) : DEFAULT))
      .catch(() => setContent(DEFAULT));
  }, []);
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "var(--card)", padding: "52px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 20 }}>←</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>شروط الاستخدام</div>
      </div>
      <div style={{ padding: "24px 20px" }}>
        <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 2, whiteSpace: "pre-wrap" }}>{content}</div>
      </div>
    </div>
  );
}
