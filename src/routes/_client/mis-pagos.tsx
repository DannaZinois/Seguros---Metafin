import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, X, Download, RefreshCw, Lock } from "lucide-react";
import { Section, Popup, type PopupState } from "@/components/cotizador/shared";
import { useCurrentClient } from "@/lib/client-context";

export const Route = createFileRoute("/_client/mis-pagos")({
  component: MisPagosPage,
  head: () => ({ meta: [{ title: "Mis pagos" }] }),
});

interface FileInfo {
  name: string;
  url: string;
  type: string;
  fecha: string;
}

function today() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

const FORMAS_PAGO = ["Mensual", "Trimestral", "Semestral", "Anual"] as const;
const formaPagoFor = (id: string) =>
  FORMAS_PAGO[id.charCodeAt(id.length - 1) % FORMAS_PAGO.length];

interface PrevPago {
  id: string;
  polizaId: string;
  aseguradora: string;
  fechaPago: string;
  formaPago: string;
}

function MisPagosPage() {
  const cliente = useCurrentClient();
  const [popup, setPopup] = useState<PopupState>(null);
  const [files, setFiles] = useState<Record<string, FileInfo>>({});
  const [preview, setPreview] = useState<FileInfo | null>(null);
  const [uploadFor, setUploadFor] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  if (!cliente) return null;

  const previos: PrevPago[] = cliente.polizas.flatMap((p) => [
    {
      id: `${p.id}-prev1`,
      polizaId: p.id,
      aseguradora: p.aseguradora,
      fechaPago: "11/15/2024",
      formaPago: formaPagoFor(p.id),
    },
    {
      id: `${p.id}-prev2`,
      polizaId: p.id,
      aseguradora: p.aseguradora,
      fechaPago: "10/15/2024",
      formaPago: formaPagoFor(p.id),
    },
  ]);

  const handleUpload = (polizaId: string, file: File) => {
    const info: FileInfo = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      fecha: today(),
    };
    setFiles((prev) => {
      const old = prev[polizaId];
      if (old) URL.revokeObjectURL(old.url);
      return { ...prev, [polizaId]: info };
    });
    setUploadFor(null);
    setPopup({
      kind: "info",
      title: "Comprobante cargado",
      message: `Se cargó "${file.name}" correctamente. El administrador revisará el pago.`,
    });
  };

  const currentUploaded = uploadFor ? files[uploadFor] : null;

  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pagos
        </h1>
        <p className="text-sm text-muted-foreground">
          Descarga el recibo de cada póliza y sube tu comprobante de pago.
        </p>
      </div>

      <Section title="Pago vigente">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Póliza</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Forma de pago</th>
                <th className="py-3 font-medium">Fecha de pago</th>
                <th className="py-3 font-medium">Recibo</th>
                <th className="py-3 font-medium">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {cliente.polizas.map((p) => {
                const uploaded = files[p.id];
                return (
                  <tr key={p.id} className="border-t border-border/60">
                    <td className="py-3 text-foreground/80">{p.aseguradora}</td>
                    <td className="py-3 font-medium text-foreground">{p.id}</td>
                    <td className="py-3 text-foreground/80">{p.vigencia}</td>
                    <td className="py-3 text-foreground/80">{formaPagoFor(p.id)}</td>
                    <td className="py-3 text-foreground/80">{p.proximoPago}</td>
                    <td className="py-3">
                      <button
                        onClick={() =>
                          setPopup({
                            kind: "info",
                            title: "Descargando recibo",
                            message: `Se está preparando el recibo de la póliza ${p.id}.`,
                          })
                        }
                        className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" /> Descargar
                      </button>
                    </td>
                    <td className="py-3">
                      {uploaded ? (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setPreview(uploaded)}
                            className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" /> Ver
                          </button>
                          <button
                            onClick={() => setUploadFor(p.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/80 hover:bg-muted"
                          >
                            <RefreshCw className="h-3 w-3" /> Cambiar
                          </button>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--status-active)] px-3 py-1 text-xs font-medium text-[color:var(--status-active-fg)]">
                            <CheckCircle2 className="h-3 w-3" /> Cargado
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setUploadFor(p.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-3 py-1 text-xs font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
                        >
                          <UploadCloud className="h-3 w-3" /> Subir
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Recibos previos"
        subtitle="Pagos anteriores: solo lectura. Puedes descargar el recibo y el comprobante."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Póliza</th>
                <th className="py-3 font-medium">Forma de pago</th>
                <th className="py-3 font-medium">Fecha de pago</th>
                <th className="py-3 font-medium">Recibo</th>
                <th className="py-3 font-medium">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {previos.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="py-3 text-foreground/80">{r.aseguradora}</td>
                  <td className="py-3 font-medium text-foreground">{r.polizaId}</td>
                  <td className="py-3 text-foreground/80">{r.formaPago}</td>
                  <td className="py-3 text-foreground/80">{r.fechaPago}</td>
                  <td className="py-3">
                    <button
                      onClick={() =>
                        setPopup({
                          kind: "info",
                          title: "Descargando recibo",
                          message: `Se está preparando el recibo de la póliza ${r.polizaId}.`,
                        })
                      }
                      className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" /> Descargar
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPopup({
                            kind: "info",
                            title: "Descargando comprobante",
                            message: `Se está preparando el comprobante de la póliza ${r.polizaId}.`,
                          })
                        }
                        className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" /> Descargar
                      </button>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        <Lock className="h-3 w-3" /> Solo lectura
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {uploadFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
          onClick={() => setUploadFor(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={() => setUploadFor(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-foreground">
              {currentUploaded ? "Cambiar archivo" : "Subir comprobante"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentUploaded
                ? `Reemplaza el comprobante actual de la póliza ${uploadFor}.`
                : `Carga el comprobante de pago de la póliza ${uploadFor}.`}
            </p>

            {currentUploaded && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-3 text-sm">
                <div className="flex items-center gap-2 truncate text-foreground/80">
                  <FileText className="h-4 w-4 text-[color:var(--brand-blue)]" />
                  <span className="truncate">{currentUploaded.name}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {currentUploaded.fecha}
                </span>
              </div>
            )}

            <button
              onClick={() => uploadInputRef.current?.click()}
              className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
            >
              <UploadCloud className="h-8 w-8 text-[color:var(--brand-blue)]" />
              <span className="font-medium text-foreground">
                {currentUploaded ? "Seleccionar nuevo archivo" : "Seleccionar archivo"}
              </span>
              <span className="text-xs">PDF o imagen</span>
            </button>
            <input
              ref={uploadInputRef}
              type="file"
              accept="application/pdf,image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && uploadFor) handleUpload(uploadFor, f);
                e.target.value = "";
              }}
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setUploadFor(null)}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-md"
          onClick={() => setPreview(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-foreground">Comprobante</h3>
            <p className="mt-1 text-sm text-muted-foreground">{preview.name}</p>
            <div className="mt-4 flex-1 overflow-hidden rounded-2xl border border-border bg-muted/30">
              {preview.type.startsWith("image/") ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="h-full max-h-[60vh] w-full object-contain"
                />
              ) : (
                <iframe src={preview.url} title={preview.name} className="h-[60vh] w-full" />
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPreview(null)}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cerrar
              </button>
              <a
                href={preview.url}
                download={preview.name}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
              >
                <Download className="h-4 w-4" /> Descargar
              </a>
            </div>
          </div>
        </div>
      )}

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}