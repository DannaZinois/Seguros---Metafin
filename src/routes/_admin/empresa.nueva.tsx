import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2, Mail, Pencil, UserPlus } from "lucide-react";
import { z } from "zod";
import {
  Section,
  Grid,
  Field,
  TextInput,
  Select,
  Popup,
  type PopupState,
} from "@/components/cotizador/shared";
import {
  useEmpresas,
  saveEmpresa,
  newEmpresa,
  newEncargado,
  type Empresa,
  type Encargado,
} from "@/lib/empresa-store";

const searchSchema = z.object({
  empresaId: z.string().optional(),
});

export const Route = createFileRoute("/_admin/empresa/nueva")({
  component: RegistroEmpresaPage,
  head: () => ({ meta: [{ title: "Registro Empresa" }] }),
  validateSearch: searchSchema,
});

function RegistroEmpresaPage() {
  const router = useRouter();
  const { empresaId } = Route.useSearch();
  const list = useEmpresas();

  const existing = useMemo(
    () => (empresaId ? list.find((e) => e.id === empresaId) ?? null : null),
    [empresaId, list],
  );

  const [empresa, setEmpresa] = useState<Empresa>(() => newEmpresa());
  const [popup, setPopup] = useState<PopupState>(null);

  useEffect(() => {
    if (existing) setEmpresa(existing);
  }, [existing]);

  const update = <K extends keyof Empresa>(k: K, v: Empresa[K]) =>
    setEmpresa((p) => ({ ...p, [k]: v }));

  const updateEncargado = (id: string, patch: Partial<Encargado>) =>
    setEmpresa((p) => ({
      ...p,
      encargados: p.encargados.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const addEncargado = () =>
    setEmpresa((p) => ({ ...p, encargados: [...p.encargados, newEncargado()] }));

  const removeEncargado = (id: string) =>
    setEmpresa((p) => ({
      ...p,
      encargados: p.encargados.filter((e) => e.id !== id),
    }));

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
    saveEmpresa({
      ...empresa,
      encargados: empresa.encargados.map((e) =>
        valid.some((v) => v.id === e.id) ? { ...e, invited: true } : e,
      ),
    });
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

  const guardar = () => {
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

  const enviar = () => {
    if (!empresa.nombre.trim()) {
      setPopup({
        kind: "error",
        title: "Faltan datos",
        message: "Captura el nombre de la empresa antes de enviar.",
      });
      return;
    }
    saveEmpresa(empresa);
    setPopup({
      kind: "info",
      title: "Empresa registrada",
      message: "La empresa se registró correctamente.",
    });
  };

  const borrar = () => {
    setPopup({
      kind: "confirm",
      title: "¿Borrar todo?",
      message: "Esto eliminará la información capturada en este formulario.",
      onConfirm: () => {
        setEmpresa(newEmpresa());
        setPopup(null);
      },
    });
  };

  const agregarPoliza = () => {
    if (!empresa.nombre.trim()) {
      setPopup({
        kind: "error",
        title: "Falta nombre de la empresa",
        message: "Captura los datos de la empresa antes de agregar una póliza.",
      });
      return;
    }
    saveEmpresa(empresa);
    router.navigate({
      to: "/empresa/poliza/nueva",
      search: { empresaId: empresa.id },
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
            Registro Empresa
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
              onChange={(v) => update("nombre", v)}
              placeholder="Nombre aquí"
            />
          </Field>
          <Field label="RFC*">
            <TextInput
              value={empresa.rfc}
              onChange={(v) => update("rfc", v)}
              placeholder="+00 0000 0000 00"
            />
          </Field>
          <Field label="Giro*">
            <TextInput
              value={empresa.giro}
              onChange={(v) => update("giro", v)}
              placeholder="Lore ipsum dolor est"
            />
          </Field>
          <Field label="Dirección*">
            <TextInput
              value={empresa.direccion}
              onChange={(v) => update("direccion", v)}
              placeholder="Lore ipsum dolor est"
            />
          </Field>
          <Field label="Código postal*">
            <TextInput
              value={empresa.codigoPostal}
              onChange={(v) => update("codigoPostal", v)}
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
          <button
            onClick={sendInvites}
            className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
          >
            <Mail className="h-4 w-4" /> Enviar invitaciones
          </button>
        }
      >
        {/* Row template (always one empty-looking input set + list) */}
        <div className="space-y-3">
          {empresa.encargados.map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-white p-3 md:grid-cols-[1.2fr_1fr_1.4fr_1fr_auto_auto]"
            >
              <TextInput
                value={e.nombre}
                onChange={(v) => updateEncargado(e.id, { nombre: v })}
                placeholder="Nombre aquí"
              />
              <TextInput
                value={e.contacto}
                onChange={(v) => updateEncargado(e.id, { contacto: v })}
                placeholder="+00 0000 0000 00"
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
                placeholder="Nombre aquí"
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
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {empresa.encargados.length === 0 && (
            <Grid>
              <Field label="Nombre completo*">
                <TextInput value="" onChange={() => {}} placeholder="Nombre aquí" />
              </Field>
              <Field label="Número de contacto*">
                <TextInput value="" onChange={() => {}} placeholder="+00 0000 0000 00" />
              </Field>
              <Field label="Correo institucional*">
                <TextInput value="" onChange={() => {}} placeholder="Lore ipsum dolor est" />
              </Field>
              <Field label="Tipo de acceso">
                <Select
                  value=""
                  onChange={() => {}}
                  options={["Admin", "RRHH", "Lectura"]}
                  placeholder="Nombre aquí"
                />
              </Field>
            </Grid>
          )}
          <button
            onClick={addEncargado}
            className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            + Agregar registro
          </button>
          {empresa.encargados.length > 0 && (
            <p className="rounded-xl bg-[color:var(--brand-bg-soft)] p-3 text-xs text-muted-foreground">
              <strong>Permisos:</strong> Admin y RRHH pueden editar, agregar y
              eliminar perfiles, así como solicitar nuevas pólizas. Lectura
              únicamente puede consultar la información.
            </p>
          )}
        </div>
      </Section>

      {/* Pólizas activas */}
      <Section
        title="Pólizas activas"
        subtitle="Aquí podrás ver el progreso de recopilación del agente y si el usuario solicita tu apoyo."
        extra={
          <button
            onClick={agregarPoliza}
            className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            <Plus className="h-4 w-4" /> Agregar póliza
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Tipo de póliza</th>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Contratante</th>
                <th className="py-3 font-medium">Número de asegurados</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Estatus</th>
                <th className="py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresa.polizas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                    Esta empresa aún no tiene pólizas registradas.
                  </td>
                </tr>
              ) : (
                empresa.polizas.map((p) => (
                  <tr key={p.id} className="border-t border-border/60">
                    <td className="py-3">{p.tipo || "—"}</td>
                    <td className="py-3 text-foreground/80">
                      {p.aseguradora || "Nombre aqui"}
                    </td>
                    <td className="py-3 text-foreground/80">
                      {p.contratante || "Nombre aqui"}
                    </td>
                    <td className="py-3 text-foreground/80">
                      {p.numAsegurados || "0000"}
                    </td>
                    <td className="py-3 text-foreground/80">
                      {p.vigencia || "00/00/0000"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-4 py-1 text-xs font-medium ${
                          p.estatus === "Vencida"
                            ? "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]"
                            : "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                        }`}
                      >
                        {p.estatus || "Vigente"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          to="/empresa/poliza/$polizaId"
                          params={{ polizaId: p.id }}
                          search={{ empresaId: empresa.id }}
                          className="rounded-full p-1.5 text-amber-500 hover:bg-amber-50"
                          title="Editar póliza"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <Link
                          to="/empresa/poliza/$polizaId"
                          params={{ polizaId: p.id }}
                          search={{ empresaId: empresa.id, addPerson: true }}
                          className="rounded-full p-1.5 text-[color:var(--brand-blue)] hover:bg-blue-50"
                          title="Agregar persona"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
        <button className="rounded-full bg-green-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-600">
          Ver whatsapp
        </button>
        <button
          onClick={guardar}
          className="rounded-full bg-violet-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-600"
        >
          + Guardar cambios
        </button>
        <button
          onClick={enviar}
          className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          Enviar
        </button>
        <button
          onClick={borrar}
          className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600"
        >
          Borrar
        </button>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Copyrights © <span className="text-[color:var(--brand-blue)]">Zinois</span>
      </p>

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}