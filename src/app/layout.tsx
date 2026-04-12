import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Todayggigu Admin",
  description: "Todayggigu Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${notoSans.className}`}>
      <body className="min-h-full">
        <LocaleProvider>
          <AuthProvider>{children}</AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
