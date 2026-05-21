import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/aseguradoras")({
  component: () => (
    <div>
      <h1 className="text-4xl font-bold text-foreground">Aseguradoras</h1>
      <p className="mt-2 text-sm text-muted-foreground">Próximamente.</p>
    </div>
  ),
});