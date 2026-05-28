import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Users, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { HeaderProfile } from "@/components/layout/header-profile";
import { AppShell } from "@/components/layout/app-shell";
import metafinLogo from "@/assets/metafin-logo.jpeg";

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

  useEffect(() => {
    if (!ready) return;
    if (!user) router.navigate({ to: "/login" });
    else if (user.role === "company") router.navigate({ to: "/perfil" });
    else if (user.role === "client") router.navigate({ to: "/mi-perfil" });
  }, [ready, user, router]);

  const navItems = [
    { to: "/cartera", label: "Cartera", icon: Users },
    { to: "/aseguradoras", label: "Aseguradoras", icon: ShieldCheck },
  ] as const;

  return (
    <AppShell
      brandTitle="Metafin"
      brandSubtitle="Administración"
      brandLogo={metafinLogo}
      navItems={navItems}
      onLogout={onLogout}
      header={
        <HeaderProfile
          name={user?.name ?? "Invitado"}
          role="Perfil Broker"
          fields={[
            { label: "Nombre", value: user?.name ?? "" },
            { label: "Correo", value: user?.email ?? "" },
            { label: "Rol", value: "Administrador" },
          ]}
        />
      }
    >
      <Outlet />
    </AppShell>
  );
}