import { CLIENTES, type Cliente } from "@/lib/clientes-data";

/**
 * Returns the currently "logged in" personal client.
 * Demo: we use the first Personal entry from CLIENTES (María González).
 */
export function useCurrentClient(): Cliente | undefined {
  return CLIENTES.find((c) => c.tipo === "Personal");
}

/** Public URLs of registered insurers, used to link out from policies. */
export const ASEGURADORA_LINKS: Record<string, string> = {
  GNP: "https://www.gnp.com.mx",
  AXA: "https://axa.mx",
  Qualitas: "https://www.qualitas.com.mx",
  Quálitas: "https://www.qualitas.com.mx",
  MetLife: "https://www.metlife.com.mx",
  HDI: "https://www.hdi.com.mx",
  Chubb: "https://www.chubb.com/mx",
  Mapfre: "https://www.mapfre.com.mx",
  Banorte: "https://www.banorteseguros.com",
  SMNYL: "https://www.monterrey.com.mx",
  Atlas: "https://www.atlas.com.mx",
};

export const ADMIN_WHATSAPP = "5215512345678";
export const ADMIN_WHATSAPP_DISPLAY = "+52 1 55 1234 5678";