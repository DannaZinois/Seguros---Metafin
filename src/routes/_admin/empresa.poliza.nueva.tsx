import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { z } from "zod";
import { useAseguradoras, appendChat } from "@/lib/store";
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
  newPoliza,
  type Empresa,
  type Poliza,
} from "@/lib/empresa-store";
import {
  AseguradosSection,
  ComprobantesSection,
} from "@/components/empresa/poliza-sections";
import { downloadAseguradosTemplate } from "@/lib/asegurados-template";

const searchSchema = z.object({
  empresaId: z.string().optional(),
});

export const Route = createFileRoute("/_admin/empresa/poliza/nueva")({
  component: NuevaPolizaPage,
  head: () => ({ meta: [{ title: "Nueva póliza" }] }),
  validateSearch: searchSchema,
});

function NuevaPolizaPage() {
  const router = useRouter();
  const { empresaId } = Route.useSearch();
  const list = useEmpresas();
  const [aseguradoras] = useAseguradoras();

  const baseEmpresa = useMemo(
    () => (empresaId ? list.find((e) => e.id === empresaId) ?? null : null),
    [empresaId, list],
  );

  const [empresa, setEmpresa] = useState<Empresa | null>(baseEmpresa);
  const [poliza, setPoliza] = useState<Poliza>(() => newPoliza());
  const [popup, setPopup] = useState<PopupState>(null);

  useEffect(() => {
    if (baseEmpresa) setEmpresa(baseEmpresa);
  }, [baseEmpresa]);

  const updatePoliza = (patch: Partial<Poliza>) =>
    setPoliza((p) => ({ ...p, ...patch }));

  const persist = () => {
    if (!empresa) {
      setPopup({
        kind: "error",
        title: "Sin empresa",
        message: "Esta póliza no está asociada a una empresa registrada.",
      });
      return false;
    }
    if (!poliza.tipo) {
      setPopup({
        kind: "error",
        title: "Falta tipo de póliza",
        message: "Selecciona el tipo de póliza antes de guardar.",
      });
      return false;
    }
    const exists = empresa.polizas.some((p) => p.id === poliza.id);
    const next: Empresa = {
      ...empresa,
      polizas: exists
        ? empresa.polizas.map((p) => (p.id === poliza.id ? poliza : p))
        : [...empresa.polizas, poliza],
    };
    saveEmpresa(next);
    setEmpresa(next);
    return true;
  };

  const onGuardar = () => {
    if (persist())
      setPopup({
        kind: "info",
        title: "Cambios guardados",
        message: "La póliza se guardó correctamente.",
      });
  };

  const onBorrar = () => {
    setPopup({
      kind: "confirm",
      title: "¿Borrar póliza?",
      message: "Esto eliminará la información capturada en este formulario.",
      onConfirm: () => {
        setPoliza(newPoliza());
        setPopup(null);
      },
    });
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
            Nueva póliza
          </h1>
          <p className="text-sm text-muted-foreground">
            Registra una nueva empresa para obtener sus cotizaciones
          </p>
        </div>
      </div>

      {/* Datos generales (read-only from empresa if present) */}
      <Section title="Datos generales">
        <Grid>
          <Field label="Nombre de la empresa*">
            <TextInput
              value={empresa?.nombre ?? ""}
              readOnly={!!empresa}
              onChange={(v) => setEmpresa((e) => (e ? { ...e, nombre: v } : e))}
              placeholder="Nombre aquí"
            />
          </Field>
          <Field label="RFC*">
            <TextInput
              value={empresa?.rfc ?? ""}
              readOnly={!!empresa}
              onChange={(v) => setEmpresa((e) => (e ? { ...e, rfc: v } : e))}
              placeholder="+00 0000 0000 00"
            />
          </Field>
          <Field label="Giro*">
            <TextInput
              value={empresa?.giro ?? ""}
              readOnly={!!empresa}
              onChange={(v) => setEmpresa((e) => (e ? { ...e, giro: v } : e))}
              placeholder="Lore ipsum dolor est"
            />
          </Field>
          <Field label="Código postal*">
            <TextInput
              value={empresa?.codigoPostal ?? ""}
              readOnly={!!empresa}
              onChange={(v) =>
                setEmpresa((e) => (e ? { ...e, codigoPostal: v } : e))
              }
              placeholder="Lore ipsum dolor est"
            />
          </Field>
        </Grid>
      </Section>

      {/* Póliza */}
      <Section title={`Póliza: ${poliza.tipo || "Tipo de póliza aquí"}`}>
        <Grid>
          <Field label="Tipo de póliza*">
            <Select
              value={poliza.tipo}
              onChange={(v) => updatePoliza({ tipo: v })}
              options={["Auto", "Gastos Médicos Mayores", "Vida", "Exceso GMM", "Casa", "GMM"]}
              placeholder="Nombre aquí"
            />
          </Field>
          <Field label="Aseguradora*">
            <Select
              value={poliza.aseguradora}
              onChange={(v) => updatePoliza({ aseguradora: v })}
              options={aseguradoras.map((a) => a.name)}
              placeholder={
                aseguradoras.length === 0
                  ? "Registra aseguradoras primero"
                  : "Nombre aquí"
              }
            />
          </Field>
          <Field label="Nombre completo del contratante*">
            <TextInput
              value={poliza.contratante}
              onChange={(v) => updatePoliza({ contratante: v })}
              placeholder="Nombre aquí"
            />
          </Field>
          <Field label="Número de contacto*">
            <TextInput
              value={poliza.contacto}
              onChange={(v) => updatePoliza({ contacto: v })}
              placeholder="+00 0000 0000 00"
            />
          </Field>
          <Field label="Código postal*">
            <TextInput
              value={poliza.codigoPostal}
              onChange={(v) => updatePoliza({ codigoPostal: v })}
              placeholder="Lore ipsum dolor est"
            />
          </Field>
          <Field label="Tipo de pago*">
            <Select
              value={poliza.tipoPago}
              onChange={(v) => updatePoliza({ tipoPago: v })}
              options={["Agente", "Domiciliado", "Directo"]}
              placeholder="Nombre aquí"
            />
          </Field>
          <Field label="Número de asegurados">
            <TextInput
              value={poliza.numAsegurados}
              onChange={(v) => updatePoliza({ numAsegurados: v })}
              placeholder="000"
            />
          </Field>
          <Field label="RFC*">
            <TextInput
              value={poliza.rfc}
              onChange={(v) => updatePoliza({ rfc: v })}
              placeholder="Lore ipsum dolor est"
            />
          </Field>
        </Grid>
      </Section>

      {/* Carga masiva */}
      <div className="mt-6">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Carga masiva de asegurados
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Carga un solo archivo para registrar a tus asegurados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadAseguradosTemplate()}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              <Download className="h-4 w-4" />
              Descargar plantilla Excel
            </button>
          </div>
          {poliza.cargaFileName && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>{poliza.cargaFileName}</span>
                <span className="text-muted-foreground">25 MB</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full bg-violet-500" />
              </div>
            </div>
          )}
          <Dropzone
            className="mt-4"
            onFile={(f) => updatePoliza({ cargaFileName: f.name })}
          />
        </div>
      </div>

      <AseguradosSection
        poliza={poliza}
        onChange={(asegurados) => updatePoliza({ asegurados })}
      />

      <ComprobantesSection
        poliza={poliza}
        onChange={(comprobantes) => updatePoliza({ comprobantes })}
      />

      <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={onGuardar}
          className="rounded-full bg-violet-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-600"
        >
          + Guardar cambios
        </button>
        <button
          onClick={onBorrar}
          className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600"
        >
          Borrar
        </button>
      </div>
      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}