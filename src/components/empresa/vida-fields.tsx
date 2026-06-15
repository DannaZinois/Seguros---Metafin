import { useState } from "react";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import {
  Section,
  Field,
  TextInput,
  DateInput,
} from "@/components/cotizador/shared";
import { Popup, type PopupState } from "@/components/cotizador/shared";
import type { VidaConfig, VidaPerfil } from "@/lib/empresa-store";

function emptyConfig(): VidaConfig {
  return { vigenciaIni: "", vigenciaFin: "", tiposEmpleado: [], perfiles: [] };
}

export function VidaFieldsSection({
  aseguradora,
  value,
  onChange,
}: {
  aseguradora: string;
  value: VidaConfig | undefined;
  onChange: (cfg: VidaConfig) => void;
}) {
  const cfg: VidaConfig = value ?? emptyConfig();
  const [tipoInput, setTipoInput] = useState("");
  const [editingPerfilId, setEditingPerfilId] = useState<string | null>(null);
  const [draftSuma, setDraftSuma] = useState("");
  const [popup, setPopup] = useState<PopupState>(null);

  const editingPerfil = cfg.perfiles.find((p) => p.id === editingPerfilId) ?? null;

  const update = (patch: Partial<VidaConfig>) => onChange({ ...cfg, ...patch });

  const openEditor = (perfilId: string) => {
    const p = cfg.perfiles.find((x) => x.id === perfilId);
    if (!p) return;
    setEditingPerfilId(perfilId);
    setDraftSuma(p.sumaAsegurada ?? "");
  };

  const closeEditor = () => {
    setEditingPerfilId(null);
    setDraftSuma("");
  };

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
        seguro: "Vida",
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

  const confirmDeletePerfil = (perfil: VidaPerfil) => {
    setPopup({
      kind: "confirm",
      title: `Borrar perfil "${perfil.tipoEmpleado}"`,
      message:
        "Esta acción es permanente: se eliminará la configuración de suma asegurada para este tipo de empleado.",
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

  const agregarSuma = () => {
    if (!editingPerfil || !draftSuma.trim()) return;
    update({
      perfiles: cfg.perfiles.map((p) =>
        p.id === editingPerfil.id
          ? { ...p, sumaAsegurada: draftSuma, status: "Configurado" }
          : p,
      ),
    });
  };

  const concluirGuardar = () => {
    if (!editingPerfil) return;
    if (draftSuma.trim()) {
      update({
        perfiles: cfg.perfiles.map((p) =>
          p.id === editingPerfil.id
            ? { ...p, sumaAsegurada: draftSuma, status: "Configurado" }
            : p,
        ),
      });
    }
    setPopup({
      kind: "info",
      title: "Perfil guardado",
      message: `Se guardó la suma asegurada del perfil "${editingPerfil.tipoEmpleado}".`,
    });
    closeEditor();
  };

  const borrarSuma = () => {
    if (!editingPerfil) return;
    update({
      perfiles: cfg.perfiles.map((p) =>
        p.id === editingPerfil.id
          ? { ...p, sumaAsegurada: "", status: "Sin configurar" }
          : p,
      ),
    });
    setDraftSuma("");
  };

  return (
    <>
      <Section title="Datos Vida">
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
        <Section title={`Seguro de Vida: ${editingPerfil.tipoEmpleado}`}>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Field label="Selecciona un tipo de empleado*">
              <TextInput value={editingPerfil.tipoEmpleado} readOnly />
            </Field>
            <Field label="Suma asegurada">
              <TextInput
                value={draftSuma}
                onChange={setDraftSuma}
                placeholder="$0000.  MXN"
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={agregarSuma}
              className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-5 py-2 text-sm font-medium text-white hover:bg-violet-600"
            >
              <Plus className="h-4 w-4" /> Agregar suma
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={concluirGuardar}
              className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-5 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
            >
              <Check className="h-4 w-4" /> Concluir y guardar
            </button>
            <button
              type="button"
              onClick={borrarSuma}
              className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={closeEditor}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </Section>
      )}

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </>
  );
}