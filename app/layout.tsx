import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrawlREC - Brawl Deck Recommendations",
  description: "Deck recommendations and card statistics for Magic: The Gathering Brawl format",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <a href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
              BrawlREC
            </a>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
            BrawlREC - Not affiliated with Wizards of the Coast
          </div>
        </footer>
      </body>
    </html>
  );
}
