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
  title: "VoicePrep — Voice Interview Practice",
  description: "Practice SWE interviews with an AI interviewer, by voice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased" style={{ color: 'var(--text-primary)' }}>
        <style>{`
          .nav-link { color: var(--text-secondary); transition: color 150ms; text-decoration: none; }
          .nav-link:hover { color: var(--text-primary); }
        `}</style>

        <header
          className="sticky top-0 z-50"
          style={{
            background: 'var(--bg-elevated)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-12">
            <a href="/" className="flex items-center gap-1.5 text-lg tracking-tight" style={{ fontWeight: 600, textDecoration: 'none' }}>
              <span style={{ color: 'var(--accent)' }}>Voice</span>
              <span style={{ color: 'var(--text-primary)' }}>Prep</span>
            </a>
            <nav className="flex items-center gap-6 text-sm" style={{ fontWeight: 500 }}>
              <a href="/problems" className="nav-link">Problems</a>
              <a href="/setup" className="nav-link">Interview</a>
              <a href="/dashboard" className="nav-link">Progress</a>
              <a href="/pricing" className="nav-link">Pricing</a>
              <a href="/blog/ai-interview-prep-market-2026" className="nav-link">Blog</a>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
