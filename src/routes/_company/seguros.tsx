import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { Section } from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";

export const Route = createFileRoute("/_company/seguros")({
  component: SegurosPage,
  head: () => ({ meta: [{ title: "Mis seguros" }] }),
});

function SegurosPage() {
  const empresa = useCompanyEmpresa();

  if (!empresa) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Mis seguros
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulta las pólizas activas de {empresa.nombre}.
        </p>
      </div>

      <Section title="Pólizas activas">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Tipo de póliza</th>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Contratante</th>
                <th className="py-3 font-medium">Número de asegurados</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Estatus</th>
                <th className="py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresa.polizas.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Sin pólizas registradas.
                  </td>
                </tr>
              ) : (
                empresa.polizas.map((p) => (
                  <tr key={p.id} className="border-t border-border/60">
                    <td className="py-3">{p.tipo || "—"}</td>
                    <td className="py-3 text-foreground/80">
                      {p.aseguradora}
                    </td>
                    <td className="py-3 text-foreground/80">
                      {p.contratante}
                    </td>
                    <td className="py-3 text-foreground/80">
                      {p.numAsegurados}
                    </td>
                    <td className="py-3 text-foreground/80">
                      {p.vigencia || "—"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-4 py-1 text-xs font-medium ${
                          p.estatus === "Vencida"
                            ? "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]"
                            : "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                        }`}
                      >
                        {p.estatus || "Vigente"}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link
                        to="/seguros/$polizaId"
                        params={{ polizaId: p.id }}
                        className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
                      >
                        <Eye className="h-3.5 w-3.5" /> Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}