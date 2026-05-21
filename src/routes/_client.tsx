import {
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import {
  User,
  Shield,
  Receipt,
  LogOut,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCurrentClient, ADMIN_WHATSAPP } from "@/lib/client-context";
import { HeaderProfile } from "@/components/layout/header-profile";
import cityBg from "@/assets/city-skyline.png";

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
    { to: "/mis-pagos", label: "Pagos", icon: Receipt },
  ] as const;

  const waMessage = encodeURIComponent(
    `Hola, soy ${cliente?.profile.nombre ?? user?.name ?? "cliente"} y necesito ayuda con mi cuenta.`,
  );
  const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${waMessage}`;

  return (
    <div className="flex min-h-screen bg-[color:var(--brand-bg-soft)]">
      <aside className="relative flex w-64 flex-col bg-[color:var(--brand-bg-soft)] px-6 py-8">
        <div className="mb-10 text-lg font-medium text-foreground/80">
          {cliente?.profile.nombre ?? user?.name ?? "Mi cuenta"}
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
        </header>
        <main className="flex-1 px-10 py-8">
          <Outlet />
        </main>

        {/* Floating WhatsApp button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar al admin por WhatsApp"
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-95"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}