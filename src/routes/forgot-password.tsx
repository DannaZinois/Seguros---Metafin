import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { FormEvent, useState } from "react";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [{ title: "Recuperar contraseña — Plataforma de Seguros" }],
  }),
});

function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
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
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Te enviaremos un enlace para restablecerla.
        </p>

        {sent ? (
          <div className="mt-8 w-full max-w-sm rounded-3xl bg-[color:var(--muted)]/70 p-6 text-sm shadow-sm">
            <p className="text-foreground">
              Si <strong>{email}</strong> está registrado, recibirás un correo con
              instrucciones en los próximos minutos.
            </p>
            <button
              onClick={() => router.navigate({ to: "/reset-password" })}
              className="mt-5 rounded-full bg-[color:var(--brand-blue)] px-6 py-2 text-xs font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
            >
              Continuar al restablecimiento
            </button>
          </div>
        ) : (
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
            <div className="mt-5 flex flex-col items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--brand-blue)] px-8 py-2.5 text-sm font-medium text-white shadow-md hover:bg-[color:var(--brand-blue-dark)]"
              >
                Enviar enlace
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