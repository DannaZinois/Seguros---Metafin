import { createFileRoute } from "@tanstack/react-router";
import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { Section, Popup, type PopupState } from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";
import type { Poliza } from "@/lib/empresa-store";

export const Route = createFileRoute("/_company/seguros")({
  component: SegurosPage,
  head: () => ({ meta: [{ title: "Mis seguros" }] }),
});

function SegurosPage() {
  const empresa = useCompanyEmpresa();
  const [popup, setPopup] = useState<PopupState>(null);
  const [detail, setDetail] = useState<Poliza | null>(null);

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

  return (
    <div className="pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Mis seguros
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulta las pólizas activas de {empresa.nombre}.
        </p>
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
                      <button
                        onClick={() => handleBaja(p.tipo || "")}
                        title="Dar de baja"
                        aria-label="Dar de baja"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--status-cancelled)] text-[color:var(--status-cancelled-fg)] hover:opacity-90"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
    </div>
  );
}