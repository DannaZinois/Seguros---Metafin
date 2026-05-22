import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Pencil } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface ProfileField {
  label: string;
  value: string;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "·";
}

export function HeaderProfile({
  name,
  role,
  fields,
  editTo,
}: {
  name: string;
  role: string;
  fields: ProfileField[];
  editTo?: string;
}) {
  const [open, setOpen] = useState(false);
  const initials = getInitials(name);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const modal = open && typeof document !== "undefined"
    ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white shadow-md"
                style={{ background: "var(--gradient-brand)" }}
              >
                {initials}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground">{role}</p>
              </div>
            </div>
            <div className="mt-6 divide-y divide-border/60 rounded-2xl border border-border bg-muted/20">
              {fields.map((f) => (
                <div
                  key={f.label}
                  className="flex items-start justify-between gap-4 px-5 py-3.5"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    {f.label}
                  </span>
                  <span className="text-right text-sm font-medium text-foreground">
                    {f.value || "—"}
                  </span>
                </div>
              ))}
            </div>
            {editTo && (
              <div className="mt-6 flex justify-end">
                <Link
                  to={editTo}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Link>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-full border border-transparent px-2 py-1 transition-all hover:border-border hover:bg-white hover:shadow-sm"
        aria-label="Ver datos de la cuenta"
      >
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm ring-2 ring-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          {initials}
        </div>
      </button>
      {modal}
    </>
  );
}