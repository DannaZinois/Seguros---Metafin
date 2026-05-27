import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, HeartPulse, Stethoscope, Info } from "lucide-react";
import { Section } from "@/components/cotizador/shared";
import { useCurrentClient } from "@/lib/client-context";
import { useAseguradoras, type PolizaTipo, type DocumentoPoliza, type Aseguradora } from "@/lib/store";
import { useMemo } from "react";

export const Route = createFileRoute("/_client/mis-documentos")({
  component: DocumentosClientPage,
  head: () => ({ meta: [{ title: "Documentos" }] }),
});

interface Documento {
  nombre: string;
  descripcion: string;
  formato: string;
  tamano: string;
}

function docsFromAseguradoras(
  aseguradoras: Aseguradora[],
  tipoMatch: (t: PolizaTipo["tipo"]) => boolean,
  audienciaFilter?: DocumentoPoliza["audiencia"],
): Documento[] {
  const out: Documento[] = [];
  for (const a of aseguradoras) {
    for (const p of a.polizas ?? []) {
      if (!tipoMatch(p.tipo)) continue;
      for (const v of p.variantes ?? []) {
        for (const d of v.documentos ?? []) {
          if (audienciaFilter && d.audiencia !== audienciaFilter) continue;
          const formato = d.pdfName ? "PDF" : d.wordName ? "DOCX" : "PDF";
          out.push({
            nombre: d.nombre,
            descripcion: `${a.name} · ${v.nombre}`,
            formato,
            tamano: "—",
          });
        }
      }
    }
  }
  return out;
}

const tramitesVida: Documento[] = [];
const tramitesGMM: Documento[] = [];
const informativos: Documento[] = [];

function descargar(doc: Documento) {
  const contenido = `Documento: ${doc.nombre}\n\n${doc.descripcion}\n\nFormato: ${doc.formato}\nTamaño: ${doc.tamano}\n\n(Documento de demostración generado por el portal Metafin.)`;
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.nombre.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.${doc.formato.toLowerCase() === "docx" ? "docx" : "pdf"}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function DocumentosTable({ docs }: { docs: Documento[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="py-3 font-medium">Documento</th>
            <th className="py-3 font-medium">Descripción</th>
            <th className="py-3 font-medium">Formato</th>
            <th className="py-3 font-medium">Tamaño</th>
            <th className="py-3 font-medium text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {docs.map((d) => (
            <tr key={d.nombre} className="align-top">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {d.nombre}
                </div>
              </td>
              <td className="py-3 pr-4 text-muted-foreground">{d.descripcion}</td>
              <td className="py-3 pr-4 text-muted-foreground">{d.formato}</td>
              <td className="py-3 pr-4 text-muted-foreground">{d.tamano}</td>
              <td className="py-3 text-right">
                <button
                  type="button"
                  onClick={() => descargar(d)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Download className="h-3.5 w-3.5" /> Descargar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentosClientPage() {
  const cliente = useCurrentClient();
  const [aseguradoras] = useAseguradoras();
  const tipos = useMemo(
    () => new Set((cliente?.polizas ?? []).map((p) => p.tipoSeguro)),
    [cliente],
  );
  const showVida = tipos.has("Vida");
  const showGMM = tipos.has("GMM");
  const docsVida = useMemo(
    () => docsFromAseguradoras(aseguradoras, (t) => t === "Vida", "Cliente"),
    [aseguradoras],
  );
  const docsGMM = useMemo(
    () => docsFromAseguradoras(aseguradoras, (t) => t === "Gastos médicos mayores", "Cliente"),
    [aseguradoras],
  );
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Descarga formatos de trámite y material informativo de tus pólizas
          {cliente?.profile.nombre ? `, ${cliente.profile.nombre}` : ""}.
        </p>
      </header>

      {showVida && (
        <Section
          title="Trámites · Seguro de Vida"
          subtitle="Formatos necesarios para iniciar y dar seguimiento a trámites de la póliza de vida."
          extra={<HeartPulse className="h-5 w-5 text-muted-foreground" />}
        >
          <DocumentosTable docs={[...tramitesVida, ...docsVida]} />
        </Section>
      )}

      {showGMM && (
        <Section
          title="Trámites · Gastos Médicos Mayores"
          subtitle="Formatos para reembolsos, programación de cirugías y avisos de siniestro GMM."
          extra={<Stethoscope className="h-5 w-5 text-muted-foreground" />}
        >
          <DocumentosTable docs={[...tramitesGMM, ...docsGMM]} />
        </Section>
      )}

      <Section
        title="Documentos informativos"
        subtitle="Condiciones generales, directorios y guías de las pólizas que tienes contratadas."
        extra={<Info className="h-5 w-5 text-muted-foreground" />}
      >
        <DocumentosTable docs={informativos} />
      </Section>
    </div>
  );
}