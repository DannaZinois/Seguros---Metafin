import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, Download } from "lucide-react";

export const Route = createFileRoute("/_client/consentimiento/ver")({
  component: VerConsentimiento,
  head: () => ({ meta: [{ title: "Ver consentimiento" }] }),
});

function VerConsentimiento() {
  return (
    <div className="pb-12">
      <div className="flex items-center gap-3">
        <Link
          to="/mis-polizas"
          className="rounded-full p-2 hover:bg-muted"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Formato de consentimiento
          </h1>
          <p className="text-sm text-muted-foreground">
            Póliza P990235 — Vida — Mapfre
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="flex h-[480px] flex-col items-center justify-center rounded-2xl bg-muted/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand-blue)]/10 text-[color:var(--brand-blue)]">
            <FileText className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            consentimiento_P990235.pdf
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Vista previa del documento de consentimiento.
          </p>
          <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-xs font-medium text-white hover:opacity-90">
            <Download className="h-3.5 w-3.5" /> Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}