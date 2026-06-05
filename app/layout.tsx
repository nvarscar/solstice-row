import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solstice Row — Row Through the Longest Day",
  description:
    "Solstice Row is an annual open-water rowing event held on the summer solstice. Rowers of all skill levels welcome.",
  openGraph: {
    title: "Solstice Row",
    description: "Row Through the Longest Day",
    type: "website",
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
