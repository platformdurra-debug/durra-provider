"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff } from "lucide-react";

export default function ProviderAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { login, loading, error } = useAuthStore();

  const inp: React.CSSProperties = { width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.1)", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none", textAlign: "right", direction: "rtl" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0F0A1A, #1A1228)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 48, fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>درّة</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 3, marginTop: 6 }}>— بوابة المزوّد —</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, background: "rgba(255,255,255,0.04)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", padding: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 24 }}>تسجيل الدخول</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input style={inp} placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email" />
          <div style={{ position: "relative" }}>
            <input style={inp} placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} type={showPass ? "text" : "password"} onKeyDown={e => e.key === "Enter" && login(email, password)} />
            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
              {showPass ? <EyeOff size={16} color="rgba(255,255,255,0.35)" /> : <Eye size={16} color="rgba(255,255,255,0.35)" />}
            </button>
          </div>
          {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#FCA5A5" }}>⚠️ {error}</div>}
          <button onClick={() => login(email, password)} disabled={loading || !email || !password}
            style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 16, marginTop: 4, background: !email || !password ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !email || !password ? "rgba(255,255,255,0.3)" : "#1A0E05", opacity: loading ? 0.7 : 1 }}>
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>حسابك يُفعَّل من قِبَل إدارة درّة</div>
      </div>
    </div>
  );
}
