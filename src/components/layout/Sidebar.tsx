"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Bell,
  Settings,
  ShieldCheck,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: <LayoutDashboard size={20} /> },
  { href: "/projects", label: "プロジェクト", icon: <FolderKanban size={20} /> },
  { href: "/notifications", label: "通知", icon: <Bell size={20} /> },
  { href: "/settings", label: "設定", icon: <Settings size={20} /> },
  { href: "/admin", label: "管理", icon: <ShieldCheck size={20} />, adminOnly: true },
];

export const Sidebar = ({ userRole }: { userRole?: string }) => {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <FolderKanban size={24} className="text-primary" />
        <span className="text-lg font-bold">TaskBoard</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems
          .filter((item) => !item.adminOnly || userRole === "ADMIN")
          .map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
};
