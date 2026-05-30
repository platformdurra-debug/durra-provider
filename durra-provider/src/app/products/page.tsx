"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProviderNav from "@/components/ProviderNav";

export default function ProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (loading || !user?.uid) return;
    getDocs(query(collection(db, "providerProducts"), where("providerId", "==", user.uid)))
      .then(snap => { setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user, loading]);

  const toggleActive = async (id: string, cur: boolean) => {
    await updateDoc(doc(db, "providerProducts", id), { active: !cur });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !cur } : p));
  };

  const toggleFeatured = async (id: string, cur: boolean) => {
    await updateDoc(doc(db, "providerProducts", id), { featured: !cur });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !cur } : p));
  };

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/products/new" style={{ textDecoration: "none" }}>
            <div style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.25)", fontSize: 12, fontWeight: 700, color: "#C9A96E", fontFamily: "Tajawal" }}>+ إضافة</div>
          </Link>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">خدماتي</div>
        <div className="page-sub">{products.length} خدمة</div>
      </div>

      <div style={{ padding: "16px" }}>
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-text" style={{ marginBottom: 20 }}>لا توجد خدمات بعد</div>
            <Link href="/products/new">
              <button className="btn-gold" style={{ width: "auto", padding: "12px 28px", borderRadius: 50 }}>أضيفي أول خدمة</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {products.map(p => (
              <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden", opacity: p.active ? 1 : 0.65 }}>
                <div style={{ display: "flex", gap: 14, padding: "16px" }}>
                  {p.images?.[0] ? (
                    <img src={p.images[0]} style={{ width: 76, height: 76, borderRadius: 14, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />
                  ) : (
                    <div style={{ width: 76, height: 76, borderRadius: 14, background: "var(--bg2)", flexShrink: 0, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--gold-glow)", border: "1px solid rgba(201,169,110,0.2)" }} />
                    </div>
                  )}
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 4 }}>
                      {p.featured && <span className="badge" style={{ background: "rgba(201,169,110,0.1)", color: "var(--gold3)", fontSize: 10 }}>مميّز</span>}
                      {!p.active && <span className="badge" style={{ background: "rgba(192,57,43,0.08)", color: "var(--red)", fontSize: 10 }}>موقوف</span>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, lineHeight: 1.5 }}>{p.description}</div>}
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gold3)" }}>{p.price} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
                  </div>
                </div>
                <div style={{ display: "flex", borderTop: "1px solid var(--border)" }}>
                  <button onClick={() => toggleFeatured(p.id, p.featured)}
                    style={{ flex: 1, padding: "11px", border: "none", borderLeft: "1px solid var(--border)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 11, background: "transparent", color: p.featured ? "var(--gold3)" : "var(--text3)" }}>
                    {p.featured ? "مميّز ✓" : "تمييز"}
                  </button>
                  <Link href={`/products/${p.id}`} style={{ flex: 1, display: "flex" }}>
                    <button style={{ flex: 1, padding: "11px", border: "none", borderLeft: "1px solid var(--border)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 11, background: "transparent", color: "var(--text3)" }}>تعديل</button>
                  </Link>
                  <button onClick={() => toggleActive(p.id, p.active)}
                    style={{ flex: 1, padding: "11px", border: "none", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 700, fontSize: 11, background: "transparent", color: p.active ? "var(--red)" : "var(--green)" }}>
                    {p.active ? "إيقاف" : "تفعيل"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ProviderNav />
    </div>
  );
}
