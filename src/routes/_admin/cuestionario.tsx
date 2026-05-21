import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { appendChat } from "@/lib/store";
import {
  useDraft,
  saveDraft,
  clearDraft,
  type CotizadorDraft,
} from "@/lib/cotizador-draft";
import {
  Section,
  Grid,
  Field,
  TextInput,
  DateInput,
  Select,
  Dropzone,
  Popup,
  type PopupState,
} from "@/components/cotizador/shared";
import { getPolizaForm } from "@/lib/poliza-forms";

export const Route = createFileRoute("/_admin/cuestionario")({
  component: CuestionarioPage,
  head: () => ({ meta: [{ title: "Cuestionario del cliente" }] }),
});

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

function CuestionarioPage() {
  const router = useRouter();
  const draft = useDraft();

  // If no draft, redirect back
  useEffect(() => {
    if (draft === null) {
      // wait one tick to see if draft hydrates
      const t = setTimeout(() => {
        if (!draft) router.navigate({ to: "/cotizadores" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [draft, router]);

  const [progreso, setProgreso] = useState(0);
  const [comentarioCliente, setComentarioCliente] = useState("");
  const [polizaName, setPolizaName] = useState("");
  const [polizaProgress, setPolizaProgress] = useState(0);
  const [docs, setDocs] = useState<DocumentRow[]>(() => defaultDocs());
  const [popup, setPopup] = useState<PopupState>(null);

  if (!draft) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando cuestionario...
      </div>
    );
  }

  const sections = getPolizaForm(draft.tipoSeguro);
  const tituloPoliza = draft.tipoSeguro
    ? `Cuestionario para póliza: ${draft.tipoSeguro}`
    : "Cuestionario para póliza";

  const setPolizaField = (key: string, value: string) => {
    const next: CotizadorDraft = {
      ...draft,
      poliza: { ...draft.poliza, [key]: value },
    };
    saveDraft(next);
  };

  const onGuardar = () => {
    setPopup({
      kind: "info",
      title: "Cambios guardados",
      message: "Los datos del cuestionario se guardaron correctamente.",
    });
  };

  const onSiguiente = () => {
    setPopup({
      kind: "info",
      title: "Cotización completada",
      message: "Continúa al siguiente paso.",
    });
  };

  const onVerWhatsapp = () => {
    if (!draft.contacto.trim()) {
      setPopup({
        kind: "error",
        title: "Sin número de contacto",
        message: "Captura primero el número de contacto del cliente.",
      });
      return;
    }
    setPopup({ kind: "chat", phone: draft.contacto });
  };

  const onBorrar = () => {
    setPopup({
      kind: "confirm",
      title: "¿Borrar todo?",
      message:
        "Esto eliminará toda la información registrada. Esta acción no se puede deshacer.",
      onConfirm: () => {
        clearDraft();
        setPopup(null);
        router.navigate({ to: "/cotizadores" });
      },
    });
  };

  return (
    <div className="pb-12">
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.navigate({ to: "/cotizadores" })}
          className="mt-2 rounded-full p-1 text-foreground hover:bg-muted"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Cuestionario del cliente
          </h1>
          <p className="text-sm text-muted-foreground">
            Registra un nuevo cliente para obtener sus cotizaciones
          </p>
        </div>
      </div>

      {/* Datos generales (READ ONLY) */}
      <Section
        title="Datos generales"
        extra={
          <button
            onClick={() => router.navigate({ to: "/cotizadores" })}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
          >
            Editar
          </button>
        }
      >
        <Grid>
          <Field label="Nombre completo del contratante">
            <TextInput value={draft.nombre} readOnly />
          </Field>
          <Field label="Número de contacto">
            <TextInput value={draft.contacto} readOnly />
          </Field>
          <Field label="Tipo de asegurado">
            <TextInput value={draft.tipoAsegurado} readOnly />
          </Field>
          <Field label="RFC">
            <TextInput value={draft.rfc} readOnly />
          </Field>
          <Field label="Sexo">
            <TextInput value={draft.sexo} readOnly />
          </Field>
          <Field label="Dirección">
            <TextInput value={draft.direccion} readOnly />
          </Field>
          <Field label="Código postal">
            <TextInput value={draft.codigoPostal} readOnly />
          </Field>
          <Field label="Fecha de nacimiento">
            <DateInput value={draft.fechaNacimiento} readOnly />
          </Field>
          <Field label="Fecha de antiguedad">
            <DateInput value={draft.fechaAntiguedad} readOnly />
          </Field>
          <Field label="Tipo de seguro">
            <TextInput value={draft.tipoSeguro} readOnly />
          </Field>
          <Field label="Aseguradora">
            <TextInput value={draft.aseguradora} readOnly />
          </Field>
          <Field label="Tipo de persona">
            <TextInput value={draft.tipoPersona} readOnly />
          </Field>
        </Grid>
      </Section>

      {/* Asegurados (READ ONLY) */}
      {(draft.tipoAsegurado === "Familiar" ||
        draft.tipoAsegurado === "Otro asegurado") &&
        draft.asegurados.map((a) => (
          <Section
            key={a.id}
            title={`Datos del asegurado: ${a.relacion.trim() || "Relación"}`}
          >
            <Grid>
              <Field label="Nombre completo del asegurado">
                <TextInput value={a.nombre} readOnly />
              </Field>
              <Field label="Número de contacto">
                <TextInput value={a.contacto} readOnly />
              </Field>
              <Field label="Sexo">
                <TextInput value={a.sexo} readOnly />
              </Field>
              <Field label="Código postal">
                <TextInput value={a.codigoPostal} readOnly />
              </Field>
              <Field label="Fecha de nacimiento">
                <DateInput value={a.fechaNacimiento} readOnly />
              </Field>
              <Field label="Fecha de antiguedad">
                <DateInput value={a.fechaAntiguedad} readOnly />
              </Field>
              <Field label="Relación">
                <TextInput value={a.relacion} readOnly />
              </Field>
            </Grid>
          </Section>
        ))}

      {/* Poliza-specific cuestionario */}
      <Section title={tituloPoliza}>
        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Selecciona un tipo de seguro en los datos generales para mostrar el
            cuestionario.
          </p>
        ) : (
          <div className="space-y-6">
            {sections.map((sec) => (
              <div key={sec.title}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {sec.title}
                </h3>
                <Grid>
                  {sec.fields.map((f) => {
                    const value = draft.poliza[f.key] ?? "";
                    return (
                      <Field key={f.key} label={f.label}>
                        {f.type === "date" ? (
                          <DateInput
                            value={value}
                            onChange={(v) => setPolizaField(f.key, v)}
                          />
                        ) : f.type === "select" ? (
                          <Select
                            value={value}
                            onChange={(v) => setPolizaField(f.key, v)}
                            options={f.options ?? []}
                            placeholder="Selecciona"
                          />
                        ) : (
                          <TextInput
                            value={value}
                            onChange={(v) => setPolizaField(f.key, v)}
                            placeholder={f.placeholder ?? "Nombre aquí"}
                          />
                        )}
                      </Field>
                    );
                  })}
                </Grid>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Progreso + Comentarios */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground">
            Progreso de cuestionario
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

      {progreso >= 100 && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground">
                Nuevo envío de cotización
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
                  appendChat(draft.contacto, {
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
            phone={draft.contacto}
            onPopup={setPopup}
          />
        </>
      )}

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
          onClick={onSiguiente}
          className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          {progreso >= 100 ? "Siguiente" : "Enviar"}
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

function DocumentosCargados({
  docs,
  setDocs,
  phone,
  onPopup,
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
                  x.id === row.id
                    ? { ...x, estatus: "Cargado", fileName: f.name }
                    : x,
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
            x.id === row.id
              ? { ...x, estatus: "Cargado", fileName: f.name }
              : x,
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
                            ? {
                                ...r,
                                encargado: e.target
                                  .value as DocumentRow["encargado"],
                              }
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