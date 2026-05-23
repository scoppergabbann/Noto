import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Noto" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans">
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
