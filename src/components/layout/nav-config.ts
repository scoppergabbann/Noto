import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  PieChart,
  Gem,
  Boxes,
  HandCoins,
  Landmark,
  ArrowLeftRight,
  TrendingUp,
  Briefcase,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", short: "Transaksi", icon: ArrowLeftRight },
  { href: "/cash", label: "Asset Cash", short: "Cash", icon: Wallet },
  { href: "/receivables", label: "Piutang", short: "Piutang", icon: HandCoins },
  { href: "/debts", label: "Utang & Cicilan", short: "Utang", icon: Landmark },
  { href: "/cards", label: "Credit Card", short: "Kartu", icon: CreditCard },
  { href: "/gold", label: "Emas", short: "Emas", icon: Gem },
  { href: "/stocks", label: "Saham", short: "Saham", icon: TrendingUp },
  { href: "/retirement", label: "Pensiun", short: "Pensiun", icon: Briefcase },
  { href: "/assets", label: "Asset Lainnya", short: "Aset", icon: Boxes },
  { href: "/summary", label: "Summary", short: "Summary", icon: PieChart },
];

// Bottom nav: 4 item paling penting
export const mobileNavItems = navItems.filter((n) =>
  ["/dashboard", "/transactions", "/cards", "/summary"].includes(n.href)
);

export const comingSoon: { label: string; icon: typeof Gem }[] = [];
