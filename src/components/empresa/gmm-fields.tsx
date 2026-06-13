import { useState } from "react";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import {
  Section,
  Field,
  TextInput,
  DateInput,
  Select,
} from "@/components/cotizador/shared";
import { Popup, type PopupState } from "@/components/cotizador/shared";
import type {
  Amparado,
  GmmConfig,
  GmmCoberturas,
  GmmPerfil,
  GmmServicio,
} from "@/lib/empresa-store";

const EMPTY_COBERTURAS: GmmCoberturas = {
  sumaAsegurada: "",
  deducible: "",
  coaseguro: "",
  topeCoaseguro: "",
  nivelHospitalario: "",
  coberturaInternacional: "Excluido",
  emergenciaExtranjero: "",
  asistenciaDental: "Excluido",
  asistenciaVision: "Excluido",
  asistenciaIntegral: "Excluido",
};

function emptyConfig(): GmmConfig {
  return { vigenciaIni: "", vigenciaFin: "", tiposEmpleado: [], perfiles: [] };
}

function Radio({
  value,
  onChange,
}: {
  value: Amparado;
  onChange: (v: Amparado) => void;
}) {
  return (
    <div className="flex items-center gap-4 pt-2">
      {(["Amparado", "Excluido"] as const).map((v) => (
        <label key={v} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={value === v}
            onChange={() => onChange(v)}
            className="h-4 w-4 accent-[color:var(--brand-blue)]"
          />
          {v}
        </label>
      ))}
    </div>
  );
}

function RichTextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="font-bold">B</span>
        <span className="italic">I</span>
        <span className="line-through">S</span>
        <span>·</span>
        <span>Tt</span>
        <span>·</span>
        <span>≡</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Placeholder..."}
        className="min-h-[120px] w-full resize-y rounded-b-2xl bg-transparent px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}

export function GmmFieldsSection({
  aseguradora,
  value,
  onChange,
}: {
  aseguradora: string;
  value: GmmConfig | undefined;
  onChange: (cfg: GmmConfig) => void;
}) {
  const cfg: GmmConfig = value ?? emptyConfig();
  const [tipoInput, setTipoInput] = useState("");
  const [editingPerfilId, setEditingPerfilId] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupState>(null);

  // Draft state for the perfil being edited
  const editingPerfil = cfg.perfiles.find((p) => p.id === editingPerfilId) ?? null;
  const [draftCob, setDraftCob] = useState<GmmCoberturas>(EMPTY_COBERTURAS);
  const [draftServ, setDraftServ] = useState<GmmServicio[]>([]);
  const [servNombre, setServNombre] = useState("");
  const [servDescripcion, setServDescripcion] = useState("");
  const [servRestricciones, setServRestricciones] = useState("");

  const update = (patch: Partial<GmmConfig>) => onChange({ ...cfg, ...patch });

  const openEditor = (perfilId: string) => {
    const p = cfg.perfiles.find((x) => x.id === perfilId);
    if (!p) return;
    setEditingPerfilId(perfilId);
    setDraftCob(p.coberturas ?? EMPTY_COBERTURAS);
    setDraftServ(p.servicios ?? []);
    setServNombre("");
    setServDescripcion("");
    setServRestricciones("");
  };

  const closeEditor = () => setEditingPerfilId(null);

  const addTipoEmpleado = () => {
    const v = tipoInput.trim();
    if (!v) return;
    if (cfg.tiposEmpleado.includes(v)) {
      setTipoInput("");
      return;
    }
    const tipos = [...cfg.tiposEmpleado, v];
    const perfiles = [
      ...cfg.perfiles,
      {
        id: crypto.randomUUID(),
        tipoEmpleado: v,
        aseguradora,
        seguro: "GMM",
        vigencia: cfg.vigenciaFin || "00/00/0000",
        status: "Sin configurar" as const,
      },
    ];
    update({ tiposEmpleado: tipos, perfiles });
    setTipoInput("");
  };

  const removeTipo = (t: string) => {
    update({
      tiposEmpleado: cfg.tiposEmpleado.filter((x) => x !== t),
      perfiles: cfg.perfiles.filter((p) => p.tipoEmpleado !== t),
    });
  };

  const confirmDeletePerfil = (perfil: GmmPerfil) => {
    setPopup({
      kind: "confirm",
      title: `Borrar perfil "${perfil.tipoEmpleado}"`,
      message:
        "Esta acción es permanente: se eliminará la configuración de coberturas y servicios para este tipo de empleado.",
      onConfirm: () => {
        update({
          perfiles: cfg.perfiles.filter((p) => p.id !== perfil.id),
          tiposEmpleado: cfg.tiposEmpleado.filter((t) => t !== perfil.tipoEmpleado),
        });
        if (editingPerfilId === perfil.id) closeEditor();
        setPopup(null);
      },
    });
  };

  const addServicio = () => {
    if (!servNombre.trim()) return;
    setDraftServ([
      ...draftServ,
      {
        id: crypto.randomUUID(),
        nombre: servNombre,
        descripcion: servDescripcion,
        restricciones: servRestricciones,
      },
    ]);
    setServNombre("");
    setServDescripcion("");
    setServRestricciones("");
  };

  const finalizarPerfil = () => {
    if (!editingPerfil) return;
    update({
      perfiles: cfg.perfiles.map((p) =>
        p.id === editingPerfil.id
          ? { ...p, coberturas: draftCob, servicios: draftServ, status: "Configurado" }
          : p,
      ),
    });
    setPopup({
      kind: "info",
      title: "Perfil guardado",
      message: `Se guardó la configuración del perfil "${editingPerfil.tipoEmpleado}".`,
    });
    closeEditor();
  };

  return (
    <>
      {/* Vigencia y tipos de empleado dentro de la póliza GMM */}
      <Section title="Datos GMM">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          <Field label="Vigencia">
            <div className="flex items-center gap-2">
              <DateInput
                value={cfg.vigenciaIni}
                onChange={(v) => update({ vigenciaIni: v })}
              />
              <span className="text-muted-foreground">—</span>
              <DateInput
                value={cfg.vigenciaFin}
                onChange={(v) => update({ vigenciaFin: v })}
              />
            </div>
          </Field>
          <Field label="Tipo de empleados">
            <div>
              <div className="relative">
                <input
                  value={tipoInput}
                  onChange={(e) => setTipoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTipoEmpleado();
                    }
                  }}
                  placeholder="Escribe un tipo aquí"
                  className="w-full rounded-full border border-border bg-white px-4 py-2 pr-12 text-sm outline-none focus:border-[color:var(--brand-blue)]"
                />
                <button
                  type="button"
                  onClick={addTipoEmpleado}
                  aria-label="Agregar tipo de empleado"
                  className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-violet-500 text-white hover:bg-violet-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {cfg.tiposEmpleado.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {cfg.tiposEmpleado.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-foreground"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTipo(t)}
                        className="grid h-4 w-4 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600"
                        aria-label={`Quitar ${t}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Field>
        </div>
      </Section>

      {/* Perfiles para esta póliza */}
      <Section
        title="Perfiles para esta póliza"
        subtitle="Aquí podrás ver todos los perfiles configurados para esta póliza"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Tipo de empleado</th>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Seguro</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Estatus</th>
                <th className="py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cfg.perfiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">
                    Agrega un tipo de empleado para crear su perfil.
                  </td>
                </tr>
              )}
              {cfg.perfiles.map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => openEditor(p.id)}
                      className="text-[color:var(--brand-blue)] hover:underline"
                    >
                      {p.tipoEmpleado || "—"}
                    </button>
                  </td>
                  <td className="py-3">{p.aseguradora || aseguradora || "—"}</td>
                  <td className="py-3">{p.seguro}</td>
                  <td className="py-3">{p.vigencia}</td>
                  <td className="py-3">
                    {p.status === "Configurado" ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        Configurado
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        Sin configurar
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditor(p.id)}
                        className="text-amber-500 hover:text-amber-600"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDeletePerfil(p)}
                        className="text-red-500 hover:text-red-600"
                        aria-label="Eliminar"
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
      </Section>

      {editingPerfil && (
        <>
          <Section title={`Coberturas básicas: ${editingPerfil.tipoEmpleado}`}>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Tipo de empleado">
                <TextInput value={editingPerfil.tipoEmpleado} readOnly />
              </Field>
              <Field label="Suma asegurada">
                <TextInput
                  value={draftCob.sumaAsegurada}
                  onChange={(v) => setDraftCob({ ...draftCob, sumaAsegurada: v })}
                  placeholder="$0000.  MXN"
                />
              </Field>
              <Field label="Deducible">
                <TextInput
                  value={draftCob.deducible}
                  onChange={(v) => setDraftCob({ ...draftCob, deducible: v })}
                  placeholder="$0000.  MXN"
                />
              </Field>
              <Field label="Coaseguro">
                <TextInput
                  value={draftCob.coaseguro}
                  onChange={(v) => setDraftCob({ ...draftCob, coaseguro: v })}
                  placeholder="$0000.  MXN"
                />
              </Field>
              <Field label="Tope de coaseguro">
                <TextInput
                  value={draftCob.topeCoaseguro}
                  onChange={(v) => setDraftCob({ ...draftCob, topeCoaseguro: v })}
                  placeholder="$0000.  MXN"
                />
              </Field>

              <Field label="Nivel hospitalario*">
                <Select
                  value={draftCob.nivelHospitalario}
                  onChange={(v) => setDraftCob({ ...draftCob, nivelHospitalario: v })}
                  options={["Normal", "Media", "Alta"]}
                  placeholder="Nombre aquí"
                />
              </Field>
              <Field label="Cobertura internacional">
                <Radio
                  value={draftCob.coberturaInternacional}
                  onChange={(v) => setDraftCob({ ...draftCob, coberturaInternacional: v })}
                />
              </Field>
              <Field label="Emergencia en el extranjero">
                <TextInput
                  value={draftCob.emergenciaExtranjero}
                  onChange={(v) => setDraftCob({ ...draftCob, emergenciaExtranjero: v })}
                  placeholder="$0000.  USD"
                />
              </Field>
              <Field label="Asistencia dental">
                <Radio
                  value={draftCob.asistenciaDental}
                  onChange={(v) => setDraftCob({ ...draftCob, asistenciaDental: v })}
                />
              </Field>
              <Field label="Asistencia visión">
                <Radio
                  value={draftCob.asistenciaVision}
                  onChange={(v) => setDraftCob({ ...draftCob, asistenciaVision: v })}
                />
              </Field>

              <Field label="Asistencia integral">
                <Radio
                  value={draftCob.asistenciaIntegral}
                  onChange={(v) => setDraftCob({ ...draftCob, asistenciaIntegral: v })}
                />
              </Field>
            </div>
          </Section>

          <Section title={`Servicios de asistencia: ${editingPerfil.tipoEmpleado}`}>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
              <Field label="Nombre del servicio">
                <TextInput
                  value={servNombre}
                  onChange={setServNombre}
                  placeholder="Nombre aquí"
                />
              </Field>
              <Field label="">
                <div />
              </Field>
              <Field label="Descripción del servicio">
                <RichTextArea value={servDescripcion} onChange={setServDescripcion} />
              </Field>
              <Field label="Restricciones del servicio">
                <RichTextArea value={servRestricciones} onChange={setServRestricciones} />
              </Field>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={addServicio}
                className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
              >
                <Plus className="h-4 w-4" /> Agregar servicio
              </button>
            </div>

            {draftServ.length > 0 && (
              <div className="mt-5 space-y-2">
                {draftServ.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between rounded-xl border border-border bg-muted/30 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-foreground">{s.nombre}</p>
                      {s.descripcion && (
                        <p className="text-xs text-muted-foreground">{s.descripcion}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDraftServ(draftServ.filter((x) => x.id !== s.id))}
                      className="text-red-500 hover:text-red-600"
                      aria-label="Eliminar servicio"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={finalizarPerfil}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
              >
                <Check className="h-4 w-4" /> Finalizar perfil
              </button>
            </div>
          </Section>
        </>
      )}

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </>
  );
}