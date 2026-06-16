import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Plus, Trash2, FileText, Upload, Pencil, ImageIcon, ChevronDown, ChevronUp, FileSpreadsheet } from "lucide-react";
import { useAseguradoras, type Aseguradora, type PolizaTipo, type TipoSeguro, type VariantePoliza } from "@/lib/store";
import { PolizaBuilder, TIPOS_SEGURO, tipoLabel } from "@/components/aseguradora/poliza-builder";

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
  const [polizasMode, setPolizasMode] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  const addPolizaToDraft = (tipo: TipoSeguro, variante: VariantePoliza) => {
    setDraft((p) => {
      const polizas = [...(p.polizas ?? [])];
      const i = polizas.findIndex((x) => x.tipo === tipo);
      if (i >= 0) {
        polizas[i] = { ...polizas[i], variantes: [...polizas[i].variantes, variante] };
      } else {
        polizas.push({ id: crypto.randomUUID(), tipo, variantes: [variante] });
      }
      return { ...p, polizas };
    });
    setPolizasMode(false);
  };

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
        {!polizasMode ? (
        <>
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

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setPolizasMode(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/10"
          >
            <Plus className="h-4 w-4" /> Agregar póliza
          </button>
          {(draft.polizas?.length ?? 0) > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {draft.polizas!.map((p) => (
                <li key={p.id}>
                  • {tipoLabel(p.tipo)} — {p.variantes.length} póliza(s)
                </li>
              ))}
            </ul>
          )}
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
        </>
        ) : (
          <PolizaBuilder
            onCancel={() => setPolizasMode(false)}
            onSave={addPolizaToDraft}
          />
        )}
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
              <th className="px-6 py-4 font-medium">Pólizas</th>
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
              <RowGroup key={a.id}>
              <tr className="border-b border-border/60 last:border-0">
                <td className="px-6 py-4 font-medium text-foreground">
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => ({ ...e, [a.id]: !e[a.id] }))}
                    className="inline-flex items-center gap-3 text-left hover:underline"
                  >
                    {expanded[a.id] ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    {a.imageDataUrl ? (
                      <img src={a.imageDataUrl} alt={a.name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                      </span>
                    )}
                    {a.name}
                  </button>
                </td>
                <td className="px-6 py-4 text-foreground/80">{a.abreviacion || "—"}</td>
                <td className="px-6 py-4 text-foreground/80">{a.ejecutivo || "—"}</td>
                <td className="px-6 py-4 text-foreground/80">
                  {a.polizas && a.polizas.length > 0
                    ? a.polizas.map((p) => `${tipoLabel(p.tipo)} (${p.variantes.length})`).join(", ")
                    : "—"}
                </td>
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
              {expanded[a.id] && (
                <tr className="border-b border-border/60 bg-muted/20">
                  <td colSpan={5} className="px-6 py-4">
                    <PolizasResumen
                      polizas={a.polizas ?? []}
                      onEdit={() =>
                        router.navigate({
                          to: "/aseguradora/$aseguradoraId",
                          params: { aseguradoraId: a.id },
                        })
                      }
                      onEditVariante={(vid) =>
                        router.navigate({
                          to: "/aseguradora/$aseguradoraId",
                          params: { aseguradoraId: a.id },
                          search: { polizaId: vid },
                        })
                      }
                      onRemove={(tipo, vid) => {
                        if (!confirm("¿Eliminar esta póliza?")) return;
                        setList(
                          list.map((x) =>
                            x.id !== a.id
                              ? x
                              : {
                                  ...x,
                                  polizas: (x.polizas ?? [])
                                    .map((pp) =>
                                      pp.tipo === tipo
                                        ? {
                                            ...pp,
                                            variantes: pp.variantes.filter(
                                              (v) => v.id !== vid,
                                            ),
                                          }
                                        : pp,
                                    )
                                    .filter((pp) => pp.variantes.length > 0),
                                },
                          ),
                        );
                      }}
                    />
                  </td>
                </tr>
              )}
              </RowGroup>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



function RowGroup({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function PolizasResumen({
  polizas,
  onEdit,
  onRemove,
}: {
  polizas: PolizaTipo[];
  onEdit: () => void;
  onRemove: (tipo: TipoSeguro, vid: string) => void;
}) {
  if (polizas.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin pólizas registradas.</p>;
  }
  return (
    <div className="space-y-4">
      {TIPOS_SEGURO.map((tipo) => {
        const grupo = polizas.find((p) => p.tipo === tipo);
        const variantes = grupo?.variantes ?? [];
        return (
          <div key={tipo} className="overflow-hidden rounded-2xl border border-border bg-white">
            <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-foreground">
              {tipoLabel(tipo)} {variantes.length > 0 && <span className="text-muted-foreground">({variantes.length})</span>}
            </div>
            {variantes.length === 0 ? (
              <div className="px-4 py-3 text-xs text-muted-foreground">Sin variantes registradas.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Nombre</th>
                    <th className="px-4 py-2 font-medium">PDF</th>
                    <th className="px-4 py-2 font-medium">Word</th>
                    <th className="px-4 py-2 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {variantes.map((v, idx) => (
                    <tr key={v.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-2 text-foreground">
                        <button
                          type="button"
                          onClick={onEdit}
                          className="text-left font-medium text-[color:var(--brand-blue)] hover:underline"
                        >
                          {v.nombre || `Variante ${idx + 1}`}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-foreground/80">
                        {v.pdfName ? (
                          <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />{v.pdfName}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2 text-foreground/80">
                        {v.wordName ? (
                          <span className="inline-flex items-center gap-1.5"><FileSpreadsheet className="h-3.5 w-3.5" />{v.wordName}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={onEdit}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                            aria-label="Editar póliza"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(tipo, v.id)}
                            className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"
                            aria-label="Eliminar póliza"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
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