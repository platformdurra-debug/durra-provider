"use client";
import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where, orderBy, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProviderNav from "@/components/ProviderNav";

const NOTIF_ICONS: Record<string, string> = {
  new_booking:       "🎉",
  booking_confirmed: "✅",
  booking_cancelled: "↩️",
  booking_completed: "💰",
  default:           "🔔",
};

export default function ProviderNotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  // Real-time listener — يصدر صوت لما يجي إشعار جديد
  useEffect(() => {
    if (!user?.uid) return;
    setFetching(true);

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifs(prev => {
        // لو في إشعار جديد غير مقروء — شغّل الصوت
        if (prev.length > 0 && all.length > prev.length) {
          const newest = all[0] as any;
          if (!newest.read) {
            try {
              if (!audioRef.current) {
                audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA..."); // placeholder
              }
              audioRef.current.play().catch(() => {});
            } catch {}
          }
        }
        return all;
      });
      setFetching(false);
    });

    return () => unsub();
  }, [user]);

  const markRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.read);
    await Promise.all(unread.map(n => updateDoc(doc(db, "notifications", n.id), { read: true })));
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--gold3)", fontFamily: "Tajawal", fontWeight: 600 }}>
              قراءة الكل
            </button>
          )}
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">
          الإشعارات
          {unreadCount > 0 && (
            <span style={{ marginRight: 8, fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: "rgba(201,169,110,0.15)", color: "var(--gold3)" }}>
              {unreadCount} جديد
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {notifs.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div className="empty-text">لا توجد إشعارات</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifs.map((n: any) => (
              <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                style={{ background: n.read ? "var(--card)" : "rgba(201,169,110,0.06)", borderRadius: 16, border: `1px solid ${n.read ? "var(--border)" : "rgba(201,169,110,0.2)"}`, padding: "14px 16px", cursor: n.read ? "default" : "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A96E", flexShrink: 0 }} />}
                      <div style={{ fontSize: 14, fontWeight: n.read ? 400 : 700, color: "var(--text)", textAlign: "right" }}>{n.title || "إشعار جديد"}</div>
                    </div>
                    {n.body && <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "right", lineHeight: 1.6 }}>{n.body}</div>}
                    {/* رابط الطلب */}
                    {n.bookingId && (
                      <button onClick={e => { e.stopPropagation(); router.push("/bookings"); }}
                        style={{ background: "rgba(201,169,110,0.1)", border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 11, color: "var(--gold3)", fontFamily: "Tajawal", fontWeight: 600 }}>
                        عرض الطلب ←
                      </button>
                    )}
                    <div style={{ fontSize: 10, color: "var(--text4)" }}>
                      {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleDateString("ar-BH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </div>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{NOTIF_ICONS[n.type] || NOTIF_ICONS.default}</div>
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
