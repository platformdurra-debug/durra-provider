"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/settings", label: "الإعدادات", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  { href: "/earnings", label: "أرباحي", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { href: "/bookings", label: "الطلبات", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { href: "/products", label: "خدماتي", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  { href: "/dashboard", label: "الرئيسية", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
];

export default function ProviderNav() {
  const path = usePathname();
  if (path === "/auth") return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50 }}>
      <div style={{ background: "rgba(15,10,26,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(201,169,110,0.15)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 0 20px" }}>
        {NAV.map(item => {
          const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
          return (
            <Link href={item.href} key={item.label} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, position: "relative" }}>
              {active && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", width: 28, height: 3, borderRadius: "0 0 4px 4px", background: "linear-gradient(90deg, #C9A96E, #E8D5A3)" }} />}
              <div style={{ color: active ? "#C9A96E" : "rgba(255,255,255,0.35)", transition: "color 0.2s" }}>{item.svg}</div>
              <span style={{ fontSize: 10, fontFamily: "Tajawal, sans-serif", fontWeight: active ? 700 : 400, color: active ? "#C9A96E" : "rgba(255,255,255,0.35)" }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
