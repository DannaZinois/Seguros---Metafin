import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, ListFilter } from "lucide-react";
import {
  Section,
  Grid,
  Field,
  TextInput,
  Select,
  DateInput,
  Popup,
  type PopupState,
} from "@/components/cotizador/shared";
import { useEmpresas, saveEmpresa, type Empresa } from "@/lib/empresa-store";

export const Route = createFileRoute(
  "/_admin/empresa/$empresaId/empleado/$empleadoId",
)({
  component: PerfilEmpleadoPage,
  head: () => ({ meta: [{ title: "Perfil de empleado" }] }),
});

const STATUS_COLORS: Record<string, string> = {
  Activa: "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]",
  Cancelada:
    "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]",
  "En revisión":
    "bg-[color:var(--status-review)] text-[color:var(--status-review-fg)]",
  "Por renovar":
    "bg-[color:var(--status-renew)] text-[color:var(--status-renew-fg)]",
};

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function PerfilEmpleadoPage() {
  const router = useRouter();
  const { empresaId, empleadoId } = Route.useParams();
  const list = useEmpresas();

  const empresa = useMemo(
    () => list.find((e) => e.id === empresaId) ?? null,
    [list, empresaId],
  );

  const base = useMemo(() => {
    if (!empresa) return null;
    for (const p of empresa.polizas) {
      const a = p.asegurados.find((x) => x.id === empleadoId);
      if (a) return { asegurado: a };
    }
    return null;
  }, [empresa, empleadoId]);

  // Collect all asegurado rows across empresa for this trabajadorId.
  const polizasDelEmpleado = useMemo(() => {
    if (!empresa || !base) return [];
    const rows: {
      polizaId: string;
      tipo: string;
      contratante: string;
      asegurado: typeof base.asegurado;
    }[] = [];
    for (const p of empresa.polizas) {
      for (const a of p.asegurados) {
        if (a.trabajadorId === base.asegurado.trabajadorId) {
          rows.push({
            polizaId: p.id,
            tipo: p.tipo || "Póliza aquí",
            contratante: empresa.nombre || p.contratante,
            asegurado: a,
          });
        }
      }
    }
    return rows;
  }, [empresa, base]);

  // Local editable datos generales — derived from the asegurado seed
  const seed = base?.asegurado;
  const seedHash = seed ? hashCode(seed.id) : 0;
  const tipos = ["Titular", "Cónyuge", "Hijo/a", "Dependiente"];
  const sexos = ["Hombre", "Mujer", "Otro"];
  const cps = ["64000", "06600", "44100", "11560", "76000"];

  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [tipoAsegurado, setTipoAsegurado] = useState("");
  const [numEmpleado, setNumEmpleado] = useState("");
  const [sexo, setSexo] = useState("");
  const [cp, setCp] = useState("");
  const [fnac, setFnac] = useState("");
  const [fant, setFant] = useState("");
  const [popup, setPopup] = useState<PopupState>(null);

  useEffect(() => {
    if (!seed) return;
    setNombre(seed.nombre || "");
    setContacto(seed.telefono || "");
    setTipoAsegurado(tipos[seedHash % tipos.length]);
    setNumEmpleado(seed.trabajadorId);
    setSexo(sexos[seedHash % sexos.length]);
    setCp(cps[seedHash % cps.length]);
    const year = 1970 + (seedHash % 30);
    const month = String(1 + (seedHash % 12)).padStart(2, "0");
    const day = String(1 + (seedHash % 27)).padStart(2, "0");
    setFnac(`${year}-${month}-${day}`);
    const ay = 2018 + (seedHash % 7);
    setFant(`${ay}-${month}-${day}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.id]);

  if (!empresa || !base) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Empleado no encontrado.
      </div>
    );
  }

  const persistStatus = (
    polizaId: string,
    asegId: string,
    status: typeof base.asegurado.status,
  ) => {
    const next: Empresa = {
      ...empresa,
      polizas: empresa.polizas.map((p) =>
        p.id !== polizaId
          ? p
          : {
              ...p,
              asegurados: p.asegurados.map((a) =>
                a.id === asegId ? { ...a, status } : a,
              ),
            },
      ),
    };
    saveEmpresa(next);
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
            Perfil de empleado
          </h1>
          <p className="text-sm text-muted-foreground">
            Registra un nuevo cliente para obtener sus datos.
          </p>
        </div>
      </div>

      <Section title="Datos generales">
        <Grid>
          <Field label="Nombre completo del asegurado*">
            <TextInput value={nombre} onChange={setNombre} placeholder="Nombre aquí" />
          </Field>
          <Field label="Número de contacto*">
            <TextInput
              value={contacto}
              onChange={setContacto}
              placeholder="+00 0000 0000 00"
            />
          </Field>
          <Field label="Tipo de asegurado">
            <Select value={tipoAsegurado} onChange={setTipoAsegurado} options={tipos} />
          </Field>
          <Field label="Número de empleado*">
            <TextInput value={numEmpleado} onChange={setNumEmpleado} />
          </Field>
          <Field label="Sexo">
            <Select value={sexo} onChange={setSexo} options={sexos} />
          </Field>
          <Field label="Código postal*">
            <TextInput value={cp} onChange={setCp} />
          </Field>
          <Field label="Fecha de nacimiento*">
            <DateInput value={fnac} onChange={setFnac} />
          </Field>
          <Field label="Fecha de antigüedad*">
            <DateInput value={fant} onChange={setFant} />
          </Field>
        </Grid>
      </Section>

      <Section title="Pólizas activas">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Número de empleado</th>
                <th className="py-3 font-medium">Contratante</th>
                <th className="py-3 font-medium">Asegurado</th>
                <th className="py-3 font-medium">
                  <span className="inline-flex items-center gap-1">
                    Póliza <ListFilter className="h-3 w-3" />
                  </span>
                </th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Fecha de renovación</th>
                <th className="py-3 font-medium">Correo</th>
                <th className="py-3 font-medium">Teléfono</th>
                <th className="py-3 font-medium">
                  <span className="inline-flex items-center gap-1">
                    Consentimiento <ListFilter className="h-3 w-3" />
                  </span>
                </th>
                <th className="py-3 font-medium">
                  <span className="inline-flex items-center gap-1">
                    Certificado <ListFilter className="h-3 w-3" />
                  </span>
                </th>
                <th className="py-3 font-medium">
                  <span className="inline-flex items-center gap-1">
                    Estatus <ListFilter className="h-3 w-3" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {polizasDelEmpleado.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Sin pólizas asociadas.
                  </td>
                </tr>
              )}
              {polizasDelEmpleado.map((row) => (
                <tr key={row.polizaId} className="border-t border-border/60">
                  <td className="py-3 text-foreground/80">
                    {row.asegurado.trabajadorId}
                  </td>
                  <td className="py-3">
                    <span className="text-[color:var(--brand-blue)]">
                      {row.contratante}
                    </span>
                  </td>
                  <td className="py-3 text-foreground/80">
                    {row.asegurado.nombre || "—"}
                  </td>
                  <td className="py-3 text-foreground/80">{row.tipo}</td>
                  <td className="py-3 text-foreground/80">
                    {row.asegurado.vigencia}
                  </td>
                  <td className="py-3 text-foreground/80">
                    {row.asegurado.renovacion}
                  </td>
                  <td className="py-3 text-foreground/80">
                    {row.asegurado.correo || "—"}
                  </td>
                  <td className="py-3 text-foreground/80">
                    {row.asegurado.telefono || "—"}
                  </td>
                  <td className="py-3">
                    <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                      <Download className="h-3.5 w-3.5" />
                      {row.asegurado.consentimiento ? "Descargar" : "-"}
                    </button>
                  </td>
                  <td className="py-3">
                    <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                      <Download className="h-3.5 w-3.5" />
                      {row.asegurado.certificado ? "Descargar" : "-"}
                    </button>
                  </td>
                  <td className="py-3">
                    <select
                      value={row.asegurado.status}
                      onChange={(e) =>
                        persistStatus(
                          row.polizaId,
                          row.asegurado.id,
                          e.target.value as typeof row.asegurado.status,
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium outline-none ${
                        STATUS_COLORS[row.asegurado.status]
                      }`}
                    >
                      <option>Activa</option>
                      <option>Cancelada</option>
                      <option>En revisión</option>
                      <option>Por renovar</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="mt-10 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() =>
            setPopup({
              kind: "confirm",
              title: "¿Dar de baja a este trabajador?",
              message:
                "Esta acción es permanente. Se eliminarán los datos del trabajador de todas las pólizas de la empresa y no podrán recuperarse.",
              onConfirm: () => {
                const next: Empresa = {
                  ...empresa,
                  polizas: empresa.polizas.map((p) => ({
                    ...p,
                    asegurados: p.asegurados.filter(
                      (a) => a.trabajadorId !== base.asegurado.trabajadorId,
                    ),
                  })),
                };
                saveEmpresa(next);
                setPopup({
                  kind: "info",
                  title: "Trabajador dado de baja",
                  message:
                    "Los datos del trabajador se eliminaron de las pólizas.",
                });
                setTimeout(() => router.history.back(), 600);
              },
            })
          }
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
        >
          Dar de baja
        </button>
        <button
          onClick={() => {
            // Persist datos generales onto every asegurado entry with same trabajadorId
            const next: Empresa = {
              ...empresa,
              polizas: empresa.polizas.map((p) => ({
                ...p,
                asegurados: p.asegurados.map((a) =>
                  a.trabajadorId === base.asegurado.trabajadorId
                    ? { ...a, nombre, telefono: contacto, trabajadorId: numEmpleado }
                    : a,
                ),
              })),
            };
            saveEmpresa(next);
          }}
          className="rounded-full bg-violet-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-600"
        >
          + Guardar cambios
        </button>
        <button
          onClick={() => router.history.back()}
          className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600"
        >
          Cancelar
        </button>
      </div>
      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}