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
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
      { href: "/summary", label: "Summary", short: "Summary", icon: PieChart },
    ],
  },
  {
    title: "KEUANGAN",
    items: [
      { href: "/transactions", label: "Transaksi", short: "Transaksi", icon: ArrowLeftRight },
      { href: "/cash", label: "Tabungan", short: "Tabungan", icon: Wallet },
      { href: "/receivables", label: "Piutang", short: "Piutang", icon: HandCoins },
      { href: "/debts", label: "Utang & Cicilan", short: "Utang", icon: Landmark },
      { href: "/cards", label: "Credit Card", short: "Kartu", icon: CreditCard },
    ],
  },
  {
    title: "INVESTASI",
    items: [
      { href: "/stocks", label: "Saham", short: "Saham", icon: TrendingUp },
      { href: "/gold", label: "Emas", short: "Emas", icon: Gem },
      { href: "/retirement", label: "Pensiun", short: "Pensiun", icon: Briefcase },
      { href: "/assets", label: "Asset Lainnya", short: "Aset", icon: Boxes },
    ],
  },
  {
    title: "SYSTEM",
    items: [{ href: "/settings", label: "Pengaturan", short: "Setting", icon: Settings }],
  },
];

// Flat list untuk keperluan lain (MobileHeader loop, dll)
export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

// Bottom nav mobile: 4 item paling sering dipakai
export const mobileNavItems: NavItem[] = [
  navItems.find((n) => n.href === "/dashboard")!,
  navItems.find((n) => n.href === "/transactions")!,
  navItems.find((n) => n.href === "/cards")!,
  navItems.find((n) => n.href === "/summary")!,
];
