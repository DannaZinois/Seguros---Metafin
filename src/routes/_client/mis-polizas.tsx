import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { X, Download, Eye, Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Section } from "@/components/cotizador/shared";
import { ASEGURADORA_LINKS } from "@/lib/client-context";

export const Route = createFileRoute("/_client/mis-polizas")({
  component: MisPolizasPage,
  head: () => ({ meta: [{ title: "Mis pólizas" }] }),
});

type RowStatus = "Activa" | "Cancelada" | "En revisión" | "Por renovar";

interface PolizaRow {
  id: string;
  tipo: "GMM" | "Vida";
  vigencia: string;
  aseguradora: string;
  contratante: string;
  status: RowStatus;
}

const POLIZAS: PolizaRow[] = [
  {
    id: "P990234",
    tipo: "GMM",
    vigencia: "06/06/2025",
    aseguradora: "Zurich",
    contratante: "Orion Innovation",
    status: "Activa",
  },
  {
    id: "P990235",
    tipo: "Vida",
    vigencia: "06/06/2025",
    aseguradora: "Mapfre",
    contratante: "Orion Innovation",
    status: "Activa",
  },
];

const statusClass: Record<RowStatus, string> = {
  Activa: "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]",
  Cancelada: "bg-destructive/10 text-destructive",
  "En revisión": "bg-amber-100 text-amber-800",
  "Por renovar": "bg-blue-100 text-blue-800",
};

function MisPolizasPage() {
  const [detail, setDetail] = useState<PolizaRow | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!downloading) return;
    const t = setTimeout(() => {
      setDownloading(false);
      setDownloadDone(true);
    }, 1500);
    return () => clearTimeout(t);
  }, [downloading]);

  const startDownload = () => {
    setDownloadDone(false);
    setDownloading(true);
  };

  const openUpload = () => {
    setUploadFile(null);
    setUploadSuccess(false);
    setUploadOpen(true);
  };

  const confirmUpload = () => {
    if (!uploadFile) return;
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadOpen(false);
    }, 1200);
  };

  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Mis pólizas
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulta el detalle de tus pólizas activas y accede al portal de tu
          aseguradora.
        </p>
      </div>

      <Section title={`Pólizas registradas (${POLIZAS.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Póliza</th>
                <th className="py-3 font-medium">Tipo</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Contratante</th>
                <th className="py-3 font-medium">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {POLIZAS.map((p) => {
                return (
                  <tr
                    key={p.id}
                    className="cursor-pointer border-t border-border/60 hover:bg-muted/40"
                    onClick={() => setDetail(p)}
                  >
                    <td className="py-3 font-medium text-foreground">{p.id}</td>
                    <td className="py-3 text-foreground/80">{p.tipo}</td>
                    <td className="py-3 text-foreground/80">{p.vigencia}</td>
                    <td className="py-3 text-foreground/80">{p.aseguradora}</td>
                    <td className="py-3 text-foreground/80">{p.contratante}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Formato de consentimiento">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Póliza</th>
                <th className="py-3 font-medium">Tipo</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Consentimiento</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border/60 hover:bg-muted/40">
                <td className="py-3 font-medium text-foreground">P990235</td>
                <td className="py-3 text-foreground/80">Vida</td>
                <td className="py-3 text-foreground/80">06/06/2025</td>
                <td className="py-3 text-foreground/80">Mapfre</td>
                <td className="py-3">
                  <div className="flex items-center gap-3 text-[color:var(--brand-blue)]">
                    <button
                      title="Ver"
                      className="hover:opacity-70"
                      onClick={() => navigate({ to: "/consentimiento/ver" })}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button title="Descargar" className="hover:opacity-70" onClick={startDownload}>
                      <Download className="h-4 w-4" />
                    </button>
                    <button title="Cargar" className="hover:opacity-70" onClick={openUpload}>
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {(downloading || downloadDone) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
          onClick={() => {
            if (!downloading) setDownloadDone(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
          >
            {downloading ? (
              <>
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-[color:var(--brand-blue)]" />
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  Descargando archivo…
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Estamos preparando consentimiento_P990235.pdf
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  Descarga completada
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  El archivo se descargó correctamente.
                </p>
                <button
                  onClick={() => setDownloadDone(false)}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {uploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
          onClick={() => setUploadOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={() => setUploadOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-foreground">
              Cargar formato de consentimiento
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Adjunta el documento firmado (PDF, JPG o PNG).
            </p>

            {uploadSuccess ? (
              <div className="mt-5 flex flex-col items-center rounded-2xl bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <p className="mt-3 text-sm font-medium text-emerald-700">
                  Archivo cargado correctamente
                </p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center hover:bg-muted/50"
                >
                  <Upload className="h-7 w-7 text-[color:var(--brand-blue)]" />
                  <span className="text-sm font-medium text-foreground">
                    {uploadFile ? uploadFile.name : "Haz clic para seleccionar un archivo"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PDF, JPG o PNG · máx. 10 MB
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setUploadOpen(false)}
                    className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmUpload}
                    disabled={!uploadFile}
                    className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    Cargar archivo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
          onClick={() => setDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={() => setDetail(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-foreground">
              {detail.tipo} — {detail.aseguradora}
            </h3>

            <div className={`mt-5 grid gap-3 ${detail.tipo === "Vida" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              <button className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-muted/30 p-4 text-left hover:bg-muted/60">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--brand-blue)]/10 text-[color:var(--brand-blue)]">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">Condiciones generales</span>
                <span className="inline-flex items-center gap-1 text-xs text-[color:var(--brand-blue)]">
                  <Download className="h-3.5 w-3.5" /> Descargar
                </span>
              </button>

              <button className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-muted/30 p-4 text-left hover:bg-muted/60">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--brand-blue)]/10 text-[color:var(--brand-blue)]">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">Mi póliza</span>
                <span className="inline-flex items-center gap-1 text-xs text-[color:var(--brand-blue)]">
                  <Download className="h-3.5 w-3.5" /> Descargar
                </span>
              </button>

              {detail.tipo === "Vida" && (
                <div className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--brand-blue)]/10 text-[color:var(--brand-blue)]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Formato de consentimiento</span>
                  <div className="flex items-center gap-3 text-[color:var(--brand-blue)]">
                    <button title="Ver" className="inline-flex items-center gap-1 text-xs hover:opacity-70">
                      <Eye className="h-3.5 w-3.5" /> Ver
                    </button>
                    <button title="Cargar" className="inline-flex items-center gap-1 text-xs hover:opacity-70">
                      <Upload className="h-3.5 w-3.5" /> Cargar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}