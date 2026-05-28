import { useState } from "react";
import { Plus, Trash2, Pencil, FileText, FileSpreadsheet, RefreshCw, Check } from "lucide-react";
import type {
  AudienciaDocumento,
  DocumentoPoliza,
  TipoSeguro,
  VariantePoliza,
} from "@/lib/store";

export const TIPOS_SEGURO: TipoSeguro[] = ["Auto", "Vida", "Gastos médicos mayores", "Exceso"];

export function tipoLabel(t: TipoSeguro): string {
  return t === "Gastos médicos mayores" ? "GMM" : t;
}

const AUDIENCIAS: AudienciaDocumento[] = ["Interno", "Cliente"];

/** Tabla editable de documentos de una póliza */
export function DocumentosTabla({
  docs,
  onUpdate,
  onRemove,
  onAdd,
}: {
  docs: DocumentoPoliza[];
  onUpdate: (id: string, patch: Partial<DocumentoPoliza>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Nombre del documento</th>
            <th className="px-3 py-2 font-medium">Descripción</th>
            <th className="px-3 py-2 font-medium">Audiencia</th>
            <th className="px-3 py-2 font-medium">PDF</th>
            <th className="px-3 py-2 font-medium">Word</th>
            <th className="px-3 py-2 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-4 text-center text-xs text-muted-foreground">
                Sin documentos.
              </td>
            </tr>
          )}
          {docs.map((d) => {
            const isEditing = editingId === d.id;
            return (
              <tr key={d.id} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={d.nombre}
                      onChange={(e) => onUpdate(d.id, { nombre: e.target.value })}
                      placeholder="Nombre del documento"
                      className="w-full rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-[color:var(--brand-blue)]"
                    />
                  ) : (
                    <span className="text-foreground">
                      {d.nombre || <span className="text-muted-foreground">Sin nombre</span>}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <input
                    value={d.descripcion ?? ""}
                    onChange={(e) => onUpdate(d.id, { descripcion: e.target.value })}
                    placeholder="Descripción breve"
                    className="w-full rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-[color:var(--brand-blue)]"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={d.audiencia}
                    onChange={(e) =>
                      onUpdate(d.id, { audiencia: e.target.value as AudienciaDocumento })
                    }
                    className="rounded-md border border-border bg-white px-2 py-1 text-xs outline-none focus:border-[color:var(--brand-blue)]"
                  >
                    {AUDIENCIAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <FileSlot
                    icon={<FileText className="h-3.5 w-3.5" />}
                    name={d.pdfName}
                    accept="application/pdf"
                    onFile={(f) => onUpdate(d.id, { pdfName: f?.name })}
                  />
                </td>
                <td className="px-3 py-2">
                  <FileSlot
                    icon={<FileSpreadsheet className="h-3.5 w-3.5" />}
                    name={d.wordName}
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onFile={(f) => onUpdate(d.id, { wordName: f?.name })}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex items-center gap-1">
                    <ReplaceButton
                      onFile={(f) => {
                        if (!f) return;
                        const isPdf = /\.pdf$/i.test(f.name);
                        onUpdate(d.id, isPdf ? { pdfName: f.name } : { wordName: f.name });
                      }}
                    />
                    <button
                      onClick={() => setEditingId(isEditing ? null : d.id)}
                      className="rounded-full p-1.5 text-foreground hover:bg-muted"
                      aria-label={isEditing ? "Confirmar" : "Editar"}
                    >
                      {isEditing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => onRemove(d.id)}
                      className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"
                      aria-label="Borrar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="border-t border-border bg-muted/20 px-3 py-2 text-right">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground hover:bg-muted"
        >
          <Plus className="h-3 w-3" /> Agregar documento
        </button>
      </div>
    </div>
  );
}

function FileSlot({
  icon,
  name,
  accept,
  onFile,
}: {
  icon: React.ReactNode;
  name: string | undefined;
  accept: string;
  onFile: (f: File | undefined) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/40">
      {icon}
      <span className="truncate max-w-[140px]">{name || "Cargar"}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </label>
  );
}

function ReplaceButton({ onFile }: { onFile: (f: File | undefined) => void }) {
  return (
    <label
      className="cursor-pointer rounded-full p-1.5 text-foreground hover:bg-muted"
      aria-label="Reemplazar archivo"
      title="Reemplazar archivo"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      <input
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </label>
  );
}

/** Formulario para crear una nueva póliza (variante) con nombre + documentos */
export function PolizaBuilder({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (tipo: TipoSeguro, variante: VariantePoliza) => void;
}) {
  const [tipo, setTipo] = useState<TipoSeguro>("Auto");
  const [nombre, setNombre] = useState("");
  const [docs, setDocs] = useState<DocumentoPoliza[]>([]);

  const addDoc = () =>
    setDocs((d) => [
      ...d,
      { id: crypto.randomUUID(), nombre: "", audiencia: "Interno" },
    ]);
  const updateDoc = (id: string, patch: Partial<DocumentoPoliza>) =>
    setDocs((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeDoc = (id: string) => setDocs((d) => d.filter((x) => x.id !== id));

  const save = () => {
    if (!nombre.trim()) return;
    onSave(tipo, {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      documentos: docs,
    });
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">Nueva póliza</h4>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-foreground">Tipo de seguro</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoSeguro)}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
          >
            {TIPOS_SEGURO.map((t) => (
              <option key={t} value={t}>
                {tipoLabel(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-foreground">Nombre de la póliza</span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Amplia Plus"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
          />
        </label>
      </div>

      <div className="mt-4">
        <span className="text-xs font-medium text-foreground">Documentos</span>
        <div className="mt-2">
          <DocumentosTabla
            docs={docs}
            onUpdate={updateDoc}
            onRemove={removeDoc}
            onAdd={addDoc}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={!nombre.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-4 py-1.5 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Agregar póliza
        </button>
      </div>
    </div>
  );
}