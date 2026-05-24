import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://noto-eight.vercel.app"),
  title: {
    default: "Noto — Noto urip, noto finansial.",
    template: "%s · Noto",
  },
  description:
    "Aplikasi personal finance untuk menata cashflow, tabungan, aset, utang, saham, emas, dan perjalanan finansialmu dengan lebih rapi.",
  keywords: [
    "Noto",
    "Noto urip noto finansial",
    "personal finance",
    "financial planner",
    "finance tracker",
    "catatan keuangan",
    "tabungan",
    "aset",
    "utang",
    "investasi",
  ],
  authors: [{ name: "Mochammad Fawwaz" }],
  creator: "Mochammad Fawwaz",
  publisher: "Noto",
  applicationName: "Noto",
  openGraph: {
    type: "website",
    url: "https://noto-eight.vercel.app",
    siteName: "Noto",
    title: "Noto — Noto urip, noto finansial.",
    description:
      "Noto membantumu menata hidup dan finansial: dari cashflow harian, tabungan, aset, utang, sampai investasi pribadi.",
    locale: "id_ID",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Noto — Noto urip, noto finansial.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Noto — Noto urip, noto finansial.",
    description:
      "Catat cashflow, tabungan, aset, utang, saham, emas, dan perjalanan finansialmu dalam satu aplikasi personal finance.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c11" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${jakarta.variable} ${fraunces.variable}`}
    >
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