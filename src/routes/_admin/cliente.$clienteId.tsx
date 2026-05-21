import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { DatosGeneralesReadonly } from "@/components/cotizador/datos-generales-readonly";
import { emptyDraft, saveDraft } from "@/lib/cotizador-draft";
import { findClienteByAnyId, type ClienteStatus } from "@/lib/clientes-data";

export const Route = createFileRoute("/_admin/cliente/$clienteId")({
  component: PerfilCliente,
  head: () => ({ meta: [{ title: "Perfil de cliente" }] }),
});

const STATUS_STYLES: Record<ClienteStatus, string> = {
  Activa: "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]",
  Cancelada: "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]",
  "En revisión": "bg-[color:var(--status-review)] text-[color:var(--status-review-fg)]",
  "Por renovar": "bg-[color:var(--status-renew)] text-[color:var(--status-renew-fg)]",
};

function PerfilCliente() {
  const router = useRouter();
  const { clienteId } = Route.useParams();
  const cliente = findClienteByAnyId(clienteId);
  const profile = cliente?.profile;
  const polizas = cliente?.polizas ?? [];

  const nuevaPoliza = () => {
    saveDraft({
      ...emptyDraft(),
      nombre: profile?.nombre ?? "",
      contacto: profile?.contacto ?? "",
      correoContacto: profile?.correo ?? "",
      tipoAsegurado: profile?.tipoAsegurado ?? "",
      sexo: profile?.sexo ?? "",
      codigoPostal: profile?.codigoPostal ?? "",
      fechaNacimiento: profile?.fechaNacimiento ?? "",
      fechaAntiguedad: profile?.fechaAntiguedad ?? "",
      tipoPersona: profile?.tipoPersona ?? "",
    });
    router.navigate({ to: "/cotizadores" });
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
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Perfil de cliente
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registra un nuevo cliente para obtener sus datos.
          </p>
        </div>
      </div>

      <DatosGeneralesReadonly profile={profile} />

      <section className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-foreground">Pólizas del cliente</h2>
          <button onClick={nuevaPoliza} className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-violet-600">
            + Nueva póliza
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                {["Contratante","Asegurado","Póliza","Vigencia","Fecha de renovación","Correo","Teléfono","Consentimiento","Certificado","Estatus"].map((h) => (
                  <th key={h} className="py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {polizas.map((p) => (
                <tr key={p.id} className="border-t border-border/60 hover:bg-muted/40">
                  <td className="py-3 text-foreground/80">{profile?.nombre}</td>
                  <td className="py-3 text-foreground/80">{profile?.nombre}</td>
                  <td className="py-3">
                    <Link
                      to="/cliente/$clienteId/poliza/$polizaId"
                      params={{ clienteId, polizaId: p.id }}
                      className="text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                    >
                      {p.tipoSeguro}
                    </Link>
                  </td>
                  <td className="py-3 text-foreground/80">{p.vigencia}</td>
                  <td className="py-3 text-foreground/80">{p.renovacion}</td>
                  <td className="py-3 text-foreground/80">{profile?.correo}</td>
                  <td className="py-3 text-foreground/80">{profile?.contacto}</td>
                  <td className="py-3">
                    <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                      <Download className="h-3.5 w-3.5" />
                      {p.consentimiento ? "Descargar" : "-"}
                    </button>
                  </td>
                  <td className="py-3">
                    <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                      <Download className="h-3.5 w-3.5" />
                      {p.certificado ? "Descargar" : "-"}
                    </button>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 flex justify-end gap-3">
        <button className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600">
          Ver whatsapp
        </button>
        <button className="rounded-full bg-violet-500 px-5 py-2 text-sm font-medium text-white hover:bg-violet-600">
          + Guardar cambios
        </button>
        <button className="rounded-full bg-destructive px-5 py-2 text-sm font-medium text-white hover:opacity-90">
          Borrar
        </button>
      </div>
    </div>
  );
}