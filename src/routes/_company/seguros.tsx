import { createFileRoute } from "@tanstack/react-router";
import { Trash2, X, Plus, Upload, UserPlus, Loader2, CheckCircle2, Pencil, FileText, FileBadge, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Section,
  Popup,
  Field,
  TextInput,
  type PopupState,
} from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";
import type { Poliza } from "@/lib/empresa-store";
import { useAseguradoras } from "@/lib/store";

export const Route = createFileRoute("/_company/seguros")({
  component: SegurosPage,
  head: () => ({ meta: [{ title: "Mis seguros" }] }),
});

function SegurosPage() {
  const empresa = useCompanyEmpresa();
  const [aseguradorasList] = useAseguradoras();
  const [popup, setPopup] = useState<PopupState>(null);
  const [detail, setDetail] = useState<Poliza | null>(null);
  const [nuevoOpen, setNuevoOpen] = useState(false);
  type NuevoStep = "form" | "reviewing" | "approved";
  const [step, setStep] = useState<NuevoStep>("form");
  const [editingId, setEditingId] = useState<string | null>(null);
  const bulkRef = useRef<HTMLInputElement | null>(null);
  const initialNuevo = {
    tipo: "",
    aseguradora: "",
    contratante: empresa?.nombre ?? "",
    contacto: "",
    codigoPostal: empresa?.codigoPostal ?? "",
    tipoPago: "",
    numAsegurados: "",
    rfc: empresa?.rfc ?? "",
    vigencia: "",
    comentarios: "",
  };
  const [nuevo, setNuevo] = useState(initialNuevo);

  useEffect(() => {
    if (step !== "reviewing") return;
    const t = setTimeout(() => setStep("approved"), 1800);
    return () => clearTimeout(t);
  }, [step]);

  if (!empresa) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  const handleBaja = (tipo: string) => {
    setPopup({
      kind: "confirm",
      title: `Dar de baja póliza ${tipo}`,
      message:
        "Esta acción es permanente: se removerán todos los privilegios asociados a esta póliza y se notificará al administrador original que solicitas su cancelación. ¿Deseas continuar?",
      onConfirm: () => {
        setPopup({
          kind: "info",
          title: "Solicitud enviada",
          message:
            "Se notificó al administrador original sobre tu solicitud de cancelación. Te contactaremos para confirmar la baja.",
        });
      },
    });
  };

  const closeNuevo = () => {
    setNuevoOpen(false);
    setNuevo(initialNuevo);
    setStep("form");
    setEditingId(null);
  };

  const handleEdit = (p: Poliza) => {
    setEditingId(p.id);
    setNuevo({
      tipo: p.tipo ?? "",
      aseguradora: p.aseguradora ?? "",
      contratante: p.contratante ?? "",
      contacto: p.contacto ?? "",
      codigoPostal: p.codigoPostal ?? "",
      tipoPago: p.tipoPago ?? "",
      numAsegurados: p.numAsegurados ?? "",
      rfc: p.rfc ?? "",
      vigencia: p.vigencia ?? "",
      comentarios: "",
    });
    setStep("form");
    setNuevoOpen(true);
  };

  const handleSolicitar = () => {
    if (!nuevo.tipo.trim() || !nuevo.aseguradora.trim()) {
      setPopup({
        kind: "error",
        title: "Datos incompletos",
        message: "Tipo de póliza y aseguradora son obligatorios.",
      });
      return;
    }
    if (editingId) {
      closeNuevo();
      setPopup({
        kind: "info",
        title: "Cambios guardados",
        message: `Se actualizaron los datos de la póliza ${nuevo.tipo}.`,
      });
      return;
    }
    setStep("reviewing");
  };

  const handleBulk = (file: File) => {
    closeNuevo();
    setPopup({
      kind: "info",
      title: "Asegurados cargados",
      message: `Procesaremos "${file.name}" y asociaremos los asegurados a la nueva póliza ${nuevo.tipo}.`,
    });
  };

  const handleIndividual = () => {
    closeNuevo();
    setPopup({
      kind: "info",
      title: "Registro individual",
      message:
        "Te llevaremos al alta individual de asegurados para esta nueva póliza.",
    });
  };

  const handleDownload = (doc: string) => {
    setPopup({
      kind: "info",
      title: "Descarga iniciada",
      message: `Se está preparando el PDF de ${doc} para la póliza ${nuevo.tipo || ""}.`,
    });
  };

  return (
    <div className="pb-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Mis seguros
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulta las pólizas activas de {empresa.nombre}.
          </p>
        </div>
        <button
          onClick={() => setNuevoOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
        >
          <Plus className="h-4 w-4" /> Nuevo seguro
        </button>
      </div>

      <Section title="Pólizas activas">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-3 font-medium">Tipo de póliza</th>
                <th className="py-3 font-medium">Aseguradora</th>
                <th className="py-3 font-medium">Contratante</th>
                <th className="py-3 font-medium">Número de asegurados</th>
                <th className="py-3 font-medium">Vigencia</th>
                <th className="py-3 font-medium">Estatus</th>
                <th className="py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresa.polizas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                    Sin pólizas registradas.
                  </td>
                </tr>
              ) : (
                empresa.polizas.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer border-t border-border/60 hover:bg-muted/40"
                    onClick={() => setDetail(p)}
                  >
                    <td className="py-3">{p.tipo || "—"}</td>
                    <td className="py-3 text-foreground/80">{p.aseguradora}</td>
                    <td className="py-3 text-foreground/80">{p.contratante}</td>
                    <td className="py-3 text-foreground/80">{p.numAsegurados}</td>
                    <td className="py-3 text-foreground/80">{p.vigencia || "—"}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-4 py-1 text-xs font-medium ${
                          p.estatus === "Vencida"
                            ? "bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)]"
                            : "bg-[color:var(--status-active)] text-[color:var(--status-active-fg)]"
                        }`}
                      >
                        {p.estatus || "Vigente"}
                      </span>
                    </td>
                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        title="Editar"
                        aria-label="Editar"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand-blue)]/10 text-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/20"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleBaja(p.tipo || "")}
                        title="Dar de baja"
                        aria-label="Dar de baja"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)] hover:opacity-90"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-md"
          onClick={() => setDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={() => setDetail(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-foreground">
              Póliza {detail.tipo}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Datos generales de la póliza con {detail.aseguradora}.
            </p>
            <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 text-sm md:grid-cols-2">
              {[
                ["Tipo de póliza", detail.tipo],
                ["Aseguradora", detail.aseguradora],
                ["Contratante", detail.contratante],
                ["Número de contacto", detail.contacto],
                ["Código postal", detail.codigoPostal],
                ["Tipo de pago", detail.tipoPago],
                ["Número de asegurados", detail.numAsegurados],
                ["RFC", detail.rfc],
                ["Vigencia", detail.vigencia || "—"],
                ["Estatus", detail.estatus || "Vigente"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                  <dd className="text-foreground">{value || "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetail(null)}
                className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}

      {nuevoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-md"
          onClick={closeNuevo}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={closeNuevo}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-foreground">
              {step === "form" && (editingId ? "Editar póliza" : "Solicitar nuevo seguro")}
              {step === "reviewing" && "Revisando solicitud"}
              {step === "approved" && "Solicitud aprobada"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === "form" &&
                (editingId
                  ? "Actualiza los datos generales y administra a los asegurados de esta póliza."
                  : "Captura los datos generales de la nueva póliza a contratar.")}
              {step === "reviewing" &&
                "Tu solicitud está siendo revisada por nuestro equipo."}
              {step === "approved" &&
                `Tu póliza ${nuevo.tipo} con ${nuevo.aseguradora} fue aprobada. Ahora carga o registra a los asegurados.`}
            </p>

            {step === "form" && (
            <>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Tipo de póliza">
                <select
                  value={nuevo.tipo}
                  onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}
                  className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm"
                >
                  <option value="">Selecciona...</option>
                  <option value="GMM">GMM</option>
                  <option value="Vida">Vida</option>
                  <option value="Auto">Auto</option>
                  <option value="Exceso">Exceso</option>
                </select>
              </Field>
              <Field label="Aseguradora">
                <select
                  value={nuevo.aseguradora}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, aseguradora: e.target.value })
                  }
                  className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm"
                >
                  <option value="">Selecciona...</option>
                  {aseguradorasList.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Contratante">
                <TextInput
                  value={nuevo.contratante}
                  onChange={(v) => setNuevo({ ...nuevo, contratante: v })}
                />
              </Field>
              <Field label="Número de contacto">
                <TextInput
                  value={nuevo.contacto}
                  onChange={(v) => setNuevo({ ...nuevo, contacto: v })}
                />
              </Field>
              <Field label="Código postal">
                <TextInput
                  value={nuevo.codigoPostal}
                  onChange={(v) => setNuevo({ ...nuevo, codigoPostal: v })}
                />
              </Field>
              <Field label="Tipo de pago">
                <select
                  value={nuevo.tipoPago}
                  onChange={(e) => setNuevo({ ...nuevo, tipoPago: e.target.value })}
                  className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm"
                >
                  <option value="">Selecciona...</option>
                  <option value="Anual">Anual</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Mensual">Mensual</option>
                </select>
              </Field>
              <Field label="Número de asegurados">
                <TextInput
                  value={nuevo.numAsegurados}
                  onChange={(v) => setNuevo({ ...nuevo, numAsegurados: v })}
                />
              </Field>
              <Field label="RFC">
                <TextInput
                  value={nuevo.rfc}
                  onChange={(v) => setNuevo({ ...nuevo, rfc: v })}
                />
              </Field>
              <Field label="Vigencia deseada">
                <TextInput
                  placeholder="DD/MM/AAAA"
                  value={nuevo.vigencia}
                  onChange={(v) => setNuevo({ ...nuevo, vigencia: v })}
                />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Comentarios">
                <textarea
                  value={nuevo.comentarios}
                  onChange={(e) => setNuevo({ ...nuevo, comentarios: e.target.value })}
                  rows={3}
                  placeholder="Describe coberturas o necesidades específicas."
                  className="w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
                />
              </Field>
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-border p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">
                Asegurados
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  onClick={() => bulkRef.current?.click()}
                  className="rounded-2xl border border-border p-4 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
                >
                  <Upload className="mb-2 h-5 w-5 text-[color:var(--brand-blue)]" />
                  <div className="text-sm font-semibold">Carga masiva</div>
                  <p className="text-xs text-muted-foreground">
                    Sube un CSV o Excel con los datos de tus asegurados.
                  </p>
                  <input
                    ref={bulkRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleBulk(f);
                    }}
                  />
                </button>
                <button
                  onClick={handleIndividual}
                  className="rounded-2xl border border-border p-4 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
                >
                  <UserPlus className="mb-2 h-5 w-5 text-[color:var(--brand-blue)]" />
                  <div className="text-sm font-semibold">Registro individual</div>
                  <p className="text-xs text-muted-foreground">
                    Captura los datos de cada asegurado uno por uno.
                  </p>
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-border p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">
                Documentos de la póliza
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <button
                  onClick={() => handleDownload("cuestionario")}
                  className="flex items-start gap-3 rounded-2xl border border-border p-4 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
                >
                  <FileText className="h-5 w-5 shrink-0 text-[color:var(--brand-blue)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">Cuestionario</span>
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">PDF del cuestionario.</p>
                  </div>
                </button>
                <button
                  onClick={() => handleDownload("condiciones generales")}
                  className="flex items-start gap-3 rounded-2xl border border-border p-4 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
                >
                  <FileText className="h-5 w-5 shrink-0 text-[color:var(--brand-blue)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">Condiciones generales</span>
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">PDF de condiciones.</p>
                  </div>
                </button>
                <button
                  onClick={() => handleDownload("certificados de asegurados")}
                  className="flex items-start gap-3 rounded-2xl border border-border p-4 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
                >
                  <FileBadge className="h-5 w-5 shrink-0 text-[color:var(--brand-blue)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">Certificados</span>
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">PDF de todos los asegurados.</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeNuevo}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleSolicitar}
                className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
              >
                {editingId ? "Guardar cambios" : "Enviar solicitud"}
              </button>
            </div>
            </>
            )}

            {step === "reviewing" && (
              <div className="mt-8 flex flex-col items-center gap-3 py-8 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-[color:var(--brand-blue)]" />
                <p className="text-sm font-medium text-foreground">
                  Tu solicitud está en revisión...
                </p>
                <p className="text-xs text-muted-foreground">
                  Esto puede tomar unos segundos.
                </p>
              </div>
            )}

            {step === "approved" && (
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-2 rounded-2xl bg-[color:var(--status-active)]/40 p-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Solicitud aprobada. Carga o registra a los asegurados que estarán bajo esta póliza.
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <button
                    onClick={() => bulkRef.current?.click()}
                    className="rounded-2xl border border-border p-5 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
                  >
                    <Upload className="mb-2 h-5 w-5 text-[color:var(--brand-blue)]" />
                    <div className="font-semibold">Carga masiva</div>
                    <p className="text-xs text-muted-foreground">
                      Sube un CSV o Excel con los datos de tus asegurados.
                    </p>
                    <input
                      ref={bulkRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleBulk(f);
                      }}
                    />
                  </button>
                  <button
                    onClick={handleIndividual}
                    className="rounded-2xl border border-border p-5 text-left hover:border-[color:var(--brand-blue)] hover:bg-muted/40"
                  >
                    <UserPlus className="mb-2 h-5 w-5 text-[color:var(--brand-blue)]" />
                    <div className="font-semibold">Registro individual</div>
                    <p className="text-xs text-muted-foreground">
                      Captura los datos de cada asegurado uno por uno.
                    </p>
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={closeNuevo}
                    className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                  >
                    Hacerlo más tarde
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}