import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { Search, Download, Plus, ChevronLeft, ChevronRight, X, User, Building2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_admin/cartera")({
  component: CarteraPage,
  head: () => ({ meta: [{ title: "Cartera de clientes" }] }),
});

type Status = "Activa" | "Cancelada" | "En revisión" | "Por renovar";

interface Row {
  id: string;
  name: string;
  poliza: string;
  renovacion: string;
  proximoPago: string;
  cantidad: string;
  correo: string;
  telefono: string;
  hasComprobante: boolean;
  status: Status;
}

const ROWS: Row[] = [
const ROWS: Row[] = [
  // María González (Personal) — 2 pólizas
  { id: "P-990234", name: "María González", poliza: "GMM", renovacion: "01/15/2025", proximoPago: "02/01/2025", cantidad: "$8,450", correo: "maria.gonzalez@correo.com", telefono: "+52 555 102 3344", hasComprobante: true, status: "Activa" },
  { id: "P-990235", name: "María González", poliza: "Auto", renovacion: "03/22/2025", proximoPago: "02/22/2025", cantidad: "$3,200", correo: "maria.gonzalez@correo.com", telefono: "+52 555 102 3344", hasComprobante: true, status: "Por renovar" },

  // Carlos Ramírez (Personal) — 3 pólizas
  { id: "P-990236", name: "Carlos Ramírez", poliza: "Vida", renovacion: "05/10/2025", proximoPago: "03/10/2025", cantidad: "$1,800", correo: "carlos.ramirez@correo.com", telefono: "+52 555 204 5566", hasComprobante: true, status: "Activa" },
  { id: "P-990237", name: "Carlos Ramírez", poliza: "GMM", renovacion: "06/01/2025", proximoPago: "03/01/2025", cantidad: "$7,950", correo: "carlos.ramirez@correo.com", telefono: "+52 555 204 5566", hasComprobante: false, status: "En revisión" },
  { id: "P-990238", name: "Carlos Ramírez", poliza: "Auto", renovacion: "11/15/2024", proximoPago: "12/15/2024", cantidad: "$2,650", correo: "carlos.ramirez@correo.com", telefono: "+52 555 204 5566", hasComprobante: true, status: "Cancelada" },

  // Ana López (Personal) — 2 pólizas
  { id: "P-990239", name: "Ana López", poliza: "Auto", renovacion: "04/20/2025", proximoPago: "03/20/2025", cantidad: "$2,980", correo: "ana.lopez@correo.com", telefono: "+52 555 318 7788", hasComprobante: true, status: "Activa" },
  { id: "P-990240", name: "Ana López", poliza: "Exceso", renovacion: "09/05/2025", proximoPago: "04/05/2025", cantidad: "$4,500", correo: "ana.lopez@correo.com", telefono: "+52 555 318 7788", hasComprobante: true, status: "Activa" },

  // Grupo Industrial Aztlán (Empresa) — 3 pólizas
  { id: "E-880101", name: "Grupo Industrial Aztlán", poliza: "GMM", renovacion: "02/28/2025", proximoPago: "02/28/2025", cantidad: "$48,200", correo: "contacto@aztlan.com.mx", telefono: "+52 55 4422 1100", hasComprobante: true, status: "Por renovar" },
  { id: "E-880102", name: "Grupo Industrial Aztlán", poliza: "Auto", renovacion: "07/14/2025", proximoPago: "03/14/2025", cantidad: "$22,750", correo: "contacto@aztlan.com.mx", telefono: "+52 55 4422 1100", hasComprobante: true, status: "Activa" },
  { id: "E-880103", name: "Grupo Industrial Aztlán", poliza: "Exceso", renovacion: "10/30/2025", proximoPago: "04/30/2025", cantidad: "$35,600", correo: "contacto@aztlan.com.mx", telefono: "+52 55 4422 1100", hasComprobante: true, status: "En revisión" },

  // Constructora Pacífico (Empresa) — 2 pólizas
  { id: "E-880201", name: "Constructora Pacífico", poliza: "Vida", renovacion: "08/12/2025", proximoPago: "03/12/2025", cantidad: "$18,400", correo: "rh@pacifico.mx", telefono: "+52 33 8899 5544", hasComprobante: false, status: "Activa" },
  { id: "E-880202", name: "Constructora Pacífico", poliza: "GMM", renovacion: "01/05/2025", proximoPago: "02/05/2025", cantidad: "$26,150", correo: "rh@pacifico.mx", telefono: "+52 33 8899 5544", hasComprobante: true, status: "Cancelada" },

  // Tecnologías Vértice (Empresa) — 2 pólizas
  { id: "E-880301", name: "Tecnologías Vértice", poliza: "Auto", renovacion: "06/18/2025", proximoPago: "03/18/2025", cantidad: "$14,300", correo: "admin@vertice.io", telefono: "+52 81 2233 4455", hasComprobante: true, status: "Activa" },
  { id: "E-880302", name: "Tecnologías Vértice", poliza: "Exceso", renovacion: "12/01/2024", proximoPago: "12/01/2024", cantidad: "$9,720", correo: "admin@vertice.io", telefono: "+52 81 2233 4455", hasComprobante: true, status: "Por renovar" },
];

const STATUS_STYLES: Record<Status, string> = {
  Activa: "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]",
  Cancelada: "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]",
  "En revisión": "bg-[color:var(--status-review)] text-[color:var(--status-review-fg)]",
  "Por renovar": "bg-[color:var(--status-renew)] text-[color:var(--status-renew-fg)]",
};

function CarteraPage() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

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
                  <th key={h} className="px-6 py-4 text-xs font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                >
                  <td className="px-6 py-4">
                    <Link
                      to="/cliente/$clienteId"
                      params={{ clienteId: r.id.replace(/[^a-zA-Z0-9]/g, "") }}
                      className="text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to="/cliente/$clienteId/poliza/$polizaId"
                      params={{
                        clienteId: r.id.replace(/[^a-zA-Z0-9]/g, ""),
                        polizaId: r.id.replace(/[^a-zA-Z0-9]/g, ""),
                      }}
                      className="text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                    >
                      {r.poliza}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-foreground/80">{r.renovacion}</td>
                  <td className="px-6 py-4 text-foreground/80">{r.proximoPago}</td>
                  <td className="px-6 py-4 text-foreground/80">{r.cantidad}</td>
                  <td className="px-6 py-4 text-foreground/80">{r.correo}</td>
                  <td className="px-6 py-4 text-foreground/80">{r.telefono}</td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
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
        <p>Mostrando 10 de 160 registros</p>
        <p>
          Copyrights © <span className="text-[color:var(--brand-blue)]">Zinois</span>
        </p>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 rounded-full border border-[color:var(--brand-blue)] px-4 py-2 text-[color:var(--brand-blue)]">
            <ChevronLeft className="h-4 w-4" /> Previo
          </button>
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={`h-9 w-9 rounded-full text-sm ${
                n === 1
                  ? "bg-[color:var(--brand-blue)] text-white"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {n}
            </button>
          ))}
          <button className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-white">
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