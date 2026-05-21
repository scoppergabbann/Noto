import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  PieChart,
  Gem,
  Boxes,
  HandCoins,
  Landmark,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/cash", label: "Asset Cash", short: "Cash", icon: Wallet },
  { href: "/receivables", label: "Piutang", short: "Piutang", icon: HandCoins },
  { href: "/debts", label: "Utang & Cicilan", short: "Utang", icon: Landmark },
  { href: "/cards", label: "Credit Card", short: "Kartu", icon: CreditCard },
  { href: "/gold", label: "Emas & Investasi", short: "Emas", icon: Gem },
  { href: "/assets", label: "Asset Lainnya", short: "Aset", icon: Boxes },
  { href: "/summary", label: "Summary", short: "Summary", icon: PieChart },
];

// Bottom-nav HP hanya menampilkan item utama agar tidak sesak (sisanya via sidebar di layar lebar).
export const mobileNavItems = navItems.filter((n) =>
  ["/dashboard", "/cash", "/cards", "/summary"].includes(n.href)
);

export const comingSoon: { label: string; icon: typeof Gem }[] = [];
