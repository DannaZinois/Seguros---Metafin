import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import {
  Section,
  Grid,
  Field,
  TextInput,
  Popup,
  type PopupState,
} from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";
import {
  saveEmpresa,
  newEncargado,
  type AccessType,
} from "@/lib/empresa-store";

export const Route = createFileRoute("/_company/perfil")({
  component: PerfilEmpresaPage,
  head: () => ({ meta: [{ title: "Mi empresa" }] }),
});

function PerfilEmpresaPage() {
  const empresa = useCompanyEmpresa();
  const [open, setOpen] = useState(false);
  const [popup, setPopup] = useState<PopupState>(null);
  const [form, setForm] = useState({
    nombre: "",
    contacto: "",
    email: "",
    acceso: "Lectura" as AccessType,
  });

  if (!empresa) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando datos de la empresa...
      </div>
    );
  }

  const resetForm = () =>
    setForm({ nombre: "", contacto: "", email: "", acceso: "Lectura" });

  const handleRegister = () => {
    if (!form.nombre.trim() || !form.email.trim()) {
      setPopup({
        kind: "error",
        title: "Datos incompletos",
        message: "Nombre y correo son obligatorios para registrar un encargado.",
      });
      return;
    }
    const enc = {
      ...newEncargado(),
      nombre: form.nombre.trim(),
      contacto: form.contacto.trim(),
      email: form.email.trim(),
      acceso: form.acceso,
      invited: false,
    };
    saveEmpresa({ ...empresa, encargados: [...empresa.encargados, enc] });
    setOpen(false);
    resetForm();
    setPopup({
      kind: "info",
      title: "Encargado registrado",
      message: `Se envió una invitación a ${enc.email}.`,
    });
  };

  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {empresa.nombre}
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulta la información registrada de tu empresa.
        </p>
      </div>

      <Section title="Datos generales">
        <Grid>
          <Field label="Nombre de la empresa">
            <TextInput value={empresa.nombre} readOnly />
          </Field>
          <Field label="RFC">
            <TextInput value={empresa.rfc} readOnly />
          </Field>
          <Field label="Giro">
            <TextInput value={empresa.giro} readOnly />
          </Field>
          <Field label="Dirección">
            <TextInput value={empresa.direccion} readOnly />
          </Field>
          <Field label="Código postal">
            <TextInput value={empresa.codigoPostal} readOnly />
          </Field>
        </Grid>
      </Section>

      <Section
        title="Encargados"
        subtitle="Personas con acceso a la plataforma por parte de tu empresa."
      >
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
          >
            <UserPlus className="h-4 w-4" /> Registrar encargado
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Nombre</th>
                <th className="py-3 font-medium">Contacto</th>
                <th className="py-3 font-medium">Correo</th>
                <th className="py-3 font-medium">Acceso</th>
                <th className="py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {empresa.encargados.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Sin encargados registrados.
                  </td>
                </tr>
              ) : (
                empresa.encargados.map((e) => (
                  <tr key={e.id} className="border-t border-border/60">
                    <td className="py-3">{e.nombre}</td>
                    <td className="py-3 text-foreground/80">{e.contacto}</td>
                    <td className="py-3 text-foreground/80">{e.email}</td>
                    <td className="py-3 text-foreground/80">{e.acceso}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          e.invited
                            ? "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {e.invited ? "Activo" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Copyrights ©{" "}
        <span className="text-[color:var(--brand-blue)]">Zinois</span>
      </p>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-foreground">
              Registrar encargado
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Agrega una persona con acceso a la plataforma.
            </p>
            <div className="mt-4 space-y-3">
              <Field label="Nombre completo">
                <TextInput
                  value={form.nombre}
                  onChange={(v) => setForm({ ...form, nombre: v })}
                />
              </Field>
              <Field label="Número de contacto">
                <TextInput
                  value={form.contacto}
                  onChange={(v) => setForm({ ...form, contacto: v })}
                />
              </Field>
              <Field label="Correo electrónico">
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                />
              </Field>
              <Field label="Tipo de acceso">
                <select
                  value={form.acceso}
                  onChange={(e) =>
                    setForm({ ...form, acceso: e.target.value as AccessType })
                  }
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="Admin">Admin</option>
                  <option value="RRHH">RRHH</option>
                  <option value="Lectura">Lectura</option>
                </select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegister}
                className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm text-white hover:bg-[color:var(--brand-blue-dark)]"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}