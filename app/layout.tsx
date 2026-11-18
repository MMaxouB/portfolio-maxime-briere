import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Kalam } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppProviders } from "@/providers/AppProviders";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { Terminal } from "@/components/terminal/Terminal";
import { SkyBackground } from "@/components/layout/SkyBackground";
import { MotionToggle } from "@/components/layout/MotionToggle";
import { Cursor } from "@/components/cursor/Cursor";
import { SITE } from "@/lib/site";
import { MOTION_BOOT_SCRIPT } from "@/lib/ambient-motion";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["400"],
});

const defaultTitle = `${SITE.name} — builds software, learns how it breaks`;

export const metadata: Metadata = {
  // Required for OG/Twitter images and canonical URLs to resolve absolutely.
  metadataBase: new URL(SITE.url),
  title: {
    template: `%s · ${SITE.name}`,
    default: defaultTitle,
  },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: `${SITE.name} — portfolio`,
    title: defaultTitle,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#06040f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} ${kalam.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
      </head>
      <body className="relative flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only rounded-xl border border-line-strong bg-deep px-4 py-2 text-sm text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
        >
          Skip to content
        </a>
        <SkyBackground />
        <AppProviders>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          {/* Global overlays — rendered outside the page scroll context */}
          <CommandPalette />
          <Terminal />
          <MotionToggle />
        </AppProviders>
        <Cursor />
      </body>
    </html>
  );
}
