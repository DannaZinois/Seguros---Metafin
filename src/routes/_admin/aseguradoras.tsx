import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Upload, Pencil, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
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
    claveAgente: "AXA-AG-44218",
    polizas: [
      {
        id: "axa-auto",
        tipo: "Auto",
        variantes: [
          { id: "axa-auto-1", nombre: "Amplia Plus", pdfName: "axa-auto-amplia.pdf", wordName: "axa-auto-amplia.docx" },
          { id: "axa-auto-2", nombre: "Limitada", pdfName: "axa-auto-limitada.pdf", wordName: "axa-auto-limitada.docx" },
        ],
      },
      {
        id: "axa-vida",
        tipo: "Vida",
        variantes: [
          { id: "axa-vida-1", nombre: "Vida Temporal", pdfName: "axa-vida-temporal.pdf", wordName: "axa-vida-temporal.docx" },
        ],
      },
      {
        id: "axa-gmm",
        tipo: "Gastos médicos mayores",
        variantes: [
          { id: "axa-gmm-1", nombre: "Versátil", pdfName: "axa-gmm-versatil.pdf", wordName: "axa-gmm-versatil.docx" },
          { id: "axa-gmm-2", nombre: "Flex Plus", pdfName: "axa-gmm-flex.pdf", wordName: "axa-gmm-flex.docx" },
        ],
      },
      {
        id: "axa-exceso",
        tipo: "Exceso",
        variantes: [
          { id: "axa-exceso-1", nombre: "Exceso RC", pdfName: "axa-exceso-rc.pdf", wordName: "axa-exceso-rc.docx" },
        ],
      },
    ],
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
    claveAgente: "GNP-AG-90821",
    polizas: [
      {
        id: "gnp-auto",
        tipo: "Auto",
        variantes: [
          { id: "gnp-auto-1", nombre: "Auto Total", pdfName: "gnp-auto-total.pdf", wordName: "gnp-auto-total.docx" },
        ],
      },
      {
        id: "gnp-vida",
        tipo: "Vida",
        variantes: [
          { id: "gnp-vida-1", nombre: "Vida Plus", pdfName: "gnp-vida-plus.pdf", wordName: "gnp-vida-plus.docx" },
          { id: "gnp-vida-2", nombre: "Vida Inversión", pdfName: "gnp-vida-inv.pdf", wordName: "gnp-vida-inv.docx" },
        ],
      },
      {
        id: "gnp-gmm",
        tipo: "Gastos médicos mayores",
        variantes: [
          { id: "gnp-gmm-1", nombre: "Médica Plus", pdfName: "gnp-gmm-plus.pdf", wordName: "gnp-gmm-plus.docx" },
        ],
      },
      {
        id: "gnp-exceso",
        tipo: "Exceso",
        variantes: [
          { id: "gnp-exceso-1", nombre: "Exceso Auto", pdfName: "gnp-exceso-auto.pdf", wordName: "gnp-exceso-auto.docx" },
          { id: "gnp-exceso-2", nombre: "Exceso RC Empresarial", pdfName: "gnp-exceso-rc.pdf", wordName: "gnp-exceso-rc.docx" },
        ],
      },
    ],
  },
];

function AseguradorasPage() {
  const router = useRouter();
  const [list, setList] = useAseguradoras();
  const imgRef = useRef<HTMLInputElement>(null);
  const empty: Aseguradora = { id: "", name: "" };
  const [draft, setDraft] = useState<Aseguradora>(empty);
  const [open, setOpen] = useState(false);

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
    };
    setList([...list, item]);
    setDraft(empty);
    if (imgRef.current) imgRef.current.value = "";
    setOpen(false);
  };

  const remove = (id: string) => setList(list.filter((a) => a.id !== id));

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Aseguradoras
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Registra las aseguradoras disponibles y su PDF base para cotizaciones.
      </p>

      <div className="mt-6 rounded-3xl border border-border bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <span className="text-base font-semibold text-foreground">
            Nuevo registro de aseguradora
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {open && (
          <div className="border-t border-border p-6">
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
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground">Datos personales</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Usuario" value={draft.usuario ?? ""} onChange={(v) => setField("usuario", v)} />
                <Field label="Contraseña" value={draft.contrasena ?? ""} onChange={(v) => setField("contrasena", v)} type="password" />
                <Field label="Clave agente en la aseguradora" value={draft.claveAgente ?? ""} onChange={(v) => setField("claveAgente", v)} />
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
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Aseguradora</th>
              <th className="px-6 py-4 font-medium">Abreviación</th>
              <th className="px-6 py-4 font-medium">Ejecutivo</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                  Aún no hay aseguradoras registradas.
                </td>
              </tr>
            )}
            {list.map((a) => (
              <tr key={a.id} className="border-b border-border/60 last:border-0">
                <td className="px-6 py-4 font-medium text-foreground">
                  <div className="inline-flex items-center gap-3">
                    {a.imageDataUrl ? (
                      <img src={a.imageDataUrl} alt={a.name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                      </span>
                    )}
                    {a.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-foreground/80">{a.abreviacion || "—"}</td>
                <td className="px-6 py-4 text-foreground/80">{a.ejecutivo || "—"}</td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() =>
                        router.navigate({
                          to: "/aseguradora/$aseguradoraId",
                          params: { aseguradoraId: a.id },
                        })
                      }
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