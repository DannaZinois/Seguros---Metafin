import {
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import cityBg from "@/assets/city-skyline.png";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const onLogout = () => {
    logout();
    router.navigate({ to: "/login" });
  };

  // Client-side guard
  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      router.navigate({ to: "/login" });
    }
  }, [user, router]);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/cartera", label: "Cartera", icon: Users },
    { to: "/cotizadores", label: "Cotizadores", icon: FileText },
    { to: "/aseguradoras", label: "Aseguradoras", icon: ShieldCheck },
  ] as const;

  return (
    <div className="flex min-h-screen bg-[color:var(--brand-bg-soft)]">
      {/* Sidebar */}
      <aside className="relative flex w-64 flex-col bg-[color:var(--brand-bg-soft)] px-6 py-8">
        <div className="mb-10 text-lg font-medium text-foreground/80">
          Nombre aquí
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground/80 transition-colors hover:bg-white"
              activeProps={{
                className:
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm bg-white text-foreground shadow-sm font-medium",
              }}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6">
          <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Otros
          </p>
          <div className="mt-3 space-y-2">
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground/80 hover:bg-white">
              <Settings className="h-5 w-5" /> Settings
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground/80 hover:bg-white">
              <HelpCircle className="h-5 w-5" /> Ayuda
            </button>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-destructive hover:bg-white"
            >
              <LogOut className="h-5 w-5" /> Cerrar sesión
            </button>
          </div>
        </div>

        <img
          src={cityBg}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 w-full opacity-40"
        />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col bg-white">
        <header className="flex items-center justify-end gap-4 border-b border-border bg-[color:var(--brand-bg-soft)]/60 px-10 py-4">
          <button className="relative rounded-full p-2 text-muted-foreground hover:bg-white">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {user?.name ?? "Invitado"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role === "admin"
                  ? "Perfil Broker"
                  : user?.role === "company"
                    ? "Perfil Compañía"
                    : "Perfil Cliente"}
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}