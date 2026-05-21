import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  FileText as FileIcon,
  Pencil,
} from "lucide-react";
import { useAseguradoras, appendChat } from "@/lib/store";
import {
  loadDraft,
  saveDraft,
  clearDraft,
  emptyDraft,
  newAsegurado,
  type CotizadorDraft,
  type Asegurado,
  type EnvioType,
} from "@/lib/cotizador-draft";
import {
  Section,
  Grid,
  Field,
  TextInput,
  DateInput,
  Select,
  EnvioOption,
  Popup,
  type PopupState,
} from "@/components/cotizador/shared";

export const Route = createFileRoute("/_admin/cotizadores")({
  component: CotizadorPage,
  head: () => ({ meta: [{ title: "Cotizador" }] }),
});

function CotizadorPage() {
  const router = useRouter();
  const [aseguradoras] = useAseguradoras();

  const [draft, setDraft] = useState<CotizadorDraft>(() => emptyDraft());
  const [popup, setPopup] = useState<PopupState>(null);
  const [showErrors, setShowErrors] = useState(false);

  // Hydrate from sessionStorage so user can come back from /cuestionario
  useEffect(() => {
    const d = loadDraft();
    if (d) setDraft({ ...emptyDraft(), ...d });
  }, []);

  const update = <K extends keyof CotizadorDraft>(k: K, v: CotizadorDraft[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));

  const showAsegurados =
    draft.tipoAsegurado === "Familiar" ||
    draft.tipoAsegurado === "Otro asegurado";

  const updateAsegurado = (id: string, patch: Partial<Asegurado>) =>
    setDraft((p) => ({
      ...p,
      asegurados: p.asegurados.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.correoContacto.trim());
  const errors = {
    nombre: !draft.nombre.trim(),
    contacto: !draft.contacto.trim(),
    correoContacto: !draft.correoContacto.trim() || !emailValid,
    tipoAsegurado: !draft.tipoAsegurado,
    sexo: !draft.sexo,
    codigoPostal: !draft.codigoPostal.trim(),
    fechaNacimiento: !draft.fechaNacimiento,
    tipoSeguro: !draft.tipoSeguro,
    aseguradora: !draft.aseguradora,
    tipoPlan: !draft.tipoPlan,
    tipoPersona: !draft.tipoPersona,
  };
  const requiredFilled = useMemo(() => {
    if (Object.values(errors).some(Boolean)) return false;
    if (!draft.envio) return false;
    if (showAsegurados) {
      return draft.asegurados.every(
        (a) => a.nombre.trim() && a.contacto.trim() && a.relacion.trim(),
      );
    }
    return true;
  }, [errors, draft, showAsegurados]);

  // Tipo de plan options from selected aseguradora + tipo de seguro
  const tipoSeguroToPolizaTipo: Record<string, string> = {
    Auto: "Auto",
    "Gastos Médicos Mayores": "Gastos médicos mayores",
    Vida: "Vida",
    Exceso: "Exceso",
  };
  const planOptions = useMemo(() => {
    const a = aseguradoras.find((x) => x.name === draft.aseguradora);
    if (!a || !draft.tipoSeguro) return [] as string[];
    const tipo = tipoSeguroToPolizaTipo[draft.tipoSeguro];
    const p = a.polizas?.find((pp) => pp.tipo === tipo);
    return p?.variantes.map((v) => v.nombre).filter(Boolean) ?? [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aseguradoras, draft.aseguradora, draft.tipoSeguro]);

  const handleEnvio = (type: Exclude<EnvioType, null>) => {
    if (type === "whatsapp" || type === "pdf") {
      if (!draft.nombre.trim() || !draft.contacto.trim()) {
        setPopup({
          kind: "error",
          title: "Datos requeridos",
          message:
            "Para usar WhatsApp o PDF debes capturar primero el nombre completo del contratante y el número de contacto.",
        });
        return;
      }
    }
    update("envio", type);
    if (type === "whatsapp") {
      appendChat(draft.contacto, {
        from: "bot",
        text: `Hola ${draft.nombre}, soy el asistente. Te haré algunas preguntas para tu cotización.`,
      });
    } else if (type === "pdf") {
      const pdf =
        aseguradoras.find((a) => a.name === draft.aseguradora)?.pdfName ??
        "formato_cotizacion.pdf";
      appendChat(draft.contacto, {
        from: "bot",
        text: `Hola ${draft.nombre}, te envío el siguiente formato para que lo completes: ${pdf}`,
      });
    }
  };

  const onGuardar = () => {
    saveDraft(draft);
    setPopup({
      kind: "info",
      title: "Cambios guardados",
      message: "Los datos del cotizador se guardaron correctamente.",
    });
  };

  const onEnviar = () => {
    if (!requiredFilled) {
      setShowErrors(true);
      setPopup({
        kind: "error",
        title: "Faltan datos",
        message:
          "Captura todos los datos obligatorios marcados en rojo y selecciona el tipo de envío antes de continuar.",
      });
      return;
    }
    saveDraft(draft);
    router.navigate({ to: "/cuestionario" });
  };

  const onBorrar = () => {
    setPopup({
      kind: "confirm",
      title: "¿Borrar todo?",
      message:
        "Esto eliminará toda la información registrada para este cotizador. Esta acción no se puede deshacer.",
      onConfirm: () => {
        clearDraft();
        setDraft(emptyDraft());
        setPopup(null);
      },
    });
  };

  return (
    <div className="pb-12">
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.navigate({ to: "/cartera" })}
          className="mt-2 rounded-full p-1 text-foreground hover:bg-muted"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Cotizador
          </h1>
          <p className="text-sm text-muted-foreground">
            Registra un nuevo cliente para obtener sus cotizaciones
          </p>
        </div>
      </div>

      <Section title="Datos generales">
        <Grid>
          <Field label="Nombre completo del contratante*">
            <TextInput value={draft.nombre} onChange={(v) => update("nombre", v)} placeholder="Nombre aquí" error={showErrors && errors.nombre} />
          </Field>
          <Field label="Número de contacto*">
            <TextInput value={draft.contacto} onChange={(v) => update("contacto", v)} placeholder="+00 0000 0000 00" error={showErrors && errors.contacto} />
          </Field>
          <Field label="Tipo de asegurado*">
            <Select
              value={draft.tipoAsegurado}
              onChange={(v) => update("tipoAsegurado", v)}
              options={["Individual", "Familiar", "Otro asegurado"]}
              placeholder="Selecciona"
              error={showErrors && errors.tipoAsegurado}
            />
          </Field>
          <Field label="Correo de contacto*">
            <TextInput
              type="email"
              value={draft.correoContacto}
              onChange={(v) => update("correoContacto", v)}
              placeholder="correo@ejemplo.com"
              error={showErrors && errors.correoContacto}
            />
          </Field>

          <Field label="Sexo*">
            <Select value={draft.sexo} onChange={(v) => update("sexo", v)} options={["Masculino", "Femenino"]} placeholder="Selecciona" error={showErrors && errors.sexo} />
          </Field>
          <Field label="Código postal*">
            <TextInput value={draft.codigoPostal} onChange={(v) => update("codigoPostal", v)} placeholder="Lore ipsum dolor est" error={showErrors && errors.codigoPostal} />
          </Field>
          <Field label="Fecha de nacimiento*">
            <DateInput value={draft.fechaNacimiento} onChange={(v) => update("fechaNacimiento", v)} error={showErrors && errors.fechaNacimiento} />
          </Field>
          <Field label="Fecha de antiguedad">
            <DateInput value={draft.fechaAntiguedad} onChange={(v) => update("fechaAntiguedad", v)} />
          </Field>

          <Field label="Tipo de seguro*">
            <Select
              value={draft.tipoSeguro}
              onChange={(v) => {
                update("tipoSeguro", v);
                update("tipoPlan", "");
              }}
              options={["Auto", "Gastos Médicos Mayores", "Vida", "Exceso"]}
              placeholder="Selecciona"
              error={showErrors && errors.tipoSeguro}
            />
          </Field>
          <Field label="Aseguradora*">
            <Select
              value={draft.aseguradora}
              onChange={(v) => {
                update("aseguradora", v);
                update("tipoPlan", "");
              }}
              options={aseguradoras.map((a) => a.name)}
              placeholder={
                aseguradoras.length === 0
                  ? "Registra aseguradoras primero"
                  : "Selecciona"
              }
              error={showErrors && errors.aseguradora}
            />
          </Field>
          <Field label="Tipo de plan*">
            <Select
              value={draft.tipoPlan}
              onChange={(v) => update("tipoPlan", v)}
              options={planOptions}
              placeholder={
                !draft.aseguradora || !draft.tipoSeguro
                  ? "Selecciona aseguradora y tipo de seguro"
                  : planOptions.length === 0
                    ? "Sin variantes registradas"
                    : "Selecciona"
              }
              disabled={planOptions.length === 0}
              error={showErrors && errors.tipoPlan}
            />
          </Field>
          <Field label="Tipo de persona*">
            <Select
              value={draft.tipoPersona}
              onChange={(v) => update("tipoPersona", v)}
              options={["Persona Física", "Persona Moral"]}
              placeholder="Selecciona"
              error={showErrors && errors.tipoPersona}
            />
          </Field>
        </Grid>
      </Section>

      {showAsegurados &&
        draft.asegurados.map((a, idx) => (
          <Section
            key={a.id}
            title={`Datos del asegurado: ${a.relacion.trim() || "Relación"}`}
            extra={
              idx === draft.asegurados.length - 1 ? (
                <button
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      asegurados: [...p.asegurados, newAsegurado()],
                    }))
                  }
                  className="rounded-full bg-violet-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-600"
                >
                  Agregar persona
                </button>
              ) : (
                <button
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      asegurados: p.asegurados.filter((x) => x.id !== a.id),
                    }))
                  }
                  className="rounded-full border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  Eliminar
                </button>
              )
            }
          >
            <Grid>
              <Field label="Nombre completo del asegurado*">
                <TextInput value={a.nombre} onChange={(v) => updateAsegurado(a.id, { nombre: v })} placeholder="Nombre aquí" />
              </Field>
              <Field label="Número de contacto*">
                <TextInput value={a.contacto} onChange={(v) => updateAsegurado(a.id, { contacto: v })} placeholder="+00 0000 0000 00" />
              </Field>
              <Field label="Sexo">
                <Select value={a.sexo} onChange={(v) => updateAsegurado(a.id, { sexo: v })} options={["Masculino", "Femenino"]} placeholder="Selecciona" />
              </Field>
              <Field label="Código postal*">
                <TextInput value={a.codigoPostal} onChange={(v) => updateAsegurado(a.id, { codigoPostal: v })} placeholder="Lore ipsum dolor est" />
              </Field>
              <Field label="Fecha de nacimiento">
                <DateInput value={a.fechaNacimiento} onChange={(v) => updateAsegurado(a.id, { fechaNacimiento: v })} />
              </Field>
              <Field label="Fecha de antiguedad">
                <DateInput value={a.fechaAntiguedad} onChange={(v) => updateAsegurado(a.id, { fechaAntiguedad: v })} />
              </Field>
              <Field label="Relación*">
                <TextInput value={a.relacion} onChange={(v) => updateAsegurado(a.id, { relacion: v })} placeholder="Lore ipsum dolor est" />
              </Field>
            </Grid>
          </Section>
        ))}

      <Section
        title="Tipo de envio"
        subtitle="Selecciona cómo quieres recopilar la información"
      >
        <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-3">
          <EnvioOption
            label="Recolección por chatbot de WhatsApp"
            active={draft.envio === "whatsapp"}
            onClick={() => handleEnvio("whatsapp")}
            color="bg-green-500 hover:bg-green-600"
            icon={<MessageCircle className="h-4 w-4" />}
            text="WhatsApp"
          />
          <EnvioOption
            label="Recolección manual"
            active={draft.envio === "manual"}
            onClick={() => handleEnvio("manual")}
            color="bg-blue-500 hover:bg-blue-600"
            icon={<Pencil className="h-4 w-4" />}
            text="Manual"
          />
          <EnvioOption
            label="Recolección por lectura de pdf por IA"
            active={draft.envio === "pdf"}
            onClick={() => handleEnvio("pdf")}
            color="bg-red-500 hover:bg-red-600"
            icon={<FileIcon className="h-4 w-4" />}
            text="pdf"
          />
        </div>
      </Section>

      <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={onGuardar}
          className="rounded-full bg-violet-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-600"
        >
          Guardar cambios
        </button>
        <button
          onClick={onEnviar}
          className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          Enviar
        </button>
        <button
          onClick={onBorrar}
          className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600"
        >
          Borrar
        </button>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Copyrights ©{" "}
        <span className="text-[color:var(--brand-blue)]">Zinois</span>
      </p>

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}