import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Bizuit Form Example",
  description: "Example app using @bizuit/form-sdk and @bizuit/ui-components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider defaultTheme="system" storageKey="bizuit-ui-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
