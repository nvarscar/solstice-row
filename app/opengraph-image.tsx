import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import eventData from "../content/event.json";

export const runtime = "nodejs";
export const alt = `${eventData.name} ${eventData.edition}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = fs.readFileSync(
    path.join(process.cwd(), "public/sr-logo.png")
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(160deg, #071407 0%, #0d2b0d 45%, #1a4a1a 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #e85d04, #e8b800, #f5c518, #e8b800, #e85d04)",
            display: "flex",
          }}
        />

        {/* Subtle water ripple backdrop */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "180px",
            background:
              "linear-gradient(to top, #0c3d2a 0%, transparent 100%)",
            opacity: 0.7,
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0px",
            zIndex: 1,
            padding: "48px 80px",
          }}
        >
          {/* Logo + Edition badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginBottom: "28px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="Solstice Row logo"
              width={96}
              height={96}
              style={{ borderRadius: "50%" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
              }}
            >
              <div
                style={{
                  background: "rgba(232,184,0,0.15)",
                  border: "1px solid rgba(232,184,0,0.4)",
                  borderRadius: "999px",
                  padding: "4px 14px",
                  color: "#e8b800",
                  fontSize: "13px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                {eventData.venue} · {eventData.edition}
              </div>
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#e8b800",
              letterSpacing: "-1px",
              textAlign: "center",
              marginBottom: "12px",
              display: "flex",
              lineHeight: 1.05,
            }}
          >
            {eventData.name}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "24px",
              color: "#f5c518",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: "36px",
              fontFamily: "Georgia, serif",
              display: "flex",
            }}
          >
            {eventData.tagline}
          </div>

          {/* Key details row */}
          <div
            style={{
              display: "flex",
              gap: "32px",
              alignItems: "center",
              marginBottom: "28px",
            }}
          >
            {/* Date */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#86d986",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Date
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#e3f7e3",
                  fontWeight: "600",
                  display: "flex",
                }}
              >
                {eventData.date}
              </div>
            </div>

            <div
              style={{
                width: "1px",
                height: "40px",
                background: "rgba(232,184,0,0.3)",
                display: "flex",
              }}
            />

            {/* Location */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#86d986",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Location
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#e3f7e3",
                  fontWeight: "600",
                  display: "flex",
                }}
              >
                {eventData.location}
              </div>
            </div>

            <div
              style={{
                width: "1px",
                height: "40px",
                background: "rgba(232,184,0,0.3)",
                display: "flex",
              }}
            />

            {/* Sunrise → Sunset */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#86d986",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Event Hours
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#e3f7e3",
                  fontWeight: "600",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#e85d04" }}>↑ {eventData.sunriseTime}</span>
                <span style={{ color: "rgba(232,184,0,0.5)" }}>—</span>
                <span style={{ color: "#e8b800" }}>↓ {eventData.sunsetTime}</span>
              </div>
            </div>
          </div>

          {/* Bottom description */}
          <div
            style={{
              fontSize: "15px",
              color: "rgba(179,238,179,0.7)",
              textAlign: "center",
              maxWidth: "760px",
              lineHeight: 1.5,
              fontFamily: "Georgia, serif",
              display: "flex",
            }}
          >
            Dawn-to-dusk fundraising row · Teams &amp; individuals welcome · All ages
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, transparent, #e8b800, transparent)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
