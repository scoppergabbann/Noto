import { LayoutDashboard, Wallet, CreditCard, PieChart, Gem, Boxes } from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/cash", label: "Asset Cash", short: "Cash", icon: Wallet },
  { href: "/cards", label: "Credit Card", short: "Kartu", icon: CreditCard },
  { href: "/summary", label: "Summary", short: "Summary", icon: PieChart },
];

export const comingSoon = [
  { label: "Emas & Investasi", icon: Gem },
  { label: "Asset Lainnya", icon: Boxes },
];
