import { createFileRoute } from "@tanstack/react-router";
import {
  Section,
  Grid,
  Field,
  TextInput,
} from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";

export const Route = createFileRoute("/_company/perfil")({
  component: PerfilEmpresaPage,
  head: () => ({ meta: [{ title: "Mi empresa" }] }),
});

function PerfilEmpresaPage() {
  const empresa = useCompanyEmpresa();

  if (!empresa) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando datos de la empresa...
      </div>
    );
  }

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
    </div>
  );
}