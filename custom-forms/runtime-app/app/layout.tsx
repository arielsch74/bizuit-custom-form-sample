import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { ReactGlobalExposer } from "@/components/ReactGlobalExposer";
import { Providers } from "@/components/providers";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "BIZUIT Custom Forms - Runtime App",
  description: "Runtime application for BIZUIT Custom Forms with hot reload support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={quicksand.variable}>
      <head>
        {/* Expose React globally for dynamically loaded forms */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // This MUST run before any dynamic form loads
            if (typeof window !== 'undefined') {
              // We'll set this from the client-side once React is loaded
              window.__REACT_READY__ = false;
            }
          `
        }} />
      </head>
      <body className="antialiased">
        <ReactGlobalExposer />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
