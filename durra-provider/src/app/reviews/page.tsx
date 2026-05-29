"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProviderNav from "@/components/ProviderNav";

export default function ReviewsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "reviews"), where("providerId", "==", user.uid), orderBy("createdAt", "desc")))
      .then(snap => { setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "0.0";

  if (fetching) return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>التقييمات</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>({reviews.length} تقييم)</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B" }}>{avg}</span>
          <span style={{ fontSize: 20 }}>⭐</span>
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>لا توجد تقييمات بعد</div>
          </div>
        ) : reviews.map(r => (
          <div key={r.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.07)", padding: "14px 18px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{new Date((r.createdAt?.seconds || 0) * 1000).toLocaleDateString("ar-BH")}</span>
              <span style={{ fontSize: 16, color: "#F59E0B" }}>{"★".repeat(r.rating || 0)}</span>
            </div>
            {r.comment && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, textAlign: "right" }}>{r.comment}</div>}
          </div>
        ))}
      </div>
      <ProviderNav />
    </div>
  );
}
