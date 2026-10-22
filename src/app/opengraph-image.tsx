import { ImageResponse } from "next/og";

export const alt = "Kharido Mart | Gentle Baby Care & Montessori Finds";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          backgroundColor: "#fdfbf7",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background blurs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "9999px",
            backgroundColor: "#fbe8e4",
            opacity: 0.8,
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "9999px",
            backgroundColor: "#edf3ee",
            opacity: 0.8,
            filter: "blur(60px)",
          }}
        />

        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#e06b5b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              K
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "30px",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#2b1f1a",
                }}
              >
                KHARIDO MART
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#e06b5b",
                  textTransform: "uppercase",
                }}
              >
                Moms & Kids Direct • India
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#ffffff",
              padding: "10px 20px",
              borderRadius: "9999px",
              border: "1px solid #ebdcd3",
              boxShadow: "0 4px 12px rgba(43,31,26,0.04)",
            }}
          >
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#2b1f1a",
              }}
            >
              100% Quality Checked &amp; BPA-Free
            </span>
          </div>
        </div>

        {/* Main Hero Copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "920px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#f5e8e3",
              color: "#c25445",
              padding: "6px 16px",
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            PEDIATRICIAN TESTED • 100% BABY-SAFE
          </div>

          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "#2b1f1a",
              margin: 0,
            }}
          >
            Gentle Baby Care, Screen-Free Montessori & Mom Essentials.
          </h1>

          <p
            style={{
              fontSize: "22px",
              lineHeight: 1.45,
              color: "#6b584f",
              margin: 0,
            }}
          >
            From whisper-quiet electric nail trimmers to interactive phonics sound books.
            Carefully curated for Indian parenting milestones.
          </p>
        </div>

        {/* Bottom Trust Ribbons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "1px solid #e8dfd8",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>📦</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#2b1f1a" }}>
                Cash on Delivery Available
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🛡️</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#2b1f1a" }}>
                7-Day Free Replacement
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>⚡</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#2b1f1a" }}>
                Fast 2-4 Day Dispatch
              </span>
            </div>
          </div>

          <span
            style={{
              fontSize: "17px",
              fontWeight: 800,
              color: "#e06b5b",
              letterSpacing: "-0.01em",
            }}
          >
            kharidomart.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
