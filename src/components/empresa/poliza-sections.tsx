import { useMemo, useState } from "react";
import { Plus, Trash2, Download, Search, Upload, FileUp, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Section } from "@/components/cotizador/shared";
import type { Poliza, DocumentoInformativo } from "@/lib/empresa-store";
import {
  AseguradoUploadDialog,
  type ParsedAseguradoFile,
  type UploadMode,
} from "@/components/asegurado/upload-dialog";
import { addAseguradoDocs, type AseguradoDoc } from "@/lib/asegurado-docs-store";

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
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return poliza.asegurados;
    return poliza.asegurados.filter(
      (a) =>
        a.trabajadorId.toLowerCase().includes(q) ||
        a.nombre.toLowerCase().includes(q),
    );
  }, [poliza.asegurados, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const showPagination = filtered.length > pageSize;

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
            {pageRows.map((a) => (
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
      {showPagination && (
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Mostrando {(safePage - 1) * pageSize + 1}-
            {Math.min(safePage * pageSize, filtered.length)} de {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </button>
            <span className="text-foreground">
              Página {safePage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
            >
              Siguiente <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
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

export function DocumentosInformativosSection({
  poliza,
  onChange,
  readOnly,
}: {
  poliza: Poliza;
  onChange: (d: DocumentoInformativo[]) => void;
  readOnly?: boolean;
}) {
  const docs = poliza.documentosInformativos ?? [];
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fileName, setFileName] = useState("");

  const reset = () => {
    setNombre("");
    setDescripcion("");
    setFileName("");
    setEditingId(null);
  };

  const open = (d?: DocumentoInformativo) => {
    if (d) {
      setEditingId(d.id);
      setNombre(d.nombre);
      setDescripcion(d.descripcion);
      setFileName(d.fileName);
    } else {
      reset();
    }
    setUploadOpen(true);
  };

  const submit = () => {
    if (!nombre.trim() || !fileName) {
      alert("Captura el nombre y selecciona el archivo.");
      return;
    }
    if (editingId) {
      onChange(
        docs.map((x) =>
          x.id === editingId
            ? { ...x, nombre: nombre.trim(), descripcion: descripcion.trim(), fileName }
            : x,
        ),
      );
    } else {
      onChange([
        ...docs,
        {
          id: crypto.randomUUID(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          fileName,
          uploadedAt: Date.now(),
        },
      ]);
    }
    setUploadOpen(false);
    reset();
  };

  const descargar = (d: DocumentoInformativo) => {
    const contenido = `Documento informativo: ${d.nombre}\n\n${d.descripcion}\n\nArchivo: ${d.fileName}`;
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = d.fileName || `${d.nombre.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Section
      title="Documentos informativos"
      subtitle="Estos documentos aparecerán en la sección de documentos informativos de empresa y cliente."
      extra={
        !readOnly && (
          <button
            onClick={() => open()}
            className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            <Plus className="h-4 w-4" /> Subir documento
          </button>
        )
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-3 font-medium">Nombre</th>
              <th className="py-3 font-medium">Descripción</th>
              <th className="py-3 font-medium">Archivo</th>
              <th className="py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                  Sin documentos informativos.
                </td>
              </tr>
            )}
            {docs.map((d) => (
              <tr key={d.id} className="border-t border-border/60">
                <td className="py-3 text-foreground">{d.nombre}</td>
                <td className="py-3 text-muted-foreground">{d.descripcion || "—"}</td>
                <td className="py-3 text-foreground/80">{d.fileName}</td>
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => descargar(d)}
                      className="rounded-full p-1.5 text-foreground hover:bg-muted"
                      title="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {!readOnly && (
                      <>
                        <button
                          onClick={() => open(d)}
                          className="rounded-full p-1.5 text-foreground hover:bg-muted"
                          title="Reemplazar"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onChange(docs.filter((x) => x.id !== d.id))}
                          className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"
                          title="Borrar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {uploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setUploadOpen(false);
            reset();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingId ? "Reemplazar documento" : "Subir documento informativo"}
              </h3>
              <button
                onClick={() => {
                  setUploadOpen(false);
                  reset();
                }}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-foreground">Nombre</span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del documento"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-foreground">Descripción breve</span>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Breve descripción"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-foreground">Archivo</span>
                <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-xs text-muted-foreground hover:bg-muted/60">
                  <Upload className="h-4 w-4" />
                  {fileName || "Selecciona un archivo (PDF, DOCX, imagen)"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFileName(f.name);
                    }}
                  />
                </label>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setUploadOpen(false);
                  reset();
                }}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
              >
                {editingId ? "Guardar" : "Subir"}
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fechaPago, setFechaPago] = useState("");
  const [tipoPago, setTipoPago] = useState<"Cliente" | "Asesor">("Cliente");
  const [fileName, setFileName] = useState<string>("");

  const reset = () => {
    setFechaPago("");
    setTipoPago("Cliente");
    setFileName("");
  };

  const submit = () => {
    if (!fechaPago || !fileName) {
      alert("Captura la fecha de pago y selecciona el archivo del recibo.");
      return;
    }
    const today = new Date();
    const fechaCarga = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;
    onChange([
      ...poliza.comprobantes,
      {
        id: crypto.randomUUID(),
        poliza: poliza.tipo
          ? `${poliza.tipo} - ${Math.random().toString(36).slice(2, 8).toUpperCase()}`
          : `Recibo - ${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        tipoPago,
        fechaPago,
        recibo: true,
        fechaCarga,
        comprobante: true,
        estatus: "Cargado",
      },
    ]);
    setUploadOpen(false);
    reset();
  };

  return (
    <Section
      title="Comprobantes de pago"
      subtitle="Verifica los comprobantes de pago o sube el archivo."
      extra={
        !readOnly && (
          <button
            onClick={() => setUploadOpen(true)}
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
              {!readOnly && <th className="py-3 font-medium" />}
            </tr>
          </thead>
          <tbody>
            {poliza.comprobantes.length === 0 && (
              <tr>
                <td colSpan={readOnly ? 7 : 8} className="py-6 text-center text-sm text-muted-foreground">
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
                {!readOnly && (
                  <td className="py-3">
                    <button
                      onClick={() =>
                        onChange(poliza.comprobantes.filter((x) => x.id !== c.id))
                      }
                      className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"
                      title="Eliminar recibo"
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
      {uploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setUploadOpen(false);
            reset();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Cargar recibo</h3>
              <button
                onClick={() => {
                  setUploadOpen(false);
                  reset();
                }}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-foreground">
                  Fecha de pago
                </span>
                <input
                  type="date"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-foreground">
                  Tipo de pago
                </span>
                <select
                  value={tipoPago}
                  onChange={(e) => setTipoPago(e.target.value as "Cliente" | "Asesor")}
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
                >
                  <option value="Cliente">Cliente</option>
                  <option value="Asesor">Asesor</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-foreground">
                  Archivo del recibo
                </span>
                <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-xs text-muted-foreground hover:bg-muted/60">
                  <Upload className="h-4 w-4" />
                  {fileName || "Selecciona un archivo (PDF, imagen)"}
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFileName(f.name);
                    }}
                  />
                </label>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setUploadOpen(false);
                  reset();
                }}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
              >
                Cargar recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}