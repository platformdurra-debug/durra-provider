"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { usePayTabs } from "@/hooks/usePayTabs";
import ProviderNav from "@/components/ProviderNav";

const DEFAULT_PLANS = [
  { id: "basic", label: "أساسية", price: 10, desc: "للبداية",       features: ["3 خدمات", "إشعارات أساسية"],                          color: "var(--text3)", popular: false },
  { id: "gold",  label: "ذهبية",  price: 25, desc: "الأكثر شيوعاً", features: ["10 خدمات", "ظهور مميّز", "أولوية الظهور"],              color: "var(--gold3)", popular: true  },
  { id: "vip",   label: "VIP",    price: 50, desc: "للمحترفين",     features: ["غير محدود", "أعلى الصفحة", "شارة VIP", "دعم أولوية"], color: "var(--blue)",  popular: false },
];

export default function ProviderSubscriptionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { createSession } = usePayTabs();
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [currentPlan, setCurrentPlan] = useState("basic");
  const [subExpiry, setSubExpiry] = useState("");
  const [providerId, setProviderId] = useState("");
  const [paying, setPaying] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    Promise.all([
      getDocs(query(collection(db, "providers"), where("ownerId", "==", user.uid))),
      getDocs(collection(db, "subscriptionPlans")),
    ]).then(([provSnap, plansSnap]) => {
      if (!provSnap.empty) {
        const d = provSnap.docs[0].data();
        setProviderId(provSnap.docs[0].id);
        setCurrentPlan(d.plan || "basic");
        if (d.planExpiry?.seconds) {
          setSubExpiry(new Date(d.planExpiry.seconds * 1000).toLocaleDateString("ar-BH", { year: "numeric", month: "long", day: "numeric" }));
        }
      }
      if (!plansSnap.empty) {
        const fetched = plansSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        if (fetched.length > 0) setPlans(fetched);
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [user, loading]);

  const handleSubscribe = async (plan: any) => {
    if (!user || plan.id === currentPlan) return;
    setPaying(plan.id);
    try {
      const session = await createSession({
        bookingId: `sub_provider_${providerId}_${plan.id}_${Date.now()}`,
        amount: plan.price,
        customerName: user.displayName,
        customerEmail: user.email,
        customerPhone: user.phone,
      });
      if (session.redirect_url) window.location.href = session.redirect_url;
    } catch { alert("حدث خطأ، حاول مرة أخرى"); }
    finally { setPaying(null); }
  };

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>PROVIDER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">باقة الاشتراك</div>
        <div className="page-sub">اختر الباقة المناسبة لمحلك</div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Current Plan */}
        <div className="card" style={{ marginBottom: 20, borderColor: "rgba(201,169,110,0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              {subExpiry && <div style={{ fontSize: 11, color: "var(--text4)" }}>تنتهي: {subExpiry}</div>}
              <div style={{ fontSize: 12, color: "var(--gold3)", fontWeight: 700 }}>
                {plans.find(p => p.id === currentPlan)?.label || "أساسية"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>باقتك الحالية</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>✦ نشطة</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 100 }}>
          {plans.map(plan => {
            const isCurrent = plan.id === currentPlan;
            return (
              <div key={plan.id} className="card" style={{ borderColor: plan.popular ? "rgba(201,169,110,0.3)" : isCurrent ? "rgba(45,138,94,0.3)" : undefined, position: "relative", overflow: "hidden" }}>
                {plan.popular && !isCurrent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #C9A96E, #E8D5A3)" }} />}
                {isCurrent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #2D8A5E, #34D399)" }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: isCurrent ? "var(--green)" : plan.color }}>
                      {plan.price} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text3)" }}>د.ب/شهر</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text4)", marginTop: 2 }}>{plan.desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>{plan.label}</div>
                    {isCurrent && <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 700, marginTop: 2 }}>✓ باقتك الحالية</div>}
                    {plan.popular && !isCurrent && <div style={{ fontSize: 10, color: "var(--gold3)", fontWeight: 700, marginTop: 2 }}>⭐ الأكثر شيوعاً</div>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                  {plan.features.map((f: string) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                      <span style={{ fontSize: 13, color: "var(--text2)" }}>{f}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isCurrent ? "var(--green)" : plan.color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  ))}
                </div>
                {isCurrent ? (
                  <button disabled className="btn-ghost" style={{ opacity: 0.5, cursor: "not-allowed" }}>باقتك الحالية</button>
                ) : (
                  <button onClick={() => handleSubscribe(plan)} disabled={paying === plan.id}
                    className={plan.popular ? "btn-gold" : "btn-ghost"}>
                    {paying === plan.id ? "جاري التوجيه للدفع..." : `الاشتراك بـ ${plan.price} د.ب/شهر`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <ProviderNav />
    </div>
  );
}
