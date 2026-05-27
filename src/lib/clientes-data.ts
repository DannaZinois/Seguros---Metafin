import type { Asegurado, Comprobante, Empresa } from "@/lib/empresa-store";

export type ClienteStatus = "Activa" | "Cancelada" | "En revisión" | "Por renovar";
export type TipoCliente = "Personal" | "Empresa";

export interface ClienteProfile {
  nombre: string;
  contacto: string;
  correo: string;
  tipoAsegurado: string;
  rfc: string;
  sexo: string;
  direccion: string;
  codigoPostal: string;
  fechaNacimiento: string;
  fechaAntiguedad: string;
  tipoPersona: string;
}

export interface PolizaData {
  id: string;
  tipoSeguro: "GMM" | "Auto" | "Vida" | "Exceso";
  aseguradora: string;
  vigencia: string;
  renovacion: string;
  proximoPago: string;
  cantidad: string;
  hasComprobante: boolean;
  consentimiento: boolean;
  certificado: boolean;
  status: ClienteStatus;
}

export interface Cliente {
  clienteId: string;
  tipo: TipoCliente;
  profile: ClienteProfile;
  polizas: PolizaData[];
}

export const CLIENTES: Cliente[] = [
  {
    clienteId: "E880101",
    tipo: "Empresa",
    profile: {
      nombre: "Orion Innovation",
      contacto: "+52 55 4422 1100",
      correo: "contacto@orioninnovation.com",
      tipoAsegurado: "Colectivo",
      rfc: "GIA050912XY8",
      sexo: "N/A",
      direccion: "Calle Lucerna 80, Juárez, Cuauhtémoc, Ciudad de México, CDMX, Mexico",
      codigoPostal: "06600",
      fechaNacimiento: "2005-09-12",
      fechaAntiguedad: "2018-02-20",
      tipoPersona: "Persona Moral",
    },
    polizas: [
      { id: "E880101", tipoSeguro: "GMM", aseguradora: "Mapfre", vigencia: "02/28/2024", renovacion: "02/28/2025", proximoPago: "02/28/2025", cantidad: "$48,200", hasComprobante: false, consentimiento: false, certificado: false, status: "Activa" },
      { id: "E880102", tipoSeguro: "Vida", aseguradora: "Zurich", vigencia: "06/15/2024", renovacion: "06/15/2025", proximoPago: "03/15/2025", cantidad: "$31,900", hasComprobante: false, consentimiento: false, certificado: false, status: "Activa" },
    ],
  },
];


export function findClienteByAnyId(id: string): Cliente | undefined {
  return CLIENTES.find(
    (c) => c.clienteId === id || c.polizas.some((p) => p.id === id),
  );
}

export function findPoliza(clienteId: string, polizaId: string) {
  const cliente = findClienteByAnyId(clienteId);
  if (!cliente) return undefined;
  const poliza = cliente.polizas.find((p) => p.id === polizaId) ?? cliente.polizas[0];
  return { cliente, poliza };
}

/**
 * Build seed Empresa records (for the empresa-store) from the dummy CLIENTES
 * marked as "Empresa". Used by Cartera so that clicking a company opens its
 * full "Perfil de Empresa" with realistic data.
 */
export function buildEmpresaSeeds(): Empresa[] {
  const ENCARGADOS: Record<string, Array<{ nombre: string; contacto: string; email: string; acceso: "Admin" | "RRHH" | "Lectura" }>> = {
    E880101: [
      { nombre: "Roberto Salinas", contacto: "+52 55 4422 1101", email: "roberto.salinas@orion.com.mx", acceso: "Admin" },
      { nombre: "Lucía Hernández", contacto: "+52 55 4422 1102", email: "lucia.hernandez@orion.com.mx", acceso: "RRHH" },
    ],
    E880201: [
      { nombre: "Jorge Méndez", contacto: "+52 33 8899 5545", email: "jorge.mendez@orion.com.mx", acceso: "Admin" },
      { nombre: "Patricia Núñez", contacto: "+52 33 8899 5546", email: "patricia.nunez@orion.com.mx", acceso: "Lectura" },
    ],
    E880301: [
      { nombre: "Daniela Ortega", contacto: "+52 81 2233 4456", email: "daniela.ortega@orion.com.mx", acceso: "Admin" },
    ],
  };
  const GIROS: Record<string, string> = {
    E880101: "Tecnología",
    E880201: "Construcción y obra civil",
    E880301: "Desarrollo de software",
  };
  const NOMBRES = [
    "Andrés Gutiérrez", "Sofía Mendoza", "Luis Alvarado", "Mariana Ríos",
    "Pablo Cárdenas", "Renata Vega", "Diego Fuentes", "Camila Soto",
    "Iván Pacheco", "Valeria Ramos", "Héctor Solís", "Paola Aguirre",
  ];
  const buildAsegurados = (polizaId: string, count: number): Asegurado[] =>
    Array.from({ length: count }).map((_, i) => {
      const nombre = NOMBRES[(i + polizaId.length) % NOMBRES.length];
      const slug = nombre.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").replace(/ /g, ".");
      const statuses: Asegurado["status"][] = ["Activa", "Activa", "Activa", "Por renovar", "En revisión"];
      return {
        id: `${polizaId}-a-${i}`,
        trabajadorId: `T${1000 + i}`,
        nombre,
        poliza: polizaId,
        vigencia: "01/15/2024",
        renovacion: "01/15/2025",
        correo: `${slug}@empresa.com`,
        telefono: `+52 55 ${String(1000 + i * 7).padStart(4, "0")} ${String(2000 + i * 11).padStart(4, "0")}`,
        consentimiento: i % 3 !== 0,
        certificado: i % 2 === 0,
        status: statuses[i % statuses.length],
      };
    });
  const buildComprobantes = (polizaId: string, count: number): Comprobante[] =>
    Array.from({ length: count }).map((_, i) => ({
      id: `${polizaId}-c-${i}`,
      poliza: polizaId,
      tipoPago: i % 2 === 0 ? "Cliente" : "Asesor",
      fechaPago: `0${(i % 9) + 1}/15/2024`,
      recibo: i % 2 === 0,
      fechaCarga: `0${(i % 9) + 1}/18/2024`,
      comprobante: i !== 1,
      estatus: i === 1 ? "Sin archivo" : "Cargado",
    }));
  return CLIENTES.filter((c) => c.tipo === "Empresa").map((c) => ({
    id: c.clienteId,
    nombre: c.profile.nombre,
    rfc: c.profile.rfc,
    giro: GIROS[c.clienteId] ?? "Servicios",
    direccion: c.profile.direccion,
    codigoPostal: c.profile.codigoPostal,
    encargados: (ENCARGADOS[c.clienteId] ?? []).map((e, i) => ({
      id: `${c.clienteId}-enc-${i}`,
      nombre: e.nombre,
      contacto: e.contacto,
      email: e.email,
      acceso: e.acceso,
      invited: true,
    })),
    polizas: c.polizas.map((p) => ({
      id: p.id,
      tipo: p.tipoSeguro,
      aseguradora: p.aseguradora,
      contratante: c.profile.nombre,
      contacto: c.profile.contacto,
      codigoPostal: c.profile.codigoPostal,
      tipoPago: "Mensual",
      numAsegurados: String(8 + (p.id.charCodeAt(p.id.length - 1) % 6)).padStart(4, "0"),
      rfc: c.profile.rfc,
      envio: "whatsapp",
      asegurados: buildAsegurados(p.id, 8 + (p.id.charCodeAt(p.id.length - 1) % 6)),
      comprobantes: buildComprobantes(p.id, 4),
      comentarios: `Póliza ${p.tipoSeguro} con ${p.aseguradora}. Renovación programada para ${p.renovacion}.`,
      vigencia: p.vigencia,
      estatus: (p.status === "Cancelada" ? "Vencida" : "Vigente") as "Vigente" | "Vencida",
    })),
    createdAt: Date.now(),
  }));
}