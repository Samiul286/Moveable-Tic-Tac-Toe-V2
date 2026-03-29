import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOVEABLE — Tic · Tac · Toe",
  description:
    "Neon arcade strategy game. 3 pieces each, oldest auto-removes, symbols swap each round. Play local, vs AI, or online in real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
