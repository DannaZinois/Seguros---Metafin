import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  FileText as FileIcon,
  Pencil,
  Plus,
  Trash2,
  Mail,
  Download,
  UserPlus,
} from "lucide-react";
import { z } from "zod";
import { useAseguradoras, appendChat } from "@/lib/store";
import {
  Section,
  Grid,
  Field,
  TextInput,
  Select,
  EnvioOption,
  Dropzone,
  Popup,
  type PopupState,
} from "@/components/cotizador/shared";
import {
  useEmpresas,
  saveEmpresa,
  newEmpresa,
  newEncargado,
  newPoliza,
  type Empresa,
  type Encargado,
  type Poliza,
  type EnvioType,
} from "@/lib/empresa-store";

const searchSchema = z.object({
  empresaId: z.string().optional(),
});

export const Route = createFileRoute("/_admin/empresa/nueva")({
  component: NuevaEmpresaPage,
  head: () => ({ meta: [{ title: "Nueva póliza · Empresa" }] }),
  validateSearch: searchSchema,
});

function NuevaEmpresaPage() {
  const router = useRouter();
  const { empresaId } = Route.useSearch();
  const list = useEmpresas();
  const [aseguradoras] = useAseguradoras();

  const existing = useMemo(
    () => (empresaId ? list.find((e) => e.id === empresaId) ?? null : null),
    [empresaId, list],
  );

  const [empresa, setEmpresa] = useState<Empresa>(() => newEmpresa());
  const [activePolizaIdx, setActivePolizaIdx] = useState(0);
  const [popup, setPopup] = useState<PopupState>(null);

  // Hydrate when editing an existing empresa (add new póliza to it)
  useEffect(() => {
    if (existing) {
      const next = { ...existing, polizas: [...existing.polizas, newPoliza()] };
      setEmpresa(next);
      setActivePolizaIdx(next.polizas.length - 1);
    }
  }, [existing]);

  const editingExisting = !!existing;
  const poliza = empresa.polizas[activePolizaIdx] ?? empresa.polizas[0];

  const updateEmpresa = <K extends keyof Empresa>(k: K, v: Empresa[K]) =>
    setEmpresa((p) => ({ ...p, [k]: v }));

  const updatePoliza = (patch: Partial<Poliza>) =>
    setEmpresa((p) => ({
      ...p,
      polizas: p.polizas.map((pl, i) =>
        i === activePolizaIdx ? { ...pl, ...patch } : pl,
      ),
    }));

  const updateEncargado = (id: string, patch: Partial<Encargado>) =>
    setEmpresa((p) => ({
      ...p,
      encargados: p.encargados.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const addEncargado = () =>
    setEmpresa((p) => ({ ...p, encargados: [...p.encargados, newEncargado()] }));

  const removeEncargado = (id: string) =>
    setEmpresa((p) => ({ ...p, encargados: p.encargados.filter((e) => e.id !== id) }));

  const sendInvites = () => {
    const valid = empresa.encargados.filter(
      (e) => e.email.trim() && e.nombre.trim() && !e.invited,
    );
    if (valid.length === 0) {
      setPopup({
        kind: "error",
        title: "Sin encargados nuevos",
        message: "Captura nombre y correo de los encargados antes de enviar invitaciones.",
      });
      return;
    }
    setEmpresa((p) => ({
      ...p,
      encargados: p.encargados.map((e) =>
        valid.some((v) => v.id === e.id) ? { ...e, invited: true } : e,
      ),
    }));
    const summary = valid
      .map((e) => `• ${e.nombre} <${e.email}> — ${e.acceso}`)
      .join("\n");
    setPopup({
      kind: "info",
      title: "Invitaciones enviadas",
      message: `Se envió un correo con credenciales de acceso a:\n\n${summary}\n\nPermisos:\n• Admin / RRHH: editar, agregar y eliminar perfiles, solicitar nuevas pólizas.\n• Lectura: solo visualizar la información.`,
    });
  };

  const handleEnvio = (type: Exclude<EnvioType, null>) => {
    if (type === "whatsapp" || type === "pdf") {
      if (!poliza.contratante.trim() || !poliza.contacto.trim()) {
        setPopup({
          kind: "error",
          title: "Datos requeridos",
          message:
            "Captura el nombre del contratante y el número de contacto antes de usar WhatsApp o PDF.",
        });
        return;
      }
    }
    updatePoliza({ envio: type });
    if (type === "whatsapp") {
      appendChat(poliza.contacto, {
        from: "bot",
        text: `Hola ${poliza.contratante}, soy el asistente. Te haré algunas preguntas para la póliza de ${empresa.nombre}.`,
      });
    } else if (type === "pdf") {
      const pdf =
        aseguradoras.find((a) => a.name === poliza.aseguradora)?.pdfName ??
        "formato_cotizacion.pdf";
      appendChat(poliza.contacto, {
        from: "bot",
        text: `Hola ${poliza.contratante}, te envío el siguiente formato: ${pdf}`,
      });
    }
  };

  const onGuardar = () => {
    if (!empresa.nombre.trim()) {
      setPopup({
        kind: "error",
        title: "Falta nombre de la empresa",
        message: "Captura al menos el nombre de la empresa antes de guardar.",
      });
      return;
    }
    saveEmpresa(empresa);
    setPopup({
      kind: "info",
      title: "Cambios guardados",
      message: "La información de la empresa se guardó correctamente.",
    });
  };

  const onEnviar = () => {
    if (!empresa.nombre.trim() || !poliza.tipo) {
      setPopup({
        kind: "error",
        title: "Faltan datos",
        message: "Captura los datos generales de la empresa y el tipo de póliza.",
      });
      return;
    }
    saveEmpresa(empresa);
    setPopup({
      kind: "info",
      title: "Póliza enviada",
      message: "La póliza se registró correctamente bajo la empresa.",
    });
  };

  const onBorrar = () => {
    setPopup({
      kind: "confirm",
      title: "¿Borrar todo?",
      message: "Esto eliminará la información capturada en este formulario.",
      onConfirm: () => {
        setEmpresa(newEmpresa());
        setActivePolizaIdx(0);
        setPopup(null);
      },
    });
  };

  const onVerWhatsapp = () => {
    if (!poliza.contacto.trim()) {
      setPopup({
        kind: "error",
        title: "Sin número de contacto",
        message: "Captura primero el número de contacto del contratante.",
      });
      return;
    }
    setPopup({ kind: "chat", phone: poliza.contacto });
  };

  const agregarPoliza = () => {
    // Save current and reload page in "add to existing" mode
    if (!empresa.nombre.trim()) {
      setPopup({
        kind: "error",
        title: "Falta nombre de la empresa",
        message: "Captura los datos de la empresa antes de agregar otra póliza.",
      });
      return;
    }
    saveEmpresa(empresa);
    router.navigate({
      to: "/empresa/nueva",
      search: { empresaId: empresa.id },
    });
  };

  // List of "active" polizas (other than the one currently being edited)
  const otherPolizas = empresa.polizas
    .map((p, i) => ({ p, i }))
    .filter(({ i }) => i !== activePolizaIdx && p[0]);
  // Actually use saved polizas:
  const savedPolizas =
    existing?.polizas.filter((p) => p.id !== poliza.id) ?? [];

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
            Nueva póliza
          </h1>
          <p className="text-sm text-muted-foreground">
            Registra una nueva empresa para obtener sus cotizaciones
          </p>
        </div>
      </div>

      {/* Datos generales */}
      <Section title="Datos generales">
        <Grid>
          <Field label="Nombre de la empresa*">
            <TextInput
              value={empresa.nombre}
              readOnly={editingExisting}
              onChange={(v) => updateEmpresa("nombre", v)}
              placeholder="Nombre aquí"
            />
          </Field>
          <Field label="RFC*">
            <TextInput
              value={empresa.rfc}
              readOnly={editingExisting}
              onChange={(v) => updateEmpresa("rfc", v)}
              placeholder="+00 0000 0000 00"
            />
          </Field>
          <Field label="Giro*">
            <TextInput
              value={empresa.giro}
              readOnly={editingExisting}
              onChange={(v) => updateEmpresa("giro", v)}
              placeholder="Lore ipsum dolor est"
            />
          </Field>
          <Field label="Código postal*">
            <TextInput
              value={empresa.codigoPostal}
              readOnly={editingExisting}
              onChange={(v) => updateEmpresa("codigoPostal", v)}
              placeholder="Lore ipsum dolor est"
            />
          </Field>
        </Grid>
      </Section>

      {/* Póliza */}
      <Section
        title={`Póliza: ${poliza.tipo || "Tipo de póliza aquí"}`}
      >
        <Grid>
          <Field label="Tipo de póliza*">
            <Select
              value={poliza.tipo}
              onChange={(v) => updatePoliza({ tipo: v })}
              options={["Auto", "Gastos Médicos Mayores", "Vida", "Exceso GMM"]}
              placeholder="Selecciona"
            />
          </Field>
          <Field label="Aseguradora">
            <Select
              value={poliza.aseguradora}
              onChange={(v) => updatePoliza({ aseguradora: v })}
              options={aseguradoras.map((a) => a.name)}
              placeholder={
                aseguradoras.length === 0
                  ? "Registra aseguradoras primero"
                  : "Selecciona"
              }
            />
          </Field>
          <Field label="Nombre completo del contratante*">
            <TextInput
              value={poliza.contratante}
              onChange={(v) => updatePoliza({ contratante: v })}
              placeholder="Nombre aquí"
            />
          </Field>
          <Field label="Número de contacto*">
            <TextInput
              value={poliza.contacto}
              onChange={(v) => updatePoliza({ contacto: v })}
              placeholder="+00 0000 0000 00"
            />
          </Field>
          <Field label="Código postal*">
            <TextInput
              value={poliza.codigoPostal}
              onChange={(v) => updatePoliza({ codigoPostal: v })}
              placeholder="Lore ipsum dolor est"
            />
          </Field>
          <Field label="Tipo de pago*">
            <Select
              value={poliza.tipoPago}
              onChange={(v) => updatePoliza({ tipoPago: v })}
              options={["Agente", "Domiciliado", "Directo"]}
              placeholder="Selecciona"
            />
          </Field>
          <Field label="Número de asegurados">
            <TextInput
              value={poliza.numAsegurados}
              onChange={(v) => updatePoliza({ numAsegurados: v })}
              placeholder="000"
            />
          </Field>
          <Field label="RFC*">
            <TextInput
              value={poliza.rfc}
              onChange={(v) => updatePoliza({ rfc: v })}
              placeholder="Lore ipsum dolor est"
            />
          </Field>
        </Grid>
      </Section>

      {/* Encargados */}
      <Section
        title="Encargados"
        subtitle="Define quién puede ingresar a la plataforma y con qué nivel de acceso."
        extra={
          <div className="flex gap-2">
            <button
              onClick={sendInvites}
              className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
            >
              <Mail className="h-4 w-4" /> Enviar invitaciones
            </button>
            <button
              onClick={addEncargado}
              className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
            >
              <Plus className="h-4 w-4" /> Agregar encargado
            </button>
          </div>
        }
      >
        {empresa.encargados.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay encargados. Agrega al menos un Admin para gestionar las
            pólizas de la empresa.
          </p>
        ) : (
          <div className="space-y-3">
            {empresa.encargados.map((e) => (
              <div
                key={e.id}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-white p-3 md:grid-cols-[1.2fr_1.4fr_1fr_auto_auto]"
              >
                <TextInput
                  value={e.nombre}
                  onChange={(v) => updateEncargado(e.id, { nombre: v })}
                  placeholder="Nombre del encargado"
                />
                <TextInput
                  value={e.email}
                  onChange={(v) => updateEncargado(e.id, { email: v })}
                  placeholder="correo@empresa.com"
                />
                <Select
                  value={e.acceso}
                  onChange={(v) =>
                    updateEncargado(e.id, {
                      acceso: (v as Encargado["acceso"]) || "Lectura",
                    })
                  }
                  options={["Admin", "RRHH", "Lectura"]}
                  placeholder="Tipo de acceso"
                />
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
                    e.invited
                      ? "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {e.invited ? "Invitado" : "Pendiente"}
                </span>
                <button
                  onClick={() => removeEncargado(e.id)}
                  className="rounded-full p-2 text-destructive hover:bg-destructive/10"
                  title="Eliminar encargado"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <p className="rounded-xl bg-[color:var(--brand-bg-soft)] p-3 text-xs text-muted-foreground">
              <strong>Permisos:</strong> Admin y RRHH pueden editar, agregar y
              eliminar perfiles, así como solicitar nuevas pólizas. Lectura
              únicamente puede consultar la información.
            </p>
          </div>
        )}
      </Section>

      {/* Tipo de envío */}
      <Section
        title="Tipo de envio"
        subtitle="Selecciona cómo quieres recopilar la información"
      >
        <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-3">
          <EnvioOption
            label="Recolección por chatbot de WhatsApp"
            active={poliza.envio === "whatsapp"}
            onClick={() => handleEnvio("whatsapp")}
            color="bg-green-500 hover:bg-green-600"
            icon={<MessageCircle className="h-4 w-4" />}
            text="WhatsApp"
          />
          <EnvioOption
            label="Recolección manual"
            active={poliza.envio === "manual"}
            onClick={() => handleEnvio("manual")}
            color="bg-blue-500 hover:bg-blue-600"
            icon={<Pencil className="h-4 w-4" />}
            text="Manual"
          />
          <EnvioOption
            label="Recolección por lectura de pdf por IA"
            active={poliza.envio === "pdf"}
            onClick={() => handleEnvio("pdf")}
            color="bg-red-500 hover:bg-red-600"
            icon={<FileIcon className="h-4 w-4" />}
            text="pdf"
          />
        </div>
      </Section>

      {/* Carga masiva + Comentarios */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground">
            Carga masiva de asegurados
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Carga un solo archivo para registrar a tus asegurados.
          </p>
          {poliza.cargaFileName && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>{poliza.cargaFileName}</span>
                <span className="text-muted-foreground">25 MB</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full bg-violet-500" />
              </div>
            </div>
          )}
          <Dropzone
            className="mt-4"
            onFile={(f) => updatePoliza({ cargaFileName: f.name })}
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
            value={poliza.comentarios}
            onChange={(e) => updatePoliza({ comentarios: e.target.value })}
            rows={6}
            className="mt-3 w-full rounded-2xl border border-border bg-white p-3 text-sm outline-none focus:border-[color:var(--brand-blue)]"
            placeholder="Sin comentarios"
          />
        </div>
      </div>

      {/* Asegurados bajo esta poliza */}
      <AseguradosSection
        poliza={poliza}
        onChange={(asegurados) => updatePoliza({ asegurados })}
      />

      {/* Pólizas activas */}
      <Section
        title="Pólizas activas"
        subtitle="Pólizas registradas bajo esta empresa."
        extra={
          <button
            onClick={agregarPoliza}
            className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            <Plus className="h-4 w-4" /> Agregar póliza
          </button>
        }
      >
        {savedPolizas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Esta empresa aún no tiene otras pólizas registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-3 font-medium">Tipo de póliza</th>
                  <th className="py-3 font-medium">Aseguradora</th>
                  <th className="py-3 font-medium">Contratante</th>
                  <th className="py-3 font-medium">Asegurados</th>
                  <th className="py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {savedPolizas.map((p) => (
                  <tr key={p.id} className="border-t border-border/60">
                    <td className="py-3">{p.tipo || "—"}</td>
                    <td className="py-3">{p.aseguradora || "—"}</td>
                    <td className="py-3">{p.contratante || "—"}</td>
                    <td className="py-3">{p.asegurados.length}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/empresa/poliza/$polizaId"
                          params={{ polizaId: p.id }}
                          search={{ empresaId: empresa.id }}
                          className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
                          title="Editar / ver póliza"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </Link>
                        <Link
                          to="/empresa/poliza/$polizaId"
                          params={{ polizaId: p.id }}
                          search={{ empresaId: empresa.id, addPerson: true }}
                          className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600"
                          title="Agregar persona"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Agregar persona
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Comprobantes de pago */}
      <ComprobantesSection
        poliza={poliza}
        onChange={(comprobantes) => updatePoliza({ comprobantes })}
      />

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
          + Guardar cambios
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

/* -------- Asegurados table -------- */

export function AseguradosSection({
  poliza,
  onChange,
  readOnly,
}: {
  poliza: Poliza;
  onChange: (a: Poliza["asegurados"]) => void;
  readOnly?: boolean;
}) {
  const addRow = () =>
    onChange([
      ...poliza.asegurados,
      {
        id: crypto.randomUUID(),
        trabajadorId: `F-#${Math.floor(100000 + Math.random() * 900000)}`,
        nombre: "",
        poliza: poliza.tipo || "Póliza aquí",
        vigencia: "00/00/0000",
        renovacion: "00/00/0000",
        correo: "",
        telefono: "",
        consentimiento: false,
        certificado: false,
        status: "Activa",
      },
    ]);

  const STATUS_COLORS: Record<string, string> = {
    Activa: "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]",
    Cancelada: "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]",
    "En revisión": "bg-[color:var(--status-review)] text-[color:var(--status-review-fg)]",
    "Por renovar": "bg-[color:var(--status-renew)] text-[color:var(--status-renew-fg)]",
  };

  return (
    <Section
      title="Asegurados bajo esta póliza"
      extra={
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600">
            + Cargar certificados
          </button>
          <button className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[color:var(--brand-blue-dark)]">
            + Descargar consentimiento
          </button>
          {!readOnly && (
            <button
              onClick={addRow}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar persona
            </button>
          )}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-3 font-medium">ID de trabajador</th>
              <th className="py-3 font-medium">Nombre</th>
              <th className="py-3 font-medium">Póliza</th>
              <th className="py-3 font-medium">Vigencia</th>
              <th className="py-3 font-medium">Fecha de renovación</th>
              <th className="py-3 font-medium">Correo</th>
              <th className="py-3 font-medium">Teléfono</th>
              <th className="py-3 font-medium">Consentimiento</th>
              <th className="py-3 font-medium">Certificado</th>
              <th className="py-3 font-medium">Status</th>
              {!readOnly && <th className="py-3 font-medium" />}
            </tr>
          </thead>
          <tbody>
            {poliza.asegurados.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Aún no hay asegurados. Carga el archivo o agrega una persona.
                </td>
              </tr>
            )}
            {poliza.asegurados.map((a) => (
              <tr key={a.id} className="border-t border-border/60">
                <td className="py-3 text-foreground/80">{a.trabajadorId}</td>
                <td className="py-3">
                  {readOnly ? (
                    a.nombre || "—"
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
                            x.id === a.id
                              ? { ...x, telefono: e.target.value }
                              : x,
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
                <td className="py-3">
                  {readOnly ? (
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[a.status]}`}
                    >
                      {a.status}
                    </span>
                  ) : (
                    <select
                      value={a.status}
                      onChange={(e) =>
                        onChange(
                          poliza.asegurados.map((x) =>
                            x.id === a.id
                              ? {
                                  ...x,
                                  status: e.target.value as typeof x.status,
                                }
                              : x,
                          ),
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium outline-none ${STATUS_COLORS[a.status]}`}
                    >
                      <option>Activa</option>
                      <option>Cancelada</option>
                      <option>En revisión</option>
                      <option>Por renovar</option>
                    </select>
                  )}
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
    </Section>
  );
}

/* -------- Comprobantes -------- */

export function ComprobantesSection({
  poliza,
  onChange,
  readOnly,
}: {
  poliza: Poliza;
  onChange: (c: Poliza["comprobantes"]) => void;
  readOnly?: boolean;
}) {
  const addRow = () =>
    onChange([
      ...poliza.comprobantes,
      {
        id: crypto.randomUUID(),
        poliza: `GMM - ${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        tipoPago: "Cliente",
        fechaPago: "00/00/0000",
        recibo: false,
        fechaCarga: "00/00/0000",
        comprobante: false,
        estatus: "Sin archivo",
      },
    ]);

  return (
    <Section
      title="Comprobantes de pago"
      subtitle="Verifica los comprobantes de pago o sube el archivo."
      extra={
        !readOnly && (
          <button
            onClick={addRow}
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
            </tr>
          </thead>
          <tbody>
            {poliza.comprobantes.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}