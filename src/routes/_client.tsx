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
  Bell,
  Settings,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCurrentClient, ADMIN_WHATSAPP } from "@/lib/client-context";
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
                {cliente?.profile.nombre ?? user?.name ?? "Invitado"}
              </p>
              <p className="text-xs text-muted-foreground">Perfil Cliente</p>
            </div>
          </div>
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