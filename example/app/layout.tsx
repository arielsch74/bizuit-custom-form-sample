import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
