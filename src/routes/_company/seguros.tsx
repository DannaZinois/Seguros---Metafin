import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Section, Popup, type PopupState } from "@/components/cotizador/shared";
import { useCompanyEmpresa } from "@/lib/company-context";

export const Route = createFileRoute("/_company/seguros")({
  component: SegurosPage,
  head: () => ({ meta: [{ title: "Mis seguros" }] }),
});

function SegurosPage() {
  const empresa = useCompanyEmpresa();
  const navigate = useNavigate();
  const [popup, setPopup] = useState<PopupState>(null);

  if (!empresa) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  const goToPoliza = (polizaId: string) =>
    navigate({ to: "/seguros/$polizaId", params: { polizaId } });

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
                  <td
                    colSpan={7}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Sin pólizas registradas.
                  </td>
                </tr>
              ) : (
                empresa.polizas.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer border-t border-border/60 hover:bg-muted/40"
                    onClick={() => goToPoliza(p.id)}
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
                          onClick={() => goToPoliza(p.id)}
                          title="Editar"
                          aria-label="Editar"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand-blue)] text-white hover:bg-[color:var(--brand-blue-dark)]"
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
      {popup && <Popup state={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}