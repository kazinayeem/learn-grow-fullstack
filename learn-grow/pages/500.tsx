import Link from "next/link";

export default function Custom500() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #faf5ff 100%)",
      color: "#111827",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: 72, lineHeight: 1, margin: 0, fontWeight: 800 }}>500</h1>
        <h2 style={{ fontSize: 28, margin: "16px 0 8px", fontWeight: 700 }}>Server Error</h2>
        <p style={{ fontSize: 16, color: "#4b5563", margin: 0 }}>
          The server encountered an unexpected error. Please try again after the app has finished starting.
        </p>
        <div style={{ marginTop: 32 }}>
          <Link href="/" style={{
            display: "inline-block",
            padding: "12px 20px",
            borderRadius: 10,
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
            fontWeight: 700,
          }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
