import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, X, RefreshCw } from "lucide-react";
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

function MisPagosPage() {
  const cliente = useCurrentClient();
  const [popup, setPopup] = useState<PopupState>(null);
  // Map polizaId -> list of uploaded files
  const [files, setFiles] = useState<Record<string, FileInfo[]>>({});
  const [preview, setPreview] = useState<FileInfo | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!cliente) return null;

  const handleUpload = (polizaId: string, file: File) => {
    const info: FileInfo = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      fecha: today(),
    };
    setFiles((prev) => ({
      ...prev,
      [polizaId]: [...(prev[polizaId] ?? []), info],
    }));
    setPopup({
      kind: "info",
      title: "Comprobante cargado",
      message: `Se cargó "${file.name}" correctamente. El administrador revisará el pago.`,
    });
  };

  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pagos
        </h1>
        <p className="text-sm text-muted-foreground">
          Sube tus comprobantes de pago por póliza. Aceptamos PDF e imágenes.
        </p>
      </div>

      {cliente.polizas.map((p) => {
        const inputKey = `up-${p.id}`;
        const list = files[p.id] ?? [];
        return (
          <Section
            key={p.id}
            title={`${p.tipoSeguro} — ${p.aseguradora}`}
            subtitle={`Póliza ${p.id} · Próximo pago ${p.proximoPago} · ${p.cantidad}`}
            extra={
              <>
                <button
                  onClick={() => inputRefs.current[inputKey]?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
                >
                  <UploadCloud className="h-4 w-4" /> Subir comprobante
                </button>
                <input
                  ref={(el) => {
                    inputRefs.current[inputKey] = el;
                  }}
                  type="file"
                  accept="application/pdf,image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(p.id, f);
                    e.target.value = "";
                  }}
                />
              </>
            }
          >
            {list.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Aún no has subido comprobantes para esta póliza.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr>
                      <th className="py-3 font-medium">Archivo</th>
                      <th className="py-3 font-medium">Fecha de carga</th>
                      <th className="py-3 font-medium">Estatus</th>
                      <th className="py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((f, i) => (
                      <tr key={`${p.id}-${i}`} className="border-t border-border/60">
                        <td className="py-3 text-foreground/80">{f.name}</td>
                        <td className="py-3 text-foreground/80">{f.fecha}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--status-active)] px-3 py-1 text-xs font-medium text-[color:var(--status-active-fg)]">
                            <CheckCircle2 className="h-3 w-3" /> Cargado
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => setPreview(f)}
                            className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" /> Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        );
      })}

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
                <RefreshCw className="h-4 w-4" /> Descargar
              </a>
            </div>
          </div>
        </div>
      )}

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}