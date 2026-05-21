import { useEffect, useState } from "react";

export interface Aseguradora {
  id: string;
  name: string;
  pdfName?: string;
  imageDataUrl?: string;
  rfc?: string;
  abreviacion?: string;
  ejecutivo?: string;
  contactoTel?: string;
  contactoEmail?: string;
  webUrl?: string;
  pagoUrl?: string;
  appUrl?: string;
  usuario?: string;
  contrasena?: string;
  claveAgente?: string;
  polizas?: PolizaTipo[];
}

export type TipoSeguro = "Auto" | "Vida" | "Gastos médicos mayores" | "Exceso";

export interface VariantePoliza {
  id: string;
  nombre: string;
  pdfName?: string;
  wordName?: string;
}

export interface PolizaTipo {
  id: string;
  tipo: TipoSeguro;
  variantes: VariantePoliza[];
}

const AS_KEY = "zinois.aseguradoras";
const CHAT_KEY = "zinois.whatsapp";

const DUMMY_ASEGURADORAS: Aseguradora[] = [
  { id: "as-gnp", name: "GNP Seguros", abreviacion: "GNP", rfc: "GNP9211254P0", ejecutivo: "María López", contactoTel: "55 1234 5678", contactoEmail: "mlopez@gnp.com.mx", webUrl: "https://www.gnp.com.mx" },
  { id: "as-axa", name: "AXA Seguros", abreviacion: "AXA", rfc: "ASE931116231", ejecutivo: "Carlos Méndez", contactoTel: "55 2345 6789", contactoEmail: "cmendez@axa.com.mx", webUrl: "https://www.axa.mx" },
  { id: "as-qualitas", name: "Quálitas", abreviacion: "QLT", rfc: "QCS931209G49", ejecutivo: "Ana Rivera", contactoTel: "55 3456 7890", contactoEmail: "arivera@qualitas.com.mx", webUrl: "https://www.qualitas.com.mx" },
  { id: "as-metlife", name: "MetLife México", abreviacion: "MET", rfc: "MME920427EM5", ejecutivo: "Jorge Hernández", contactoTel: "55 4567 8901", contactoEmail: "jhernandez@metlife.com.mx", webUrl: "https://www.metlife.com.mx" },
  { id: "as-mapfre", name: "Mapfre México", abreviacion: "MAP", rfc: "SCM920424162", ejecutivo: "Laura Torres", contactoTel: "55 5678 9012", contactoEmail: "ltorres@mapfre.com.mx", webUrl: "https://www.mapfre.com.mx" },
  { id: "as-banorte", name: "Seguros Banorte", abreviacion: "BNT", rfc: "SBG971124PL2", ejecutivo: "Roberto Sánchez", contactoTel: "55 6789 0123", contactoEmail: "rsanchez@banorte.com", webUrl: "https://www.segurosbanorte.com.mx" },
  { id: "as-monterrey", name: "Seguros Monterrey New York Life", abreviacion: "SMNYL", rfc: "SMN930101AB1", ejecutivo: "Patricia Gómez", contactoTel: "55 7890 1234", contactoEmail: "pgomez@smnyl.com.mx", webUrl: "https://www.mnyl.com.mx" },
  { id: "as-atlas", name: "Seguros Atlas", abreviacion: "ATL", rfc: "SAT8410245V8", ejecutivo: "Fernando Ruiz", contactoTel: "55 8901 2345", contactoEmail: "fruiz@segurosatlas.com.mx", webUrl: "https://www.segurosatlas.com.mx" },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(`store:${key}`));
}

function useStore<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(fallback);
  useEffect(() => {
    setState(read<T>(key, fallback));
    const h = () => setState(read<T>(key, fallback));
    window.addEventListener(`store:${key}`, h);
    return () => window.removeEventListener(`store:${key}`, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [
    state,
    (v: T | ((p: T) => T)) => {
      const next =
        typeof v === "function" ? (v as (p: T) => T)(read<T>(key, fallback)) : v;
      write(key, next);
      setState(next);
    },
  ] as const;
}

export function useAseguradoras() {
  const result = useStore<Aseguradora[]>(AS_KEY, DUMMY_ASEGURADORAS);
  const [list] = result;
  if (typeof window !== "undefined" && Array.isArray(list) && list.length === 0) {
    write(AS_KEY, DUMMY_ASEGURADORAS);
  }
  return result;
}

export interface ChatMessage {
  id: string;
  from: "bot" | "client" | "agent";
  text: string;
  ts: number;
}
export type ChatsByPhone = Record<string, ChatMessage[]>;

export function useChats() {
  return useStore<ChatsByPhone>(CHAT_KEY, {});
}

export function appendChat(phone: string, msg: Omit<ChatMessage, "id" | "ts">) {
  const all = read<ChatsByPhone>(CHAT_KEY, {});
  const list = all[phone] ?? [];
  list.push({ ...msg, id: crypto.randomUUID(), ts: Date.now() });
  all[phone] = list;
  write(CHAT_KEY, all);
}