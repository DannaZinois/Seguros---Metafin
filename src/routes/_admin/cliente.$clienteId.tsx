import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { Section, Grid, Field, TextInput, DateInput, Select } from "@/components/cotizador/shared";
import { useAseguradoras } from "@/lib/store";

export const Route = createFileRoute("/_admin/cliente/$clienteId")({
  component: PerfilCliente,
  head: () => ({ meta: [{ title: "Perfil de cliente" }] }),
});

type Status = "Activa" | "Cancelada" | "En revisión" | "Por renovar";
const STATUS_STYLES: Record<Status, string> = {
  Activa: "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]",
  Cancelada: "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]",
  "En revisión": "bg-[color:var(--status-review)] text-[color:var(--status-review-fg)]",
  "Por renovar": "bg-[color:var(--status-renew)] text-[color:var(--status-renew-fg)]",
};

interface PolizaRow {
  id: string;
  contratante: string;
  asegurado: string;
  poliza: string;
  vigencia: string;
  renovacion: string;
  correo: string;
  telefono: string;
  consentimiento: boolean;
  certificado: boolean;
  status: Status;
}

const POLIZAS: PolizaRow[] = [
  { id: "F990234", contratante: "John Doe", asegurado: "John Doe", poliza: "GMM", vigencia: "01/01/2024", renovacion: "01/01/2024", correo: "johndoe@correo.com", telefono: "+000 000 000", consentimiento: true, certificado: true, status: "Activa" },
  { id: "F990233", contratante: "John Doe", asegurado: "John Doe", poliza: "Auto", vigencia: "12/01/2023", renovacion: "12/01/2023", correo: "johndoe@correo.com", telefono: "+000 000 000", consentimiento: false, certificado: false, status: "Cancelada" },
  { id: "F990232", contratante: "John Doe", asegurado: "John Doe", poliza: "Vida", vigencia: "11/01/2023", renovacion: "11/01/2023", correo: "johndoe@correo.com", telefono: "+000 000 000", consentimiento: true, certificado: true, status: "En revisión" },
];

function PerfilCliente() {
  const router = useRouter();
  const { clienteId } = Route.useParams();
  const [aseguradoras] = useAseguradoras();

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

      <DatosGeneralesIdenticos aseguradoraNames={aseguradoras.map((a) => a.name)} />

      <section className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-foreground">Pólizas del cliente</h2>
          <button className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-violet-600">
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
              {POLIZAS.map((p) => (
                <tr key={p.id} className="border-t border-border/60 hover:bg-muted/40">
                  <td className="py-3 text-foreground/80">{p.contratante}</td>
                  <td className="py-3 text-foreground/80">{p.asegurado}</td>
                  <td className="py-3">
                    <Link
                      to="/cliente/$clienteId/poliza/$polizaId"
                      params={{ clienteId, polizaId: p.id }}
                      className="text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                    >
                      {p.poliza}
                    </Link>
                  </td>
                  <td className="py-3 text-foreground/80">{p.vigencia}</td>
                  <td className="py-3 text-foreground/80">{p.renovacion}</td>
                  <td className="py-3 text-foreground/80">{p.correo}</td>
                  <td className="py-3 text-foreground/80">{p.telefono}</td>
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