import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { Section, Grid, Field, TextInput } from "@/components/cotizador/shared";
import { useCurrentClient, ASEGURADORA_LINKS } from "@/lib/client-context";
import type { PolizaData } from "@/lib/clientes-data";

export const Route = createFileRoute("/_client/mis-polizas")({
  component: MisPolizasPage,
  head: () => ({ meta: [{ title: "Mis pólizas" }] }),
});

const statusClass: Record<PolizaData["status"], string> = {
  Activa: "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]",
  Cancelada: "bg-destructive/10 text-destructive",
  "En revisión": "bg-amber-100 text-amber-800",
  "Por renovar": "bg-blue-100 text-blue-800",
};

function MisPolizasPage() {
  const cliente = useCurrentClient();
  const [detail, setDetail] = useState<PolizaData | null>(null);

  if (!cliente) return null;

  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Mis pólizas
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulta el detalle de tus pólizas activas y accede al portal de tu
          aseguradora.
        </p>
      </div>

      <Section title={`Pólizas registradas (${cliente.polizas.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Póliza</th>
                <th className="py-3 font-medium">Tipo</th>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Próximo pago</th>
                <th className="py-3 font-medium">Estatus</th>
                <th className="py-3 font-medium">Portal aseguradora</th>
              </tr>
            </thead>
            <tbody>
              {cliente.polizas.map((p) => {
                const link = ASEGURADORA_LINKS[p.aseguradora];
                return (
                  <tr
                    key={p.id}
                    className="cursor-pointer border-t border-border/60 hover:bg-muted/40"
                    onClick={() => setDetail(p)}
                  >
                    <td className="py-3 font-medium text-foreground">{p.id}</td>
                    <td className="py-3 text-foreground/80">{p.tipoSeguro}</td>
                    <td className="py-3 text-foreground/80">{p.aseguradora}</td>
                    <td className="py-3 text-foreground/80">{p.vigencia}</td>
                    <td className="py-3 text-foreground/80">{p.proximoPago}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Ir al sitio
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
          onClick={() => setDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={() => setDetail(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-foreground">
              Póliza {detail.id} — {detail.tipoSeguro}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Datos generales de tu póliza con {detail.aseguradora}.
            </p>
            <div className="mt-4">
              <Grid>
                <Field label="Tipo de seguro">
                  <TextInput value={detail.tipoSeguro} readOnly />
                </Field>
                <Field label="Aseguradora">
                  <TextInput value={detail.aseguradora} readOnly />
                </Field>
                <Field label="Vigencia">
                  <TextInput value={detail.vigencia} readOnly />
                </Field>
                <Field label="Renovación">
                  <TextInput value={detail.renovacion} readOnly />
                </Field>
                <Field label="Próximo pago">
                  <TextInput value={detail.proximoPago} readOnly />
                </Field>
                <Field label="Monto">
                  <TextInput value={detail.cantidad} readOnly />
                </Field>
                <Field label="Estatus">
                  <TextInput value={detail.status} readOnly />
                </Field>
                <Field label="Certificado">
                  <TextInput value={detail.certificado ? "Sí" : "No"} readOnly />
                </Field>
              </Grid>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              {ASEGURADORA_LINKS[detail.aseguradora] && (
                <a
                  href={ASEGURADORA_LINKS[detail.aseguradora]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
                >
                  <ExternalLink className="h-4 w-4" /> Ir al portal de {detail.aseguradora}
                </a>
              )}
              <button
                onClick={() => setDetail(null)}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}