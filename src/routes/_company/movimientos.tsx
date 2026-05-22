import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ClipboardList } from "lucide-react";
import { Section } from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";

export const Route = createFileRoute("/_company/movimientos")({
  component: MovimientosPage,
  head: () => ({ meta: [{ title: "Administración de movimientos" }] }),
});

type TipoMovimiento =
  | "Alta de empleado"
  | "Baja de empleado"
  | "Actualización de póliza"
  | "Carga de comprobante"
  | "Renovación"
  | "Cambio de datos";

interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  usuario: string;
  rol: string;
  fecha: string; // DD/MM/YYYY
  hora: string; // HH:mm
  detalle: string;
}

const STORAGE_KEY = "zinois.movimientos";

const TIPOS: TipoMovimiento[] = [
  "Alta de empleado",
  "Baja de empleado",
  "Actualización de póliza",
  "Carga de comprobante",
  "Renovación",
  "Cambio de datos",
];

function seedMovimientos(): Movimiento[] {
  const base: Omit<Movimiento, "id">[] = [
    { tipo: "Alta de empleado", usuario: "María Hernández", rol: "RRHH", fecha: "18/05/2026", hora: "09:42", detalle: "Alta de Luis Ramírez en póliza GMM-2024" },
    { tipo: "Carga de comprobante", usuario: "Carlos Mendoza", rol: "Admin", fecha: "17/05/2026", hora: "14:08", detalle: "Comprobante de pago póliza Autos-118" },
    { tipo: "Actualización de póliza", usuario: "Ana López", rol: "Admin", fecha: "15/05/2026", hora: "11:25", detalle: "Cambio de aseguradora a GNP" },
    { tipo: "Baja de empleado", usuario: "María Hernández", rol: "RRHH", fecha: "12/05/2026", hora: "16:53", detalle: "Baja de Sofía Pérez" },
    { tipo: "Renovación", usuario: "Carlos Mendoza", rol: "Admin", fecha: "08/05/2026", hora: "10:14", detalle: "Renovación póliza Vida-007" },
    { tipo: "Cambio de datos", usuario: "Ana López", rol: "Admin", fecha: "05/05/2026", hora: "08:30", detalle: "Actualización de dirección fiscal" },
    { tipo: "Carga de comprobante", usuario: "María Hernández", rol: "RRHH", fecha: "02/05/2026", hora: "13:46", detalle: "Comprobante póliza GMM-2024" },
    { tipo: "Alta de empleado", usuario: "Carlos Mendoza", rol: "Admin", fecha: "28/04/2026", hora: "15:21", detalle: "Alta masiva de 12 empleados" },
  ];
  return base.map((m) => ({ ...m, id: crypto.randomUUID() }));
}

function useMovimientos() {
  const [list, setList] = useState<Movimiento[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setList(JSON.parse(raw));
        return;
      }
    } catch {
      // ignore
    }
    const seeds = seedMovimientos();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    setList(seeds);
  }, []);
  return [list, setList] as const;
}

function MovimientosPage() {
  const empresa = useCompanyEmpresa();
  const [movs] = useMovimientos();
  const [query, setQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoMovimiento | "Todos">("Todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movs.filter((m) => {
      if (tipoFiltro !== "Todos" && m.tipo !== tipoFiltro) return false;
      if (!q) return true;
      return (
        m.usuario.toLowerCase().includes(q) ||
        m.tipo.toLowerCase().includes(q) ||
        m.detalle.toLowerCase().includes(q)
      );
    });
  }, [movs, query, tipoFiltro]);

  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Administración de movimientos
        </h1>
        <p className="text-sm text-muted-foreground">
          Registro de movimientos realizados en la cuenta de{" "}
          {empresa?.nombre ?? "la empresa"}: tipo, responsable, fecha y hora.
        </p>
      </div>

      <Section
        title="Bitácora de movimientos"
        subtitle={`${filtered.length} movimiento${filtered.length === 1 ? "" : "s"} registrado${filtered.length === 1 ? "" : "s"}`}
        extra={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por usuario o detalle"
                className="h-9 w-64 rounded-full border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-[color:var(--brand-blue)]"
              />
            </div>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as TipoMovimiento | "Todos")}
              className="h-9 rounded-full border border-border bg-white px-3 text-sm outline-none focus:border-[color:var(--brand-blue)]"
            >
              <option value="Todos">Todos los tipos</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Tipo de movimiento</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Hora</th>
                  <th className="px-4 py-3 font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      <ClipboardList className="mx-auto mb-2 h-6 w-6 opacity-60" />
                      No se encontraron movimientos.
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className="border-t border-border/60">
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-[color:var(--brand-blue)]/10 px-2.5 py-1 text-xs font-medium text-[color:var(--brand-blue)]">
                          {m.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground/90">{m.usuario}</td>
                      <td className="px-4 py-3 text-foreground/70">{m.rol}</td>
                      <td className="px-4 py-3 text-foreground/80">{m.fecha}</td>
                      <td className="px-4 py-3 text-foreground/80">{m.hora}</td>
                      <td className="px-4 py-3 text-foreground/70">{m.detalle}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </div>
  );
}