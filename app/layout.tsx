import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Media Bias Sentiment Monitor",
  description:
    "Real-time sentiment analysis across major news outlets with bias scoring and charged language detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {children}
      </body>
    </html>
  );
}
