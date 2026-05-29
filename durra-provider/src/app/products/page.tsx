"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, deleteDoc, doc } from "firebase/firestore";
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
    if (!user) return;
    getDocs(query(collection(db, "providerProducts"), where("providerId", "==", user.uid)))
      .then(snap => { setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "providerProducts", id), { active: !current });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !current } : p));
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "providerProducts", id), { featured: !current });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !current } : p));
  };

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/products/new">
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A0E05" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
        </Link>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>خدماتي ({products.length})</div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛠️</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>لا توجد خدمات بعد</div>
            <Link href="/products/new">
              <button style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#1A0E05", border: "none", borderRadius: 50, padding: "12px 28px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, cursor: "pointer" }}>أضيفي أول خدمة</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 12, padding: "14px" }}>
                  {p.images?.[0] ? (
                    <img src={p.images[0]} style={{ width: 72, height: 72, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: 14, background: "rgba(201,169,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🛠️</div>
                  )}
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 4 }}>
                      {p.featured && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: "rgba(201,169,110,0.2)", color: "#C9A96E", fontWeight: 700 }}>مميّز ⭐</span>}
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{p.name}</div>
                    </div>
                    {p.description && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>{p.description}</div>}
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#C9A96E" }}>{p.price} <span style={{ fontSize: 11 }}>د.ب</span></div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <button onClick={() => toggleFeatured(p.id, p.featured)} style={{ flex: 1, padding: "10px", border: "none", borderLeft: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 11, background: "transparent", color: p.featured ? "#C9A96E" : "rgba(255,255,255,0.3)" }}>
                    {p.featured ? "⭐ مميّز" : "تمييز"}
                  </button>
                  <Link href={`/products/${p.id}`} style={{ flex: 1 }}>
                    <button style={{ width: "100%", padding: "10px", border: "none", borderLeft: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 11, background: "transparent", color: "rgba(255,255,255,0.4)" }}>تعديل</button>
                  </Link>
                  <button onClick={() => toggleActive(p.id, p.active)} style={{ flex: 1, padding: "10px", border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 11, background: "transparent", color: p.active ? "#EF4444" : "#34D399" }}>
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
