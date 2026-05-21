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
  return useStore<Aseguradora[]>(AS_KEY, []);
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