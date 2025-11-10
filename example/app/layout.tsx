import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppToolbar } from "@/components/app-toolbar";

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
      <body className="antialiased">
        <Providers>
          <AppToolbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
