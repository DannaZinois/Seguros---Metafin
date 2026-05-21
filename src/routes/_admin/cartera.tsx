import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { Search, Download, Plus, ChevronLeft, ChevronRight, X, User, Building2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CLIENTES, buildEmpresaSeeds, type ClienteStatus, type TipoCliente } from "@/lib/clientes-data";
import { seedEmpresasIfEmpty } from "@/lib/empresa-store";

export const Route = createFileRoute("/_admin/cartera")({
  component: CarteraPage,
  head: () => ({ meta: [{ title: "Cartera de clientes" }] }),
});

interface Row {
  id: string;
  clienteId: string;
  tipo: TipoCliente;
  name: string;
  poliza: string;
  renovacion: string;
  proximoPago: string;
  cantidad: string;
  correo: string;
  telefono: string;
  hasComprobante: boolean;
  status: ClienteStatus;
}

const ROWS: Row[] = CLIENTES.flatMap((c) =>
  c.polizas.map((p) => ({
    id: p.id,
    clienteId: c.clienteId,
    tipo: c.tipo,
    name: c.profile.nombre,
    poliza: p.tipoSeguro,
    renovacion: p.renovacion,
    proximoPago: p.proximoPago,
    cantidad: p.cantidad,
    correo: c.profile.correo,
    telefono: c.profile.contacto,
    hasComprobante: p.hasComprobante,
    status: p.status,
  })),
);

const STATUS_STYLES: Record<ClienteStatus, string> = {
  Activa: "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]",
  Cancelada: "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]",
  "En revisión": "bg-[color:var(--status-review)] text-[color:var(--status-review-fg)]",
  "Por renovar": "bg-[color:var(--status-renew)] text-[color:var(--status-renew-fg)]",
};

function CarteraPage() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Seed empresa store with dummy companies so empresa profile pages
  // show coherent data when opened from this table.
  useEffect(() => {
    seedEmpresasIfEmpty(buildEmpresaSeeds());
  }, []);

  const rows = useMemo(() => {
    if (!query.trim()) return ROWS;
    const q = query.toLowerCase();
    return ROWS.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.correo.toLowerCase().includes(q),
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const startIdx = rows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, rows.length);

  const pageNumbers = useMemo(() => {
    const nums: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [page, totalPages]);

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Cartera de clientes
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Consulta el estatus de todos tus clientes, agrega edita o elimina
      </p>

      <div className="mt-8 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar cliente"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-white py-3 pl-11 pr-5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-blue)]"
          />
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" /> Nuevo registro
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-white text-muted-foreground">
              <tr>
                {[
                  "Nombre",
                  "Póliza",
                  "Fecha de renovación",
                  "Próximo pago",
                  "Cantidad",
                  "Correo",
                  "Teléfono",
                  "Comprobante",
                  "Status",
                ].map((h) => (
                <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                >
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                    {r.tipo === "Empresa" ? (
                      <Link
                        to="/empresa/nueva"
                        search={{ empresaId: r.clienteId }}
                        className="text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                      >
                        {r.name}
                      </Link>
                    ) : (
                      <Link
                        to="/cliente/$clienteId"
                        params={{ clienteId: r.clienteId }}
                        className="text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                      >
                        {r.name}
                      </Link>
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                    {r.tipo === "Empresa" ? (
                      <Link
                        to="/empresa/poliza/$polizaId"
                        params={{ polizaId: r.id }}
                        search={{ empresaId: r.clienteId }}
                        className="text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                      >
                        {r.poliza}
                      </Link>
                    ) : (
                      <Link
                        to="/cliente/$clienteId/poliza/$polizaId"
                        params={{ clienteId: r.clienteId, polizaId: r.id }}
                        className="text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                      >
                        {r.poliza}
                      </Link>
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap text-foreground/80">{r.renovacion}</td>
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap text-foreground/80">{r.proximoPago}</td>
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap text-foreground/80">{r.cantidad}</td>
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap text-foreground/80">{r.correo}</td>
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap text-foreground/80">{r.telefono}</td>
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                    {r.hasComprobante ? (
                      <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                        <Download className="h-4 w-4" /> Descargar
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Download className="h-4 w-4" /> -
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-4 py-1 text-xs font-medium ${STATUS_STYLES[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Mostrando {startIdx}-{endIdx} de {rows.length} registros
        </p>
        <p>
          Copyrights © <span className="text-[color:var(--brand-blue)]">Zinois</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 rounded-full border border-[color:var(--brand-blue)] px-4 py-2 text-[color:var(--brand-blue)] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previo
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-9 w-9 rounded-full text-sm ${
                n === page
                  ? "bg-[color:var(--brand-blue)] text-white"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-white disabled:opacity-40"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {modalOpen && <NewRegistroModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function NewRegistroModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<"personal" | "empresa" | null>(null);
  const router = useRouter();

  const confirm = () => {
    onClose();
    if (selected === "personal") {
      router.navigate({ to: "/cotizadores" });
    } else if (selected === "empresa") {
      router.navigate({ to: "/empresa/nueva" });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-foreground">Nuevo registro</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecciona el tipo de cliente que deseas registrar.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelected("personal")}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
              selected === "personal"
                ? "border-[color:var(--brand-blue)] bg-[color:var(--brand-bg-soft)] shadow-md"
                : "border-border hover:border-[color:var(--brand-blue)]/50"
            }`}
          >
            <div className="rounded-full bg-[color:var(--brand-bg-soft)] p-3">
              <User className="h-6 w-6 text-[color:var(--brand-blue)]" />
            </div>
            <span className="text-sm font-semibold text-foreground">Personal</span>
            <span className="text-xs text-muted-foreground text-center">
              Cliente individual con datos personales
            </span>
          </button>

          <button
            onClick={() => setSelected("empresa")}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
              selected === "empresa"
                ? "border-[color:var(--brand-blue)] bg-[color:var(--brand-bg-soft)] shadow-md"
                : "border-border hover:border-[color:var(--brand-blue)]/50"
            }`}
          >
            <div className="rounded-full bg-[color:var(--brand-bg-soft)] p-3">
              <Building2 className="h-6 w-6 text-[color:var(--brand-blue)]" />
            </div>
            <span className="text-sm font-semibold text-foreground">Empresa</span>
            <span className="text-xs text-muted-foreground text-center">
              Empresa o entidad jurídica
            </span>
          </button>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-border px-6 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            disabled={!selected}
            onClick={confirm}
            className="rounded-full bg-[color:var(--brand-blue)] px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-blue-dark)] disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}