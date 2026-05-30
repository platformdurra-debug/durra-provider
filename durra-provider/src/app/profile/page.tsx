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
    <div className="page-wrap">
      {/* Hero */}
      <div style={{ background: "linear-gradient(150deg, #2C1A0A, #4A2E14)", padding: "52px 20px 32px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(201,169,110,0.12)", margin: "0 auto 14px", border: "2px solid rgba(201,169,110,0.2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {provider?.logoImage
            ? <img src={provider.logoImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "var(--gold)", fontStyle: "italic" }}>
                {(provider?.name || user?.displayName || "م")[0]}
              </div>
          }
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#E8D5A3", marginBottom: 4 }}>{provider?.name || user?.displayName}</div>
        <div style={{ fontSize: 12, color: "rgba(201,169,110,0.45)" }}>{provider?.type} · {provider?.area}</div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
          {[
            { label: "الخدمات", value: stats.products, color: "var(--blue)" },
            { label: "مكتملة",  value: stats.bookings, color: "var(--green)" },
            { label: "أرباحي",  value: `${stats.earnings.toFixed(0)} د.ب`, color: "var(--gold3)" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
              <div className="stat-value" style={{ color: s.color, fontSize: 18 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="card" style={{ padding: 0 }}>
          {[
            { href: "/dashboard",  label: "لوحة التحكم" },
            { href: "/products",   label: "خدماتي" },
            { href: "/bookings",   label: "الطلبات" },
            { href: "/earnings",   label: "الأرباح" },
            { href: "/reviews",    label: "التقييمات" },
            { href: "/settings",   label: "إعدادات المحل" },
          ].map((item, i, arr) => (
            <Link href={item.href} key={item.label} style={{ textDecoration: "none" }}>
              <div className="divider-row" style={{ padding: "16px 20px", borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border)" }}>
                <span style={{ fontSize: 14, color: "var(--text4)" }}>‹</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)" }}>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>

        <button onClick={logout} style={{ width: "100%", marginTop: 16, padding: "14px", borderRadius: 16, border: "1px solid rgba(192,57,43,0.2)", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 14, background: "rgba(192,57,43,0.05)", color: "var(--red)" }}>
          تسجيل الخروج
        </button>
      </div>
      <ProviderNav />
    </div>
  );
}
