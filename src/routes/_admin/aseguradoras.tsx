import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, FileText, Upload, Pencil, X, ImageIcon } from "lucide-react";
import { useAseguradoras, type Aseguradora } from "@/lib/store";

export const Route = createFileRoute("/_admin/aseguradoras")({
  component: AseguradorasPage,
  head: () => ({ meta: [{ title: "Aseguradoras" }] }),
});

const SEED: Aseguradora[] = [
  {
    id: "seed-axa",
    name: "AXA Seguros",
    abreviacion: "AXA",
    rfc: "ASE931116231",
    ejecutivo: "María González",
    contactoTel: "55 1234 5678",
    contactoEmail: "maria.gonzalez@axa.com.mx",
    webUrl: "https://axa.mx",
    pagoUrl: "https://axa.mx/pagos",
    appUrl: "https://apps.apple.com/mx/app/axa-mexico",
    usuario: "agente_axa01",
    contrasena: "Demo$2025",
  },
  {
    id: "seed-gnp",
    name: "GNP Seguros",
    abreviacion: "GNP",
    rfc: "GNP9211244P0",
    ejecutivo: "Carlos Ramírez",
    contactoTel: "55 8765 4321",
    contactoEmail: "carlos.ramirez@gnp.com.mx",
    webUrl: "https://gnp.com.mx",
    pagoUrl: "https://gnp.com.mx/pagos",
    appUrl: "https://play.google.com/store/apps/details?id=mx.gnp",
    usuario: "agente_gnp22",
    contrasena: "Gnp#Demo99",
  },
];

function AseguradorasPage() {
  const [list, setList] = useAseguradoras();
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const empty: Aseguradora = { id: "", name: "" };
  const [draft, setDraft] = useState<Aseguradora>(empty);
  const [pendingFile, setPendingFile] = useState<string>("");
  const [editing, setEditing] = useState<Aseguradora | null>(null);

  useEffect(() => {
    if (list.length === 0) setList(SEED);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = <K extends keyof Aseguradora>(k: K, v: Aseguradora[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));

  const onImageFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField("imageDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const add = () => {
    if (!draft.name.trim()) return;
    const item: Aseguradora = {
      ...draft,
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      pdfName: pendingFile || undefined,
    };
    setList([...list, item]);
    setDraft(empty);
    setPendingFile("");
    if (fileRef.current) fileRef.current.value = "";
    if (imgRef.current) imgRef.current.value = "";
  };

  const remove = (id: string) => setList(list.filter((a) => a.id !== id));
  const save = (a: Aseguradora) => {
    setList(list.map((x) => (x.id === a.id ? a : x)));
    setEditing(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Aseguradoras
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Registra las aseguradoras disponibles y su PDF base para cotizaciones.
      </p>

      <div className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            {draft.imageDataUrl ? (
              <img src={draft.imageDataUrl} alt="" className="h-24 w-24 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <ImageIcon className="h-7 w-7" />
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40">
              <Upload className="h-3.5 w-3.5" /> Imagen
              <input
                ref={imgRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onImageFile(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nombre de aseguradora" value={draft.name} onChange={(v) => setField("name", v)} placeholder="Ej. AXA" />
            <Field label="Abreviación" value={draft.abreviacion ?? ""} onChange={(v) => setField("abreviacion", v)} />
            <Field label="RFC" value={draft.rfc ?? ""} onChange={(v) => setField("rfc", v)} />
            <Field label="Ejecutivo" value={draft.ejecutivo ?? ""} onChange={(v) => setField("ejecutivo", v)} />
            <Field label="Número de contacto" value={draft.contactoTel ?? ""} onChange={(v) => setField("contactoTel", v)} />
            <Field label="Correo de contacto" value={draft.contactoEmail ?? ""} onChange={(v) => setField("contactoEmail", v)} />
            <Field label="Link a página web" value={draft.webUrl ?? ""} onChange={(v) => setField("webUrl", v)} />
            <Field label="Link para pago" value={draft.pagoUrl ?? ""} onChange={(v) => setField("pagoUrl", v)} />
            <Field label="Link para descargar aplicación" value={draft.appUrl ?? ""} onChange={(v) => setField("appUrl", v)} />

            <div>
              <label className="text-xs font-medium text-foreground">PDF base (opcional)</label>
              <label className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40">
                <Upload className="h-4 w-4" />
                <span className="truncate">{pendingFile || "Subir archivo PDF"}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setPendingFile(e.target.files?.[0]?.name ?? "")}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">Datos personales</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Usuario" value={draft.usuario ?? ""} onChange={(v) => setField("usuario", v)} />
            <Field label="Contraseña" value={draft.contrasena ?? ""} onChange={(v) => setField("contrasena", v)} type="password" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={add}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-5 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
          >
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Aseguradora</th>
              <th className="px-6 py-4 font-medium">Abreviación</th>
              <th className="px-6 py-4 font-medium">Ejecutivo</th>
              <th className="px-6 py-4 font-medium">Contacto</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  Aún no hay aseguradoras registradas.
                </td>
              </tr>
            )}
            {list.map((a) => (
              <tr key={a.id} className="border-b border-border/60 last:border-0">
                <td className="px-6 py-4 font-medium text-foreground">
                  <span className="inline-flex items-center gap-3">
                    {a.imageDataUrl ? (
                      <img src={a.imageDataUrl} alt={a.name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                      </span>
                    )}
                    {a.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground/80">{a.abreviacion || "—"}</td>
                <td className="px-6 py-4 text-foreground/80">{a.ejecutivo || "—"}</td>
                <td className="px-6 py-4 text-foreground/80">
                  {a.contactoEmail || a.contactoTel || (a.pdfName ? (
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[color:var(--brand-blue)]" />
                      {a.pdfName}
                    </span>
                  ) : "—")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => setEditing(a)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => remove(a.id)}
                      className="rounded-full p-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <EditDialog
          item={editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function EditDialog({
  item,
  onClose,
  onSave,
}: {
  item: Aseguradora;
  onClose: () => void;
  onSave: (a: Aseguradora) => void;
}) {
  const [form, setForm] = useState<Aseguradora>(item);
  const set = <K extends keyof Aseguradora>(k: K, v: Aseguradora[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const onImage = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("imageDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Editar aseguradora</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-4">
          {form.imageDataUrl ? (
            <img src={form.imageDataUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted/40">
            <Upload className="h-4 w-4" /> Subir imagen
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImage(e.target.files?.[0])}
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Abreviación" value={form.abreviacion ?? ""} onChange={(v) => set("abreviacion", v)} />
          <Field label="RFC" value={form.rfc ?? ""} onChange={(v) => set("rfc", v)} />
          <Field label="Ejecutivo" value={form.ejecutivo ?? ""} onChange={(v) => set("ejecutivo", v)} />
          <Field label="Número de contacto" value={form.contactoTel ?? ""} onChange={(v) => set("contactoTel", v)} />
          <Field label="Correo de contacto" value={form.contactoEmail ?? ""} onChange={(v) => set("contactoEmail", v)} />
          <Field label="Link a página web" value={form.webUrl ?? ""} onChange={(v) => set("webUrl", v)} />
          <Field label="Link para pago" value={form.pagoUrl ?? ""} onChange={(v) => set("pagoUrl", v)} />
          <Field label="Link para descargar aplicación" value={form.appUrl ?? ""} onChange={(v) => set("appUrl", v)} className="sm:col-span-2" />
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-lg font-semibold text-foreground">Datos personales</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Usuario" value={form.usuario ?? ""} onChange={(v) => set("usuario", v)} />
            <Field label="Contraseña" value={form.contrasena ?? ""} onChange={(v) => set("contrasena", v)} type="password" />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-full bg-[color:var(--brand-blue)] px-5 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
      />
    </div>
  );
}