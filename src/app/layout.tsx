import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/app-shell";
import { Toaster } from 'sonner';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans-arabic",
});

export const metadata: Metadata = {
  title: "Aqara Plus CRM - نظام إدارة علاقات العملاء للعقارات",
  description: "نظام متكامل لإدارة العملاء والعقارات والمبيعات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={ibmPlexSansArabic.className}>
        <AppShell>{children}</AppShell>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
