import type { Metadata } from "next";
import Script from "next/script";
import { Gabarito } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";
import WhatsAppButton from "@/components/WhatsAppButton";

const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Parliament Watch Uganda",
  description: "Your Eye on Parliament - Bridging the gap between Parliament and citizens",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JQG3VM76CT"
          strategy="afterInteractive"
        />
        <Script id="ga4-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JQG3VM76CT');
          `}
        </Script>
      </head>
      <body className={`${gabarito.variable} antialiased font-sans`}>
        <Header />
        {children}
        <Footer />
        <WhatsAppButton />
        <ChatbotWidget />
      </body>
    </html>
  );
}
