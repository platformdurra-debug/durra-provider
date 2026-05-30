"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/products",  label: "خدماتي" },
  { href: "/bookings",  label: "الطلبات" },
  { href: "/earnings",  label: "أرباحي" },
  { href: "/settings",  label: "الإعدادات" },
];

export default function ProviderNav() {
  const path = usePathname();
  if (path === "/auth") return null;

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV.map(item => {
          const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
          return (
            <Link href={item.href} key={item.href} style={{ textDecoration: "none", flex: 1 }}>
              <div className={`bn-item ${active ? "active" : ""}`}>
                <div className="bn-bar" />
                <span style={{ fontSize: 13, fontWeight: active ? 800 : 500, color: active ? "var(--gold3)" : "var(--text4)", fontFamily: "Tajawal, sans-serif", whiteSpace: "nowrap" }}>
                  {item.label}
                </span>
                {active && (
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", marginTop: 2 }} />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
