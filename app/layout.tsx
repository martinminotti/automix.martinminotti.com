import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoMix - Professional MP3 Mixer",
  description: "Drag, drop, and mix your MP3s with automatic crossfade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
