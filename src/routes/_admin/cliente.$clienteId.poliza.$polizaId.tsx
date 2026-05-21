import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2, CloudDownload } from "lucide-react";
import { Section } from "@/components/cotizador/shared";
import { DatosGeneralesReadonly } from "@/components/cotizador/datos-generales-readonly";
import { emptyDraft, saveDraft } from "@/lib/cotizador-draft";

export const Route = createFileRoute("/_admin/cliente/$clienteId/poliza/$polizaId")({
  component: VerPolizaCliente,
  head: () => ({ meta: [{ title: "Ver póliza" }] }),
});

type Estatus = "Cargado" | "Sin archivo";

const DOCS: { nombre: string; encargado: string; fecha: string; estatus: Estatus }[] = [
  { nombre: "INE", encargado: "Cliente", fecha: "00/00/0000", estatus: "Cargado" },
  { nombre: "Comprobante de domicilio", encargado: "Cliente", fecha: "00/00/0000", estatus: "Sin archivo" },
  { nombre: "Póliza", encargado: "Asesor", fecha: "00/00/0000", estatus: "Cargado" },
  { nombre: "Recibos", encargado: "Asesor", fecha: "00/00/0000", estatus: "Cargado" },
  { nombre: "Cotización", encargado: "Asesor", fecha: "00/00/0000", estatus: "Cargado" },
];

function VerPolizaCliente() {
  const router = useRouter();
  const { clienteId, polizaId } = Route.useParams();

  // Sample client data prefill — mirrors the row in cliente.$clienteId.tsx
  const prefillDraft = () => {
    saveDraft({
      ...emptyDraft(),
      nombre: "John Doe",
      contacto: "+000 000 000",
      correoContacto: "johndoe@correo.com",
      tipoAsegurado: "Individual",
      sexo: "Masculino",
      codigoPostal: "00000",
      fechaNacimiento: "1990-01-01",
      fechaAntiguedad: "2024-01-01",
      tipoSeguro: "Gastos Médicos Mayores",
      tipoPersona: "Persona Física",
    });
  };

  const goToCotizacion = () => {
    prefillDraft();
    router.navigate({ to: "/cotizadores" });
  };

  const goToCuestionario = () => {
    prefillDraft();
    router.navigate({ to: "/cuestionario" });
  };

  return (
    <div>
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.history.back()}
          className="mt-2 rounded-full p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Ver póliza</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registra un nuevo cliente para obtener sus datos.
          </p>
        </div>
      </div>

      <DatosGeneralesReadonly />

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { title: "Cotización de póliza", subtitle: "Última edición el 00/00/0000 a las 00:00:00 por John Doe", onOpen: goToCotizacion },
          { title: "Cuestionario de póliza", subtitle: "Última edición el 00/00/0000 a las 00:00:00 por John Doe", onOpen: goToCuestionario },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-[color:var(--brand-blue)]/40 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <button onClick={c.onOpen} className="text-left">
                <h3 className="font-bold text-foreground hover:text-[color:var(--brand-blue)]">{c.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>
              </button>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Acciones</p>
                <div className="mt-1 flex items-center gap-2">
                  <button onClick={c.onOpen} className="rounded-full p-1.5 text-amber-500 hover:bg-amber-50" aria-label="Editar"><Pencil className="h-4 w-4" /></button>
                  <button className="rounded-full p-1.5 text-destructive hover:bg-destructive/10" aria-label="Borrar"><Trash2 className="h-4 w-4" /></button>
                  <button className="rounded-full p-1.5 text-[color:var(--brand-blue)] hover:bg-muted" aria-label="Descargar"><CloudDownload className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Section
        title="Documentos cargados"
        subtitle="Aquí podrás ver el progreso de recopilación del agente y si el usuario solicita tu apoyo."
        extra={
          <button className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-xs font-medium text-white hover:bg-violet-600">
            + Agregar documento
          </button>
        }
      >
        <div className="overflow-x-auto">
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
              {DOCS.map((d) => (
                <tr key={d.nombre} className="border-t border-border/60">
                  <td className="py-3 text-foreground/80">{d.nombre}</td>
                  <td className="py-3 text-foreground/80">{d.encargado}</td>
                  <td className="py-3 text-foreground/80">{d.fecha}</td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      d.estatus === "Cargado"
                        ? "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                        : "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]"
                    }`}>
                      {d.estatus}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-full p-1.5 text-amber-500 hover:bg-amber-50"><Pencil className="h-4 w-4" /></button>
                      <button className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="mt-8 flex justify-end gap-3">
        <button className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600">Ver whatsapp</button>
        <button className="rounded-full bg-violet-500 px-5 py-2 text-sm font-medium text-white hover:bg-violet-600">+ Guardar cambios</button>
        <button className="rounded-full bg-destructive px-5 py-2 text-sm font-medium text-white hover:opacity-90">Borrar</button>
      </div>
    </div>
  );
}