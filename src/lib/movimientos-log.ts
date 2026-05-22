import { COMPANY_USER_EMPRESA_ID } from "@/lib/company-context";

export type TipoMovimiento =
  | "Alta de empleado"
  | "Baja de empleado"
  | "Actualización de póliza"
  | "Carga de comprobante"
  | "Renovación"
  | "Cambio de datos";

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  usuario: string;
  rol: string;
  fecha: string;
  hora: string;
  detalle: string;
}

export const MOVIMIENTOS_KEY = "zinois.movimientos.v2";
export const MOVIMIENTOS_EVENT = "zinois-movimientos-changed";

function readEmpresas(): Array<{
  id: string;
  encargados: Array<{ nombre: string; acceso: string }>;
}> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("zinois.empresas");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Identify the currently acting encargado (defaults to first Admin). */
export function currentEncargado(): { nombre: string; rol: string } {
  const empresas = readEmpresas();
  const empresa = empresas.find((e) => e.id === COMPANY_USER_EMPRESA_ID);
  const enc =
    empresa?.encargados.find((e) => e.acceso === "Admin") ??
    empresa?.encargados[0];
  return {
    nombre: enc?.nombre ?? "Roberto Salinas",
    rol: enc?.acceso ?? "Admin",
  };
}

export function logMovimiento(tipo: TipoMovimiento, detalle: string) {
  if (typeof window === "undefined") return;
  const { nombre, rol } = currentEncargado();
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const entry: Movimiento = {
    id: crypto.randomUUID(),
    tipo,
    usuario: nombre,
    rol,
    fecha: `${dd}/${mm}/${yyyy}`,
    hora: `${hh}:${min}`,
    detalle,
  };
  let list: Movimiento[] = [];
  try {
    const raw = localStorage.getItem(MOVIMIENTOS_KEY);
    list = raw ? JSON.parse(raw) : [];
  } catch {
    list = [];
  }
  const next = [entry, ...list];
  localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(MOVIMIENTOS_EVENT));
}