import { createFileRoute, useRouter } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Ingresar — Plataforma de Seguros" }],
  }),
});

function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const u = login(email, password, remember);
      if (u.role === "company")
        router.navigate({ to: "/perfil" });
      else router.navigate({ to: "/cartera" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ingresar");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Soft sky background */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%]"
        style={{
          background:
            "linear-gradient(180deg, var(--brand-bg-soft) 0%, white 100%)",
        }}
      />
      {/* Top divider lines */}
      <div className="relative mx-auto max-w-7xl px-6 pt-10">
        <div className="grid grid-cols-2 gap-12">
          <div className="h-px bg-[color:var(--border)]" />
          <div className="h-px bg-[color:var(--border)]" />
        </div>
      </div>

      {/* Hero copy */}
      <main className="relative mx-auto flex max-w-2xl flex-col items-center px-6 pt-10 pb-16 text-center">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
          Bienvenido a tu plataforma
          <br /> de seguros
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Ingresa tus datos para continuar a la plataforma.
        </p>

        {/* Card */}
        <form
          onSubmit={onSubmit}
          className="mt-8 w-full max-w-sm rounded-3xl bg-[color:var(--muted)]/70 p-6 shadow-sm backdrop-blur"
        >
          <label className="block text-sm font-semibold text-foreground">
            Correo:
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo..."
            className="mt-2 w-full rounded-full bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-[color:var(--brand-blue)]"
          />

          <label className="mt-4 block text-sm font-semibold text-foreground">
            Contraseña:
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña..."
            className="mt-2 w-full rounded-full bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-[color:var(--brand-blue)]"
          />

          <label className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground">
            Recordarme en este equipo
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-[color:var(--brand-blue)]"
            />
          </label>

          {error && (
            <p className="mt-3 text-center text-xs text-destructive">{error}</p>
          )}

          <div className="mt-5 flex justify-center">
            <button
              type="submit"
              className="rounded-full bg-[color:var(--brand-blue)] px-8 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[color:var(--brand-blue-dark)]"
            >
              Ingresar
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="absolute inset-x-0 bottom-0 border-t border-border bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-full bg-gradient-to-br from-[color:var(--brand-blue)] to-orange-400" />
            Copyright © 2025
          </div>
          <a href="#" className="underline underline-offset-4">
            Política de Privacidad
          </a>
          <div>
            Powered by Zinois | ¿Más información?{" "}
            <a href="#" className="underline underline-offset-4">
              Contactanos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}