"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProviderNav from "@/components/ProviderNav";

export default function ProviderEarningsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "serviceBookings"), where("providerId", "==", user.uid), where("status", "==", "completed"), orderBy("createdAt", "desc")))
      .then(snap => { setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user, loading]);

  const total = bookings.reduce((s, b) => s + (b.providerAmount || 0), 0);
  const now = new Date();
  const thisMonth = bookings.filter(b => {
    const d = new Date((b.createdAt?.seconds || 0) * 1000);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, b) => s + (b.providerAmount || 0), 0);

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div style={{ background: "linear-gradient(150deg, #2C1A0A, #4A2E14)", padding: "52px 20px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 3, marginBottom: 16 }}>إجمالي الأرباح</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>{total.toFixed(2)}</div>
        <div style={{ fontSize: 13, color: "rgba(201,169,110,0.5)", marginTop: 6 }}>دينار بحريني</div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderColor: "rgba(201,169,110,0.2)" }}>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>هذا الشهر</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--green)" }}>{thisMonth.toFixed(2)} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
        </div>

        <div className="section-title">السجل ({bookings.length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bookings.length === 0 ? (
            <div className="empty-state"><div className="empty-text">لا توجد أرباح بعد</div></div>
          ) : bookings.map(b => (
            <div key={b.id} className="card" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text4)", fontFamily: "monospace" }}>{new Date((b.createdAt?.seconds || 0) * 1000).toLocaleDateString("ar-BH")}</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 2 }}>{b.customerName || "زبونة"} · {b.productName || "خدمة"}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gold3)" }}>{b.providerAmount} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ProviderNav />
    </div>
  );
}
