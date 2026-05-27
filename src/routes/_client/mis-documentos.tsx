import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, HeartPulse, Stethoscope, Info } from "lucide-react";
import { Section } from "@/components/cotizador/shared";
import { useCurrentClient } from "@/lib/client-context";

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

const tramitesVida: Documento[] = [
  { nombre: "Solicitud de siniestro - Vida", descripcion: "Formato para iniciar el trámite por fallecimiento del asegurado.", formato: "PDF", tamano: "210 KB" },
  { nombre: "Designación de beneficiarios", descripcion: "Actualiza o registra a los beneficiarios de la póliza de vida.", formato: "PDF", tamano: "180 KB" },
  { nombre: "Aviso de invalidez total y permanente", descripcion: "Formato para reclamar el beneficio por invalidez.", formato: "PDF", tamano: "195 KB" },
  { nombre: "Carta de instrucciones de pago", descripcion: "Indicaciones bancarias para el pago de la suma asegurada.", formato: "DOCX", tamano: "85 KB" },
];

const tramitesGMM: Documento[] = [
  { nombre: "Solicitud de reembolso GMM", descripcion: "Formato para solicitar reembolso de gastos médicos.", formato: "PDF", tamano: "240 KB" },
  { nombre: "Aviso de accidente o enfermedad", descripcion: "Notifica el inicio de un padecimiento o accidente cubierto.", formato: "PDF", tamano: "175 KB" },
  { nombre: "Programación de cirugía", descripcion: "Solicitud para programar cirugía bajo cobertura GMM.", formato: "PDF", tamano: "200 KB" },
  { nombre: "Carta médica del especialista", descripcion: "Formato para el médico tratante con diagnóstico y tratamiento.", formato: "DOCX", tamano: "95 KB" },
  { nombre: "Reembolso de medicamentos", descripcion: "Anexo para solicitar reembolso de farmacia ambulatoria.", formato: "PDF", tamano: "150 KB" },
];

const informativos: Documento[] = [
  { nombre: "Condiciones generales - GMM", descripcion: "Documento informativo con coberturas, exclusiones y deducible.", formato: "PDF", tamano: "1.2 MB" },
  { nombre: "Condiciones generales - Vida", descripcion: "Información detallada de la póliza de vida grupo.", formato: "PDF", tamano: "950 KB" },
  { nombre: "Directorio de hospitales en red", descripcion: "Listado actualizado de hospitales y clínicas en convenio.", formato: "PDF", tamano: "780 KB" },
  { nombre: "Guía rápida para el asegurado", descripcion: "Pasos para hacer uso de tu póliza y contactos clave.", formato: "PDF", tamano: "420 KB" },
  { nombre: "Tabulador de indemnizaciones", descripcion: "Tabla de pagos por accidente personal e invalidez.", formato: "PDF", tamano: "310 KB" },
];

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
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Descarga formatos de trámite y material informativo de tus pólizas
          {cliente?.profile.nombre ? `, ${cliente.profile.nombre}` : ""}.
        </p>
      </header>

      <Section
        title="Trámites · Seguro de Vida"
        subtitle="Formatos necesarios para iniciar y dar seguimiento a trámites de la póliza de vida."
        extra={<HeartPulse className="h-5 w-5 text-muted-foreground" />}
      >
        <DocumentosTable docs={tramitesVida} />
      </Section>

      <Section
        title="Trámites · Gastos Médicos Mayores"
        subtitle="Formatos para reembolsos, programación de cirugías y avisos de siniestro GMM."
        extra={<Stethoscope className="h-5 w-5 text-muted-foreground" />}
      >
        <DocumentosTable docs={tramitesGMM} />
      </Section>

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