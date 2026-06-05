import type { Metadata } from "next";
import "./globals.css";
import event from "../content/event.json";

const ogTitle = `${event.name} ${event.edition} — ${event.tagline}`;
const ogDescription =
  `${event.date} · ${event.location} · ${event.venue} · ` +
  `Sunrise ${event.sunriseTime} to sunset ${event.sunsetTime}. ` +
  `${event.heroSubtitle}`;

export const metadata: Metadata = {
  metadataBase: new URL(event.siteUrl),
  title: `${event.name} ${event.edition} — Row Through the Longest Day`,
  description: event.description,
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    type: "website",
    siteName: event.name,
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          src="https://identity.netlify.com/v1/netlify-identity-widget.js"
          async
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
