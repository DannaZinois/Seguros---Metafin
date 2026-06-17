import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { z } from "zod";
import { useAseguradoras } from "@/lib/store";
import { downloadAseguradosTemplate } from "@/lib/asegurados-template";
import {
  Section,
  Grid,
  Field,
  TextInput,
  Select,
  Dropzone,
  Popup,
  type PopupState,
} from "@/components/cotizador/shared";
import {
  useEmpresas,
  saveEmpresa,
  type Empresa,
  type Poliza,
} from "@/lib/empresa-store";

function normalizeTipoSeguro(t: string): string {
  const x = (t ?? "").trim().toLowerCase();
  if (x === "vida") return "Vida";
  if (x === "auto") return "Auto";
  if (x === "gmm" || x.startsWith("gastos")) return "Gastos médicos mayores";
  if (x.startsWith("exceso")) return "Exceso";
  return t;
}
import {
  AseguradosSection,
  ComprobantesSection,
  DocumentosInformativosSection,
  DocumentosPolizaSection,
} from "@/components/empresa/poliza-sections";
import { GmmFieldsSection } from "@/components/empresa/gmm-fields";
import { VidaFieldsSection } from "@/components/empresa/vida-fields";

const searchSchema = z.object({
  empresaId: z.string().optional(),
  addPerson: z.boolean().optional(),
});

export const Route = createFileRoute("/_admin/empresa/poliza/$polizaId")({
  component: VerPolizaPage,
  head: () => ({ meta: [{ title: "Ver póliza" }] }),
  validateSearch: searchSchema,
});

function VerPolizaPage() {
  const router = useRouter();
  const { polizaId } = Route.useParams();
  const { empresaId, addPerson } = Route.useSearch();
  const list = useEmpresas();
  const [aseguradoras] = useAseguradoras();

  const found = useMemo(() => {
    for (const emp of list) {
      if (empresaId && emp.id !== empresaId) continue;
      const pl = emp.polizas.find((p) => p.id === polizaId);
      if (pl) return { empresa: emp, poliza: pl };
    }
    return null;
  }, [list, polizaId, empresaId]);

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [poliza, setPoliza] = useState<Poliza | null>(null);
  const [popup, setPopup] = useState<PopupState>(null);

  useEffect(() => {
    if (found) {
      setEmpresa(found.empresa);
      setPoliza(found.poliza);
    }
  }, [found]);

  // When addPerson flag is present, scroll to / open add row in asegurados
  useEffect(() => {
    if (addPerson && poliza) {
      const el = document.getElementById("asegurados-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [addPerson, poliza]);

  if (!empresa || !poliza) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando póliza...
      </div>
    );
  }

  const updatePoliza = (patch: Partial<Poliza>) => {
    const next = { ...poliza, ...patch };
    setPoliza(next);
    const e: Empresa = {
      ...empresa,
      polizas: empresa.polizas.map((p) => (p.id === poliza.id ? next : p)),
    };
    setEmpresa(e);
  };

  const persist = () => {
    if (empresa) saveEmpresa(empresa);
  };

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
            Ver póliza {empresa.nombre || "nombre aquí"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Registra una nueva empresa para obtener sus cotizaciones
          </p>
        </div>
      </div>

      <Section title="Datos generales">
        <Grid>
          <Field label="Nombre de la empresa*">
            <TextInput value={empresa.nombre} readOnly />
          </Field>
          <Field label="RFC*">
            <TextInput value={empresa.rfc} readOnly />
          </Field>
          <Field label="Giro*">
            <TextInput value={empresa.giro} readOnly />
          </Field>
          <Field label="Código postal*">
            <TextInput value={empresa.codigoPostal} readOnly />
          </Field>
        </Grid>
      </Section>

      <Section title={`Póliza: ${poliza.tipo || "Tipo de póliza aquí"}`}>
        <Grid>
          <Field label="Tipo de póliza*">
            <Select
              value={poliza.tipo}
              onChange={(v) => updatePoliza({ tipo: v, variante: "" })}
              options={["Auto", "Gastos Médicos Mayores", "Vida", "Exceso GMM"]}
              placeholder="Selecciona"
            />
          </Field>
          <Field label="Aseguradora">
            <Select
              value={poliza.aseguradora}
              onChange={(v) => updatePoliza({ aseguradora: v, variante: "" })}
              options={aseguradoras.map((a) => a.name)}
              placeholder="Selecciona"
            />
          </Field>
          <Field label="Nombre de póliza">
            <Select
              value={poliza.variante ?? ""}
              onChange={(v) => updatePoliza({ variante: v })}
              options={(() => {
                const aseg = aseguradoras.find((a) => a.name === poliza.aseguradora);
                if (!aseg?.polizas) return [];
                return aseg.polizas
                  .filter((pt) => normalizeTipoSeguro(poliza.tipo) === pt.tipo)
                  .flatMap((pt) => (pt.variantes ?? []).map((v) => v.nombre));
              })()}
              placeholder={
                poliza.aseguradora
                  ? "Selecciona la variante"
                  : "Selecciona aseguradora primero"
              }
            />
          </Field>
          <Field label="Nombre completo del contratante*">
            <TextInput
              value={poliza.contratante}
              onChange={(v) => updatePoliza({ contratante: v })}
            />
          </Field>
          <Field label="Número de contacto*">
            <TextInput
              value={poliza.contacto}
              onChange={(v) => updatePoliza({ contacto: v })}
            />
          </Field>
          <Field label="Código postal*">
            <TextInput
              value={poliza.codigoPostal}
              onChange={(v) => updatePoliza({ codigoPostal: v })}
            />
          </Field>
          <Field label="Tipo de pago*">
            <Select
              value={poliza.tipoPago}
              onChange={(v) => updatePoliza({ tipoPago: v })}
              options={["Agente", "Domiciliado", "Directo"]}
              placeholder="Selecciona"
            />
          </Field>
          <Field label="Número de asegurados">
            <TextInput
              value={poliza.numAsegurados}
              onChange={(v) => updatePoliza({ numAsegurados: v })}
            />
          </Field>
          <Field label="RFC*">
            <TextInput
              value={poliza.rfc}
              onChange={(v) => updatePoliza({ rfc: v })}
            />
          </Field>
        </Grid>
      </Section>

      {(poliza.tipo === "Gastos Médicos Mayores" || poliza.tipo === "GMM") && (
        <GmmFieldsSection
          aseguradora={poliza.aseguradora}
          value={poliza.gmm}
          onChange={(gmm) => updatePoliza({ gmm })}
        />
      )}

      {poliza.tipo === "Vida" && (
        <VidaFieldsSection
          aseguradora={poliza.aseguradora}
          value={poliza.vida}
          onChange={(vida) => updatePoliza({ vida })}
        />
      )}

      <div className="mt-6">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Carga de asegurados
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Carga un solo archivo para registrar a tus asegurados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadAseguradosTemplate()}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" /> Descargar plantilla Excel
            </button>
          </div>
          <Dropzone
            className="mt-4"
            onFile={(f) => updatePoliza({ cargaFileName: f.name })}
          />
        </div>
      </div>

      <div id="asegurados-section">
        <AseguradosSection
          poliza={poliza}
          onChange={(asegurados) => updatePoliza({ asegurados })}
          empresaId={empresa.id}
        />
      </div>

      <ComprobantesSection
        poliza={poliza}
        onChange={(comprobantes) => updatePoliza({ comprobantes })}
      />

      <DocumentosPolizaSection
        poliza={poliza}
        onChange={(documentosPoliza) => updatePoliza({ documentosPoliza })}
      />

      <DocumentosInformativosSection
        poliza={poliza}
        onChange={(documentosInformativos) =>
          updatePoliza({ documentosInformativos })
        }
      />

      <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() => {
            persist();
            setPopup({
              kind: "info",
              title: "Cambios guardados",
              message:
                "La información de la póliza se guardó y se actualizó en los perfiles de empresa y cliente.",
            });
          }}
          className="rounded-full bg-violet-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-600"
        >
          + Guardar cambios
        </button>
        <button
          onClick={() =>
            setPopup({
              kind: "confirm",
              title: "¿Descartar cambios?",
              message:
                "Se revertirán los datos modificados a la última versión guardada.",
              onConfirm: () => {
                if (found) {
                  setEmpresa(found.empresa);
                  setPoliza(found.poliza);
                }
                setPopup({
                  kind: "info",
                  title: "Cambios descartados",
                  message: "Se restauró la última versión guardada.",
                });
              },
            })
          }
          className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600"
        >
          Borrar
        </button>
      </div>
      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}