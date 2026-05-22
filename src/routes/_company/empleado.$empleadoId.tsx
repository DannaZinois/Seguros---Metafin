import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil, Check, X, ExternalLink } from "lucide-react";
import { Section, Grid, Field, TextInput } from "@/components/cotizador/shared";
import { EMPLEADOS_NOMBRES } from "@/lib/empleados-nombres";
import { useCompanyEmpresa } from "@/lib/company-context";
import { ASEGURADORA_LINKS } from "@/lib/client-context";
import { FamiliaresBeneficiariosSection } from "@/components/familiares-beneficiarios";

export const Route = createFileRoute("/_company/empleado/$empleadoId")({
  component: EmpleadoDetallePage,
  head: () => ({ meta: [{ title: "Perfil de empleado" }] }),
});

const puestos = ["Analista", "Gerente", "Director", "Coordinador", "Asistente"];

function nombreFromId(empleadoId: string): string {
  const match = empleadoId.match(/-(\d+)$/);
  if (!match) return "Empleado";
  const idx = parseInt(match[1], 10) - 1;
  return EMPLEADOS_NOMBRES[idx] ?? "Empleado";
}

function correoFromNombre(nombre: string): string {
  const slug = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim()
    .replace(/\s+/g, ".");
  return `${slug}@orioninnovation.com`;
}

function telefonoFromId(empleadoId: string): string {
  const match = empleadoId.match(/-(\d+)$/);
  const num = match ? parseInt(match[1], 10) : 1;
  const phone = String(10000000 + ((num * 7919) % 89999999)).slice(0, 8);
  return `+52 55 ${phone.slice(0, 4)} ${phone.slice(4)}`;
}

function rfcFromNombre(nombre: string, empleadoId: string): string {
  const parts = nombre.toUpperCase().split(" ");
  const a = (parts[0]?.slice(0, 2) ?? "XX") + (parts[1]?.slice(0, 1) ?? "X") + (parts[2]?.slice(0, 1) ?? "X");
  const match = empleadoId.match(/-(\d+)$/);
  const num = match ? parseInt(match[1], 10) : 1;
  const yy = String(70 + (num % 30)).padStart(2, "0");
  const mm = String(1 + (num % 12)).padStart(2, "0");
  const dd = String(1 + (num % 28)).padStart(2, "0");
  return `${a}${yy}${mm}${dd}H${String(num).padStart(2, "0")}`.slice(0, 13);
}

interface PolizaRow {
  id: string;
  tipo: "GMM" | "Vida";
  vigencia: string;
  aseguradora: string;
  contratante: string;
  status: "Activa";
}

function EmpleadoDetallePage() {
  const router = useRouter();
  const { empleadoId } = Route.useParams();
  const empresa = useCompanyEmpresa();

  const nombre = nombreFromId(empleadoId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre,
    correo: correoFromNombre(nombre),
    contacto: telefonoFromId(empleadoId),
    rfc: rfcFromNombre(nombre, empleadoId),
    numeroEmpleado: empleadoId,
    area: empresa?.nombre ?? "BBVA",
    puesto: "Analista",
  });

  const contratante = empresa?.nombre ?? "Orion Innovation";
  const polizas: PolizaRow[] = [
    { id: "P990234", tipo: "GMM", vigencia: "06/06/2025", aseguradora: "Zurich", contratante, status: "Activa" },
    { id: "P990235", tipo: "Vida", vigencia: "06/06/2025", aseguradora: "Mapfre", contratante, status: "Activa" },
  ];

  return (
    <div className="pb-12">
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.history.back()}
          className="mt-2 rounded-full p-2 hover:bg-muted"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {form.nombre}
          </h1>
          <p className="text-sm text-muted-foreground">
            Perfil del empleado y pólizas en las que se encuentra.
          </p>
        </div>
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

      <Section title={`Pólizas en las que se encuentra (${polizas.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Póliza</th>
                <th className="py-3 font-medium">Tipo</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Contratante</th>
                <th className="py-3 font-medium">Estatus</th>
                <th className="py-3 font-medium">Portal aseguradora</th>
              </tr>
            </thead>
            <tbody>
              {polizas.map((p) => {
                const link = ASEGURADORA_LINKS[p.aseguradora];
                return (
                  <tr key={p.id} className="border-t border-border/60 hover:bg-muted/40">
                    <td className="py-3 font-medium text-foreground">{p.id}</td>
                    <td className="py-3 text-foreground/80">{p.tipo}</td>
                    <td className="py-3 text-foreground/80">{p.vigencia}</td>
                    <td className="py-3 text-foreground/80">{p.aseguradora}</td>
                    <td className="py-3 text-foreground/80">{p.contratante}</td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-[color:var(--status-active)] px-3 py-1 text-xs font-medium text-[color:var(--status-active-fg)]">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Ir al sitio
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="mt-6">
        <Link
          to="/empleados"
          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--brand-blue)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a empleados
        </Link>
      </div>
    </div>
  );
}