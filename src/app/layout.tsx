import { ColorSchemeScript } from "@mantine/core";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Providers } from "@/app/providers";
import "@mantine/notifications/styles.css";
import "@/app/globals.css";

/** Dual-font system: Fraunces (display) + Inter (body/UI). */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brandy",
  description: "Brandy - branding asset management for your companies",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <NuqsAdapter>
          <Providers>{children}</Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
};

export default RootLayout;
