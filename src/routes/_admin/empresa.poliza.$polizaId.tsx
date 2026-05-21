import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  FileText as FileIcon,
  Pencil,
} from "lucide-react";
import { z } from "zod";
import { useAseguradoras, appendChat } from "@/lib/store";
import {
  Section,
  Grid,
  Field,
  TextInput,
  Select,
  EnvioOption,
  Dropzone,
  Popup,
  type PopupState,
} from "@/components/cotizador/shared";
import {
  useEmpresas,
  saveEmpresa,
  type Empresa,
  type Poliza,
  type EnvioType,
} from "@/lib/empresa-store";
import {
  AseguradosSection,
  ComprobantesSection,
} from "@/components/empresa/poliza-sections";

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

  const handleEnvio = (type: Exclude<EnvioType, null>) => {
    if (type === "whatsapp" || type === "pdf") {
      if (!poliza.contratante.trim() || !poliza.contacto.trim()) {
        setPopup({
          kind: "error",
          title: "Datos requeridos",
          message:
            "Captura nombre del contratante y número de contacto antes de usar WhatsApp o PDF.",
        });
        return;
      }
    }
    updatePoliza({ envio: type });
    if (type === "whatsapp") {
      appendChat(poliza.contacto, {
        from: "bot",
        text: `Hola ${poliza.contratante}, soy el asistente. Te haré algunas preguntas para la póliza de ${empresa.nombre}.`,
      });
    } else if (type === "pdf") {
      const pdf =
        aseguradoras.find((a) => a.name === poliza.aseguradora)?.pdfName ??
        "formato_cotizacion.pdf";
      appendChat(poliza.contacto, {
        from: "bot",
        text: `Hola ${poliza.contratante}, te envío el siguiente formato: ${pdf}`,
      });
    }
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
              onChange={(v) => updatePoliza({ tipo: v })}
              options={["Auto", "Gastos Médicos Mayores", "Vida", "Exceso GMM"]}
              placeholder="Selecciona"
            />
          </Field>
          <Field label="Aseguradora">
            <Select
              value={poliza.aseguradora}
              onChange={(v) => updatePoliza({ aseguradora: v })}
              options={aseguradoras.map((a) => a.name)}
              placeholder="Selecciona"
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

      <Section
        title="Tipo de envio"
        subtitle="Selecciona cómo quieres recopilar la información"
      >
        <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-3">
          <EnvioOption
            label="Recolección por chatbot de WhatsApp"
            active={poliza.envio === "whatsapp"}
            onClick={() => handleEnvio("whatsapp")}
            color="bg-green-500 hover:bg-green-600"
            icon={<MessageCircle className="h-4 w-4" />}
            text="WhatsApp"
          />
          <EnvioOption
            label="Recolección manual"
            active={poliza.envio === "manual"}
            onClick={() => handleEnvio("manual")}
            color="bg-blue-500 hover:bg-blue-600"
            icon={<Pencil className="h-4 w-4" />}
            text="Manual"
          />
          <EnvioOption
            label="Recolección por lectura de pdf por IA"
            active={poliza.envio === "pdf"}
            onClick={() => handleEnvio("pdf")}
            color="bg-red-500 hover:bg-red-600"
            icon={<FileIcon className="h-4 w-4" />}
            text="pdf"
          />
        </div>
      </Section>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground">
            Carga de asegurados
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Carga un solo archivo para registrar a tus asegurados.
          </p>
          <Dropzone
            className="mt-4"
            onFile={(f) => updatePoliza({ cargaFileName: f.name })}
          />
        </div>
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground">
            Comentarios del cliente
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Recibe feedback del cliente y edita a sus especificaciones si es
            necesario.
          </p>
          <textarea
            value={poliza.comentarios}
            onChange={(e) => updatePoliza({ comentarios: e.target.value })}
            rows={6}
            className="mt-3 w-full rounded-2xl border border-border bg-white p-3 text-sm outline-none focus:border-[color:var(--brand-blue)]"
            placeholder="Sin comentarios"
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

      <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() => {
            if (!poliza.contacto.trim()) {
              setPopup({
                kind: "error",
                title: "Sin número de contacto",
                message: "Captura primero el número de contacto del contratante.",
              });
              return;
            }
            setPopup({ kind: "chat", phone: poliza.contacto });
          }}
          className="rounded-full bg-green-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-600"
        >
          Ver whatsapp
        </button>
        <button
          onClick={() => {
            persist();
            setPopup({
              kind: "info",
              title: "Cambios guardados",
              message: "La información de la póliza se guardó correctamente.",
            });
          }}
          className="rounded-full bg-violet-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-600"
        >
          + Guardar cambios
        </button>
        <button
          onClick={() => {
            persist();
            setPopup({
              kind: "info",
              title: "Póliza enviada",
              message: "La póliza se actualizó correctamente.",
            });
          }}
          className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          Enviar
        </button>
        <button
          onClick={() =>
            setPopup({
              kind: "confirm",
              title: "¿Borrar póliza?",
              message: "Esto eliminará esta póliza de la empresa.",
              onConfirm: () => {
                const e: Empresa = {
                  ...empresa,
                  polizas: empresa.polizas.filter((p) => p.id !== poliza.id),
                };
                saveEmpresa(e);
                router.navigate({ to: "/cartera" });
              },
            })
          }
          className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600"
        >
          Borrar
        </button>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Copyrights ©{" "}
        <span className="text-[color:var(--brand-blue)]">Zinois</span>
      </p>

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}