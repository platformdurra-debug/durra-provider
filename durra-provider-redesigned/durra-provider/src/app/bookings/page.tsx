"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProviderNav from "@/components/ProviderNav";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "انتظار تأكيد", color: "#92580A", bg: "rgba(212,136,10,0.1)" },
  confirmed: { label: "مؤكد",         color: "#1A6B42", bg: "rgba(45,138,94,0.1)" },
  completed: { label: "مكتمل",        color: "#9B7A54", bg: "rgba(155,122,84,0.1)" },
  cancelled: { label: "ملغي",         color: "#9B2518", bg: "rgba(192,57,43,0.1)" },
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

  const TABS = [
    { val: "all",       label: `الكل (${bookings.length})` },
    { val: "pending",   label: `انتظار (${bookings.filter(b => b.status === "pending").length})` },
    { val: "confirmed", label: "مؤكدة" },
    { val: "completed", label: "مكتملة" },
  ];

  const filtered = tab === "all" ? bookings : bookings.filter(b => b.status === tab);

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>PROVIDER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">الطلبات الواردة</div>
        <div className="page-sub">{bookings.length} طلب إجمالي</div>
      </div>

      <div style={{ padding: "16px" }}>
        <div className="tabs" style={{ marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.val} className={`tab-btn ${tab === t.val ? "active" : ""}`} onClick={() => setTab(t.val)}>{t.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-text">لا توجد طلبات</div></div>
          ) : filtered.map(b => {
            const s = STATUS[b.status] || STATUS.pending;
            return (
              <div key={b.id} className="card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{b.customerName || "زبونة"}</div>
                    <div style={{ fontSize: 12, color: "var(--gold3)", fontWeight: 700 }}>{b.productName || "خدمة"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--border)", marginBottom: b.status === "pending" || b.status === "confirmed" ? 12 : 0 }}>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{b.date?.seconds ? new Date(b.date.seconds * 1000).toLocaleDateString("ar-BH") : "—"}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--gold3)" }}>{b.providerAmount} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
                </div>
                {b.note && <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "right", marginBottom: 12, padding: "8px 12px", background: "var(--bg2)", borderRadius: 10 }}>{b.note}</div>}
                {b.status === "pending" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => updateStatus(b.id, "cancelled")} className="btn-danger">رفض</button>
                    <button onClick={() => updateStatus(b.id, "confirmed")} className="btn-success">قبول ✓</button>
                  </div>
                )}
                {b.status === "confirmed" && (
                  <button onClick={() => updateStatus(b.id, "completed")} className="btn-ghost" style={{ width: "100%" }}>تأكيد الإكمال</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <ProviderNav />
    </div>
  );
}
