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
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { HeaderProfile } from "@/components/layout/header-profile";
import cityBg from "@/assets/city-skyline.png";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  const onLogout = () => {
    logout();
    router.navigate({ to: "/login" });
  };

  // Client-side guard
  useEffect(() => {
    if (!ready) return;
    if (!user) router.navigate({ to: "/login" });
    else if (user.role === "company") router.navigate({ to: "/perfil" });
    else if (user.role === "client") router.navigate({ to: "/mi-perfil" });
  }, [ready, user, router]);

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
          <HeaderProfile
            name={user?.name ?? "Invitado"}
            role="Perfil Broker"
            fields={[
              { label: "Nombre", value: user?.name ?? "" },
              { label: "Correo", value: user?.email ?? "" },
              { label: "Rol", value: "Administrador" },
            ]}
          />
        </header>
        <main className="flex-1 px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}