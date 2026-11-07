import type { Metadata } from "next";
import { Hind_Siliguri, Newsreader, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import { SessionProvider } from "@/lib/session-context";

const body = Hind_Siliguri({
  variable: "--font-body",
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const banglaSerif = Noto_Serif_Bengali({
  variable: "--font-bangla-serif",
  subsets: ["bengali"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Researcher BD — Bangladesh Research & Innovation Network",
  description:
    "Discover research. Connect people. Build knowledge. A bilingual research ecosystem connecting students, researchers, faculty, institutions and laboratories in Bangladesh and beyond.",
  keywords: [
    "Researcher BD",
    "Bangladesh research",
    "research opportunities Bangladesh",
    "research supervisors Bangladesh",
    "research datasets",
    "academic journals Bangladesh",
    "research network",
  ],
  authors: [{ name: "Researcher BD" }],
  icons: {
    icon: "/logo.svg",
  },
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  other: {
    "theme-color": "#0b6e4f",
  },
  openGraph: {
    title: "Researcher BD",
    description: "Bangladesh Research & Innovation Network",
    siteName: "Researcher BD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${body.variable} ${serif.variable} ${banglaSerif.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider>
          <I18nProvider>
            <SessionProvider>
              {children}
              <Toaster />
              <SonnerToaster position="top-right" richColors />
            </SessionProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
