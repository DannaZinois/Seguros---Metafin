import { useEffect, useState } from "react";

export type AccessType = "Admin" | "RRHH" | "Lectura";

export interface Encargado {
  id: string;
  nombre: string;
  contacto: string;
  email: string;
  acceso: AccessType;
  invited?: boolean;
}

export type EnvioType = "whatsapp" | "manual" | "pdf" | null;

export interface Asegurado {
  id: string;
  trabajadorId: string;
  nombre: string;
  poliza: string;
  vigencia: string;
  renovacion: string;
  correo: string;
  telefono: string;
  consentimiento: boolean;
  certificado: boolean;
  status: "Activa" | "Cancelada" | "En revisión" | "Por renovar";
}

export interface Comprobante {
  id: string;
  poliza: string;
  tipoPago: "Cliente" | "Asesor";
  fechaPago: string;
  recibo: boolean;
  fechaCarga: string;
  comprobante: boolean;
  estatus: "Cargado" | "Sin archivo";
}

export interface Poliza {
  id: string;
  tipo: string;
  aseguradora: string;
  variante?: string;
  contratante: string;
  contacto: string;
  codigoPostal: string;
  tipoPago: string;
  numAsegurados: string;
  rfc: string;
  envio: EnvioType;
  asegurados: Asegurado[];
  comprobantes: Comprobante[];
  comentarios: string;
  cargaFileName?: string;
  vigencia?: string;
  estatus?: "Vigente" | "Vencida";
}

export interface Empresa {
  id: string;
  nombre: string;
  rfc: string;
  giro: string;
  direccion: string;
  codigoPostal: string;
  correoInstitucional?: string;
  encargados: Encargado[];
  polizas: Poliza[];
  createdAt: number;
}

const KEY = "zinois.empresas.v2";

function read(): Empresa[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Empresa[]) : [];
  } catch {
    return [];
  }
}

function write(list: Empresa[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("empresas-changed"));
}

export function useEmpresas() {
  const [list, setList] = useState<Empresa[]>([]);
  useEffect(() => {
    setList(read());
    const h = () => setList(read());
    window.addEventListener("empresas-changed", h);
    return () => window.removeEventListener("empresas-changed", h);
  }, []);
  return list;
}

export function useEmpresa(id: string | undefined) {
  const list = useEmpresas();
  return id ? list.find((e) => e.id === id) ?? null : null;
}

export function saveEmpresa(empresa: Empresa) {
  const list = read();
  const i = list.findIndex((e) => e.id === empresa.id);
  if (i >= 0) list[i] = empresa;
  else list.unshift(empresa);
  write(list);
}

export function deleteEmpresa(id: string) {
  write(read().filter((e) => e.id !== id));
}

/**
 * Seed the empresa store with demo companies if it is empty.
 * Used so the Cartera dummy "Empresa" profiles open the full registration
 * screen with realistic data.
 */
export function seedEmpresasIfEmpty(seeds: Empresa[]) {
  if (typeof window === "undefined") return;
  const existing = read();
  // Re-seed if empty, or if existing seeded entries are missing the richer
  // dummy data (asegurados/comprobantes). Preserves user-created empresas
  // that aren't in the seed set.
  if (existing.length === 0) {
    write(seeds);
    return;
  }
  const seedIds = new Set(seeds.map((s) => s.id));
  const userCreated = existing.filter((e) => !seedIds.has(e.id));
  const needsRefresh = seeds.some((s) => {
    const cur = existing.find((e) => e.id === s.id);
    return (
      !cur ||
      cur.nombre !== s.nombre ||
      cur.giro !== s.giro ||
      cur.direccion !== s.direccion ||
      cur.codigoPostal !== s.codigoPostal ||
      cur.polizas.length !== s.polizas.length ||
      cur.polizas.some((p) => p.asegurados.length === 0) ||
      cur.encargados.length !== s.encargados.length ||
      cur.encargados.some((e, i) => e.email !== s.encargados[i]?.email)
    );
  });
  if (needsRefresh) write([...userCreated, ...seeds]);
}

export function newEncargado(): Encargado {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    contacto: "",
    email: "",
    acceso: "Lectura",
    invited: false,
  };
}

export function newPoliza(): Poliza {
  return {
    id: crypto.randomUUID(),
    tipo: "",
    aseguradora: "",
    contratante: "",
    contacto: "",
    codigoPostal: "",
    tipoPago: "",
    numAsegurados: "",
    rfc: "",
    envio: null,
    asegurados: [],
    comprobantes: [],
    comentarios: "",
    vigencia: "00/00/0000",
    estatus: "Vigente",
  };
}

export function newEmpresa(): Empresa {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    rfc: "",
    giro: "",
    direccion: "",
    codigoPostal: "",
    encargados: [],
    polizas: [],
    createdAt: Date.now(),
  };
}

/** Permissions derived from access type */
export function canEdit(a: AccessType) {
  return a === "Admin" || a === "RRHH";
}