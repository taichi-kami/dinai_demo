import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dinai — 飲食店向けAI広告配信",
  description: "AIが最適な広告戦略を、一瞬で。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, background: "#0a0a0f" }}>
        {children}
      </body>
    </html>
  );
}
