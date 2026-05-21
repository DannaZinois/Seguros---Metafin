import {
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Building2,
  Shield,
  Users,
  Receipt,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCompanyEmpresa } from "@/lib/company-context";
import { HeaderProfile } from "@/components/layout/header-profile";
import cityBg from "@/assets/city-skyline.png";

export const Route = createFileRoute("/_company")({
  component: CompanyLayout,
});

function CompanyLayout() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const empresa = useCompanyEmpresa();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.navigate({ to: "/login" });
    else if (user.role === "admin") router.navigate({ to: "/cartera" });
    else if (user.role === "client") router.navigate({ to: "/mi-perfil" });
  }, [ready, user, router]);

  const onLogout = () => {
    logout();
    router.navigate({ to: "/login" });
  };

  const navItems = [
    { to: "/perfil", label: "Mi empresa", icon: Building2 },
    { to: "/seguros", label: "Seguros", icon: Shield },
    { to: "/empleados", label: "Empleados", icon: Users },
    { to: "/pagos", label: "Pagos", icon: Receipt },
  ] as const;

  return (
    <div className="flex min-h-screen bg-[color:var(--brand-bg-soft)]">
      <aside className="relative flex w-64 flex-col bg-[color:var(--brand-bg-soft)] px-6 py-8">
        <div className="mb-10 text-lg font-medium text-foreground/80">
          {user?.name ?? "Mi empresa"}
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
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-destructive hover:bg-white"
          >
            <LogOut className="h-5 w-5" /> Cerrar sesión
          </button>
        </div>

        <img
          src={cityBg}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 w-full opacity-40"
        />
      </aside>

      <div className="flex flex-1 flex-col bg-white">
        <header className="flex items-center justify-end gap-4 border-b border-border bg-[color:var(--brand-bg-soft)]/60 px-10 py-4">
          <HeaderProfile
            name={empresa?.nombre ?? user?.name ?? "Invitado"}
            role="Perfil Compañía"
            fields={[
              { label: "Empresa", value: empresa?.nombre ?? "" },
              { label: "RFC", value: empresa?.rfc ?? "" },
              { label: "Giro", value: empresa?.giro ?? "" },
              { label: "Dirección", value: empresa?.direccion ?? "" },
              { label: "Código postal", value: empresa?.codigoPostal ?? "" },
              { label: "Correo de acceso", value: user?.email ?? "" },
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