import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LP9 YPC | Young Professionals Club",
  description:
    "Lagos Province 9 Young Professionals Club — Register, find jobs, and grow your career with a community that cares.",
  keywords: ["LP9 YPC", "Lagos Province 9", "Young Professionals", "jobs", "career"],
  authors: [{ name: "LP9 YPC" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
