import { useEffect, useState } from "react";

export type AccessType = "Admin" | "RRHH" | "Lectura";

export interface Encargado {
  id: string;
  nombre: string;
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
}

export interface Empresa {
  id: string;
  nombre: string;
  rfc: string;
  giro: string;
  codigoPostal: string;
  encargados: Encargado[];
  polizas: Poliza[];
  createdAt: number;
}

const KEY = "zinois.empresas";

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

export function newEncargado(): Encargado {
  return {
    id: crypto.randomUUID(),
    nombre: "",
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
  };
}

export function newEmpresa(): Empresa {
  return {
    id: crypto.randomUUID(),
    nombre: "",
    rfc: "",
    giro: "",
    codigoPostal: "",
    encargados: [],
    polizas: [newPoliza()],
    createdAt: Date.now(),
  };
}

/** Permissions derived from access type */
export function canEdit(a: AccessType) {
  return a === "Admin" || a === "RRHH";
}