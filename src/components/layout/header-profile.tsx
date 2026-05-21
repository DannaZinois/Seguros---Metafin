import { useState } from "react";
import { X } from "lucide-react";

export interface ProfileField {
  label: string;
  value: string;
}

export function HeaderProfile({
  name,
  role,
  fields,
}: {
  name: string;
  role: string;
  fields: ProfileField[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-full px-2 py-1 transition-colors hover:bg-white"
        aria-label="Ver datos de la cuenta"
      >
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div>
                <h3 className="text-lg font-bold text-foreground">{name}</h3>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </div>
            <div className="mt-5 divide-y divide-border/60 rounded-2xl border border-border bg-muted/20">
              {fields.map((f) => (
                <div key={f.label} className="flex items-start justify-between gap-3 px-4 py-3">
                  <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
                  <span className="text-right text-sm text-foreground">{f.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}