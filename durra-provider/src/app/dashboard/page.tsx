"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProviderNav from "@/components/ProviderNav";

const STATUS_OPTIONS = [
  { val: "open",   label: "مفتوح الآن",  dot: "#34D399", bg: "rgba(52,211,153,0.15)" },
  { val: "busy",   label: "مشغول",       dot: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  { val: "closed", label: "مغلق",        dot: "#EF4444", bg: "rgba(239,68,68,0.15)" },
];

export default function ProviderDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, earnings: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [provSnap, bookSnap] = await Promise.all([
        getDocs(query(collection(db, "providers"), where("ownerId", "==", user.uid))),
        getDocs(query(collection(db, "serviceBookings"), where("providerId", "==", user.uid), orderBy("createdAt", "desc"))),
      ]);
      if (!provSnap.empty) setProvider({ id: provSnap.docs[0].id, ...provSnap.docs[0].data() });
      const bookings = bookSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const completed = bookings.filter((b: any) => b.status === "completed");
      setStats({
        total: bookings.length,
        pending: bookings.filter((b: any) => b.status === "pending").length,
        completed: completed.length,
        earnings: completed.reduce((s: number, b: any) => s + (b.providerAmount || 0), 0),
      });
      setRecentBookings(bookings.slice(0, 4));
      setFetching(false);
    };
    fetchAll();
  }, [user]);

  const changeStatus = async (status: string) => {
    if (!provider) return;
    setStatusLoading(true);
    await updateDoc(doc(db, "providers", provider.id), { status });
    setProvider((p: any) => ({ ...p, status }));
    setStatusLoading(false);
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.val === (provider?.status || "open")) || STATUS_OPTIONS[0];

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* Header */}
      <div style={{ padding: "56px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Link href="/profile">
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(201,169,110,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18 }}>👤</span>
            </div>
          </Link>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, color: "#C9A96E" }}>درّة</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{provider?.name || user?.displayName}</div>
          </div>
        </div>

        {/* Status Switcher */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", padding: "12px 16px" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10, textAlign: "right" }}>حالة المحل</div>
          <div style={{ display: "flex", gap: 8 }}>
            {STATUS_OPTIONS.map(s => (
              <button key={s.val} onClick={() => changeStatus(s.val)} disabled={statusLoading}
                style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 11, background: provider?.status === s.val ? s.bg : "rgba(255,255,255,0.04)", color: provider?.status === s.val ? s.dot : "rgba(255,255,255,0.3)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "الطلبات الكل", value: stats.total,               icon: "📦", color: "#60A5FA" },
          { label: "انتظار",       value: stats.pending,             icon: "⏳", color: "#F59E0B" },
          { label: "مكتملة",      value: stats.completed,            icon: "✅", color: "#34D399" },
          { label: "أرباحي (د.ب)", value: stats.earnings.toFixed(2), icon: "💰", color: "#C9A96E" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: "18px 16px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ padding: "0 20px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { href: "/products/new", icon: "➕", label: "إضافة خدمة" },
            { href: "/products",     icon: "🛠️", label: "خدماتي" },
            { href: "/reviews",      icon: "⭐", label: "التقييمات" },
          ].map(item => (
            <Link href={item.href} key={item.label} style={{ textDecoration: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{item.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Link href="/bookings" style={{ textDecoration: "none", fontSize: 12, color: "#C9A96E", fontWeight: 600 }}>عرض الكل ‹</Link>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>آخر الطلبات</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 20 }}>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>لا توجد طلبات بعد</div>
            </div>
          ) : recentBookings.map((b: any) => (
            <div key={b.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.07)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#C9A96E" }}>{b.providerAmount} د.ب</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{b.customerName || "زبونة"}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{b.productName || "خدمة"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProviderNav />
    </div>
  );
}
