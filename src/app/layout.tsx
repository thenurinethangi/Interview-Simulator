import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: '--font-dm-sans' });

export const metadata: Metadata = {
  title: "IntelliView",
  description: "AI-powered technical interview practice — CV & topic-based sessions with real-time evaluation and expert answer generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${dmSans.variable} ${dmSans.className} bg-(--paper) text-(--ink) flex h-screen overflow-hidden antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
