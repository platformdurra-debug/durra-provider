"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "providerProducts", id as string)).then(snap => {
      if (snap.exists()) { const d = snap.data(); setName(d.name || ""); setPrice(String(d.price || "")); setDescription(d.description || ""); setDuration(d.duration || ""); }
    });
  }, [id]);

  const save = async () => {
    setSaving(true);
    await updateDoc(doc(db, "providerProducts", id as string), { name, price: Number(price), description, duration });
    setSaving(false); router.push("/products");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "52px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 16, color: "var(--text2)" }}>›</span>
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>تعديل الخدمة</div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input" placeholder="اسم الخدمة" value={name} onChange={e => setName(e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input className="input" placeholder="السعر (د.ب)" value={price} onChange={e => setPrice(e.target.value)} type="number" />
            <input className="input" placeholder="المدة" value={duration} onChange={e => setDuration(e.target.value)} />
          </div>
          <textarea className="input" placeholder="الوصف..." value={description} onChange={e => setDescription(e.target.value)} style={{ height: 90, resize: "none" }} />
        </div>
      </div>
      <button onClick={save} disabled={saving} className="btn-gold">
        {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </div>
  );
}
