import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, Download, CheckCircle2 } from "lucide-react";
import {
  Section,
  Popup,
  type PopupState,
} from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";
import { saveEmpresa, type Comprobante } from "@/lib/empresa-store";

export const Route = createFileRoute("/_company/pagos")({
  component: PagosPage,
  head: () => ({ meta: [{ title: "Pagos" }] }),
});

function PagosPage() {
  const empresa = useCompanyEmpresa();
  const [popup, setPopup] = useState<PopupState>(null);

  if (!empresa) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  const handleUpload = (polizaId: string, file: File) => {
    const today = new Date();
    const fmt = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
    const nuevo: Comprobante = {
      id: crypto.randomUUID(),
      poliza: polizaId,
      tipoPago: "Cliente",
      fechaPago: fmt,
      recibo: false,
      fechaCarga: fmt,
      comprobante: true,
      estatus: "Cargado",
    };
    const next = {
      ...empresa,
      polizas: empresa.polizas.map((p) =>
        p.id === polizaId
          ? { ...p, comprobantes: [...p.comprobantes, nuevo] }
          : p,
      ),
    };
    saveEmpresa(next);
    setPopup({
      kind: "info",
      title: "Comprobante cargado",
      message: `Se cargó el archivo "${file.name}" correctamente.`,
    });
  };

  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pagos
        </h1>
        <p className="text-sm text-muted-foreground">
          Sube los comprobantes de pago de tus pólizas y consulta el historial.
        </p>
      </div>

      {empresa.polizas.map((p) => (
        <Section
          key={p.id}
          title={`${p.tipo} — ${p.aseguradora}`}
          subtitle={`Póliza ${p.id} · Vigencia ${p.vigencia ?? "—"}`}
          extra={
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]">
              <UploadCloud className="h-4 w-4" />
              Subir comprobante
              <input
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(p.id, f);
                  e.target.value = "";
                }}
              />
            </label>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-3 font-medium">Tipo de pago</th>
                  <th className="py-3 font-medium">Fecha de pago</th>
                  <th className="py-3 font-medium">Recibo</th>
                  <th className="py-3 font-medium">Fecha de carga</th>
                  <th className="py-3 font-medium">Comprobante</th>
                  <th className="py-3 font-medium">Estatus</th>
                </tr>
              </thead>
              <tbody>
                {p.comprobantes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      Sin comprobantes. Sube tu primer comprobante.
                    </td>
                  </tr>
                ) : (
                  p.comprobantes.map((c) => (
                    <tr key={c.id} className="border-t border-border/60">
                      <td className="py-3 text-foreground/80">{c.tipoPago}</td>
                      <td className="py-3 text-foreground/80">{c.fechaPago}</td>
                      <td className="py-3">
                        <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                          <Download className="h-3.5 w-3.5" />
                          {c.recibo ? "Descargar" : "-"}
                        </button>
                      </td>
                      <td className="py-3 text-foreground/80">{c.fechaCarga}</td>
                      <td className="py-3">
                        <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                          <Download className="h-3.5 w-3.5" />
                          {c.comprobante ? "Descargar" : "-"}
                        </button>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            c.estatus === "Cargado"
                              ? "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                              : "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]"
                          }`}
                        >
                          {c.estatus === "Cargado" && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {c.estatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>
      ))}

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}