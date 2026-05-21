import { Plus, Trash2, Download } from "lucide-react";
import { Section } from "@/components/cotizador/shared";
import type { Poliza } from "@/lib/empresa-store";

const STATUS_COLORS: Record<string, string> = {
  Activa: "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]",
  Cancelada: "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]",
  "En revisión": "bg-[color:var(--status-review)] text-[color:var(--status-review-fg)]",
  "Por renovar": "bg-[color:var(--status-renew)] text-[color:var(--status-renew-fg)]",
};

export function AseguradosSection({
  poliza,
  onChange,
  readOnly,
}: {
  poliza: Poliza;
  onChange: (a: Poliza["asegurados"]) => void;
  readOnly?: boolean;
}) {
  const addRow = () =>
    onChange([
      ...poliza.asegurados,
      {
        id: crypto.randomUUID(),
        trabajadorId: `F-#${Math.floor(100000 + Math.random() * 900000)}`,
        nombre: "",
        poliza: poliza.tipo || "Póliza aquí",
        vigencia: "00/00/0000",
        renovacion: "00/00/0000",
        correo: "",
        telefono: "",
        consentimiento: false,
        certificado: false,
        status: "Activa",
      },
    ]);

  return (
    <Section
      title="Asegurados bajo esta póliza"
      extra={
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600">
            + Cargar certificados
          </button>
          <button className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-blue)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[color:var(--brand-blue-dark)]">
            + Descargar consentimiento
          </button>
          {!readOnly && (
            <button
              onClick={addRow}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar persona
            </button>
          )}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-3 font-medium">ID de trabajador</th>
              <th className="py-3 font-medium">Nombre</th>
              <th className="py-3 font-medium">Póliza</th>
              <th className="py-3 font-medium">Vigencia</th>
              <th className="py-3 font-medium">Fecha de renovación</th>
              <th className="py-3 font-medium">Correo</th>
              <th className="py-3 font-medium">Teléfono</th>
              <th className="py-3 font-medium">Consentimiento</th>
              <th className="py-3 font-medium">Certificado</th>
              <th className="py-3 font-medium">Status</th>
              {!readOnly && <th className="py-3 font-medium" />}
            </tr>
          </thead>
          <tbody>
            {poliza.asegurados.length === 0 && (
              <tr>
                <td colSpan={11} className="py-8 text-center text-sm text-muted-foreground">
                  Aún no hay asegurados. Carga el archivo o agrega una persona.
                </td>
              </tr>
            )}
            {poliza.asegurados.map((a) => (
              <tr key={a.id} className="border-t border-border/60">
                <td className="py-3 text-foreground/80">{a.trabajadorId}</td>
                <td className="py-3">
                  {readOnly ? (
                    a.nombre || "—"
                  ) : (
                    <input
                      value={a.nombre}
                      onChange={(e) =>
                        onChange(
                          poliza.asegurados.map((x) =>
                            x.id === a.id ? { ...x, nombre: e.target.value } : x,
                          ),
                        )
                      }
                      className="w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none focus:bg-muted/40"
                      placeholder="Nombre"
                    />
                  )}
                </td>
                <td className="py-3 text-foreground/80">{a.poliza}</td>
                <td className="py-3 text-foreground/80">{a.vigencia}</td>
                <td className="py-3 text-foreground/80">{a.renovacion}</td>
                <td className="py-3">
                  {readOnly ? (
                    a.correo || "—"
                  ) : (
                    <input
                      value={a.correo}
                      onChange={(e) =>
                        onChange(
                          poliza.asegurados.map((x) =>
                            x.id === a.id ? { ...x, correo: e.target.value } : x,
                          ),
                        )
                      }
                      className="w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none focus:bg-muted/40"
                      placeholder="correo@dominio.com"
                    />
                  )}
                </td>
                <td className="py-3">
                  {readOnly ? (
                    a.telefono || "—"
                  ) : (
                    <input
                      value={a.telefono}
                      onChange={(e) =>
                        onChange(
                          poliza.asegurados.map((x) =>
                            x.id === a.id ? { ...x, telefono: e.target.value } : x,
                          ),
                        )
                      }
                      className="w-full rounded-md bg-transparent px-2 py-1 text-sm outline-none focus:bg-muted/40"
                      placeholder="+000 000 000"
                    />
                  )}
                </td>
                <td className="py-3">
                  <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    {a.consentimiento ? "Descargar" : "-"}
                  </button>
                </td>
                <td className="py-3">
                  <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    {a.certificado ? "Descargar" : "-"}
                  </button>
                </td>
                <td className="py-3">
                  {readOnly ? (
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[a.status]}`}>
                      {a.status}
                    </span>
                  ) : (
                    <select
                      value={a.status}
                      onChange={(e) =>
                        onChange(
                          poliza.asegurados.map((x) =>
                            x.id === a.id
                              ? { ...x, status: e.target.value as typeof x.status }
                              : x,
                          ),
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium outline-none ${STATUS_COLORS[a.status]}`}
                    >
                      <option>Activa</option>
                      <option>Cancelada</option>
                      <option>En revisión</option>
                      <option>Por renovar</option>
                    </select>
                  )}
                </td>
                {!readOnly && (
                  <td className="py-3">
                    <button
                      onClick={() =>
                        onChange(poliza.asegurados.filter((x) => x.id !== a.id))
                      }
                      className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export function ComprobantesSection({
  poliza,
  onChange,
  readOnly,
}: {
  poliza: Poliza;
  onChange: (c: Poliza["comprobantes"]) => void;
  readOnly?: boolean;
}) {
  const addRow = () =>
    onChange([
      ...poliza.comprobantes,
      {
        id: crypto.randomUUID(),
        poliza: `GMM - ${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        tipoPago: "Cliente",
        fechaPago: "00/00/0000",
        recibo: false,
        fechaCarga: "00/00/0000",
        comprobante: false,
        estatus: "Sin archivo",
      },
    ]);

  return (
    <Section
      title="Comprobantes de pago"
      subtitle="Verifica los comprobantes de pago o sube el archivo."
      extra={
        !readOnly && (
          <button
            onClick={addRow}
            className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
          >
            <Plus className="h-4 w-4" /> Cargar recibos
          </button>
        )
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-3 font-medium">Póliza</th>
              <th className="py-3 font-medium">Tipo de pago</th>
              <th className="py-3 font-medium">Fecha de pago</th>
              <th className="py-3 font-medium">Recibo</th>
              <th className="py-3 font-medium">Fecha de carga</th>
              <th className="py-3 font-medium">Comprobante</th>
              <th className="py-3 font-medium">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {poliza.comprobantes.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                  Sin comprobantes registrados.
                </td>
              </tr>
            )}
            {poliza.comprobantes.map((c) => (
              <tr key={c.id} className="border-t border-border/60">
                <td className="py-3 text-foreground/80">{c.poliza}</td>
                <td className="py-3 text-foreground/80">{c.tipoPago}</td>
                <td className="py-3 text-foreground/80">{c.fechaPago}</td>
                <td className="py-3">
                  <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    {c.recibo ? "Descargar" : "-"}
                  </button>
                </td>
                <td className="py-3 text-foreground/80">{c.fechaCarga}</td>
                <td className="py-3">
                  <button className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    {c.comprobante ? "Descargar" : "-"}
                  </button>
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      c.estatus === "Cargado"
                        ? "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                        : "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]"
                    }`}
                  >
                    {c.estatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}