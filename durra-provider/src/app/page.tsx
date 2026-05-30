"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Root() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, []);
  return <div style={{ minHeight: "100vh", background: "#0F0A1A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;
}
