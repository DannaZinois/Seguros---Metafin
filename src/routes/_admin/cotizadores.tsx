import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/cotizadores")({
  component: () => (
    <div>
      <h1 className="text-4xl font-bold text-foreground">Cotizadores</h1>
      <p className="mt-2 text-sm text-muted-foreground">Próximamente.</p>
    </div>
  ),
});