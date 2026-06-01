import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { FormEvent, useState } from "react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [{ title: "Restablecer contraseña — Plataforma de Seguros" }],
  }),
});

function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setDone(true);
    setTimeout(() => router.navigate({ to: "/login" }), 1800);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%]"
        style={{
          background:
            "linear-gradient(180deg, var(--brand-bg-soft) 0%, white 100%)",
        }}
      />
      <main className="relative mx-auto flex max-w-2xl flex-col items-center px-6 pt-20 pb-16 text-center">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
          Restablece tu contraseña
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Elige una nueva contraseña para tu cuenta.
        </p>

        {done ? (
          <div className="mt-8 w-full max-w-sm rounded-3xl bg-[color:var(--muted)]/70 p-6 text-sm shadow-sm">
            <p className="text-foreground">
              Contraseña actualizada. Redirigiendo al inicio de sesión…
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-8 w-full max-w-sm rounded-3xl bg-[color:var(--muted)]/70 p-6 shadow-sm backdrop-blur"
          >
            <label className="block text-sm font-semibold text-foreground">
              Nueva contraseña:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="mt-2 w-full rounded-full bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-[color:var(--brand-blue)]"
            />
            <label className="mt-4 block text-sm font-semibold text-foreground">
              Confirmar contraseña:
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              className="mt-2 w-full rounded-full bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-[color:var(--brand-blue)]"
            />
            {error && (
              <p className="mt-3 text-center text-xs text-destructive">{error}</p>
            )}
            <div className="mt-5 flex flex-col items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--brand-blue)] px-8 py-2.5 text-sm font-medium text-white shadow-md hover:bg-[color:var(--brand-blue-dark)]"
              >
                Guardar contraseña
              </button>
              <Link
                to="/login"
                className="text-xs text-[color:var(--brand-blue)] hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}