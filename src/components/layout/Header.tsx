"use client";

import { useTheme } from "next-themes";
import { Bell, Search, Sun, Moon, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { signOutAction } from "@/lib/actions/auth";

export const Header = ({ userName }: { userName?: string | null }) => {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      {/* 検索バー (placeholder) */}
      <div className="relative max-w-md flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="タスクを検索..."
          className="w-full rounded-md border border-input bg-background py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled
        />
      </div>

      <div className="flex items-center gap-2">
        {/* テーマ切替 */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="テーマ切替"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* 通知ベル (placeholder) */}
        <button
          className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="通知"
          disabled
        >
          <Bell size={18} />
        </button>

        {/* ユーザーメニュー */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {userName?.[0]?.toUpperCase() ?? <User size={14} />}
            </div>
            <span className="hidden md:inline">{userName ?? "ユーザー"}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-card py-1 shadow-lg">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <LogOut size={16} />
                  ログアウト
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
