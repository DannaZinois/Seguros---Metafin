import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Plus, Trash2, FileText, Upload } from "lucide-react";
import { useAseguradoras, type Aseguradora } from "@/lib/store";

export const Route = createFileRoute("/_admin/aseguradoras")({
  component: AseguradorasPage,
  head: () => ({ meta: [{ title: "Aseguradoras" }] }),
});

function AseguradorasPage() {
  const [list, setList] = useAseguradoras();
  const [name, setName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<string>("");

  const add = () => {
    if (!name.trim()) return;
    const item: Aseguradora = {
      id: crypto.randomUUID(),
      name: name.trim(),
      pdfName: pendingFile || undefined,
    };
    setList([...list, item]);
    setName("");
    setPendingFile("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = (id: string) => setList(list.filter((a) => a.id !== id));

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Aseguradoras
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Registra las aseguradoras disponibles y su PDF base para cotizaciones.
      </p>

      <div className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label className="text-xs font-medium text-foreground">
              Nombre de aseguradora
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. AXA"
              className="mt-1 w-full rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">
              PDF base (opcional)
            </label>
            <label className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted/40">
              <Upload className="h-4 w-4" />
              {pendingFile || "Subir archivo PDF"}
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) =>
                  setPendingFile(e.target.files?.[0]?.name ?? "")
                }
              />
            </label>
          </div>
          <button
            onClick={add}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[color:var(--brand-blue)] px-5 text-sm font-medium text-white hover:bg-[color:var(--brand-blue-dark)]"
          >
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Aseguradora</th>
              <th className="px-6 py-4 font-medium">PDF</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                  Aún no hay aseguradoras registradas.
                </td>
              </tr>
            )}
            {list.map((a) => (
              <tr key={a.id} className="border-b border-border/60 last:border-0">
                <td className="px-6 py-4 font-medium text-foreground">{a.name}</td>
                <td className="px-6 py-4 text-foreground/80">
                  {a.pdfName ? (
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[color:var(--brand-blue)]" />
                      {a.pdfName}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => remove(a.id)}
                    className="rounded-full p-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}