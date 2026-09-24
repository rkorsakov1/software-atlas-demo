import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AtlasProviders } from "@/components/layout/AtlasProviders";
import { DesktopNudge } from "@/components/layout/DesktopNudge";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "The Software Atlas",
    template: "%s · The Software Atlas",
  },
  description:
    "How software markets form, consolidate, get disrupted and spawn new ones, from 1950 to today.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

type RootLayoutProps = { children: React.ReactNode };

const RootLayout = ({ children }: RootLayoutProps): React.ReactElement => (
  <html lang="en" suppressHydrationWarning>
    <body
      className={`${sans.variable} ${mono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
    >
      <AtlasProviders>
        <a
          href="#main"
          className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <DesktopNudge />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
      </AtlasProviders>
    </body>
  </html>
);

export default RootLayout;
