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
      await addDoc(collection(db, "providerProducts"), { name, price: Number(price), description, duration, images: urls, providerId, active: true, featured: false, createdAt: serverTimestamp() });
      router.push("/products");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "52px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 16, color: "var(--text2)" }}>›</span>
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>إضافة خدمة جديدة</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Images */}
        <div className="card">
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, fontWeight: 600 }}>صور الخدمة</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {previews.map((p, i) => <img key={i} src={p} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }} />)}
            <label className="upload-box" style={{ width: 80, height: 80, flexShrink: 0 }}>
              <span style={{ fontSize: 22, color: "var(--gold)" }}>+</span>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && handleImages(e.target.files)} />
            </label>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="input" placeholder="اسم الخدمة" value={name} onChange={e => setName(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input className="input" placeholder="السعر (د.ب)" value={price} onChange={e => setPrice(e.target.value)} type="number" />
              <input className="input" placeholder="المدة" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <textarea className="input" placeholder="وصف الخدمة..." value={description} onChange={e => setDescription(e.target.value)} style={{ height: 90, resize: "none" }} />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || !name || !price} className="btn-gold"
          style={{ opacity: !name || !price ? 0.5 : 1 }}>
          {loading ? "جاري الإضافة..." : "إضافة الخدمة"}
        </button>
      </div>
    </div>
  );
}
