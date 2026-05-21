import { useEffect, useState } from "react";

export interface Asegurado {
  id: string;
  nombre: string;
  contacto: string;
  sexo: string;
  codigoPostal: string;
  fechaNacimiento: string;
  fechaAntiguedad: string;
  relacion: string;
}

export type EnvioType = "whatsapp" | "manual" | "pdf" | null;

export interface CotizadorDraft {
  nombre: string;
  contacto: string;
  correoContacto: string;
  tipoAsegurado: string;
  sexo: string;
  codigoPostal: string;
  fechaNacimiento: string;
  fechaAntiguedad: string;
  tipoSeguro: string;
  aseguradora: string;
  tipoPlan: string;
  tipoPersona: string;
  asegurados: Asegurado[];
  envio: EnvioType;
  /** poliza-specific dynamic fields */
  poliza: Record<string, string>;
}

const KEY = "zinois.cotizador.draft";

export function newAsegurado(): Asegurado {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    contacto: "",
    sexo: "",
    codigoPostal: "",
    fechaNacimiento: "",
    fechaAntiguedad: "",
    relacion: "",
  };
}

export function emptyDraft(): CotizadorDraft {
  return {
    nombre: "",
    contacto: "",
    correoContacto: "",
    tipoAsegurado: "",
    sexo: "",
    codigoPostal: "",
    fechaNacimiento: "",
    fechaAntiguedad: "",
    tipoSeguro: "",
    aseguradora: "",
    tipoPlan: "",
    tipoPersona: "",
    asegurados: [newAsegurado()],
    envio: null,
    poliza: {},
  };
}

export function loadDraft(): CotizadorDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CotizadorDraft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(d: CotizadorDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(d));
  window.dispatchEvent(new CustomEvent("cotizador-draft"));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("cotizador-draft"));
}

export function useDraft() {
  const [draft, setDraft] = useState<CotizadorDraft | null>(null);
  useEffect(() => {
    setDraft(loadDraft());
    const h = () => setDraft(loadDraft());
    window.addEventListener("cotizador-draft", h);
    return () => window.removeEventListener("cotizador-draft", h);
  }, []);
  return draft;
}