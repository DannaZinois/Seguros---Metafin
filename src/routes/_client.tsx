import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { User, Shield, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCurrentClient } from "@/lib/client-context";
import { HeaderProfile } from "@/components/layout/header-profile";
import { AppShell } from "@/components/layout/app-shell";

export const Route = createFileRoute("/_client")({
  component: ClientLayout,
});

function ClientLayout() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const cliente = useCurrentClient();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.navigate({ to: "/login" });
    else if (user.role === "company") router.navigate({ to: "/perfil" });
    else if (user.role === "admin") router.navigate({ to: "/cartera" });
  }, [ready, user, router]);

  const onLogout = () => {
    logout();
    router.navigate({ to: "/login" });
  };

  const navItems = [
    { to: "/mi-perfil", label: "Mi perfil", icon: User },
    { to: "/mis-polizas", label: "Mis pólizas", icon: Shield },
  ] as const;

  return (
    <AppShell
      brandTitle={cliente?.profile.nombre ?? user?.name ?? "Mi cuenta"}
      brandSubtitle="Portal Cliente"
      navItems={navItems}
      onLogout={onLogout}
      header={
        <HeaderProfile
          name={cliente?.profile.nombre ?? user?.name ?? "Invitado"}
          role="Perfil Cliente"
          fields={[
            { label: "Nombre", value: cliente?.profile.nombre ?? user?.name ?? "" },
            { label: "Correo", value: cliente?.profile.correo ?? user?.email ?? "" },
            { label: "Contacto", value: cliente?.profile.contacto ?? "" },
            { label: "RFC", value: cliente?.profile.rfc ?? "" },
            { label: "Tipo de persona", value: cliente?.profile.tipoPersona ?? "" },
            { label: "ID de cliente", value: cliente?.clienteId ?? "" },
          ]}
        />
      }
      floating={
        <a
          href="mailto:siniestro@metafin.mx"
          aria-label="Contactar por correo"
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[color:var(--brand-blue-dark)]"
        >
          <Mail className="h-5 w-5" />
          Contacto
        </a>
      }
    >
      <Outlet />
    </AppShell>
  );
}