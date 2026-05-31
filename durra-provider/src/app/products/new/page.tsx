"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface Addon {
  name: string;
  price: string;
}

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // التوصيل
  const [hasDelivery, setHasDelivery] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState("");

  // الإضافات
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImages = (files: FileList) => {
    const arr = Array.from(files).slice(0, 5);
    setImages(arr);
    setPreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const addAddon = () => setAddons(prev => [...prev, { name: "", price: "" }]);
  const removeAddon = (i: number) => setAddons(prev => prev.filter((_, idx) => idx !== i));
  const updateAddon = (i: number, field: keyof Addon, val: string) => {
    setAddons(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a));
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

      const validAddons = addons.filter(a => a.name && a.price).map(a => ({ name: a.name, price: Number(a.price) }));

      await addDoc(collection(db, "providerProducts"), {
        name,
        price: Number(price),
        description,
        duration,
        images: urls,
        providerId,
        hasDelivery,
        deliveryPrice: hasDelivery ? Number(deliveryPrice) : 0,
        addons: validAddons,
        active: true,
        featured: false,
        createdAt: serverTimestamp(),
      });
      router.push("/products");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "52px 16px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 16, color: "var(--text2)" }}>›</span>
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>إضافة خدمة جديدة</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* الصور */}
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

        {/* البيانات الأساسية */}
        <div className="card">
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, fontWeight: 600 }}>بيانات الخدمة</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="input" placeholder="اسم الخدمة" value={name} onChange={e => setName(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input className="input" placeholder="السعر (د.ب)" value={price} onChange={e => setPrice(e.target.value)} type="number" />
              <input className="input" placeholder="المدة (مثال: ساعتان)" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <textarea className="input" placeholder="وصف الخدمة..." value={description} onChange={e => setDescription(e.target.value)} style={{ height: 90, resize: "none" }} />
          </div>
        </div>

        {/* التوصيل */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: hasDelivery ? 12 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setHasDelivery(!hasDelivery)}
                style={{ width: 44, height: 24, borderRadius: 50, border: "none", cursor: "pointer", background: hasDelivery ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "var(--bg2)", transition: "all 0.2s", position: "relative" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, transition: "all 0.2s", left: hasDelivery ? 22 : 4, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </button>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>🚚 خدمة التوصيل</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>هل تقدم توصيل للزبائن؟</div>
            </div>
          </div>
          {hasDelivery && (
            <input className="input" placeholder="سعر التوصيل (د.ب)" value={deliveryPrice} onChange={e => setDeliveryPrice(e.target.value)} type="number" />
          )}
        </div>

        {/* الإضافات */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button onClick={addAddon} style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 10, padding: "6px 14px", cursor: "pointer", fontSize: 12, color: "var(--gold3)", fontFamily: "Tajawal", fontWeight: 600 }}>
              + إضافة
            </button>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>✨ الإضافات (Add-ons)</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>خيارات إضافية بأسعار مختلفة</div>
            </div>
          </div>

          {addons.length === 0 ? (
            <div style={{ textAlign: "center", padding: "16px 0", fontSize: 12, color: "var(--text4)" }}>
              لا توجد إضافات — اضغط "+ إضافة" لتضيف
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {addons.map((addon, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => removeAddon(i)}
                    style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.15)", cursor: "pointer", color: "var(--red)", fontSize: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ×
                  </button>
                  <input className="input" placeholder="السعر (د.ب)" value={addon.price} onChange={e => updateAddon(i, "price", e.target.value)} type="number" style={{ width: 90, flexShrink: 0 }} />
                  <input className="input" placeholder="اسم الإضافة" value={addon.name} onChange={e => updateAddon(i, "name", e.target.value)} style={{ flex: 1 }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={loading || !name || !price} className="btn-gold"
          style={{ opacity: !name || !price ? 0.5 : 1 }}>
          {loading ? "جاري الإضافة..." : "إضافة الخدمة"}
        </button>
      </div>
    </div>
  );
}
