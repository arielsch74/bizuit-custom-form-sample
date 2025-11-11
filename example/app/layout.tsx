import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppToolbar } from "@/components/app-toolbar";
import { ReactGlobalExposer } from "@/components/ReactGlobalExposer";

export const metadata: Metadata = {
  title: "BIZUIT Custom Forms Sample",
  description: "Example app using @tyconsa/bizuit-form-sdk and @tyconsa/bizuit-ui-components",
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
        <Providers>
          <AppToolbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
