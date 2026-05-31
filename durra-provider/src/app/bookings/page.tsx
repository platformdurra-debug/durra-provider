"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProviderNav from "@/components/ProviderNav";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "انتظار تأكيد", color: "#92580A", bg: "rgba(212,136,10,0.1)" },
  confirmed: { label: "مؤكد",         color: "#1A6B42", bg: "rgba(45,138,94,0.1)" },
  completed: { label: "مكتمل",        color: "#9B7A54", bg: "rgba(155,122,84,0.1)" },
  cancelled: { label: "ملغي",         color: "#9B2518", bg: "rgba(192,57,43,0.1)" },
};

export default function BookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [fetching, setFetching] = useState(false);
  const [complaintBooking, setComplaintBooking] = useState<any>(null);
  const [complaintText, setComplaintText] = useState("");
  const [sendingComplaint, setSendingComplaint] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "serviceBookings"), where("providerId", "==", user.uid), orderBy("createdAt", "desc")))
      .then(snap => { setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(() => setFetching(false));
  }, [user, loading]);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "serviceBookings", id), { status });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));

    // إشعار واتساب للزبونة
    if (status === "confirmed") {
      const booking = bookings.find(b => b.id === id);
      if (booking?.customerPhone) {
        const msg = encodeURIComponent(`مرحباً ${booking.customerName}، تم تأكيد حجزك لخدمة "${booking.productName}" ✅`);
        window.open(`https://wa.me/973${booking.customerPhone.replace(/\D/g, "")}?text=${msg}`, "_blank");
      }
    }
  };

  const submitComplaint = async () => {
    if (!complaintText.trim() || !complaintBooking || !user) return;
    setSendingComplaint(true);
    try {
      await addDoc(collection(db, "complaints"), {
        bookingId: complaintBooking.id,
        providerId: user.uid,
        customerId: complaintBooking.customerId,
        customerName: complaintBooking.customerName,
        productName: complaintBooking.productName,
        complaint: complaintText,
        status: "open",
        createdAt: serverTimestamp(),
      });
      // إشعار للأدمن
      await addDoc(collection(db, "notifications"), {
        userId: "admin",
        type: "new_complaint",
        title: "شكوى جديدة من مزود خدمة",
        body: `${user.displayName || "مزود"} يشتكي من ${complaintBooking.customerName}: ${complaintText.slice(0, 60)}...`,
        bookingId: complaintBooking.id,
        read: false,
        createdAt: serverTimestamp(),
      });
      setComplaintBooking(null);
      setComplaintText("");
      alert("تم إرسال الشكوى للإدارة ✅");
    } finally { setSendingComplaint(false); }
  };

  const TABS = [
    { val: "all",       label: `الكل (${bookings.length})` },
    { val: "pending",   label: `انتظار (${bookings.filter(b => b.status === "pending").length})` },
    { val: "confirmed", label: "مؤكدة" },
    { val: "completed", label: "مكتملة" },
  ];

  const filtered = tab === "all" ? bookings : bookings.filter(b => b.status === tab);

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: "rgba(201,169,110,0.4)", letterSpacing: 2 }}>PROVIDER</div>
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">الطلبات الواردة</div>
        <div className="page-sub">{bookings.length} طلب إجمالي</div>
      </div>

      <div style={{ padding: "16px" }}>
        <div className="tabs" style={{ marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.val} className={`tab-btn ${tab === t.val ? "active" : ""}`} onClick={() => setTab(t.val)}>{t.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-text">لا توجد طلبات</div></div>
          ) : filtered.map(b => {
            const s = STATUS[b.status] || STATUS.pending;
            return (
              <div key={b.id} className="card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{b.customerName || "زبونة"}</div>
                    <div style={{ fontSize: 12, color: "var(--gold3)", fontWeight: 700 }}>{b.productName || "خدمة"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--border)", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{b.date || "—"} {b.time && `· ${b.time}`}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--gold3)" }}>{b.providerAmount} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}>د.ب</span></div>
                </div>

                {b.notes && <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "right", marginBottom: 12, padding: "8px 12px", background: "var(--bg2)", borderRadius: 10 }}>{b.notes}</div>}

                {/* أزرار الحالة */}
                {b.status === "pending" && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <button onClick={() => updateStatus(b.id, "cancelled")} className="btn-danger">رفض</button>
                    <button onClick={() => updateStatus(b.id, "confirmed")} className="btn-success">قبول ✓</button>
                  </div>
                )}
                {b.status === "confirmed" && (
                  <button onClick={() => updateStatus(b.id, "completed")} className="btn-ghost" style={{ width: "100%", marginBottom: 8 }}>تأكيد الإكمال</button>
                )}

                {/* زر الشكوى */}
                {(b.status === "confirmed" || b.status === "completed") && (
                  <button onClick={() => { setComplaintBooking(b); setComplaintText(""); }}
                    style={{ width: "100%", padding: "9px", borderRadius: 12, border: "1px solid rgba(192,57,43,0.2)", cursor: "pointer", fontFamily: "Tajawal", fontWeight: 600, fontSize: 12, background: "rgba(192,57,43,0.04)", color: "var(--red)" }}>
                    ⚠️ تقديم شكوى للإدارة
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Complaint Modal */}
      {complaintBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setComplaintBooking(null)}>
          <div style={{ width: "100%", background: "var(--card)", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", textAlign: "right", marginBottom: 6 }}>تقديم شكوى</div>
            <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "right", marginBottom: 16 }}>
              شكوى بخصوص: {complaintBooking.customerName} — {complaintBooking.productName}
            </div>
            <textarea
              value={complaintText}
              onChange={e => setComplaintText(e.target.value)}
              placeholder="اكتب تفاصيل الشكوى..."
              style={{ width: "100%", height: 120, padding: "12px 14px", borderRadius: 14, border: "1.5px solid var(--border)", background: "var(--bg2)", color: "var(--text)", fontFamily: "Tajawal, sans-serif", fontSize: 13, outline: "none", resize: "none", textAlign: "right", direction: "rtl" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={() => setComplaintBooking(null)} className="btn-ghost">إلغاء</button>
              <button onClick={submitComplaint} disabled={sendingComplaint || !complaintText.trim()} className="btn-gold" style={{ flex: 1 }}>
                {sendingComplaint ? "جاري الإرسال..." : "إرسال للإدارة"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProviderNav />
    </div>
  );
}
