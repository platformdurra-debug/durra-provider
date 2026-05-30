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
  const [uploading, setUploading] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "providers"), where("ownerId", "==", user.uid))).then(snap => {
      if (!snap.empty) {
        const d = snap.docs[0].data();
        setProviderId(snap.docs[0].id);
        setName(d.name || ""); setPhone(d.phone || ""); setWhatsapp(d.whatsapp || "");
        setInstagram(d.instagram || ""); setArea(d.area || ""); setDescription(d.description || "");
        setWorkFrom(d.workingHours?.from || ""); setWorkTo(d.workingHours?.to || "");
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [user, loading]);

  const save = async () => {
    if (!providerId) return;
    setSaving(true);
    await updateDoc(doc(db, "providers", providerId), { name, phone, whatsapp, instagram, area, description, workingHours: { from: workFrom, to: workTo } });
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const uploadImage = async (file: File, field: string) => {
    if (!providerId) return;
    setUploading(field);
    const storageRef = ref(storage, `providers/${user?.uid}/${field}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "providers", providerId), { [field]: url });
    setUploading(null);
  };

  if (loading || fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {saved && <span style={{ fontSize: 12, color: "#34D399", fontWeight: 700 }}>✓ تم الحفظ</span>}
          <div className="logo-text">درّة ✦</div>
        </div>
        <div className="page-title">إعدادات المحل</div>
        <div className="page-sub">تحديث معلومات وصور محلك</div>
      </div>

      <div style={{ padding: "16px" }}>
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14, fontWeight: 600 }}>صور المحل</div>
          <div style={{ display: "flex", gap: 12 }}>
            {["coverImage", "logoImage"].map(field => (
              <label key={field} className="upload-box" style={{ flex: 1, height: 80, position: "relative" }}>
                {uploading === field && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>}
                <div style={{ width: 24, height: 24, borderRadius: 6, border: "1.5px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14, color: "var(--gold)", lineHeight: 1 }}>+</span>
                </div>
                <span className="upload-box-label">{field === "coverImage" ? "الغلاف" : "اللوغو"}</span>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], field)} />
              </label>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="input" placeholder="اسم المحل" value={name} onChange={e => setName(e.target.value)} />
            <input className="input" placeholder="المنطقة" value={area} onChange={e => setArea(e.target.value)} />
            <input className="input" placeholder="رقم الجوال" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            <input className="input" placeholder="واتساب" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} type="tel" />
            <input className="input" placeholder="إنستقرام" value={instagram} onChange={e => setInstagram(e.target.value)} />
            <textarea className="input" placeholder="وصف المحل..." value={description} onChange={e => setDescription(e.target.value)} style={{ height: 80, resize: "none" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input className="input" placeholder="من (9:00 AM)" value={workFrom} onChange={e => setWorkFrom(e.target.value)} />
              <input className="input" placeholder="إلى (10:00 PM)" value={workTo} onChange={e => setWorkTo(e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} className="btn-gold">{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</button>
      </div>
      <ProviderNav />
    </div>
  );
}
