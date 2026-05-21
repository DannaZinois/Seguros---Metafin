import { useRef } from "react";
import { Calendar, ChevronDown, MessageSquare, UploadCloud, X } from "lucide-react";
import { useChats } from "@/lib/store";

export function Section({
  title,
  subtitle,
  extra,
  children,
}: {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {extra}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-[color:var(--brand-blue)] ${
        readOnly ? "cursor-not-allowed bg-muted/40 text-muted-foreground" : ""
      }`}
    />
  );
}

export function DateInput({
  value,
  onChange,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-full border border-border bg-white px-4 py-2 pr-9 text-sm outline-none focus:border-[color:var(--brand-blue)] ${
          readOnly ? "cursor-not-allowed bg-muted/40 text-muted-foreground" : ""
        }`}
      />
      <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange?: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full appearance-none rounded-full border border-border bg-white px-4 py-2 pr-9 text-sm outline-none focus:border-[color:var(--brand-blue)] ${
          disabled ? "cursor-not-allowed bg-muted/40 text-muted-foreground" : ""
        }`}
      >
        <option value="">{placeholder ?? "Selecciona"}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function EnvioOption({
  label,
  active,
  onClick,
  color,
  icon,
  text,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-3 text-sm text-foreground">{label}</span>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all ${color} ${
          active ? "ring-2 ring-offset-2 ring-foreground/40" : ""
        }`}
      >
        {icon}
        {text}
      </button>
    </div>
  );
}

export function Dropzone({
  onFile,
  className,
}: {
  onFile: (f: File) => void;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label
      className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-white text-sm text-muted-foreground hover:bg-muted/40 ${className ?? ""}`}
    >
      <UploadCloud className="h-6 w-6 text-[color:var(--brand-blue)]" />
      Arrastra tu archivo aquí o da click
      <input
        ref={ref}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </label>
  );
}

export type PopupState =
  | null
  | { kind: "error" | "info"; title: string; message: string }
  | {
      kind: "confirm";
      title: string;
      message: string;
      onConfirm: () => void;
    }
  | {
      kind: "upload";
      title: string;
      onFile: (f: File) => void;
    }
  | {
      kind: "client-upload";
      title: string;
      message: string;
      onSelf: () => void;
      onClient: () => void;
    }
  | { kind: "chat"; phone: string };

export function Popup({
  state,
  onClose,
}: {
  state: NonNullable<PopupState>;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        {state.kind === "chat" ? (
          <ChatPanel phone={state.phone} />
        ) : state.kind === "upload" ? (
          <UploadPanel
            title={state.title}
            onFile={(f) => {
              state.onFile(f);
              onClose();
            }}
          />
        ) : state.kind === "client-upload" ? (
          <>
            <h3 className="text-lg font-bold text-foreground">{state.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => state.onClient()}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Pedir al cliente
              </button>
              <button
                onClick={() => state.onSelf()}
                className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm text-white hover:bg-[color:var(--brand-blue-dark)]"
              >
                Subirlo yo mismo
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-foreground">{state.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              {state.kind === "confirm" ? (
                <>
                  <button
                    onClick={onClose}
                    className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={state.onConfirm}
                    className="rounded-full bg-destructive px-4 py-2 text-sm text-white hover:opacity-90"
                  >
                    Sí, borrar
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="rounded-full bg-[color:var(--brand-blue)] px-4 py-2 text-sm text-white hover:bg-[color:var(--brand-blue-dark)]"
                >
                  Entendido
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UploadPanel({
  title,
  onFile,
}: {
  title: string;
  onFile: (f: File) => void;
}) {
  return (
    <>
      <h3 className="text-lg font-bold text-foreground">Subir: {title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Arrastra el archivo o da click para seleccionarlo.
      </p>
      <div className="mt-4">
        <Dropzone onFile={onFile} />
      </div>
    </>
  );
}

function ChatPanel({ phone }: { phone: string }) {
  const [chats] = useChats();
  const messages = chats[phone] ?? [];
  return (
    <div className="flex max-h-[70vh] flex-col">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <div className="rounded-full bg-green-500 p-2 text-white">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">WhatsApp</p>
          <p className="text-xs text-muted-foreground">{phone}</p>
        </div>
      </div>
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin mensajes aún.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              m.from === "agent"
                ? "ml-auto bg-green-100 text-green-900"
                : m.from === "bot"
                  ? "bg-muted text-foreground"
                  : "bg-[color:var(--brand-bg-soft)] text-foreground"
            }`}
          >
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {m.from}
            </p>
            <p className="whitespace-pre-wrap">{m.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}