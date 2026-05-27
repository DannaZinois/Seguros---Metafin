import { useEffect, useState } from "react";

export interface AseguradoDoc {
  id: string;
  /** RFC del asegurado dueño del archivo */
  rfc: string;
  /** Nombre detectado (si aplica) */
  nombre?: string;
  /** ID de póliza al que pertenece (si se sabe) */
  polizaId?: string;
  /** ID del asegurado (si se sabe) */
  aseguradoId?: string;
  /** Nombre original del archivo */
  fileName: string;
  mime: string;
  size: number;
  /** Contenido del archivo como data URL base64 */
  dataUrl: string;
  /** Origen del archivo */
  source: "zip" | "pdf-split" | "manual";
  /** Marcado como certificado */
  esCertificado?: boolean;
  /** Marcado como consentimiento (va a la tabla de Formato de consentimiento) */
  esConsentimiento?: boolean;
  createdAt: number;
}

const KEY = "zinois.aseguradoDocs";

function read(): AseguradoDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AseguradoDoc[]) : [];
  } catch {
    return [];
  }
}

function write(list: AseguradoDoc[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("asegurado-docs-changed"));
}

export function addAseguradoDocs(docs: AseguradoDoc[]) {
  const list = read();
  write([...docs, ...list]);
}

export function removeAseguradoDoc(id: string) {
  write(read().filter((d) => d.id !== id));
}

export function useAseguradoDocs(): AseguradoDoc[] {
  const [list, setList] = useState<AseguradoDoc[]>([]);
  useEffect(() => {
    setList(read());
    const h = () => setList(read());
    window.addEventListener("asegurado-docs-changed", h);
    return () => window.removeEventListener("asegurado-docs-changed", h);
  }, []);
  return list;
}

export function getDocsByRfc(all: AseguradoDoc[], rfc?: string | null): AseguradoDoc[] {
  if (!rfc) return [];
  const r = rfc.trim().toUpperCase();
  if (!r) return [];
  return all.filter((d) => d.rfc?.trim().toUpperCase() === r);
}

export function getConsentimientosByRfc(
  all: AseguradoDoc[],
  rfc?: string | null,
): AseguradoDoc[] {
  return getDocsByRfc(all, rfc).filter((d) => d.esConsentimiento);
}

export function getDocsForPoliza(
  all: AseguradoDoc[],
  polizaId?: string | null,
): AseguradoDoc[] {
  if (!polizaId) return [];
  return all.filter((d) => d.polizaId === polizaId);
}

export function downloadDoc(d: AseguradoDoc) {
  const a = document.createElement("a");
  a.href = d.dataUrl;
  a.download = d.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function viewDoc(d: AseguradoDoc) {
  window.open(d.dataUrl, "_blank", "noopener,noreferrer");
}

/** RFC mexicano (persona física o moral) */
export const RFC_REGEX = /\b([A-ZÑ&]{3,4})\d{6}([A-Z\d]{2})[A\d]\b/;
