"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";

export default function ProviderAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuthStore();

  const handleLogin = async () => {
    if (!agreed) { alert("يجب الموافقة على الشروط والأحكام"); return; }
    setSubmitting(true);
    try { await login(email, password); } finally { setSubmitting(false); }
  };

  const handleForgot = async () => {
    if (!email) { setResetError("أدخل بريدك الإلكتروني أولاً"); return; }
    setSubmitting(true); setResetError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (e: any) {
      setResetError(e.code === "auth/user-not-found" ? "البريد غير مسجّل" : "حدث خطأ، حاول مرة أخرى");
    } finally { setSubmitting(false); }
  };

  const inp = {
    width: "100%", padding: "14px 16px", borderRadius: 14,
    border: "1.5px solid #E8DDD0", fontSize: 14,
    fontFamily: "Tajawal, sans-serif", background: "#FAF7F2",
    color: "#2C1A0A", outline: "none", textAlign: "right" as const, direction: "rtl" as const,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #2C1A0A, #4A2E14 60%, #FAF7F2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 56, fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>درّة</div>
        <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, transparent, #C9A96E, transparent)", margin: "14px auto" }} />
        <div style={{ fontSize: 11, color: "rgba(201,169,110,0.5)", letterSpacing: 4 }}>بوابة المزوّد</div>
      </div>

      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Forgot Password */}
        {isForgot ? (
          <div style={{ background: "#FFFFFF", borderRadius: 24, border: "1px solid #E8DDD0", padding: 28, boxShadow: "0 8px 40px rgba(44,26,10,0.12)" }}>
            <button onClick={() => { setIsForgot(false); setResetSent(false); setResetError(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7E60", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
              ← رجوع
            </button>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#2C1A0A", textAlign: "center", marginBottom: 6 }}>نسيت كلمة المرور؟</div>
            <div style={{ fontSize: 12, color: "#9B7E60", textAlign: "center", marginBottom: 24 }}>سنرسل لك رابط إعادة التعيين</div>
            {resetSent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📩</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#065F46", marginBottom: 6 }}>تم الإرسال!</div>
                <div style={{ fontSize: 12, color: "#9B7E60" }}>تحقق من بريدك الإلكتروني</div>
                <button onClick={() => { setIsForgot(false); setResetSent(false); }}
                  style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer", color: "#C9A96E", fontSize: 13, fontWeight: 700 }}>
                  رجوع للدخول
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input style={inp} placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email" />
                {resetError && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.15)", fontSize: 13, color: "#9B2518" }}>⚠️ {resetError}</div>}
                <button onClick={handleForgot} disabled={submitting || !email}
                  style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: !email ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !email ? "#F5F0E8" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !email ? "#BFA080" : "#1A0E02", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "جاري الإرسال..." : "أرسل رابط إعادة التعيين"}
                </button>
              </div>
            )}
          </div>

        ) : (
          /* Login */
          <div style={{ background: "#FFFFFF", borderRadius: 24, border: "1px solid #E8DDD0", padding: 28, boxShadow: "0 8px 40px rgba(44,26,10,0.12)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2C1A0A", textAlign: "center", marginBottom: 24 }}>تسجيل الدخول</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input style={inp} placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email" />
              <div style={{ position: "relative" }}>
                <input style={inp} placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  {showPass ? <EyeOff size={16} color="#C4A882" /> : <Eye size={16} color="#C4A882" />}
                </button>
              </div>

              {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.15)", fontSize: 13, color: "#9B2518" }}>⚠️ {error}</div>}

              {/* Terms */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "4px 0" }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: "#C9A96E", flexShrink: 0 }} />
                <div style={{ textAlign: "right", flex: 1 }}>
                  <span style={{ fontSize: 12, color: "#9B7E60" }}>أوافق على </span>
                  <a href="/terms" target="_blank" style={{ fontSize: 12, color: "#C9A96E", fontWeight: 700 }}>شروط الاستخدام</a>
                  <span style={{ fontSize: 12, color: "#9B7E60" }}> و</span>
                  <a href="/privacy" target="_blank" style={{ fontSize: 12, color: "#C9A96E", fontWeight: 700 }}>سياسة الخصوصية</a>
                </div>
              </div>

              <button onClick={handleLogin} disabled={submitting || !email || !password || !agreed}
                style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: submitting || !email || !password || !agreed ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 16, background: !email || !password || !agreed ? "#F5F0E8" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !email || !password || !agreed ? "#BFA080" : "#1A0E02", opacity: submitting ? 0.7 : 1, transition: "all 0.2s", marginTop: 4 }}>
                {submitting ? "جاري الدخول..." : "دخول"}
              </button>

              <button onClick={() => setIsForgot(true)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#C9A96E", fontFamily: "Tajawal, sans-serif", fontWeight: 600 }}>
                نسيت كلمة المرور؟
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#BFA080" }}>حسابك يُفعَّل من قِبَل إدارة درّة</div>
          </div>
        )}
      </div>
    </div>
  );
}
