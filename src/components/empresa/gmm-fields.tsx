import { useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import {
  Section,
  Field,
  TextInput,
  DateInput,
  Select,
} from "@/components/cotizador/shared";

interface Perfil {
  id: string;
  tipoEmpleado: string;
  aseguradora: string;
  seguro: string;
  vigencia: string;
}

interface Servicio {
  id: string;
  nombre: string;
  aplica: string;
  descripcion: string;
  restricciones: string;
}

type Amparado = "Amparado" | "Excluido";

function Radio({
  value,
  onChange,
}: {
  value: Amparado;
  onChange: (v: Amparado) => void;
}) {
  return (
    <div className="flex items-center gap-4 pt-2">
      {(["Amparado", "Excluido"] as const).map((v) => (
        <label key={v} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={value === v}
            onChange={() => onChange(v)}
            className="h-4 w-4 accent-[color:var(--brand-blue)]"
          />
          {v}
        </label>
      ))}
    </div>
  );
}

function RichTextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="font-bold">B</span>
        <span className="italic">I</span>
        <span className="line-through">S</span>
        <span>·</span>
        <span>Tt</span>
        <span>·</span>
        <span>≡</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Placeholder..."}
        className="min-h-[120px] w-full resize-y rounded-b-2xl bg-transparent px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}

export function GmmFieldsSection() {
  const [vigenciaIni, setVigenciaIni] = useState("");
  const [vigenciaFin, setVigenciaFin] = useState("");
  const [tipoInput, setTipoInput] = useState("");
  const [tiposEmpleado, setTiposEmpleado] = useState<string[]>([
    "Empleado",
    "Ejecutivo",
  ]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([
    { id: "1", tipoEmpleado: "Empleado", aseguradora: "Nombre aquí", seguro: "GMM", vigencia: "00/00/0000" },
    { id: "2", tipoEmpleado: "Ejecutivo", aseguradora: "Nombre aquí", seguro: "GMM", vigencia: "00/00/0000" },
  ]);

  // Coberturas básicas (per "Tipo de empleado")
  const [cobTipo, setCobTipo] = useState("");
  const [sumaAsegurada, setSumaAsegurada] = useState("");
  const [deducible, setDeducible] = useState("");
  const [coaseguro, setCoaseguro] = useState("");
  const [topeCoaseguro, setTopeCoaseguro] = useState("");
  const [nivelHospitalario, setNivelHospitalario] = useState("");
  const [coberturaIntl, setCoberturaIntl] = useState<Amparado>("Excluido");
  const [emergenciaExt, setEmergenciaExt] = useState("");
  const [asistenciaDental, setAsistenciaDental] = useState<Amparado>("Excluido");
  const [asistenciaVision, setAsistenciaVision] = useState<Amparado>("Excluido");
  const [asistenciaIntegral, setAsistenciaIntegral] = useState<Amparado>("Excluido");

  // Servicios de asistencia
  const [servNombre, setServNombre] = useState("");
  const [servAplica, setServAplica] = useState("");
  const [servDescripcion, setServDescripcion] = useState("");
  const [servRestricciones, setServRestricciones] = useState("");
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const addTipoEmpleado = () => {
    const v = tipoInput.trim();
    if (!v) return;
    if (!tiposEmpleado.includes(v)) setTiposEmpleado([...tiposEmpleado, v]);
    setTipoInput("");
  };

  const removeTipo = (t: string) =>
    setTiposEmpleado(tiposEmpleado.filter((x) => x !== t));

  const addPerfil = () => {
    setPerfiles([
      ...perfiles,
      {
        id: crypto.randomUUID(),
        tipoEmpleado: "",
        aseguradora: "",
        seguro: "GMM",
        vigencia: "00/00/0000",
      },
    ]);
  };

  const addServicio = () => {
    if (!servNombre.trim()) return;
    setServicios([
      ...servicios,
      {
        id: crypto.randomUUID(),
        nombre: servNombre,
        aplica: servAplica,
        descripcion: servDescripcion,
        restricciones: servRestricciones,
      },
    ]);
    setServNombre("");
    setServAplica("");
    setServDescripcion("");
    setServRestricciones("");
  };

  return (
    <>
      {/* Vigencia y tipos de empleado dentro de la póliza GMM */}
      <Section title="Datos GMM">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          <Field label="Vigencia">
            <div className="flex items-center gap-2">
              <DateInput value={vigenciaIni} onChange={setVigenciaIni} />
              <span className="text-muted-foreground">—</span>
              <DateInput value={vigenciaFin} onChange={setVigenciaFin} />
            </div>
          </Field>
          <Field label="Tipo de empleados">
            <div>
              <input
                value={tipoInput}
                onChange={(e) => setTipoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTipoEmpleado();
                  }
                }}
                placeholder="Escribe un tipo aquí"
                className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
              />
              {tiposEmpleado.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tiposEmpleado.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-foreground"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTipo(t)}
                        className="grid h-4 w-4 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600"
                        aria-label={`Quitar ${t}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Field>
        </div>
      </Section>

      {/* Perfiles para esta póliza */}
      <Section
        title="Perfiles para esta póliza"
        subtitle="Aquí podrás ver todos los perfiles configurados para esta póliza"
        extra={
          <button
            type="button"
            onClick={addPerfil}
            className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            <Plus className="h-4 w-4" /> Agregar perfil
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Tipo de empleado</th>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Seguro</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {perfiles.map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="py-3">{p.tipoEmpleado || "—"}</td>
                  <td className="py-3">{p.aseguradora || "—"}</td>
                  <td className="py-3">{p.seguro}</td>
                  <td className="py-3">{p.vigencia}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="text-amber-500 hover:text-amber-600"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPerfiles(perfiles.filter((x) => x.id !== p.id))
                        }
                        className="text-red-500 hover:text-red-600"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Coberturas básicas */}
      <Section title={`Coberturas básicas: ${cobTipo || "Tipo de empleado aquí"}`}>
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Selecciona un tipo de empleado*">
            <Select
              value={cobTipo}
              onChange={setCobTipo}
              options={tiposEmpleado}
              placeholder="Nombre aquí"
            />
          </Field>
          <Field label="Suma asegurada">
            <TextInput value={sumaAsegurada} onChange={setSumaAsegurada} placeholder="$0000.  MNX" />
          </Field>
          <Field label="Deducible">
            <TextInput value={deducible} onChange={setDeducible} placeholder="$0000.  MNX" />
          </Field>
          <Field label="Coaseguro">
            <TextInput value={coaseguro} onChange={setCoaseguro} placeholder="$0000.  MNX" />
          </Field>
          <Field label="Tope de coaseguro">
            <TextInput value={topeCoaseguro} onChange={setTopeCoaseguro} placeholder="$0000.  MNX" />
          </Field>

          <Field label="Nivel hospitalario*">
            <Select
              value={nivelHospitalario}
              onChange={setNivelHospitalario}
              options={["Normal", "Media", "Alta"]}
              placeholder="Nombre aquí"
            />
          </Field>
          <Field label="Cobertura internacional">
            <Radio value={coberturaIntl} onChange={setCoberturaIntl} />
          </Field>
          <Field label="Emergencia en el extranjero">
            <TextInput value={emergenciaExt} onChange={setEmergenciaExt} placeholder="$0000.  USD" />
          </Field>
          <Field label="Asistencia dental">
            <Radio value={asistenciaDental} onChange={setAsistenciaDental} />
          </Field>
          <Field label="Asistencia visión">
            <Radio value={asistenciaVision} onChange={setAsistenciaVision} />
          </Field>

          <Field label="Asistencia integral">
            <Radio value={asistenciaIntegral} onChange={setAsistenciaIntegral} />
          </Field>
        </div>
      </Section>

      {/* Servicios de asistencia */}
      <Section title="Servicios de asistencia">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          <Field label="Nombre del servicio">
            <TextInput value={servNombre} onChange={setServNombre} placeholder="Nombre aquí" />
          </Field>
          <Field label="A quién aplica">
            <Select
              value={servAplica}
              onChange={setServAplica}
              options={tiposEmpleado}
              placeholder="Nombre aquí"
            />
          </Field>
          <Field label="Descripción del servicio">
            <RichTextArea value={servDescripcion} onChange={setServDescripcion} />
          </Field>
          <Field label="Restricciones del servicio">
            <RichTextArea value={servRestricciones} onChange={setServRestricciones} />
          </Field>
        </div>

        {servicios.length > 0 && (
          <div className="mt-5 space-y-2">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="flex items-start justify-between rounded-xl border border-border bg-muted/30 p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{s.nombre}</p>
                  <p className="text-xs text-muted-foreground">Aplica: {s.aplica || "—"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setServicios(servicios.filter((x) => x.id !== s.id))}
                  className="text-red-500 hover:text-red-600"
                  aria-label="Eliminar servicio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={addServicio}
            className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            <Plus className="h-4 w-4" /> Agregar servicio
          </button>
        </div>
      </Section>
    </>
  );
}