import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
// Імпортуємо нові компоненти
import BackgroundBlobs from "@/components/ui/BackgroundBlobs";

// Налаштування шрифту (якщо ти використовуєш змінні)
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "Personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          {/* 1. Фонові плями (на весь сайт, фіксовані) */}
          <BackgroundBlobs />

          {/* Контент сайту */}
          <div className="relative z-10">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}