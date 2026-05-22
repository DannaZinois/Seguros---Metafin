import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Section } from "@/components/cotizador/shared";

type Relacion = "Cónyuge" | "Hijo/Hija" | "Mamá/Papá";
type Poliza = "GMM" | "Vida";

export interface FamiliarRow {
  id: string;
  nombre: string;
  relacion: Relacion;
  edad: string;
  sexo: "Masculino" | "Femenino";
  poliza: Poliza;
  porcentaje: string;
}

const RELACIONES: Relacion[] = ["Cónyuge", "Hijo/Hija", "Mamá/Papá"];
const POLIZAS: Poliza[] = ["GMM", "Vida"];
const SEXOS: FamiliarRow["sexo"][] = ["Masculino", "Femenino"];

const DEFAULT_ROWS: FamiliarRow[] = [
  { id: "f1", nombre: "María López García", relacion: "Cónyuge", edad: "34", sexo: "Femenino", poliza: "GMM", porcentaje: "" },
  { id: "f2", nombre: "Diego López Pérez", relacion: "Hijo/Hija", edad: "8", sexo: "Masculino", poliza: "GMM", porcentaje: "" },
  { id: "f3", nombre: "María López García", relacion: "Cónyuge", edad: "34", sexo: "Femenino", poliza: "Vida", porcentaje: "70" },
  { id: "f4", nombre: "Rosa Pérez Vázquez", relacion: "Mamá/Papá", edad: "62", sexo: "Femenino", poliza: "Vida", porcentaje: "30" },
];

export function FamiliaresBeneficiariosSection() {
  const [rows, setRows] = useState<FamiliarRow[]>(DEFAULT_ROWS);
  const [editing, setEditing] = useState(false);
  const editable = editing;

  const update = (id: string, patch: Partial<FamiliarRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [
      ...rs,
      { id: `f${Date.now()}`, nombre: "", relacion: "Cónyuge", edad: "", sexo: "Masculino", poliza: "GMM", porcentaje: "" },
    ]);

  const inputCls = "w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm disabled:bg-muted/40";

  return (
    <Section
      title="Familiares y beneficiarios"
      extra={
        editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={add}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm hover:bg-muted"
            >
              <Plus className="h-4 w-4" /> Agregar
            </button>
            <button
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm hover:bg-muted"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
            <button
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand-blue)] px-3.5 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
            >
              <Check className="h-4 w-4" /> Guardar cambios
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm hover:bg-muted"
          >
            <Pencil className="h-4 w-4" /> Editar
          </button>
        )
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-2 pr-3 font-medium">Nombre / Beneficiario</th>
              <th className="py-2 pr-3 font-medium">Relación / Parentesco</th>
              <th className="py-2 pr-3 font-medium">Edad</th>
              <th className="py-2 pr-3 font-medium">Sexo</th>
              <th className="py-2 pr-3 font-medium">Póliza</th>
              <th className="py-2 pr-3 font-medium">% Beneficio</th>
              {editable && <th className="py-2 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isVida = r.poliza === "Vida";
              return (
                <tr key={r.id} className="border-t border-border/60 align-middle">
                  <td className="py-2 pr-3">
                    <input
                      className={inputCls}
                      value={r.nombre}
                      onChange={(e) => update(r.id, { nombre: e.target.value })}
                      placeholder={isVida ? "Nombre del Beneficiario" : "Nombre completo"}
                      disabled={!editable}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      className={inputCls}
                      value={r.relacion}
                      onChange={(e) => update(r.id, { relacion: e.target.value as Relacion })}
                      disabled={!editable}
                    >
                      {RELACIONES.map((rel) => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3 w-20">
                    <input
                      className={inputCls}
                      value={r.edad}
                      onChange={(e) => update(r.id, { edad: e.target.value })}
                      inputMode="numeric"
                      disabled={!editable}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      className={inputCls}
                      value={r.sexo}
                      onChange={(e) => update(r.id, { sexo: e.target.value as FamiliarRow["sexo"] })}
                      disabled={!editable}
                    >
                      {SEXOS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      className={inputCls}
                      value={r.poliza}
                      onChange={(e) => update(r.id, { poliza: e.target.value as Poliza })}
                      disabled={!editable}
                    >
                      {POLIZAS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3 w-24">
                    {isVida ? (
                      <div className="relative">
                        <input
                          className={inputCls + " pr-6"}
                          value={r.porcentaje}
                          onChange={(e) => update(r.id, { porcentaje: e.target.value })}
                          inputMode="numeric"
                          disabled={!editable}
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </td>
                  {editable && (
                    <td className="py-2">
                      <button
                        onClick={() => remove(r.id)}
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Para pólizas de Vida usa el nombre del beneficiario, su parentesco y el porcentaje de beneficio asignado.
      </p>
    </Section>
  );
}