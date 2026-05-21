import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Calendar,
  MessageCircle,
  FileText as FileIcon,
  Plus,
  Pencil,
  Trash2,
  X,
  UploadCloud,
  MessageSquare,
} from "lucide-react";
import { useAseguradoras, appendChat, useChats } from "@/lib/store";

export const Route = createFileRoute("/_admin/cotizadores")({
  component: CotizadorPage,
  head: () => ({ meta: [{ title: "Cotizador" }] }),
});

type EnvioType = "whatsapp" | "manual" | "pdf" | null;

interface Asegurado {
  id: string;
  nombre: string;
  contacto: string;
  sexo: string;
  codigoPostal: string;
  fechaNacimiento: string;
  fechaAntiguedad: string;
  relacion: string;
}

function newAsegurado(): Asegurado {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    contacto: "",
    sexo: "",
    codigoPostal: "",
    fechaNacimiento: "",
    fechaAntiguedad: "",
    relacion: "",
  };
}

function CotizadorPage() {
  const router = useRouter();
  const [aseguradoras] = useAseguradoras();

  // Datos generales
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [tipoAsegurado, setTipoAsegurado] = useState("");
  const [rfc, setRfc] = useState("");
  const [sexo, setSexo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaAntiguedad, setFechaAntiguedad] = useState("");
  const [tipoSeguro, setTipoSeguro] = useState("");
  const [aseguradora, setAseguradora] = useState("");
  const [tipoPersona, setTipoPersona] = useState("");

  const showAsegurados =
    tipoAsegurado === "Familiar" || tipoAsegurado === "Otro asegurado";

  const [asegurados, setAsegurados] = useState<Asegurado[]>([newAsegurado()]);

  const [envio, setEnvio] = useState<EnvioType>(null);

  // Stage 2 state
  const [stage, setStage] = useState<1 | 2>(1);
  const [progreso, setProgreso] = useState(0);
  const [comentarioCliente, setComentarioCliente] = useState("");
  const [polizaName, setPolizaName] = useState("");
  const [polizaProgress, setPolizaProgress] = useState(0);
  const [docs, setDocs] = useState<DocumentRow[]>(() => defaultDocs());

  const [popup, setPopup] = useState<PopupState>(null);

  const requiredFilled = useMemo(() => {
    if (!nombre.trim() || !contacto.trim() || !rfc.trim()) return false;
    if (!direccion.trim() || !codigoPostal.trim()) return false;
    if (!envio) return false;
    if (showAsegurados) {
      return asegurados.every(
        (a) => a.nombre.trim() && a.contacto.trim() && a.relacion.trim(),
      );
    }
    return true;
  }, [
    nombre, contacto, rfc, direccion, codigoPostal, envio, showAsegurados, asegurados,
  ]);

  const handleEnvio = (type: Exclude<EnvioType, null>) => {
    if (type === "whatsapp" || type === "pdf") {
      if (!nombre.trim() || !contacto.trim()) {
        setPopup({
          kind: "error",
          title: "Datos requeridos",
          message:
            "Para usar WhatsApp o PDF debes capturar primero el nombre completo del contratante y el número de contacto.",
        });
        return;
      }
    }
    setEnvio(type);
    if (type === "whatsapp") {
      appendChat(contacto, {
        from: "bot",
        text: `Hola ${nombre}, soy el asistente. Te haré algunas preguntas para tu cotización.`,
      });
    } else if (type === "pdf") {
      const pdf =
        aseguradoras.find((a) => a.name === aseguradora)?.pdfName ??
        "formato_cotizacion.pdf";
      appendChat(contacto, {
        from: "bot",
        text: `Hola ${nombre}, te envío el siguiente formato para que lo completes: ${pdf}`,
      });
    }
  };

  const onGuardar = () => {
    if (!nombre.trim() && !contacto.trim() && !rfc.trim()) {
      setPopup({
        kind: "error",
        title: "Sin datos para guardar",
        message: "Registra al menos los datos básicos antes de guardar.",
      });
      return;
    }
    setPopup({
      kind: "info",
      title: "Cambios guardados",
      message: "Los datos del cotizador se guardaron correctamente.",
    });
  };

  const onEnviar = () => {
    if (!envio) {
      setPopup({
        kind: "error",
        title: "Selecciona un tipo de envío",
        message: "Elige WhatsApp, Manual o PDF antes de enviar.",
      });
      return;
    }
    if (stage === 2 && requiredFilled) {
      // "Siguiente"
      setPopup({
        kind: "info",
        title: "Cotización completada",
        message: "Continúa al siguiente paso.",
      });
      return;
    }
    if (envio === "manual") {
      const resumen = `Estos son los datos capturados:\n• Nombre: ${nombre}\n• Tipo: ${tipoSeguro}\n• Aseguradora: ${aseguradora}\n¿Es correcto?`;
      appendChat(contacto || "sin-numero", { from: "agent", text: resumen });
      setProgreso(100);
    } else {
      appendChat(contacto, {
        from: "bot",
        text: "Recopilando información faltante con el cliente...",
      });
      // Simulate progress
      setProgreso((p) => Math.min(100, p + 25));
    }
    setStage(2);
  };

  const onBorrar = () => {
    setPopup({
      kind: "confirm",
      title: "¿Borrar todo?",
      message:
        "Esto eliminará toda la información registrada para este cotizador. Esta acción no se puede deshacer.",
      onConfirm: () => {
        setNombre(""); setContacto(""); setTipoAsegurado(""); setRfc("");
        setSexo(""); setDireccion(""); setCodigoPostal("");
        setFechaNacimiento(""); setFechaAntiguedad(""); setTipoSeguro("");
        setAseguradora(""); setTipoPersona("");
        setAsegurados([newAsegurado()]);
        setEnvio(null); setStage(1); setProgreso(0);
        setComentarioCliente(""); setPolizaName(""); setPolizaProgress(0);
        setDocs(defaultDocs());
        setPopup(null);
      },
    });
  };

  const onVerWhatsapp = () => {
    if (!contacto.trim()) {
      setPopup({
        kind: "error",
        title: "Sin número de contacto",
        message: "Captura primero el número de contacto del cliente.",
      });
      return;
    }
    setPopup({ kind: "chat", phone: contacto });
  };

  const enviarLabel =
    stage === 2 && requiredFilled ? "Siguiente" : "Enviar";

  return (
    <div className="pb-12">
      {/* Header */}
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

      {/* Datos generales */}
      <Section title="Datos generales">
        <Grid>
          <Field label="Nombre completo del contratante*">
            <TextInput value={nombre} onChange={setNombre} placeholder="Nombre aquí" />
          </Field>
          <Field label="Número de contacto*">
            <TextInput value={contacto} onChange={setContacto} placeholder="+00 0000 0000 00" />
          </Field>
          <Field label="Tipo de asegurado">
            <Select
              value={tipoAsegurado}
              onChange={setTipoAsegurado}
              options={["Individual", "Familiar", "Otro asegurado"]}
              placeholder="Selecciona"
            />
          </Field>
          <Field label="RFC*">
            <TextInput value={rfc} onChange={setRfc} placeholder="Lore ipsum dolor est" />
          </Field>

          <Field label="Sexo">
            <Select
              value={sexo}
              onChange={setSexo}
              options={["Masculino", "Femenino"]}
              placeholder="Selecciona"
            />
          </Field>
          <Field label="Dirección*">
            <TextInput value={direccion} onChange={setDireccion} placeholder="Lore ipsum dolor est" />
          </Field>
          <Field label="Código postal*">
            <TextInput value={codigoPostal} onChange={setCodigoPostal} placeholder="Lore ipsum dolor est" />
          </Field>
          <Field label="Fecha de nacimiento">
            <DateInput value={fechaNacimiento} onChange={setFechaNacimiento} />
          </Field>

          <Field label="Fecha de antiguedad">
            <DateInput value={fechaAntiguedad} onChange={setFechaAntiguedad} />
          </Field>
          <Field label="Tipo de seguro">
            <Select
              value={tipoSeguro}
              onChange={setTipoSeguro}
              options={["Auto", "Gastos Médicos Mayores", "Vida", "Exceso"]}
              placeholder="Selecciona"
            />
          </Field>
          <Field label="Aseguradora">
            <Select
              value={aseguradora}
              onChange={setAseguradora}
              options={aseguradoras.map((a) => a.name)}
              placeholder={
                aseguradoras.length === 0
                  ? "Registra aseguradoras primero"
                  : "Selecciona"
              }
            />
          </Field>
          <Field label="Tipo de persona">
            <Select
              value={tipoPersona}
              onChange={setTipoPersona}
              options={["Persona Física", "Persona Moral"]}
              placeholder="Selecciona"
            />
          </Field>
        </Grid>
      </Section>

      {/* Asegurados (solo si Familiar / Otro asegurado) */}
      {showAsegurados &&
        asegurados.map((a, idx) => (
          <Section
            key={a.id}
            title={`Datos del asegurado: ${a.relacion.trim() || "Relación"}`}
            extra={
              idx === asegurados.length - 1 ? (
                <button
                  onClick={() =>
                    setAsegurados([...asegurados, newAsegurado()])
                  }
                  className="rounded-full bg-violet-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-600"
                >
                  Agregar persona
                </button>
              ) : (
                <button
                  onClick={() =>
                    setAsegurados(asegurados.filter((x) => x.id !== a.id))
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
                <TextInput
                  value={a.nombre}
                  onChange={(v) => updateAsegurado(setAsegurados, a.id, { nombre: v })}
                  placeholder="Nombre aquí"
                />
              </Field>
              <Field label="Número de contacto*">
                <TextInput
                  value={a.contacto}
                  onChange={(v) => updateAsegurado(setAsegurados, a.id, { contacto: v })}
                  placeholder="+00 0000 0000 00"
                />
              </Field>
              <Field label="Sexo">
                <Select
                  value={a.sexo}
                  onChange={(v) => updateAsegurado(setAsegurados, a.id, { sexo: v })}
                  options={["Masculino", "Femenino"]}
                  placeholder="Selecciona"
                />
              </Field>
              <Field label="Código postal*">
                <TextInput
                  value={a.codigoPostal}
                  onChange={(v) => updateAsegurado(setAsegurados, a.id, { codigoPostal: v })}
                  placeholder="Lore ipsum dolor est"
                />
              </Field>
              <Field label="Fecha de nacimiento">
                <DateInput
                  value={a.fechaNacimiento}
                  onChange={(v) => updateAsegurado(setAsegurados, a.id, { fechaNacimiento: v })}
                />
              </Field>
              <Field label="Fecha de antiguedad">
                <DateInput
                  value={a.fechaAntiguedad}
                  onChange={(v) => updateAsegurado(setAsegurados, a.id, { fechaAntiguedad: v })}
                />
              </Field>
              <Field label="Relación*">
                <TextInput
                  value={a.relacion}
                  onChange={(v) => updateAsegurado(setAsegurados, a.id, { relacion: v })}
                  placeholder="Lore ipsum dolor est"
                />
              </Field>
            </Grid>
          </Section>
        ))}

      {/* Tipo de envío */}
      <Section
        title="Tipo de envio"
        subtitle="Selecciona cómo quieres recopilar la información"
      >
        <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-3">
          <EnvioOption
            label="Recolección por chatbot de WhatsApp"
            active={envio === "whatsapp"}
            onClick={() => handleEnvio("whatsapp")}
            color="bg-green-500 hover:bg-green-600"
            icon={<MessageCircle className="h-4 w-4" />}
            text="WhatsApp"
          />
          <EnvioOption
            label="Recolección manual"
            active={envio === "manual"}
            onClick={() => handleEnvio("manual")}
            color="bg-blue-500 hover:bg-blue-600"
            icon={<Pencil className="h-4 w-4" />}
            text="Manual"
          />
          <EnvioOption
            label="Recolección por lectura de pdf por IA"
            active={envio === "pdf"}
            onClick={() => handleEnvio("pdf")}
            color="bg-red-500 hover:bg-red-600"
            icon={<FileIcon className="h-4 w-4" />}
            text="pdf"
          />
        </div>
      </Section>

      {/* Stage 2 sections */}
      {stage === 2 && (envio === "whatsapp" || envio === "pdf") && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground">
              Progreso de cotización
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Aquí podrás ver el progreso de llenado del agente y si el usuario
              solicita tu apoyo.
            </p>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span>Datos de usuario recopilados con éxito</span>
              <span className="font-medium">{progreso}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-violet-500 transition-all"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <button
              onClick={() => setProgreso((p) => Math.min(100, p + 25))}
              className="mt-4 text-xs text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
            >
              Simular avance
            </button>
          </div>
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground">
              Comentarios del cliente
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Recibe feedback del cliente y edita a sus especificaciones si es
              necesario.
            </p>
            <textarea
              value={comentarioCliente}
              onChange={(e) => setComentarioCliente(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-2xl border border-border bg-white p-3 text-sm outline-none focus:border-[color:var(--brand-blue)]"
              placeholder="Sin comentarios"
            />
          </div>
        </div>
      )}

      {stage === 2 && progreso >= 100 && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground">
                Envio de cotización
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Envia tu cotización inicial al cliente y recibe feedback
              </p>
              {polizaName && (
                <>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span>{polizaName}</span>
                    <span className="text-muted-foreground">25 MB</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-violet-500 transition-all"
                      style={{ width: `${polizaProgress}%` }}
                    />
                  </div>
                </>
              )}
              <Dropzone
                className="mt-4"
                onFile={(f) => {
                  setPolizaName(f.name);
                  setPolizaProgress(100);
                  appendChat(contacto, {
                    from: "agent",
                    text: `Te envío la cotización: ${f.name}`,
                  });
                }}
              />
            </div>
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground">
                Comentarios del cliente
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Recibe feedback del cliente y edita a sus especificaciones si es
                necesario.
              </p>
              <textarea
                value={comentarioCliente}
                onChange={(e) => setComentarioCliente(e.target.value)}
                rows={6}
                className="mt-3 w-full rounded-2xl border border-border bg-white p-3 text-sm outline-none focus:border-[color:var(--brand-blue)]"
                placeholder="Sin comentarios"
              />
            </div>
          </div>

          <DocumentosCargados
            docs={docs}
            setDocs={setDocs}
            phone={contacto}
            onPopup={setPopup}
          />
        </>
      )}

      {/* Bottom actions */}
      <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={onVerWhatsapp}
          className="rounded-full bg-green-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-600"
        >
          Ver whatsapp
        </button>
        <button
          onClick={onGuardar}
          className="rounded-full bg-violet-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-600"
        >
          {stage === 2 ? "+ Guardar cambios" : "Guardar cambios"}
        </button>
        <button
          onClick={onEnviar}
          className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          {enviarLabel}
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

/* ---------- helpers / small UI ---------- */

function updateAsegurado(
  setter: React.Dispatch<React.SetStateAction<Asegurado[]>>,
  id: string,
  patch: Partial<Asegurado>,
) {
  setter((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

function Section({
  title,
  subtitle,
  extra,
  children,
}: {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {extra}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
    />
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border border-border bg-white px-4 py-2 pr-9 text-sm outline-none focus:border-[color:var(--brand-blue)]"
      />
      <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-full border border-border bg-white px-4 py-2 pr-9 text-sm outline-none focus:border-[color:var(--brand-blue)]"
      >
        <option value="">{placeholder ?? "Selecciona"}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function EnvioOption({
  label, active, onClick, color, icon, text,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-3 text-sm text-foreground">{label}</span>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all ${color} ${
          active ? "ring-2 ring-offset-2 ring-foreground/40" : ""
        }`}
      >
        {icon}
        {text}
      </button>
    </div>
  );
}

function Dropzone({
  onFile,
  className,
}: {
  onFile: (f: File) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label
      className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-white text-sm text-muted-foreground hover:bg-muted/40 ${className ?? ""}`}
    >
      <UploadCloud className="h-6 w-6 text-[color:var(--brand-blue)]" />
      Arrastra tu archivo aquí o da click
      <input
        ref={ref}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </label>
  );
}

/* ---------- documentos cargados ---------- */

type DocStatus = "Cargado" | "Sin archivo";
interface DocumentRow {
  id: string;
  nombre: string;
  encargado: "Cliente" | "Asesor";
  fecha: string;
  estatus: DocStatus;
  fileName?: string;
}

function defaultDocs(): DocumentRow[] {
  return [
    { id: crypto.randomUUID(), nombre: "INE", encargado: "Cliente", fecha: "00/00/0000", estatus: "Cargado" },
    { id: crypto.randomUUID(), nombre: "Comprobante de domicilio", encargado: "Cliente", fecha: "00/00/0000", estatus: "Sin archivo" },
    { id: crypto.randomUUID(), nombre: "Póliza", encargado: "Asesor", fecha: "00/00/0000", estatus: "Cargado" },
    { id: crypto.randomUUID(), nombre: "Recibos", encargado: "Asesor", fecha: "00/00/0000", estatus: "Cargado" },
    { id: crypto.randomUUID(), nombre: "Cotización", encargado: "Asesor", fecha: "00/00/0000", estatus: "Cargado" },
  ];
}

function DocumentosCargados({
  docs, setDocs, phone, onPopup,
}: {
  docs: DocumentRow[];
  setDocs: React.Dispatch<React.SetStateAction<DocumentRow[]>>;
  phone: string;
  onPopup: (p: PopupState) => void;
}) {
  const addRow = () => {
    setDocs((d) => [
      ...d,
      {
        id: crypto.randomUUID(),
        nombre: "Nuevo documento",
        encargado: "Asesor",
        fecha: "00/00/0000",
        estatus: "Sin archivo",
      },
    ]);
  };

  const onUpload = (row: DocumentRow) => {
    if (row.encargado === "Cliente") {
      onPopup({
        kind: "client-upload",
        title: "Subir documento",
        message: `¿Quieres subir "${row.nombre}" tú mismo o pedirle al cliente que lo suba por WhatsApp?`,
        onSelf: () =>
          onPopup({
            kind: "upload",
            title: row.nombre,
            onFile: (f) =>
              setDocs((d) =>
                d.map((x) =>
                  x.id === row.id ? { ...x, estatus: "Cargado", fileName: f.name } : x,
                ),
              ),
          }),
        onClient: () => {
          appendChat(phone, {
            from: "bot",
            text: `Por favor sube el documento: ${row.nombre}`,
          });
          onPopup({
            kind: "info",
            title: "Solicitud enviada",
            message: "Se solicitó el documento al cliente por WhatsApp.",
          });
        },
      });
      return;
    }
    onPopup({
      kind: "upload",
      title: row.nombre,
      onFile: (f) =>
        setDocs((d) =>
          d.map((x) =>
            x.id === row.id ? { ...x, estatus: "Cargado", fileName: f.name } : x,
          ),
        ),
    });
  };

  return (
    <section className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Documentos cargados</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aquí podrás ver el progreso de recopilación del agente y si el
            usuario solicita tu apoyo.
          </p>
        </div>
        <button
          onClick={addRow}
          className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
        >
          <Plus className="h-4 w-4" /> Agregar documento
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-3 font-medium">Nombre de documento</th>
              <th className="py-3 font-medium">Encargado</th>
              <th className="py-3 font-medium">Fecha de carga</th>
              <th className="py-3 font-medium">Estatus</th>
              <th className="py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-t border-border/60">
                <td className="py-3">
                  <input
                    value={d.nombre}
                    onChange={(e) =>
                      setDocs((rows) =>
                        rows.map((r) =>
                          r.id === d.id ? { ...r, nombre: e.target.value } : r,
                        ),
                      )
                    }
                    className="w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none focus:bg-muted/40"
                  />
                </td>
                <td className="py-3">
                  <select
                    value={d.encargado}
                    onChange={(e) =>
                      setDocs((rows) =>
                        rows.map((r) =>
                          r.id === d.id
                            ? { ...r, encargado: e.target.value as DocumentRow["encargado"] }
                            : r,
                        ),
                      )
                    }
                    className="rounded-md bg-transparent px-2 py-1 text-sm outline-none focus:bg-muted/40"
                  >
                    <option>Cliente</option>
                    <option>Asesor</option>
                  </select>
                </td>
                <td className="py-3 text-foreground/80">{d.fecha}</td>
                <td className="py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      d.estatus === "Cargado"
                        ? "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                        : "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]"
                    }`}
                  >
                    {d.estatus}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpload(d)}
                      className="rounded-full p-1.5 text-amber-500 hover:bg-amber-50"
                      title="Subir/editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDocs((rows) =>
                          rows.map((r) =>
                            r.id === d.id
                              ? { ...r, estatus: "Sin archivo", fileName: undefined }
                              : r,
                          ),
                        )
                      }
                      className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"
                      title="Eliminar"
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
    </section>
  );
}

/* ---------- popup ---------- */

type PopupState =
  | null
  | { kind: "error" | "info"; title: string; message: string }
  | {
      kind: "confirm";
      title: string;
      message: string;
      onConfirm: () => void;
    }
  | {
      kind: "upload";
      title: string;
      onFile: (f: File) => void;
    }
  | {
      kind: "client-upload";
      title: string;
      message: string;
      onSelf: () => void;
      onClient: () => void;
    }
  | { kind: "chat"; phone: string };

function Popup({
  state, onClose,
}: {
  state: NonNullable<PopupState>;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        {state.kind === "chat" ? (
          <ChatPanel phone={state.phone} />
        ) : state.kind === "upload" ? (
          <UploadPanel title={state.title} onFile={(f) => { state.onFile(f); onClose(); }} />
        ) : state.kind === "client-upload" ? (
          <>
            <h3 className="text-lg font-bold text-foreground">{state.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => { state.onClient(); }}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Pedir al cliente
              </button>
              <button
                onClick={() => { state.onSelf(); }}
                className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm text-white hover:bg-[color:var(--brand-blue-dark)]"
              >
                Subirlo yo mismo
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-foreground">{state.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              {state.kind === "confirm" ? (
                <>
                  <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">
                    Cancelar
                  </button>
                  <button
                    onClick={state.onConfirm}
                    className="rounded-full bg-destructive px-4 py-2 text-sm text-white hover:opacity-90"
                  >
                    Sí, borrar
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm text-white hover:bg-[color:var(--brand-blue-dark)]"
                >
                  Entendido
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UploadPanel({ title, onFile }: { title: string; onFile: (f: File) => void }) {
  return (
    <>
      <h3 className="text-lg font-bold text-foreground">Subir: {title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Arrastra el archivo o da click para seleccionarlo.
      </p>
      <div className="mt-4">
        <Dropzone onFile={onFile} />
      </div>
    </>
  );
}

function ChatPanel({ phone }: { phone: string }) {
  const [chats] = useChats();
  const messages = chats[phone] ?? [];
  return (
    <div className="flex max-h-[70vh] flex-col">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <div className="rounded-full bg-green-500 p-2 text-white">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">WhatsApp</p>
          <p className="text-xs text-muted-foreground">{phone}</p>
        </div>
      </div>
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin mensajes aún.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              m.from === "agent"
                ? "ml-auto bg-green-100 text-green-900"
                : m.from === "bot"
                  ? "bg-muted text-foreground"
                  : "bg-[color:var(--brand-bg-soft)] text-foreground"
            }`}
          >
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {m.from}
            </p>
            <p className="whitespace-pre-wrap">{m.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}