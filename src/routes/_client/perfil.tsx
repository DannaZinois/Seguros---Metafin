import { createFileRoute } from "@tanstack/react-router";
import { Section, Grid, Field, TextInput } from "@/components/cotizador/shared";
import { useCurrentClient } from "@/lib/client-context";

export const Route = createFileRoute("/_client/perfil")({
  component: MiPerfilPage,
  head: () => ({ meta: [{ title: "Mi perfil" }] }),
});

function MiPerfilPage() {
  const cliente = useCurrentClient();
  if (!cliente) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando datos del cliente...
      </div>
    );
  }
  const p = cliente.profile;
  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {p.nombre}
        </h1>
        <p className="text-sm text-muted-foreground">
          Tus datos generales registrados en la plataforma.
        </p>
      </div>

      <Section title="Datos generales">
        <Grid>
          <Field label="Nombre completo">
            <TextInput value={p.nombre} readOnly />
          </Field>
          <Field label="Correo electrónico">
            <TextInput value={p.correo} readOnly />
          </Field>
          <Field label="Número de contacto">
            <TextInput value={p.contacto} readOnly />
          </Field>
          <Field label="RFC">
            <TextInput value={p.rfc} readOnly />
          </Field>
          <Field label="Tipo de asegurado">
            <TextInput value={p.tipoAsegurado} readOnly />
          </Field>
          <Field label="Tipo de persona">
            <TextInput value={p.tipoPersona} readOnly />
          </Field>
          <Field label="Sexo">
            <TextInput value={p.sexo} readOnly />
          </Field>
          <Field label="Fecha de nacimiento">
            <TextInput value={p.fechaNacimiento} readOnly />
          </Field>
          <Field label="Fecha de antigüedad">
            <TextInput value={p.fechaAntiguedad} readOnly />
          </Field>
          <Field label="Dirección">
            <TextInput value={p.direccion} readOnly />
          </Field>
          <Field label="Código postal">
            <TextInput value={p.codigoPostal} readOnly />
          </Field>
          <Field label="ID de cliente">
            <TextInput value={cliente.clienteId} readOnly />
          </Field>
        </Grid>
      </Section>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Copyrights ©{" "}
        <span className="text-[color:var(--brand-blue)]">Zinois</span>
      </p>
    </div>
  );
}