import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ImageIcon, Upload, Plus, Trash2, Pencil } from "lucide-react";
import { z } from "zod";
import {
  useAseguradoras,
  type Aseguradora,
  type PolizaTipo,
  type TipoSeguro,
  type VariantePoliza,
  type DocumentoPoliza,
} from "@/lib/store";
import {
  PolizaBuilder,
  DocumentosTabla,
  NivelesHospitalariosEditor,
  TIPOS_SEGURO,
  tipoLabel,
} from "@/components/aseguradora/poliza-builder";

export const Route = createFileRoute("/_admin/aseguradora/$aseguradoraId")({
  component: EditAseguradoraPage,
  head: () => ({ meta: [{ title: "Editar aseguradora" }] }),
  validateSearch: z.object({ polizaId: z.string().optional() }),
});

function EditAseguradoraPage() {
  const router = useRouter();
  const { aseguradoraId } = Route.useParams();
  const { polizaId: focusPolizaId } = Route.useSearch();
  const [list, setList] = useAseguradoras();
  const original = useMemo(
    () => list.find((a) => a.id === aseguradoraId) ?? null,
    [list, aseguradoraId],
  );

  const [form, setForm] = useState<Aseguradora | null>(original);
  const [adding, setAdding] = useState(false);

  if (!original || !form) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Aseguradora no encontrada.
      </div>
    );
  }

  const set = <K extends keyof Aseguradora>(k: K, v: Aseguradora[K]) =>
    setForm((p) => (p ? { ...p, [k]: v } : p));

  const onImage = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("imageDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const addPoliza = (tipo: TipoSeguro, variante: VariantePoliza) => {
    setForm((p) => {
      if (!p) return p;
      const polizas = [...(p.polizas ?? [])];
      const i = polizas.findIndex((x) => x.tipo === tipo);
      if (i >= 0) {
        polizas[i] = { ...polizas[i], variantes: [...polizas[i].variantes, variante] };
      } else {
        polizas.push({ id: crypto.randomUUID(), tipo, variantes: [variante] });
      }
      return { ...p, polizas };
    });
    setAdding(false);
  };

  const updateVariante = (tipo: TipoSeguro, vid: string, patch: Partial<VariantePoliza>) => {
    setForm((p) => {
      if (!p) return p;
      return {
        ...p,
        polizas: (p.polizas ?? []).map((pp) =>
          pp.tipo === tipo
            ? { ...pp, variantes: pp.variantes.map((v) => (v.id === vid ? { ...v, ...patch } : v)) }
            : pp,
        ),
      };
    });
  };

  const removeVariante = (tipo: TipoSeguro, vid: string) => {
    setForm((p) => {
      if (!p) return p;
      return {
        ...p,
        polizas: (p.polizas ?? [])
          .map((pp) =>
            pp.tipo === tipo ? { ...pp, variantes: pp.variantes.filter((v) => v.id !== vid) } : pp,
          )
          .filter((pp) => pp.variantes.length > 0),
      };
    });
  };

  const onSave = () => {
    setList(list.map((x) => (x.id === form.id ? form : x)));
    router.history.back();
  };

  const focusedPoliza = focusPolizaId
    ? (form.polizas ?? [])
        .flatMap((p) => p.variantes.map((v) => ({ tipo: p.tipo, variante: v })))
        .find((p) => p.variante.id === focusPolizaId)
    : null;

  if (focusPolizaId) {
    return (
      <div className="pb-12">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.history.back()}
            className="mt-2 rounded-full p-2 hover:bg-muted"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar póliza</h1>
            <p className="text-sm text-muted-foreground">
              Actualiza únicamente los datos de la póliza seleccionada.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-sm">
          {focusedPoliza ? (
            <VarianteEditor
              tipo={focusedPoliza.tipo}
              variante={focusedPoliza.variante}
              onChange={(patch) =>
                updateVariante(focusedPoliza.tipo, focusedPoliza.variante.id, patch)
              }
              onDelete={() => removeVariante(focusedPoliza.tipo, focusedPoliza.variante.id)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Póliza no encontrada.</p>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => router.history.back()}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="rounded-full bg-[color:var(--brand-blue)] px-5 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.history.back()}
          className="mt-2 rounded-full p-2 hover:bg-muted"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar aseguradora</h1>
          <p className="text-sm text-muted-foreground">
            Actualiza los datos, datos personales y pólizas registradas.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nombre" value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Abreviación" value={form.abreviacion ?? ""} onChange={(v) => set("abreviacion", v)} />
          <Field label="RFC" value={form.rfc ?? ""} onChange={(v) => set("rfc", v)} />
          <Field label="Ejecutivo" value={form.ejecutivo ?? ""} onChange={(v) => set("ejecutivo", v)} />
          <Field label="Número de contacto" value={form.contactoTel ?? ""} onChange={(v) => set("contactoTel", v)} />
          <Field label="Correo de contacto" value={form.contactoEmail ?? ""} onChange={(v) => set("contactoEmail", v)} />
          <Field label="Link a página web" value={form.webUrl ?? ""} onChange={(v) => set("webUrl", v)} />
          <Field label="Link para pago" value={form.pagoUrl ?? ""} onChange={(v) => set("pagoUrl", v)} />
          <Field label="Link para descargar aplicación" value={form.appUrl ?? ""} onChange={(v) => set("appUrl", v)} />
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-base font-semibold text-foreground">Datos personales</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Usuario" value={form.usuario ?? ""} onChange={(v) => set("usuario", v)} />
            <Field label="Contraseña" value={form.contrasena ?? ""} onChange={(v) => set("contrasena", v)} type="password" />
            <Field label="Clave agente en la aseguradora" value={form.claveAgente ?? ""} onChange={(v) => set("claveAgente", v)} />
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Pólizas</h3>
            {!adding && (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/10"
              >
                <Plus className="h-4 w-4" /> Agregar póliza
              </button>
            )}
          </div>

          {adding && (
            <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4">
              <PolizaBuilder onCancel={() => setAdding(false)} onSave={addPoliza} />
            </div>
          )}

          <div className="mt-4 space-y-4">
            {TIPOS_SEGURO.map((tipo) => {
              const grupo = (form.polizas ?? []).find((p) => p.tipo === tipo);
              const variantes = grupo?.variantes ?? [];
              if (variantes.length === 0) return null;
              return (
                <div key={tipo} className="overflow-hidden rounded-2xl border border-border">
                  <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-foreground">
                    {tipoLabel(tipo)} <span className="text-muted-foreground">({variantes.length})</span>
                  </div>
                  <div className="divide-y divide-border">
                    {variantes.map((v) => (
                      <VarianteEditor
                        key={v.id}
                        tipo={tipo}
                        variante={v}
                        highlight={focusPolizaId === v.id}
                        onChange={(patch) => updateVariante(tipo, v.id, patch)}
                        onDelete={() => removeVariante(tipo, v.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {(form.polizas ?? []).every((p) => p.variantes.length === 0) && !adding && (
              <p className="text-sm text-muted-foreground">Sin pólizas registradas.</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => router.history.back()}
            className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="rounded-full bg-[color:var(--brand-blue)] px-5 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

function VarianteEditor({
  tipo,
  variante,
  highlight,
  onChange,
  onDelete,
}: {
  tipo: TipoSeguro;
  variante: VariantePoliza;
  highlight?: boolean;
  onChange: (patch: Partial<VariantePoliza>) => void;
  onDelete: () => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (highlight && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [highlight]);
  const docs = variante.documentos ?? [];

  const updateDoc = (id: string, patch: Partial<DocumentoPoliza>) =>
    onChange({ documentos: docs.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  const removeDoc = (id: string) =>
    onChange({ documentos: docs.filter((d) => d.id !== id) });
  const addDoc = () =>
    onChange({
      documentos: [
        ...docs,
        { id: crypto.randomUUID(), nombre: "", audiencia: "Interno" },
      ],
    });

  return (
    <div
      ref={ref}
      className={
        "p-4 transition-colors " +
        (highlight ? "bg-[color:var(--brand-blue)]/5 ring-2 ring-[color:var(--brand-blue)]/40" : "")
      }
    >
      <div className="flex items-center justify-between gap-3">
        {editingName ? (
          <input
            autoFocus
            value={variante.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
            onBlur={() => setEditingName(false)}
            className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-[color:var(--brand-blue)]"
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {variante.nombre || "Sin nombre"}
            </span>
            <button
              onClick={() => setEditingName(true)}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Editar nombre"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar póliza
        </button>
      </div>
      <div className="mt-3">
        {tipo === "Gastos médicos mayores" && (
          <NivelesHospitalariosEditor
            niveles={variante.nivelesHospitalarios ?? []}
            onChange={(nivelesHospitalarios) => onChange({ nivelesHospitalarios })}
          />
        )}
        <DocumentosTabla
          docs={docs}
          onUpdate={updateDoc}
          onRemove={removeDoc}
          onAdd={addDoc}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
      />
    </label>
  );
}
