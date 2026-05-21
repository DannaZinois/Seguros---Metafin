import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Section } from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";
import type { Asegurado } from "@/lib/empresa-store";

export const Route = createFileRoute("/_company/empleados")({
  component: EmpleadosPage,
  head: () => ({ meta: [{ title: "Empleados" }] }),
});

interface EmpleadoRow extends Asegurado {
  polizaTipo: string;
}

function EmpleadosPage() {
  const empresa = useCompanyEmpresa();
  const [query, setQuery] = useState("");

  const empleados: EmpleadoRow[] = useMemo(() => {
    if (!empresa) return [];
    const rows: EmpleadoRow[] = [];
    for (const p of empresa.polizas) {
      for (const a of p.asegurados) {
        rows.push({ ...a, polizaTipo: p.tipo });
      }
    }
    return rows;
  }, [empresa]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return empleados;
    return empleados.filter(
      (e) =>
        e.trabajadorId.toLowerCase().includes(q) ||
        e.nombre.toLowerCase().includes(q),
    );
  }, [empleados, query]);

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
          Empleados
        </h1>
        <p className="text-sm text-muted-foreground">
          Empleados asegurados bajo las pólizas de {empresa.nombre}.
        </p>
      </div>

      <Section title={`Total: ${empleados.length}`}>
        <div className="mb-4 flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por ID o nombre"
              className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[color:var(--brand-blue)]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">ID</th>
                <th className="py-3 font-medium">Nombre</th>
                <th className="py-3 font-medium">Póliza</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Renovación</th>
                <th className="py-3 font-medium">Correo</th>
                <th className="py-3 font-medium">Teléfono</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Sin resultados.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="border-t border-border/60">
                    <td className="py-3 text-foreground/80">{e.trabajadorId}</td>
                    <td className="py-3">{e.nombre}</td>
                    <td className="py-3 text-foreground/80">{e.polizaTipo}</td>
                    <td className="py-3 text-foreground/80">{e.vigencia}</td>
                    <td className="py-3 text-foreground/80">{e.renovacion}</td>
                    <td className="py-3 text-foreground/80">{e.correo}</td>
                    <td className="py-3 text-foreground/80">{e.telefono}</td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-[color:var(--status-active)] px-3 py-1 text-xs font-medium text-[color:var(--status-active-fg)]">
                        {e.status}
                      </span>
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