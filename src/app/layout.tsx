import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import "./globals.css";

const RobotoMono = Roboto_Mono({
  variable: "--font-sans",
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AniView",
  description: "Anime player website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${RobotoMono.variable} antialiased bg-black`}
      >
        <ErrorBoundary>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
