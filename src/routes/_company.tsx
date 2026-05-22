import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Building2, Shield, Users, ClipboardList } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCompanyEmpresa } from "@/lib/company-context";
import { HeaderProfile } from "@/components/layout/header-profile";
import { AppShell } from "@/components/layout/app-shell";
import orionLogo from "@/assets/orion-logo.webp";

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
    { to: "/movimientos", label: "Movimientos", icon: ClipboardList },
  ] as const;

  return (
    <AppShell
      brandTitle={empresa?.nombre ?? "Mi empresa"}
      brandSubtitle="Portal Compañía"
      brandLogo={orionLogo}
      navItems={navItems}
      onLogout={onLogout}
      header={
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
      }
    >
      <Outlet />
    </AppShell>
  );
}