"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const inp: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.1)", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none", textAlign: "right", direction: "rtl" };

  const handleImages = (files: FileList) => {
    const arr = Array.from(files).slice(0, 5);
    setImages(arr);
    setPreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!user || !name || !price) return;
    setLoading(true);
    try {
      const provSnap = await getDocs(query(collection(db, "providers"), where("ownerId", "==", user.uid)));
      const providerId = provSnap.empty ? user.uid : provSnap.docs[0].id;
      const urls: string[] = [];
      for (const img of images) {
        const storageRef = ref(storage, `providers/${user.uid}/${Date.now()}_${img.name}`);
        await uploadBytes(storageRef, img);
        urls.push(await getDownloadURL(storageRef));
      }
      await addDoc(collection(db, "providerProducts"), {
        name, price: Number(price), description, duration,
        images: urls, providerId, active: true, featured: false,
        createdAt: serverTimestamp(),
      });
      router.push("/products");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: "#0F0A1A", minHeight: "100vh", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "56px 20px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>إضافة خدمة جديدة</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Images */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: 16 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, textAlign: "right" }}>صور الخدمة</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {previews.map((p, i) => <img key={i} src={p} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />)}
            <label style={{ width: 80, height: 80, borderRadius: 12, border: "2px dashed rgba(201,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && handleImages(e.target.files)} />
            </label>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", padding: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input style={inp} placeholder="اسم الخدمة" value={name} onChange={e => setName(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input style={inp} placeholder="السعر (د.ب)" value={price} onChange={e => setPrice(e.target.value)} type="number" />
              <input style={inp} placeholder="المدة (مثال: ساعتان)" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <textarea style={{ ...inp, height: 90, resize: "none" }} placeholder="وصف الخدمة..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || !name || !price}
          style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !name || !price ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !name || !price ? "rgba(255,255,255,0.3)" : "#1A0E05", opacity: loading ? 0.7 : 1 }}>
          {loading ? "جاري الإضافة..." : "إضافة الخدمة"}
        </button>
      </div>
    </div>
  );
}
