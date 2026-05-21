import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Search, Download, Upload, UserPlus, FileText, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Section,
  Field,
  TextInput,
  Popup,
  type PopupState,
} from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";
import { saveEmpresa, type Asegurado, type Empresa } from "@/lib/empresa-store";

export const Route = createFileRoute("/_company/empleados")({
  component: EmpleadosPage,
  head: () => ({ meta: [{ title: "Empleados" }] }),
});

interface EmpleadoRow extends Asegurado {
  polizaTipo: string;
}

type Mode = "choose" | "bulk" | "individual";

function isVida(tipo: string) {
  return tipo.toLowerCase().includes("vida");
}

function EmpleadosPage() {
  const empresa = useCompanyEmpresa();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("choose");
  const [popup, setPopup] = useState<PopupState>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const bulkRef = useRef<HTMLInputElement | null>(null);
  const cotizRef = useRef<HTMLInputElement | null>(null);
  const cuestRef = useRef<HTMLInputElement | null>(null);

  const initialForm = {
    nombre: "",
    trabajadorId: "",
    vigencia: "",
    codigoPostal: "",
    telefono: "",
    sexo: "F" as "F" | "M",
    contacto: "",
    polizaTipo: "",
    cotizacion: "",
    cuestionario: "",
  };
  const [form, setForm] = useState(initialForm);

  const empleados: EmpleadoRow[] = useMemo(() => {
    if (!empresa) return [];
    const rows: EmpleadoRow[] = [];
    for (const p of empresa.polizas) {
      for (const a of p.asegurados) {
        rows.push({ ...a, polizaTipo: p.tipo });
      }
    }
    return rows;
  }, [empresa]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return empleados;
    return empleados.filter(
      (e) =>
        e.trabajadorId.toLowerCase().includes(q) ||
        e.nombre.toLowerCase().includes(q),
    );
  }, [empleados, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage],
  );

  if (!empresa) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  const polizaTipos = Array.from(
    new Set(empresa.polizas.map((p) => p.tipo).filter(Boolean)),
  );

  const closeModal = () => {
    setOpen(false);
    setMode("choose");
    setForm(initialForm);
  };

  const handleBulkUpload = (file: File) => {
    closeModal();
    setPopup({
      kind: "info",
      title: "Archivo cargado",
      message: `Procesaremos "${file.name}" y agregaremos los empleados detectados.`,
    });
  };

  const handleSaveIndividual = () => {
    if (!form.nombre.trim() || !form.trabajadorId.trim() || !form.polizaTipo) {
      setPopup({
        kind: "error",
        title: "Datos incompletos",
        message: "Nombre, ID de trabajador y tipo de póliza son obligatorios.",
      });
      return;
    }
    const target = empresa.polizas.find((p) => p.tipo === form.polizaTipo);
    if (!target) {
      setPopup({
        kind: "error",
        title: "Póliza no encontrada",
        message: "No existe una póliza activa de ese tipo.",
      });
      return;
    }
    const nuevo: Asegurado = {
      id: crypto.randomUUID(),
      trabajadorId: form.trabajadorId.trim(),
      nombre: form.nombre.trim(),
      poliza: target.tipo,
      vigencia: form.vigencia || "00/00/0000",
      renovacion: "00/00/0000",
      correo: "",
      telefono: form.telefono,
      consentimiento: false,
      certificado: false,
      status: "Activa",
    };
    const updated: Empresa = {
      ...empresa,
      polizas: empresa.polizas.map((p) =>
        p.id === target.id ? { ...p, asegurados: [...p.asegurados, nuevo] } : p,
      ),
    };
    saveEmpresa(updated);
    closeModal();
    setPopup({
      kind: "info",
      title: "Empleado registrado",
      message: `${nuevo.nombre} fue agregado a la póliza ${target.tipo}.`,
    });
  };

  const showConsentimientoCol = empleados.some((e) => isVida(e.polizaTipo));
  const colCount = 8 + (showConsentimientoCol ? 1 : 0);

  return (
    <div className="pb-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Empleados
          </h1>
          <p className="text-sm text-muted-foreground">
            Empleados asegurados bajo las pólizas de {empresa.nombre}.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
        >
          <UserPlus className="h-4 w-4" /> Añadir empleado
        </button>
      </div>

      <Section title={`Total: ${empleados.length}`}>
        <div className="mb-4 flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por ID o nombre"
              className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[color:var(--brand-blue)]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">ID</th>
                <th className="py-3 font-medium">Nombre</th>
                <th className="py-3 font-medium">Póliza</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Renovación</th>
                <th className="py-3 font-medium">Teléfono</th>
                {showConsentimientoCol && (
                  <th className="py-3 font-medium">Consentimiento</th>
                )}
                <th className="py-3 font-medium">Certificado</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="py-8 text-center text-sm text-muted-foreground">
                    Sin resultados.
                  </td>
                </tr>
              ) : (
                pageRows.map((e) => (
                  <tr key={e.id} className="border-t border-border/60">
                    <td className="py-3 text-foreground/80">{e.trabajadorId}</td>
                    <td className="py-3">{e.nombre}</td>
                    <td className="py-3 text-foreground/80">{e.polizaTipo}</td>
                    <td className="py-3 text-foreground/80">{e.vigencia}</td>
                    <td className="py-3 text-foreground/80">{e.renovacion}</td>
                    <td className="py-3 text-foreground/80">{e.telefono}</td>
                    {showConsentimientoCol && (
                      <td className="py-3">
                        {isVida(e.polizaTipo) ? (
                          <button
                            onClick={() =>
                              setPopup({
                                kind: "info",
                                title: "Subir consentimiento",
                                message: `Carga el consentimiento firmado de ${e.nombre}.`,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 text-xs font-medium text-white hover:bg-violet-600"
                          >
                            <Upload className="h-3 w-3" /> Subir
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    )}
                    <td className="py-3">
                      <button
                        onClick={() =>
                          setPopup({
                            kind: "info",
                            title: "Descargar certificado",
                            message: `Descargando certificado de ${e.nombre}.`,
                          })
                        }
                        className="inline-flex items-center gap-1 text-[color:var(--brand-blue)] underline-offset-4 hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" /> Descargar
                      </button>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-[color:var(--status-active)] px-3 py-1 text-xs font-medium text-[color:var(--status-active-fg)]">
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Mostrando {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`min-w-8 rounded-full px-3 py-1 text-xs font-medium ${
                    n === currentPage
                      ? "bg-[color:var(--brand-blue)] text-white"
                      : "text-foreground/80 hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Section>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            {mode === "choose" && (
              <>
                <h3 className="text-lg font-bold text-foreground">Añadir empleado</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  ¿Cómo deseas agregar a los empleados?
                </p>
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <button
                    onClick={() => setMode("bulk")}
                    className="rounded-2xl border border-border p-5 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
                  >
                    <Upload className="mb-2 h-5 w-5 text-[color:var(--brand-blue)]" />
                    <div className="font-semibold">Carga masiva</div>
                    <p className="text-xs text-muted-foreground">
                      Sube un archivo CSV o Excel con los datos de varios empleados.
                    </p>
                  </button>
                  <button
                    onClick={() => setMode("individual")}
                    className="rounded-2xl border border-border p-5 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
                  >
                    <UserPlus className="mb-2 h-5 w-5 text-[color:var(--brand-blue)]" />
                    <div className="font-semibold">Registro individual</div>
                    <p className="text-xs text-muted-foreground">
                      Captura los datos de un empleado y los documentos requeridos.
                    </p>
                  </button>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {mode === "bulk" && (
              <>
                <h3 className="text-lg font-bold text-foreground">Carga masiva</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sube un archivo .csv o .xlsx con los empleados a registrar.
                </p>
                <div
                  onClick={() => bulkRef.current?.click()}
                  className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-10 hover:border-[color:var(--brand-blue)] hover:bg-muted/30"
                >
                  <Upload className="h-8 w-8 text-[color:var(--brand-blue)]" />
                  <div className="text-sm font-medium">Haz clic para seleccionar el archivo</div>
                  <div className="text-xs text-muted-foreground">CSV o XLSX</div>
                  <input
                    ref={bulkRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleBulkUpload(f);
                    }}
                  />
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setMode("choose")}
                    className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={closeModal}
                    className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {mode === "individual" && (
              <>
                <h3 className="text-lg font-bold text-foreground">Registro individual</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Captura los datos básicos del nuevo empleado.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Nombre completo">
                    <TextInput value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
                  </Field>
                  <Field label="ID de trabajador">
                    <TextInput value={form.trabajadorId} onChange={(v) => setForm({ ...form, trabajadorId: v })} />
                  </Field>
                  <Field label="Vigencia">
                    <TextInput placeholder="DD/MM/AAAA" value={form.vigencia} onChange={(v) => setForm({ ...form, vigencia: v })} />
                  </Field>
                  <Field label="Código postal">
                    <TextInput value={form.codigoPostal} onChange={(v) => setForm({ ...form, codigoPostal: v })} />
                  </Field>
                  <Field label="Teléfono">
                    <TextInput value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
                  </Field>
                  <Field label="Número de contacto">
                    <TextInput value={form.contacto} onChange={(v) => setForm({ ...form, contacto: v })} />
                  </Field>
                  <Field label="Sexo">
                    <select
                      value={form.sexo}
                      onChange={(e) => setForm({ ...form, sexo: e.target.value as "F" | "M" })}
                      className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm"
                    >
                      <option value="F">Femenino</option>
                      <option value="M">Masculino</option>
                    </select>
                  </Field>
                  <Field label="Tipo de póliza">
                    <select
                      value={form.polizaTipo}
                      onChange={(e) => setForm({ ...form, polizaTipo: e.target.value })}
                      className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm"
                    >
                      <option value="">Selecciona...</option>
                      {polizaTipos.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div
                    onClick={() => cotizRef.current?.click()}
                    className="cursor-pointer rounded-2xl border border-border p-4 hover:border-[color:var(--brand-blue)] hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[color:var(--brand-blue)]" />
                      <div className="text-sm font-semibold">Formulario de cotización</div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {form.cotizacion
                        ? form.cotizacion
                        : `Sube el formulario${form.polizaTipo ? ` para ${form.polizaTipo}` : ""}.`}
                    </p>
                    <input
                      ref={cotizRef}
                      type="file"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setForm({ ...form, cotizacion: f.name });
                      }}
                    />
                  </div>
                  <div
                    onClick={() => cuestRef.current?.click()}
                    className="cursor-pointer rounded-2xl border border-border p-4 hover:border-[color:var(--brand-blue)] hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-[color:var(--brand-blue)]" />
                      <div className="text-sm font-semibold">Cuestionario</div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {form.cuestionario
                        ? form.cuestionario
                        : `Sube el cuestionario${form.polizaTipo ? ` de ${form.polizaTipo}` : ""}.`}
                    </p>
                    <input
                      ref={cuestRef}
                      type="file"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setForm({ ...form, cuestionario: f.name });
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setMode("choose")}
                    className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                  >
                    Atrás
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={closeModal}
                      className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveIndividual}
                      className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm text-white hover:bg-[color:var(--brand-blue-dark)]"
                    >
                      Registrar empleado
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}