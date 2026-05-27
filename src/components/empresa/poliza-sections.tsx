import { useMemo, useState } from "react";
import { Plus, Trash2, Download, Search, Upload, FileUp, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Section } from "@/components/cotizador/shared";
import type { Poliza } from "@/lib/empresa-store";
import {
  AseguradoUploadDialog,
  type ParsedAseguradoFile,
  type UploadMode,
} from "@/components/asegurado/upload-dialog";
import { addAseguradoDocs, type AseguradoDoc } from "@/lib/asegurado-docs-store";

const STATUS_COLORS: Record<string, string> = {
  Activa: "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]",
  Cancelada: "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]",
  "En revisión": "bg-[color:var(--status-review)] text-[color:var(--status-review-fg)]",
  "Por renovar": "bg-[color:var(--status-renew)] text-[color:var(--status-renew-fg)]",
};

export function AseguradosSection({
  poliza,
  onChange,
  readOnly,
  empresaId,
}: {
  poliza: Poliza;
  onChange: (a: Poliza["asegurados"]) => void;
  readOnly?: boolean;
  empresaId?: string;
}) {
  const [query, setQuery] = useState("");
  const [uploadMode, setUploadMode] = useState<UploadMode | null>(null);
  const [consentDialog, setConsentDialog] = useState<null | "choose" | "individual">(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return poliza.asegurados;
    return poliza.asegurados.filter(
      (a) =>
        a.trabajadorId.toLowerCase().includes(q) ||
        a.nombre.toLowerCase().includes(q),
    );
  }, [poliza.asegurados, query]);

  const handleParsed = (files: ParsedAseguradoFile[]) => {
    const now = Date.now();
    const docs: AseguradoDoc[] = [];
    const updatedAsegurados = [...poliza.asegurados];
    const isCertificadoMode = uploadMode === "pdf-split";

    for (const f of files) {
      const rfc = (f.detectedRfc ?? "").toUpperCase();
      const match = updatedAsegurados.find(
        (a) =>
          (rfc && a.trabajadorId.toUpperCase() === rfc) ||
          (f.detectedNombre &&
            a.nombre &&
            a.nombre.toLowerCase().includes(f.detectedNombre.toLowerCase())),
      );

      docs.push({
        id: crypto.randomUUID(),
        rfc: rfc || match?.trabajadorId || "SIN-RFC",
        nombre: f.detectedNombre ?? match?.nombre,
        polizaId: poliza.id,
        aseguradoId: match?.id,
        fileName: f.fileName,
        mime: f.mime,
        size: f.size,
        dataUrl: f.dataUrl,
        source: uploadMode === "zip" ? "zip" : "pdf-split",
        esCertificado: isCertificadoMode,
        esConsentimiento: !!f.esConsentimiento,
        createdAt: now,
      });

      if (match) {
        const idx = updatedAsegurados.findIndex((a) => a.id === match.id);
        updatedAsegurados[idx] = {
          ...updatedAsegurados[idx],
          certificado:
            updatedAsegurados[idx].certificado || isCertificadoMode,
          consentimiento:
            updatedAsegurados[idx].consentimiento || !!f.esConsentimiento,
        };
      }
    }
    if (docs.length) addAseguradoDocs(docs);
    onChange(updatedAsegurados);
    setUploadMode(null);
  };

  return (
    <Section
      title="Asegurados bajo esta póliza"
      extra={
        <div className="flex gap-2">
          {!readOnly && (
            <>
              <button
                onClick={() => setUploadMode("zip")}
                className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
              >
                <FileUp className="h-3.5 w-3.5" /> Archivos del asegurado
              </button>
              <button
                onClick={() => setUploadMode("pdf-split")}
                className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600"
              >
                <Upload className="h-3.5 w-3.5" /> Cargar certificados
              </button>
            </>
          )}
          <button
            onClick={() => setConsentDialog("choose")}
            className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
          >
            <Download className="h-3.5 w-3.5" /> Descargar consentimiento
          </button>
        </div>
      }
    >
      <div className="mb-4 flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por RFC o nombre del trabajador"
            className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[color:var(--brand-blue)]"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              {consentDialog === "individual" && (
                <th className="py-3 font-medium w-8">
                  <input
                    type="checkbox"
                    checked={
                      poliza.asegurados.length > 0 &&
                      poliza.asegurados.every((a) => selected[a.id])
                    }
                    onChange={(e) => {
                      const all: Record<string, boolean> = {};
                      if (e.target.checked)
                        poliza.asegurados.forEach((a) => (all[a.id] = true));
                      setSelected(all);
                    }}
                  />
                </th>
              )}
              <th className="py-3 font-medium">RFC</th>
              <th className="py-3 font-medium">Nombre</th>
              <th className="py-3 font-medium">Póliza</th>
              <th className="py-3 font-medium">Vigencia</th>
              <th className="py-3 font-medium">Fecha de renovación</th>
              <th className="py-3 font-medium">Correo</th>
              <th className="py-3 font-medium">Teléfono</th>
              <th className="py-3 font-medium">Consentimiento</th>
              <th className="py-3 font-medium">Certificado</th>
              {!readOnly && <th className="py-3 font-medium" />}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-sm text-muted-foreground">
                  {poliza.asegurados.length === 0
                    ? "Aún no hay asegurados. Carga el archivo o agrega una persona."
                    : "Sin resultados para tu búsqueda."}
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-border/60">
                {consentDialog === "individual" && (
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={!!selected[a.id]}
                      onChange={(e) =>
                        setSelected({ ...selected, [a.id]: e.target.checked })
                      }
                    />
                  </td>
                )}
                <td className="py-3 text-foreground/80">
                  {empresaId ? (
                    <Link
                      to="/empresa/$empresaId/empleado/$empleadoId"
                      params={{ empresaId, empleadoId: a.id }}
                      className="text-[color:var(--brand-blue)] hover:underline"
                    >
                      {a.trabajadorId}
                    </Link>
                  ) : (
                    a.trabajadorId
                  )}
                </td>
                <td className="py-3">
                  {readOnly ? (
                    empresaId && a.nombre ? (
                      <Link
                        to="/empresa/$empresaId/empleado/$empleadoId"
                        params={{ empresaId, empleadoId: a.id }}
                        className="text-[color:var(--brand-blue)] hover:underline"
                      >
                        {a.nombre}
                      </Link>
                    ) : (
                      a.nombre || "—"
                    )
                  ) : (
                    <input
                      value={a.nombre}
                      onChange={(e) =>
                        onChange(
                          poliza.asegurados.map((x) =>
                            x.id === a.id ? { ...x, nombre: e.target.value } : x,
                          ),
                        )
                      }
                      className="w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none focus:bg-muted/40"
                      placeholder="Nombre"
                    />
                  )}
                </td>
                <td className="py-3 text-foreground/80">{a.poliza}</td>
                <td className="py-3 text-foreground/80">{a.vigencia}</td>
                <td className="py-3 text-foreground/80">{a.renovacion}</td>
                <td className="py-3">
                  {readOnly ? (
                    a.correo || "—"
                  ) : (
                    <input
                      value={a.correo}
                      onChange={(e) =>
                        onChange(
                          poliza.asegurados.map((x) =>
                            x.id === a.id ? { ...x, correo: e.target.value } : x,
                          ),
                        )
                      }
                      className="w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none focus:bg-muted/40"
                      placeholder="correo@dominio.com"
                    />
                  )}
                </td>
                <td className="py-3">
                  {readOnly ? (
                    a.telefono || "—"
                  ) : (
                    <input
                      value={a.telefono}
                      onChange={(e) =>
                        onChange(
                          poliza.asegurados.map((x) =>
                            x.id === a.id ? { ...x, telefono: e.target.value } : x,
                          ),
                        )
                      }
                      className="w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none focus:bg-muted/40"
                      placeholder="+000 000 000"
                    />
                  )}
                </td>
                <td className="py-3">
                  <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    {a.consentimiento ? "Descargar" : "-"}
                  </button>
                </td>
                <td className="py-3">
                  <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    {a.certificado ? "Descargar" : "-"}
                  </button>
                </td>
                {!readOnly && (
                  <td className="py-3">
                    <button
                      onClick={() =>
                        onChange(poliza.asegurados.filter((x) => x.id !== a.id))
                      }
                      className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {consentDialog === "individual" && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => {
              setConsentDialog(null);
              setSelected({});
            }}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              const ids = Object.keys(selected).filter((k) => selected[k]);
              if (!ids.length) {
                alert("Selecciona al menos un asegurado.");
                return;
              }
              setConsentDialog(null);
              setSelected({});
              alert(`Descargando consentimientos de ${ids.length} asegurado(s).`);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
          >
            <Download className="h-4 w-4" /> Descargar seleccionados
          </button>
        </div>
      )}
      <AseguradoUploadDialog
        open={uploadMode !== null}
        mode={uploadMode ?? "zip"}
        polizaId={poliza.id}
        onClose={() => setUploadMode(null)}
        onConfirm={handleParsed}
      />
      {consentDialog === "choose" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Descargar consentimiento</h3>
              <button
                onClick={() => setConsentDialog(null)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">
              ¿Cómo quieres descargar los consentimientos?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setConsentDialog(null);
                  alert(
                    `Descargando consentimientos de los ${poliza.asegurados.length} asegurados.`,
                  );
                }}
                className="rounded-xl border border-border p-4 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
              >
                <div className="font-medium">Descarga masiva</div>
                <div className="text-xs text-muted-foreground">
                  Descarga los consentimientos de todos los asegurados en un solo archivo.
                </div>
              </button>
              <button
                onClick={() => setConsentDialog("individual")}
                className="rounded-xl border border-border p-4 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
              >
                <div className="font-medium">Uno por uno</div>
                <div className="text-xs text-muted-foreground">
                  Selecciona los perfiles específicos desde la tabla de asegurados.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

export function ComprobantesSection({
  poliza,
  onChange,
  readOnly,
}: {
  poliza: Poliza;
  onChange: (c: Poliza["comprobantes"]) => void;
  readOnly?: boolean;
}) {
  const addRow = () =>
    onChange([
      ...poliza.comprobantes,
      {
        id: crypto.randomUUID(),
        poliza: `GMM - ${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        tipoPago: "Cliente",
        fechaPago: "00/00/0000",
        recibo: false,
        fechaCarga: "00/00/0000",
        comprobante: false,
        estatus: "Sin archivo",
      },
    ]);

  return (
    <Section
      title="Comprobantes de pago"
      subtitle="Verifica los comprobantes de pago o sube el archivo."
      extra={
        !readOnly && (
          <button
            onClick={addRow}
            className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            <Plus className="h-4 w-4" /> Cargar recibos
          </button>
        )
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-3 font-medium">Póliza</th>
              <th className="py-3 font-medium">Tipo de pago</th>
              <th className="py-3 font-medium">Fecha de pago</th>
              <th className="py-3 font-medium">Recibo</th>
              <th className="py-3 font-medium">Fecha de carga</th>
              <th className="py-3 font-medium">Comprobante</th>
              <th className="py-3 font-medium">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {poliza.comprobantes.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                  Sin comprobantes registrados.
                </td>
              </tr>
            )}
            {poliza.comprobantes.map((c) => (
              <tr key={c.id} className="border-t border-border/60">
                <td className="py-3 text-foreground/80">{c.poliza}</td>
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
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      c.estatus === "Cargado"
                        ? "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                        : "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]"
                    }`}
                  >
                    {c.estatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}