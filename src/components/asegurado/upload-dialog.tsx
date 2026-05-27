import { useRef, useState } from "react";
import { Upload, X, Loader2, CheckCircle2, FileText, AlertTriangle } from "lucide-react";

export type UploadMode = "zip" | "pdf-split";

export interface ParsedAseguradoFile {
  fileName: string;
  mime: string;
  size: number;
  dataUrl: string;
  detectedRfc: string | null;
  detectedNombre: string | null;
  esConsentimiento?: boolean;
  /** Solo en modo pdf-split */
  page?: number;
}

function base64ToDataUrl(base64: string, mime: string): string {
  return `data:${mime};base64,${base64}`;
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AseguradoUploadDialog({
  open,
  mode,
  polizaId,
  onClose,
  onConfirm,
}: {
  open: boolean;
  mode: UploadMode;
  polizaId?: string;
  onClose: () => void;
  /** Llamado tras parseo exitoso con los archivos listos para persistir */
  onConfirm: (files: ParsedAseguradoFile[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedAseguradoFile[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const accept = mode === "zip" ? ".zip" : ".pdf";
  const title =
    mode === "zip"
      ? "Cargar archivos del asegurado (ZIP)"
      : "Cargar certificados (PDF)";
  const subtitle =
    mode === "zip"
      ? "Sube un .zip con los documentos. Detectaremos RFC y nombre de cada archivo para asignarlos al asegurado correcto."
      : "Sube un PDF con varias hojas. Lo separaremos en hojas individuales y las asignaremos por RFC/nombre.";

  const reset = () => {
    setFile(null);
    setBusy(false);
    setError(null);
    setParsed(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setParsed(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (polizaId) fd.append("polizaId", polizaId);
      const endpoint =
        mode === "zip"
          ? "/api/public/asegurados/zip"
          : "/api/public/asegurados/pdf-split";
      const res = await fetch(endpoint, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      const data = (await res.json()) as
        | { files: Array<Omit<ParsedAseguradoFile, "dataUrl"> & { base64: string }> }
        | {
            pages: Array<
              Omit<ParsedAseguradoFile, "dataUrl" | "esConsentimiento"> & {
                base64: string;
              }
            >;
          };
      let items: ParsedAseguradoFile[] = [];
      if ("files" in data) {
        items = data.files.map((f) => ({
          ...f,
          dataUrl: base64ToDataUrl(f.base64, f.mime),
        }));
      } else {
        items = data.pages.map((p) => ({
          ...p,
          dataUrl: base64ToDataUrl(p.base64, p.mime),
        }));
      }
      setParsed(items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const confirm = () => {
    if (!parsed) return;
    onConfirm(parsed);
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
      >
        <button
          onClick={close}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>

        {!parsed && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center hover:bg-muted/50"
            >
              <Upload className="h-7 w-7 text-[color:var(--brand-blue)]" />
              <span className="text-sm font-medium text-foreground">
                {file ? file.name : "Haz clic para seleccionar un archivo"}
              </span>
              <span className="text-xs text-muted-foreground">
                {mode === "zip" ? ".zip" : ".pdf"} · máx. 20 MB
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={close}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={!file || busy}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Procesando…" : "Procesar archivo"}
              </button>
            </div>
          </>
        )}

        {parsed && (
          <div className="mt-5">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Se detectaron {parsed.length} archivo(s).
            </div>
            <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Archivo</th>
                    <th className="px-3 py-2 font-medium">RFC</th>
                    <th className="px-3 py-2 font-medium">Nombre</th>
                    <th className="px-3 py-2 font-medium">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((f, i) => (
                    <tr key={i} className="border-t border-border/60">
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 text-foreground">
                          <FileText className="h-3.5 w-3.5 text-[color:var(--brand-blue)]" />
                          {f.fileName}{" "}
                          <span className="text-muted-foreground">
                            ({humanSize(f.size)})
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-foreground/80">
                        {f.detectedRfc ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-foreground/80">
                        {f.detectedNombre ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        {f.esConsentimiento ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                            Consentimiento
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Archivo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={reset}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cargar otro
              </button>
              <button
                onClick={confirm}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
              >
                Guardar archivos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
