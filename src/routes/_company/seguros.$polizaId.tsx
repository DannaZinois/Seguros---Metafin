import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  Section,
  Grid,
  Field,
  TextInput,
} from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";
import { AseguradosSection } from "@/components/empresa/poliza-sections";

export const Route = createFileRoute("/_company/seguros/$polizaId")({
  component: VerSeguroPage,
  head: () => ({ meta: [{ title: "Ver póliza" }] }),
});

function VerSeguroPage() {
  const router = useRouter();
  const { polizaId } = Route.useParams();
  const empresa = useCompanyEmpresa();
  const poliza = empresa?.polizas.find((p) => p.id === polizaId) ?? null;

  if (!empresa || !poliza) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Póliza no encontrada.
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.history.back()}
          className="mt-2 rounded-full p-1 text-foreground hover:bg-muted"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Póliza {poliza.tipo}
          </h1>
          <p className="text-sm text-muted-foreground">
            Información de la póliza contratada con {poliza.aseguradora}.
          </p>
        </div>
      </div>

      <Section title="Datos de la póliza">
        <Grid>
          <Field label="Tipo de póliza">
            <TextInput value={poliza.tipo} readOnly />
          </Field>
          <Field label="Aseguradora">
            <TextInput value={poliza.aseguradora} readOnly />
          </Field>
          <Field label="Contratante">
            <TextInput value={poliza.contratante} readOnly />
          </Field>
          <Field label="Número de contacto">
            <TextInput value={poliza.contacto} readOnly />
          </Field>
          <Field label="Código postal">
            <TextInput value={poliza.codigoPostal} readOnly />
          </Field>
          <Field label="Tipo de pago">
            <TextInput value={poliza.tipoPago} readOnly />
          </Field>
          <Field label="Número de asegurados">
            <TextInput value={poliza.numAsegurados} readOnly />
          </Field>
          <Field label="RFC">
            <TextInput value={poliza.rfc} readOnly />
          </Field>
          <Field label="Vigencia">
            <TextInput value={poliza.vigencia || "—"} readOnly />
          </Field>
          <Field label="Estatus">
            <TextInput value={poliza.estatus || "Vigente"} readOnly />
          </Field>
        </Grid>
      </Section>

      <AseguradosSection
        poliza={poliza}
        onChange={() => {}}
        readOnly
      />
    </div>
  );
}