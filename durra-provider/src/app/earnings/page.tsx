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
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "serviceBookings"), where("providerId", "==", user.uid), where("status", "==", "completed"), orderBy("createdAt", "desc")))
      .then(snap => { setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  const total = bookings.reduce((s, b) => s + (b.providerAmount || 0), 0);
  const thisMonth = bookings.filter(b => {
    const d = new Date((b.createdAt?.seconds || 0) * 1000);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, b) => s + (b.providerAmount || 0), 0);

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "linear-gradient(135deg, #1A1228, #2C1810)", padding: "56px 20px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 8 }}>إجمالي الأرباح</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>{total.toFixed(2)}</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>دينار بحريني</div>
      </div>
      <div style={{ padding: "20px" }}>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: "18px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#34D399" }}>{thisMonth.toFixed(2)} <span style={{ fontSize: 13 }}>د.ب</span></div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>هذا الشهر</div>
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 14 }}>السجل</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 20 }}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>لا توجد أرباح بعد</div>
            </div>
          ) : bookings.map(b => (
            <div key={b.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.07)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#C9A96E" }}>{b.providerAmount} <span style={{ fontSize: 12 }}>د.ب</span></div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{b.customerName || "زبونة"}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{new Date((b.createdAt?.seconds || 0) * 1000).toLocaleDateString("ar-BH")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ProviderNav />
    </div>
  );
}
