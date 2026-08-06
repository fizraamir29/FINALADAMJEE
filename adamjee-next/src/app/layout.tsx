import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import LayoutShell from "@/components/LayoutShell";
import "./globals.css";

// Self-hosted at build time — no runtime request to Google.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-admin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adamjee Computers | Premium Custom Gaming PCs & Accessories",
  description: "Configure your ultimate dream custom gaming PC, browse laptops, components, and accessories at Adamjee Computers Pakistan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={`${jakarta.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <AppProvider>
            <LayoutShell>{children}</LayoutShell>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
