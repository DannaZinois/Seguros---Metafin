import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Pencil, Check, Camera } from "lucide-react";

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
  onSave,
  editableLabels,
}: {
  name: string;
  role: string;
  fields: ProfileField[];
  onSave?: (fields: ProfileField[]) => void;
  /** Optional whitelist of labels that can be edited. Defaults to all. */
  editableLabels?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [localFields, setLocalFields] = useState<ProfileField[]>(fields);
  const storageKey = `header-profile:${role}:${name}`;
  const [savedFields, setSavedFields] = useState<ProfileField[] | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate persisted overrides from localStorage on mount / identity change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          fields?: ProfileField[];
          photo?: string | null;
        };
        setSavedFields(parsed.fields ?? null);
        setPhoto(parsed.photo ?? null);
      } else {
        setSavedFields(null);
        setPhoto(null);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  // Merge incoming fields with any saved overrides (saved values win).
  const mergedFields: ProfileField[] = fields.map((f) => {
    const override = savedFields?.find((s) => s.label === f.label);
    return override ? { ...f, value: override.value } : f;
  });
  const fieldsKey = useRef("");
  const newKey = JSON.stringify(mergedFields);
  if (fieldsKey.current !== newKey && !editing) {
    fieldsKey.current = newKey;
  }
  useEffect(() => {
    if (!editing) setLocalFields(mergedFields);
  }, [fieldsKey.current, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  const initials = getInitials(name);
  const canEditLabel = (label: string) =>
    !editableLabels || editableLabels.includes(label);

  const updateField = (label: string, value: string) => {
    setLocalFields((prev) =>
      prev.map((f) => (f.label === label ? { ...f, value } : f)),
    );
  };

  const handleSave = () => {
    onSave?.(localFields);
    setSavedFields(localFields);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ fields: localFields, photo }),
        );
      } catch {
        /* ignore */
      }
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setLocalFields(mergedFields);
    setEditing(false);
  };

  const handleClose = () => {
    handleCancel();
    setOpen(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;
      if (!dataUrl) return;
      setPhoto(dataUrl);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify({ fields: savedFields ?? localFields, photo: dataUrl }),
          );
        } catch {
          /* ignore */
        }
      }
    };
    reader.readAsDataURL(file);
  };

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
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="relative">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="h-16 w-16 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white shadow-md"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {initials}
                  </div>
                )}
                {editing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow-md ring-2 ring-white hover:bg-orange-600"
                      aria-label="Cargar foto"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground">{role}</p>
                {editing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
                  >
                    <Camera className="h-3 w-3" /> Cambiar foto
                  </button>
                )}
              </div>
            </div>
            <div className="mt-6 divide-y divide-border/60 rounded-2xl border border-border bg-muted/20">
              {localFields.map((f) => (
                <div
                  key={f.label}
                  className="flex items-start justify-between gap-4 px-5 py-3.5"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    {f.label}
                  </span>
                  {editing && canEditLabel(f.label) ? (
                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => updateField(f.label, e.target.value)}
                      className="w-1/2 rounded-lg border border-border bg-white px-3 py-1.5 text-right text-sm font-medium text-foreground focus:border-orange-500 focus:outline-none"
                    />
                  ) : (
                    <span className="text-right text-sm font-medium text-foreground">
                      {f.value || "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                  >
                    <X className="h-4 w-4" /> Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    <Check className="h-4 w-4" /> Guardar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </button>
              )}
            </div>
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
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-white"
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm ring-2 ring-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            {initials}
          </div>
        )}
      </button>
      {modal}
    </>
  );
}