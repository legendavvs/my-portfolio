import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

// Налаштовуємо змінну шрифту
const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter", // <--- Це важливо
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
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}