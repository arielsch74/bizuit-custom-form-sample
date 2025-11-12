import type { Metadata } from "next";
import "./globals.css";
import { ReactGlobalExposer } from "@/components/ReactGlobalExposer";

export const metadata: Metadata = {
  title: "Bizuit Custom Forms - Runtime App",
  description: "Runtime application for Bizuit Custom Forms with hot reload support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
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
        {children}
      </body>
    </html>
  );
}
