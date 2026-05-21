import { Link } from "@tanstack/react-router";
import { LogOut, Shield, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface AppShellProps {
  brandTitle: string;
  brandSubtitle: string;
  navItems: readonly NavItem[];
  onLogout: () => void;
  header: ReactNode;
  children: ReactNode;
  floating?: ReactNode;
}

export function AppShell({
  brandTitle,
  brandSubtitle,
  navItems,
  onLogout,
  header,
  children,
  floating,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[color:var(--brand-bg-soft)]">
      <aside
        className="relative flex w-64 flex-col px-4 py-6 text-[color:var(--sidebar-foreground)]"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div className="mb-8 flex items-center gap-3 px-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-white">
              {brandTitle}
            </p>
            <p className="truncate text-[11px] uppercase tracking-[0.14em] text-white/60">
              {brandSubtitle}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition-all hover:bg-white/10 hover:text-white"
              activeProps={{
                className:
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-[color:var(--brand-navy-deep)] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]",
              }}
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-t border-white/10 pt-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-border bg-white/80 px-8 py-3 backdrop-blur">
          {header}
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
        {floating}
      </div>
    </div>
  );
}