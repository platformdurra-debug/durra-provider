"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProviderNav from "@/components/ProviderNav";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "انتظار تأكيد", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  confirmed: { label: "مؤكد ✓",       color: "#34D399", bg: "rgba(52,211,153,0.15)" },
  completed: { label: "مكتمل",        color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)" },
  cancelled: { label: "ملغي",         color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};

export default function BookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "serviceBookings"), where("providerId", "==", user.uid), orderBy("createdAt", "desc")))
      .then(snap => { setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "serviceBookings", id), { status });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const filtered = tab === "all" ? bookings : bookings.filter(b => b.status === tab);

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 16 }}>الطلبات الواردة</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14 }}>
          {[{ val: "all", label: "الكل" }, { val: "pending", label: "انتظار" }, { val: "confirmed", label: "مؤكدة" }, { val: "completed", label: "مكتملة" }].map(t => (
            <button key={t.val} onClick={() => setTab(t.val)} style={{ padding: "7px 16px", borderRadius: 50, border: "none", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 12, background: tab === t.val ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "rgba(255,255,255,0.06)", color: tab === t.val ? "#1A0E05" : "rgba(255,255,255,0.4)", transition: "all 0.2s" }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>لا توجد طلبات</div>
          </div>
        ) : filtered.map(b => {
          const s = STATUS[b.status] || STATUS.pending;
          return (
            <div key={b.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{b.customerName || "زبونة"}</div>
                  <div style={{ fontSize: 12, color: "#C9A96E", fontWeight: 700 }}>{b.productName || "خدمة"}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.05)", marginBottom: b.status === "pending" ? 10 : 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#C9A96E" }}>{b.providerAmount} <span style={{ fontSize: 11 }}>د.ب</span></div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{b.date?.seconds ? new Date(b.date.seconds * 1000).toLocaleDateString("ar-BH") : "—"}</div>
              </div>
              {b.note && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "right", marginBottom: 10 }}>ملاحظة: {b.note}</div>}
              {b.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => updateStatus(b.id, "cancelled")} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13, background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>رفض</button>
                  <button onClick={() => updateStatus(b.id, "confirmed")} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13, background: "rgba(52,211,153,0.15)", color: "#34D399" }}>قبول ✓</button>
                </div>
              )}
              {b.status === "confirmed" && (
                <button onClick={() => updateStatus(b.id, "completed")} style={{ width: "100%", padding: "9px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13, background: "rgba(96,165,250,0.15)", color: "#60A5FA" }}>تأكيد الإكمال</button>
              )}
            </div>
          );
        })}
      </div>
      <ProviderNav />
    </div>
  );
}
