import { useState, useEffect } from "react";

export default function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed", bottom: 24, right: 20, zIndex: 200,
        width: 42, height: 42, borderRadius: "50%",
        background: "linear-gradient(135deg,#6d28d9,#a78bfa)",
        border: "none", color: "#fff", fontSize: 18, cursor: "pointer",
        boxShadow: "0 4px 20px rgba(109,40,217,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "popIn 0.2s ease",
      }}>
      ↑
    </button>
  );
}
