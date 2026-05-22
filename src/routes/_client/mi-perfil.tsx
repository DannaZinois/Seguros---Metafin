import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Section, Grid, Field, TextInput } from "@/components/cotizador/shared";
import { useCurrentClient } from "@/lib/client-context";

export const Route = createFileRoute("/_client/mi-perfil")({
  component: MiPerfilPage,
  head: () => ({ meta: [{ title: "Mi perfil" }] }),
});

function MiPerfilPage() {
  const cliente = useCurrentClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contacto: "",
    rfc: "",
    numeroEmpleado: "EMP-00123",
    area: "BBVA",
    puesto: "Analista",
  });
  const puestos = ["Analista", "Gerente", "Director", "Coordinador", "Asistente"];

  useEffect(() => {
    if (cliente) {
      setForm((f) => ({
        ...f,
        nombre: cliente.profile.nombre,
        correo: cliente.profile.correo,
        contacto: cliente.profile.contacto,
        rfc: cliente.profile.rfc,
      }));
    }
  }, [cliente]);

  if (!cliente) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando datos del cliente...
      </div>
    );
  }
  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {form.nombre}
        </h1>
        <p className="text-sm text-muted-foreground">
          Tus datos generales registrados en la plataforma.
        </p>
      </div>

      <Section
        title="Datos generales"
        extra={
          editing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm hover:bg-muted"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand-blue)] px-3.5 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
              >
                <Check className="h-4 w-4" /> Guardar cambios
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm hover:bg-muted"
            >
              <Pencil className="h-4 w-4" /> Editar
            </button>
          )
        }
      >
        <Grid>
          <Field label="Nombre completo">
            <TextInput
              value={form.nombre}
              onChange={(v) => setForm({ ...form, nombre: v })}
              readOnly={!editing}
            />
          </Field>
          <Field label="Correo electrónico">
            <TextInput
              value={form.correo}
              onChange={(v) => setForm({ ...form, correo: v })}
              readOnly={!editing}
            />
          </Field>
          <Field label="Número de contacto">
            <TextInput
              value={form.contacto}
              onChange={(v) => setForm({ ...form, contacto: v })}
              readOnly={!editing}
            />
          </Field>
          <Field label="RFC">
            <TextInput
              value={form.rfc}
              onChange={(v) => setForm({ ...form, rfc: v })}
              readOnly={!editing}
            />
          </Field>
          <Field label="Número de empleado">
            <TextInput
              value={form.numeroEmpleado}
              onChange={(v) => setForm({ ...form, numeroEmpleado: v })}
              readOnly={!editing}
            />
          </Field>
          <Field label="Área a la que pertenece">
            <TextInput
              value={form.area}
              onChange={(v) => setForm({ ...form, area: v })}
              readOnly={!editing}
            />
          </Field>
          <Field label="Puesto">
            {editing ? (
              <select
                value={form.puesto}
                onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              >
                {puestos.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            ) : (
              <TextInput value={form.puesto} readOnly />
            )}
          </Field>
        </Grid>
      </Section>
    </div>
  );
}