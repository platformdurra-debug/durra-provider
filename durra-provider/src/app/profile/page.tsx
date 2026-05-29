"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProviderNav from "@/components/ProviderNav";

export default function ProviderProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [stats, setStats] = useState({ products: 0, bookings: 0, earnings: 0 });

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    Promise.all([
      getDocs(query(collection(db, "providers"), where("ownerId", "==", user.uid))),
      getDocs(query(collection(db, "providerProducts"), where("providerId", "==", user.uid))),
      getDocs(query(collection(db, "serviceBookings"), where("providerId", "==", user.uid), where("status", "==", "completed"))),
    ]).then(([provSnap, prodSnap, bookSnap]) => {
      if (!provSnap.empty) setProvider({ id: provSnap.docs[0].id, ...provSnap.docs[0].data() });
      const bookings = bookSnap.docs.map(d => d.data());
      setStats({ products: prodSnap.size, bookings: bookSnap.size, earnings: bookings.reduce((s, b) => s + (b.providerAmount || 0), 0) });
    });
  }, [user]);

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "linear-gradient(135deg, #1A1228, #2C1810)", padding: "56px 20px 28px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(201,169,110,0.15)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {provider?.logoImage ? <img src={provider.logoImage} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ fontSize: 30 }}>🏪</span>}
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{provider?.name || user?.displayName}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{provider?.type} · {provider?.area}</div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "الخدمات", value: stats.products, color: "#60A5FA" },
            { label: "مكتملة",  value: stats.bookings, color: "#34D399" },
            { label: "أرباحي",  value: `${stats.earnings.toFixed(0)} د.ب`, color: "#C9A96E" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {[
          { href: "/dashboard",  icon: "📊", label: "لوحة التحكم" },
          { href: "/products",   icon: "🛠️", label: "خدماتي" },
          { href: "/bookings",   icon: "📦", label: "الطلبات" },
          { href: "/earnings",   icon: "💰", label: "الأرباح" },
          { href: "/reviews",    icon: "⭐", label: "التقييمات" },
          { href: "/settings",   icon: "⚙️", label: "الإعدادات" },
        ].map(item => (
          <Link href={item.href} key={item.label} style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.5)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{item.label}</span>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
              </div>
            </div>
          </Link>
        ))}

        <button onClick={logout} style={{ width: "100%", marginTop: 20, padding: "14px", borderRadius: 16, border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: "rgba(239,68,68,0.06)", color: "#EF4444" }}>
          تسجيل الخروج
        </button>
      </div>
      <ProviderNav />
    </div>
  );
}
