import { useEffect, useMemo } from "react";
import {
  useEmpresas,
  seedEmpresasIfEmpty,
  type Empresa,
} from "@/lib/empresa-store";
import { buildEmpresaSeeds } from "@/lib/clientes-data";

/**
 * The empresa that the logged-in "company" user represents.
 * For the demo we map the company role to the first seeded empresa
 * (Grupo Industrial Aztlán — E880101).
 */
export const COMPANY_USER_EMPRESA_ID = "E880101";

export function useCompanyEmpresa(): Empresa | null {
  useEffect(() => {
    seedEmpresasIfEmpty(buildEmpresaSeeds());
  }, []);
  const list = useEmpresas();
  return useMemo(
    () =>
      list.find((e) => e.id === COMPANY_USER_EMPRESA_ID) ?? list[0] ?? null,
    [list],
  );
}