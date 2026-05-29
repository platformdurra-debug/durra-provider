"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProviderNav from "@/components/ProviderNav";

export default function ProviderSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [providerId, setProviderId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [workFrom, setWorkFrom] = useState("");
  const [workTo, setWorkTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "providers"), where("ownerId", "==", user.uid))).then(snap => {
      if (!snap.empty) {
        const d = snap.docs[0].data();
        setProviderId(snap.docs[0].id);
        setName(d.name || ""); setPhone(d.phone || ""); setWhatsapp(d.whatsapp || "");
        setInstagram(d.instagram || ""); setArea(d.area || ""); setDescription(d.description || "");
        setWorkFrom(d.workingHours?.from || ""); setWorkTo(d.workingHours?.to || "");
      }
    });
  }, [user]);

  const save = async () => {
    if (!providerId) return;
    setSaving(true);
    await updateDoc(doc(db, "providers", providerId), { name, phone, whatsapp, instagram, area, description, workingHours: { from: workFrom, to: workTo } });
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const uploadImage = async (file: File, field: string) => {
    if (!providerId) return;
    const storageRef = ref(storage, `providers/${user?.uid}/${field}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "providers", providerId), { [field]: url });
  };

  const inp: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.1)", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none", textAlign: "right", direction: "rtl" };

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ padding: "56px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {saved && <span style={{ fontSize: 12, color: "#34D399", fontWeight: 700 }}>✓ تم الحفظ</span>}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>إعدادات المحل</div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Images */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12, textAlign: "right" }}>صور المحل</div>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ flex: 1, height: 70, borderRadius: 14, border: "2px dashed rgba(201,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexDirection: "column", gap: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style={{ fontSize: 10, color: "rgba(201,169,110,0.7)" }}>الغلاف</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], "coverImage")} />
            </label>
            <label style={{ flex: 1, height: 70, borderRadius: 14, border: "2px dashed rgba(201,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexDirection: "column", gap: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style={{ fontSize: 10, color: "rgba(201,169,110,0.7)" }}>اللوغو</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], "logoImage")} />
            </label>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input style={inp} placeholder="اسم المحل" value={name} onChange={e => setName(e.target.value)} />
            <input style={inp} placeholder="المنطقة" value={area} onChange={e => setArea(e.target.value)} />
            <input style={inp} placeholder="رقم الجوال" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            <input style={inp} placeholder="واتساب" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} type="tel" />
            <input style={inp} placeholder="إنستقرام" value={instagram} onChange={e => setInstagram(e.target.value)} />
            <textarea style={{ ...inp, height: 80, resize: "none" }} placeholder="وصف المحل..." value={description} onChange={e => setDescription(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input style={inp} placeholder="من (مثال: 9:00 AM)" value={workFrom} onChange={e => setWorkFrom(e.target.value)} />
              <input style={inp} placeholder="إلى (مثال: 10:00 PM)" value={workTo} onChange={e => setWorkTo(e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} style={{ width: "100%", padding: "14px", borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#1A0E05", opacity: saving ? 0.7 : 1 }}>
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
      <ProviderNav />
    </div>
  );
}
