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

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>PROVIDER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div style={{ marginTop: 16, display: "flex", alignItems: "flex-end", gap: 12 }}>
          <div>
            <div className="page-title" style={{ marginTop: 0 }}>التقييمات</div>
            <div className="page-sub">{reviews.length} تقييم</div>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: "#E8D5A3", lineHeight: 1 }}>{avg}</div>
        </div>
        {/* Stars bar */}
        <div style={{ marginTop: 12, display: "flex", gap: 4 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= Math.round(Number(avg)) ? "rgba(201,169,110,0.7)" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {reviews.length === 0 ? (
          <div className="empty-state"><div className="empty-text">لا توجد تقييمات بعد</div></div>
        ) : reviews.map(r => (
          <div key={r.id} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: r.comment ? 10 : 0 }}>
              <div style={{ fontSize: 10, color: "var(--text4)" }}>
                {new Date((r.createdAt?.seconds || 0) * 1000).toLocaleDateString("ar-BH")}
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: i <= (r.rating || 0) ? "var(--gold)" : "var(--border)" }} />
                ))}
              </div>
            </div>
            {r.comment && <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, textAlign: "right" }}>{r.comment}</div>}
          </div>
        ))}
      </div>
      <ProviderNav />
    </div>
  );
}
