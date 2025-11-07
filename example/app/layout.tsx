import type { Metadata } from "next";
import "./globals.css";
import { BizuitThemeProvider } from "@bizuit/ui-components";

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
        <BizuitThemeProvider
          defaultTheme="system"
          defaultColorTheme="blue"
          defaultLanguage="es"
        >
          {children}
        </BizuitThemeProvider>
      </body>
    </html>
  );
}
