import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { ArrowLeft, Pencil, Check, X, ChevronDown, ChevronRight, Eye, Download, FileText } from "lucide-react";
import { Section, Grid, Field, TextInput } from "@/components/cotizador/shared";
import { EMPLEADOS_NOMBRES } from "@/lib/empleados-nombres";
import { useCompanyEmpresa } from "@/lib/company-context";
import { useAseguradoDocs, getDocsByRfc, downloadDoc as downloadStored, viewDoc as viewStored } from "@/lib/asegurado-docs-store";

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

interface DocItem {
  nombre: string;
  formato: string;
  tamano: string;
}

function documentosFor(p: PolizaRow, nombre: string): DocItem[] {
  const base: DocItem[] = [
    { nombre: `Carátula de póliza ${p.id}.pdf`, formato: "PDF", tamano: "210 KB" },
    { nombre: `Certificado individual - ${nombre}.pdf`, formato: "PDF", tamano: "180 KB" },
    { nombre: `Condiciones generales ${p.aseguradora}.pdf`, formato: "PDF", tamano: "1.2 MB" },
    { nombre: `Consentimiento firmado - ${nombre}.pdf`, formato: "PDF", tamano: "95 KB" },
  ];
  if (p.tipo === "GMM") {
    base.push(
      { nombre: "Directorio de hospitales.pdf", formato: "PDF", tamano: "640 KB" },
      { nombre: "Cuadro médico y coberturas.pdf", formato: "PDF", tamano: "320 KB" },
    );
  } else {
    base.push({ nombre: "Designación de beneficiarios.pdf", formato: "PDF", tamano: "120 KB" });
  }
  return base;
}

function descargarDoc(d: DocItem) {
  const blob = new Blob([`Documento simulado: ${d.nombre}`], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = d.nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function verDoc(d: DocItem) {
  const blob = new Blob([`Documento simulado: ${d.nombre}`], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
}

function EmpleadoDetallePage() {
  const router = useRouter();
  const { empleadoId } = Route.useParams();
  const empresa = useCompanyEmpresa();
  const allDocs = useAseguradoDocs();

  const nombre = nombreFromId(empleadoId);
  const [editing, setEditing] = useState(false);
  const [openPoliza, setOpenPoliza] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre,
    correo: correoFromNombre(nombre),
    contacto: telefonoFromId(empleadoId),
    rfc: rfcFromNombre(nombre, empleadoId),
    numeroEmpleado: empleadoId,
    area: empresa?.nombre ?? "BBVA",
    puesto: "Analista",
    sexo: "Masculino",
    edad: "32",
  });
  const sexos = ["Masculino", "Femenino"];

  const contratante = empresa?.nombre ?? "Orion Innovation";
  const polizas: PolizaRow[] = [
    { id: "P990234", tipo: "GMM", vigencia: "06/06/2025", aseguradora: "Zurich", contratante, status: "Activa" },
    { id: "P990235", tipo: "Vida", vigencia: "06/06/2025", aseguradora: "Mapfre", contratante, status: "Activa" },
  ];

  const uploadedForEmpleado = getDocsByRfc(allDocs, form.rfc);

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
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-orange-600"
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
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-orange-600"
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
          <Field label="Sexo">
            {editing ? (
              <select
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              >
                {sexos.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <TextInput value={form.sexo} readOnly />
            )}
          </Field>
          <Field label="Edad">
            <TextInput
              value={form.edad}
              onChange={(v) => setForm({ ...form, edad: v })}
              readOnly={!editing}
            />
          </Field>
        </Grid>
      </Section>

      <FamiliaresBeneficiariosSection />

      <Section title={`Pólizas en las que se encuentra (${polizas.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="w-6 py-3"></th>
                <th className="py-3 font-medium">Póliza</th>
                <th className="py-3 font-medium">Tipo</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Contratante</th>
                <th className="py-3 font-medium">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {polizas.map((p) => {
                const isOpen = openPoliza === p.id;
                const docs = documentosFor(p, form.nombre);
                return (
                  <Fragment key={p.id}>
                    <tr
                      onClick={() => setOpenPoliza(isOpen ? null : p.id)}
                      className={`cursor-pointer border-t border-border/60 transition-colors ${
                        isOpen ? "bg-sky-50" : "hover:bg-muted/40"
                      }`}
                    >
                      <td className="py-3 pl-2 text-muted-foreground">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="py-3 font-medium text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                        {p.id}
                      </td>
                      <td className="py-3 text-foreground/80">{p.tipo}</td>
                      <td className="py-3 text-foreground/80">{p.vigencia}</td>
                      <td className="py-3 text-foreground/80">{p.aseguradora}</td>
                      <td className="py-3 text-foreground/80">{p.contratante}</td>
                      <td className="py-3">
                        <span className="inline-flex rounded-full bg-[color:var(--status-active)] px-3 py-1 text-xs font-medium text-[color:var(--status-active-fg)]">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-border/60 bg-sky-50/40">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Documentos de {form.nombre} · Póliza {p.id}
                          </div>
                          <div className="overflow-hidden rounded-xl border border-border bg-white">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-muted/40 text-xs text-muted-foreground">
                                <tr>
                                  <th className="px-3 py-2 font-medium">Documento</th>
                                  <th className="px-3 py-2 font-medium">Formato</th>
                                  <th className="px-3 py-2 font-medium">Tamaño</th>
                                  <th className="px-3 py-2 text-right font-medium">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {docs.map((d) => (
                                  <tr key={d.nombre} className="border-t border-border/60">
                                    <td className="px-3 py-2">
                                      <span className="inline-flex items-center gap-2 text-foreground">
                                        <FileText className="h-4 w-4 text-[color:var(--brand-blue)]" />
                                        {d.nombre}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-foreground/80">{d.formato}</td>
                                    <td className="px-3 py-2 text-foreground/80">{d.tamano}</td>
                                    <td className="px-3 py-2">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            verDoc(d);
                                          }}
                                          className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground hover:bg-muted"
                                        >
                                          <Eye className="h-3.5 w-3.5" /> Ver
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            descargarDoc(d);
                                          }}
                                          className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-3 py-1 text-xs font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
                                        >
                                          <Download className="h-3.5 w-3.5" /> Descargar
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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