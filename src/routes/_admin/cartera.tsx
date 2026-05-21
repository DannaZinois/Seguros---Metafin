import { createFileRoute, useRouter } from "@tanstack/react-router";
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
  { id: "F-#990234", name: "John Doe", poliza: "Póliza aquí", renovacion: "01/01/2024", proximoPago: "01/01/2024", cantidad: "$165", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "Activa" },
  { id: "F-#990233", name: "John Doe", poliza: "Póliza aquí", renovacion: "12/01/2023", proximoPago: "12/01/2023", cantidad: "$165", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: false, status: "Cancelada" },
  { id: "F-#990232", name: "John Doe", poliza: "Póliza aquí", renovacion: "11/01/2023", proximoPago: "11/01/2023", cantidad: "$165", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "En revisión" },
  { id: "C-#982427", name: "John Doe", poliza: "Póliza aquí", renovacion: "10/01/2023", proximoPago: "10/01/2023", cantidad: "$120", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "Por renovar" },
  { id: "T-#956533", name: "John Doe", poliza: "Póliza aquí", renovacion: "09/01/2023", proximoPago: "09/01/2023", cantidad: "$80", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "Activa" },
  { id: "I-#8193168", name: "John Doe", poliza: "Póliza aquí", renovacion: "08/15/2023", proximoPago: "08/15/2023", cantidad: "$120", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "En revisión" },
  { id: "F-#990234", name: "John Doe", poliza: "Póliza aquí", renovacion: "01/01/2024", proximoPago: "01/01/2024", cantidad: "$165", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "Por renovar" },
  { id: "F-#990233", name: "John Doe", poliza: "Póliza aquí", renovacion: "12/01/2023", proximoPago: "12/01/2023", cantidad: "$165", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: false, status: "Cancelada" },
  { id: "F-#990232", name: "John Doe", poliza: "Póliza aquí", renovacion: "11/01/2023", proximoPago: "11/01/2023", cantidad: "$165", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "Activa" },
  { id: "C-#982427", name: "John Doe", poliza: "Póliza aquí", renovacion: "10/01/2023", proximoPago: "10/01/2023", cantidad: "$120", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "Por renovar" },
  { id: "T-#956533", name: "John Doe", poliza: "Póliza aquí", renovacion: "09/01/2023", proximoPago: "09/01/2023", cantidad: "$80", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "En revisión" },
  { id: "I-#8193168", name: "John Doe", poliza: "Póliza aquí", renovacion: "08/15/2023", proximoPago: "08/15/2023", cantidad: "$120", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "Activa" },
  { id: "T-#956533", name: "John Doe", poliza: "Póliza aquí", renovacion: "09/01/2023", proximoPago: "09/01/2023", cantidad: "$80", correo: "johndoe@correo.com", telefono: "+000 000 000", hasComprobante: true, status: "Activa" },
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
                  "ID de cliente",
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
                  <td className="px-6 py-4 text-foreground/80">{r.id}</td>
                  <td className="px-6 py-4">
                    <a href="#" className="text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                      {r.name}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-foreground/80">{r.poliza}</td>
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
  const [selected, setSelected] = useState<"personal" | "compania" | null>(null);
  const router = useRouter();

  const confirm = () => {
    // Placeholder — would navigate to a creation flow
    onClose();
    router.navigate({ to: "/cartera" });
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
            onClick={() => setSelected("compania")}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
              selected === "compania"
                ? "border-[color:var(--brand-blue)] bg-[color:var(--brand-bg-soft)] shadow-md"
                : "border-border hover:border-[color:var(--brand-blue)]/50"
            }`}
          >
            <div className="rounded-full bg-[color:var(--brand-bg-soft)] p-3">
              <Building2 className="h-6 w-6 text-[color:var(--brand-blue)]" />
            </div>
            <span className="text-sm font-semibold text-foreground">Compañía</span>
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