import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "PrepAI",
  description: "AI-powered technical interview practice — CV & topic-based sessions with real-time evaluation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className} bg-white text-[#0d0d0d] flex h-screen overflow-hidden antialiased`}>
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {children}
        </main>
      </body>
    </html>
  );
}
