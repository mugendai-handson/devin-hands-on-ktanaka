import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devin Task Board",
  description: "リッチなタスク管理アプリ",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
};
export default RootLayout;
