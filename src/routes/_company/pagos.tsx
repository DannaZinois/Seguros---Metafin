import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UploadCloud, Download, CheckCircle2, FileText, RefreshCw, X } from "lucide-react";
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

interface FileInfo {
  name: string;
  url: string;
  type: string;
}

function PagosPage() {
  const empresa = useCompanyEmpresa();
  const [popup, setPopup] = useState<PopupState>(null);
  const [files, setFiles] = useState<Record<string, FileInfo>>({});
  const [preview, setPreview] = useState<{ comprobanteId: string; polizaId: string } | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  if (!empresa) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  const today = () => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const setComprobanteFile = (polizaId: string, comprobanteId: string, file: File) => {
    const info: FileInfo = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    };
    setFiles((prev) => {
      const old = prev[comprobanteId];
      if (old) URL.revokeObjectURL(old.url);
      return { ...prev, [comprobanteId]: info };
    });
    const next = {
      ...empresa,
      polizas: empresa.polizas.map((p) =>
        p.id === polizaId
          ? {
              ...p,
              comprobantes: p.comprobantes.map((c) =>
                c.id === comprobanteId
                  ? { ...c, comprobante: true, estatus: "Cargado" as const, fechaCarga: today() }
                  : c,
              ),
            }
          : p,
      ),
    };
    saveEmpresa(next);
  };

  const handleUploadNew = (polizaId: string, file: File) => {
    const nuevo: Comprobante = {
      id: crypto.randomUUID(),
      poliza: polizaId,
      tipoPago: "Cliente",
      fechaPago: today(),
      recibo: false,
      fechaCarga: today(),
      comprobante: true,
      estatus: "Cargado",
    };
    const next = {
      ...empresa,
      polizas: empresa.polizas.map((p) =>
        p.id === polizaId ? { ...p, comprobantes: [...p.comprobantes, nuevo] } : p,
      ),
    };
    saveEmpresa(next);
    setFiles((prev) => ({
      ...prev,
      [nuevo.id]: {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      },
    }));
    setPopup({
      kind: "info",
      title: "Comprobante cargado",
      message: `Se cargó "${file.name}" correctamente.`,
    });
  };

  const previewFile = preview ? files[preview.comprobanteId] : null;

  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pagos
        </h1>
        <p className="text-sm text-muted-foreground">
          Sube los comprobantes de pago desde la columna “Comprobante” de cada póliza.
        </p>
      </div>

      {empresa.polizas.map((p) => {
        const newInputKey = `new-${p.id}`;
        return (
          <Section
            key={p.id}
            title={`${p.tipo} — ${p.aseguradora}`}
            subtitle={`Póliza ${p.id} · Vigencia ${p.vigencia ?? "—"}`}
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
                      <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                        <button
                          onClick={() => inputRefs.current[newInputKey]?.click()}
                          className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-xs font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
                        >
                          <UploadCloud className="h-3.5 w-3.5" /> Cargar comprobante
                        </button>
                        <input
                          ref={(el) => {
                            inputRefs.current[newInputKey] = el;
                          }}
                          type="file"
                          accept="application/pdf,image/*"
                          hidden
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadNew(p.id, f);
                            e.target.value = "";
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    p.comprobantes.map((c) => {
                      const cargado = c.estatus === "Cargado";
                      const inputKey = `c-${c.id}`;
                      return (
                        <tr key={c.id} className="border-t border-border/60">
                          <td className="py-3 text-foreground/80">{c.tipoPago}</td>
                          <td className="py-3 text-foreground/80">{c.fechaPago}</td>
                          <td className="py-3">
                            <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                              <Download className="h-3.5 w-3.5" />
                              {c.recibo ? "Descargar" : "-"}
                            </button>
                          </td>
                          <td className="py-3 text-foreground/80">{cargado ? c.fechaCarga : "—"}</td>
                          <td className="py-3">
                            {cargado ? (
                              <button
                                onClick={() =>
                                  setPreview({ comprobanteId: c.id, polizaId: p.id })
                                }
                                className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Ver comprobante
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => inputRefs.current[inputKey]?.click()}
                                  className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-3 py-1 text-xs font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
                                >
                                  <UploadCloud className="h-3 w-3" /> Cargar
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
                                    if (f) setComprobanteFile(p.id, c.id, f);
                                    e.target.value = "";
                                  }}
                                />
                              </>
                            )}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                                cargado
                                  ? "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                                  : "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]"
                              }`}
                            >
                              {cargado && <CheckCircle2 className="h-3 w-3" />}
                              {c.estatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {p.comprobantes.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => inputRefs.current[newInputKey]?.click()}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-muted"
                >
                  <UploadCloud className="h-3.5 w-3.5" /> Cargar nuevo comprobante
                </button>
                <input
                  ref={(el) => {
                    inputRefs.current[newInputKey] = el;
                  }}
                  type="file"
                  accept="application/pdf,image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadNew(p.id, f);
                    e.target.value = "";
                  }}
                />
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
            <p className="mt-1 text-sm text-muted-foreground">
              {previewFile?.name ?? "Archivo cargado previamente."}
            </p>
            <div className="mt-4 flex-1 overflow-hidden rounded-2xl border border-border bg-muted/30">
              {previewFile ? (
                previewFile.type.startsWith("image/") ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="h-full max-h-[60vh] w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={previewFile.url}
                    title={previewFile.name}
                    className="h-[60vh] w-full"
                  />
                )
              ) : (
                <div className="flex h-[40vh] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
                  <FileText className="h-10 w-10 text-[color:var(--brand-blue)]" />
                  <p>
                    Vista previa no disponible para archivos cargados en sesiones anteriores.
                  </p>
                  <p className="text-xs">Puedes reemplazarlo con un nuevo archivo.</p>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPreview(null)}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cerrar
              </button>
              <button
                onClick={() => replaceInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
              >
                <RefreshCw className="h-4 w-4" /> Reemplazar archivo
              </button>
              <input
                ref={replaceInputRef}
                type="file"
                accept="application/pdf,image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && preview) {
                    setComprobanteFile(preview.polizaId, preview.comprobanteId, f);
                    setPopup({
                      kind: "info",
                      title: "Archivo reemplazado",
                      message: `Se reemplazó por "${f.name}".`,
                    });
                  }
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>
      )}

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}