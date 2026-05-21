import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Noto · Financial Planner",
  description: "Noto urip, noto finansial. Personal wealth tracker & financial planner.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geist.variable} ${fraunces.variable} font-sans`}>
        {/* Set tema sebelum paint untuk hindari flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem('noto-theme')||'{}');if(s&&s.state&&s.state.isDark){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
