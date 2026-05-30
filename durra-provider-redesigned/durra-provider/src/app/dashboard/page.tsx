"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProviderNav from "@/components/ProviderNav";

const STATUS_OPTIONS = [
  { val: "open",   label: "مفتوح",  color: "#1A6B42", bg: "rgba(45,138,94,0.1)",  border: "rgba(45,138,94,0.25)" },
  { val: "busy",   label: "مشغول", color: "#92580A", bg: "rgba(212,136,10,0.1)", border: "rgba(212,136,10,0.25)" },
  { val: "closed", label: "مغلق",  color: "#9B2518", bg: "rgba(192,57,43,0.1)",  border: "rgba(192,57,43,0.25)" },
];

const BOOKING_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "انتظار", color: "#92580A", bg: "rgba(212,136,10,0.1)" },
  confirmed: { label: "مؤكد",   color: "#1A6B42", bg: "rgba(45,138,94,0.1)" },
  completed: { label: "مكتمل", color: "#9B7A54", bg: "rgba(155,122,84,0.1)" },
  cancelled: { label: "ملغي",  color: "#9B2518", bg: "rgba(192,57,43,0.1)" },
};

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
    Promise.all([
      getDocs(query(collection(db, "providers"), where("ownerId", "==", user.uid))),
      getDocs(query(collection(db, "serviceBookings"), where("providerId", "==", user.uid), orderBy("createdAt", "desc"))),
    ]).then(([provSnap, bookSnap]) => {
      if (!provSnap.empty) setProvider({ id: provSnap.docs[0].id, ...provSnap.docs[0].data() });
      const bookings = bookSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const completed = bookings.filter((b: any) => b.status === "completed");
      setStats({ total: bookings.length, pending: bookings.filter((b: any) => b.status === "pending").length, completed: completed.length, earnings: completed.reduce((s: number, b: any) => s + (b.providerAmount || 0), 0) });
      setRecentBookings(bookings.slice(0, 4));
      setFetching(false);
    });
  }, [user]);

  const changeStatus = async (status: string) => {
    if (!provider) return;
    setStatusLoading(true);
    await updateDoc(doc(db, "providers", provider.id), { status });
    setProvider((p: any) => ({ ...p, status }));
    setStatusLoading(false);
  };

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  const currentStatus = STATUS_OPTIONS.find(s => s.val === (provider?.status || "open")) || STATUS_OPTIONS[0];

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Link href="/profile" style={{ textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontFamily: "Tajawal", fontWeight: 700, color: "#C9A96E" }}>حسابي</span>
            </div>
          </Link>
          <div style={{ textAlign: "right" }}>
            <div className="logo-text">درّة ✦</div>
            <div style={{ fontSize: 11, color: "rgba(201,169,110,0.45)", marginTop: 2 }}>{provider?.name || user?.displayName}</div>
          </div>
        </div>

        {/* Status */}
        <div style={{ marginTop: 20, background: "rgba(255,255,255,0.06)", borderRadius: 16, border: "1px solid rgba(201,169,110,0.15)", padding: "14px 16px" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", marginBottom: 10, textAlign: "right", letterSpacing: 1 }}>حالة المحل</div>
          <div style={{ display: "flex", gap: 8 }}>
            {STATUS_OPTIONS.map(s => (
              <button key={s.val} onClick={() => changeStatus(s.val)} disabled={statusLoading}
                style={{ flex: 1, padding: "9px 4px", borderRadius: 12, border: `1px solid ${provider?.status === s.val ? s.border : "rgba(201,169,110,0.1)"}`, cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 12, background: provider?.status === s.val ? s.bg : "transparent", color: provider?.status === s.val ? s.color : "rgba(201,169,110,0.3)", transition: "all 0.2s" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "إجمالي الطلبات", value: stats.total,               color: "var(--text)" },
            { label: "في الانتظار",    value: stats.pending,             color: "var(--yellow)" },
            { label: "مكتملة",         value: stats.completed,           color: "var(--green)" },
            { label: "أرباحي (د.ب)",   value: stats.earnings.toFixed(2), color: "var(--gold3)" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
          {[
            { href: "/products/new", label: "إضافة خدمة" },
            { href: "/products",     label: "خدماتي" },
            { href: "/reviews",      label: "التقييمات" },
          ].map(item => (
            <Link href={item.href} key={item.label} style={{ textDecoration: "none" }}>
              <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", padding: "14px 10px", textAlign: "center", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,169,110,0.35)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E8DDD0"; }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold3)", fontFamily: "Tajawal" }}>{item.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Bookings */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Link href="/bookings" style={{ textDecoration: "none", fontSize: 12, color: "var(--gold3)", fontWeight: 700 }}>عرض الكل ←</Link>
          <div className="section-title" style={{ marginBottom: 0 }}>آخر الطلبات</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentBookings.length === 0 ? (
            <div className="empty-state"><div className="empty-text">لا توجد طلبات بعد</div></div>
          ) : recentBookings.map((b: any) => {
            const s = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending;
            return (
              <div key={b.id} className="card" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--gold3)" }}>{b.providerAmount} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{b.customerName || "زبونة"}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{b.productName || "خدمة"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ProviderNav />
    </div>
  );
}
