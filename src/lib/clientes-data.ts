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
    clienteId: "P990234",
    tipo: "Personal",
    profile: {
      nombre: "María González",
      contacto: "+52 555 102 3344",
      correo: "maria.gonzalez@correo.com",
      tipoAsegurado: "Individual",
      rfc: "GOMA890512H45",
      sexo: "Femenino",
      direccion: "Av. Reforma 123, CDMX",
      codigoPostal: "06600",
      fechaNacimiento: "1989-05-12",
      fechaAntiguedad: "2022-01-15",
      tipoPersona: "Persona Física",
    },
    polizas: [
      { id: "P990234", tipoSeguro: "GMM", aseguradora: "GNP", vigencia: "01/15/2024", renovacion: "01/15/2025", proximoPago: "02/01/2025", cantidad: "$8,450", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" },
      { id: "P990235", tipoSeguro: "Auto", aseguradora: "Qualitas", vigencia: "03/22/2024", renovacion: "03/22/2025", proximoPago: "02/22/2025", cantidad: "$3,200", hasComprobante: true, consentimiento: true, certificado: false, status: "Por renovar" },
    ],
  },
  {
    clienteId: "P990236",
    tipo: "Personal",
    profile: {
      nombre: "Carlos Ramírez",
      contacto: "+52 555 204 5566",
      correo: "carlos.ramirez@correo.com",
      tipoAsegurado: "Familiar",
      rfc: "RAMC820318R23",
      sexo: "Masculino",
      direccion: "Calle Pino 45, Guadalajara",
      codigoPostal: "44600",
      fechaNacimiento: "1982-03-18",
      fechaAntiguedad: "2020-06-01",
      tipoPersona: "Persona Física",
    },
    polizas: [
      { id: "P990236", tipoSeguro: "Vida", aseguradora: "MetLife", vigencia: "05/10/2024", renovacion: "05/10/2025", proximoPago: "03/10/2025", cantidad: "$1,800", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" },
      { id: "P990237", tipoSeguro: "GMM", aseguradora: "AXA", vigencia: "06/01/2024", renovacion: "06/01/2025", proximoPago: "03/01/2025", cantidad: "$7,950", hasComprobante: false, consentimiento: false, certificado: true, status: "En revisión" },
      { id: "P990238", tipoSeguro: "Auto", aseguradora: "HDI", vigencia: "11/15/2023", renovacion: "11/15/2024", proximoPago: "12/15/2024", cantidad: "$2,650", hasComprobante: true, consentimiento: true, certificado: false, status: "Cancelada" },
    ],
  },
  {
    clienteId: "P990239",
    tipo: "Personal",
    profile: {
      nombre: "Ana López",
      contacto: "+52 555 318 7788",
      correo: "ana.lopez@correo.com",
      tipoAsegurado: "Individual",
      rfc: "LOPA950727A12",
      sexo: "Femenino",
      direccion: "Blvd. Independencia 78, Monterrey",
      codigoPostal: "64000",
      fechaNacimiento: "1995-07-27",
      fechaAntiguedad: "2023-04-10",
      tipoPersona: "Persona Física",
    },
    polizas: [
      { id: "P990239", tipoSeguro: "Auto", aseguradora: "Qualitas", vigencia: "04/20/2024", renovacion: "04/20/2025", proximoPago: "03/20/2025", cantidad: "$2,980", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" },
      { id: "P990240", tipoSeguro: "Exceso", aseguradora: "Chubb", vigencia: "09/05/2024", renovacion: "09/05/2025", proximoPago: "04/05/2025", cantidad: "$4,500", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" },
    ],
  },
  {
    clienteId: "E880101",
    tipo: "Empresa",
    profile: {
      nombre: "Grupo Industrial Aztlán",
      contacto: "+52 55 4422 1100",
      correo: "contacto@aztlan.com.mx",
      tipoAsegurado: "Colectivo",
      rfc: "GIA050912XY8",
      sexo: "N/A",
      direccion: "Parque Industrial Norte 200, Edo. Méx.",
      codigoPostal: "54940",
      fechaNacimiento: "2005-09-12",
      fechaAntiguedad: "2018-02-20",
      tipoPersona: "Persona Moral",
    },
    polizas: [
      { id: "E880101", tipoSeguro: "GMM", aseguradora: "GNP", vigencia: "02/28/2024", renovacion: "02/28/2025", proximoPago: "02/28/2025", cantidad: "$48,200", hasComprobante: true, consentimiento: true, certificado: true, status: "Por renovar" },
      { id: "E880102", tipoSeguro: "Auto", aseguradora: "Qualitas", vigencia: "07/14/2024", renovacion: "07/14/2025", proximoPago: "03/14/2025", cantidad: "$22,750", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" },
      { id: "E880103", tipoSeguro: "Exceso", aseguradora: "Chubb", vigencia: "10/30/2024", renovacion: "10/30/2025", proximoPago: "04/30/2025", cantidad: "$35,600", hasComprobante: true, consentimiento: false, certificado: true, status: "En revisión" },
    ],
  },
  {
    clienteId: "E880201",
    tipo: "Empresa",
    profile: {
      nombre: "Constructora Pacífico",
      contacto: "+52 33 8899 5544",
      correo: "rh@pacifico.mx",
      tipoAsegurado: "Colectivo",
      rfc: "CPA101120ABC",
      sexo: "N/A",
      direccion: "Av. Vallarta 1200, Guadalajara",
      codigoPostal: "44100",
      fechaNacimiento: "2010-11-20",
      fechaAntiguedad: "2015-08-05",
      tipoPersona: "Persona Moral",
    },
    polizas: [
      { id: "E880201", tipoSeguro: "Vida", aseguradora: "MetLife", vigencia: "08/12/2024", renovacion: "08/12/2025", proximoPago: "03/12/2025", cantidad: "$18,400", hasComprobante: false, consentimiento: true, certificado: false, status: "Activa" },
      { id: "E880202", tipoSeguro: "GMM", aseguradora: "AXA", vigencia: "01/05/2024", renovacion: "01/05/2025", proximoPago: "02/05/2025", cantidad: "$26,150", hasComprobante: true, consentimiento: true, certificado: true, status: "Cancelada" },
    ],
  },
  {
    clienteId: "E880301",
    tipo: "Empresa",
    profile: {
      nombre: "Tecnologías Vértice",
      contacto: "+52 81 2233 4455",
      correo: "admin@vertice.io",
      tipoAsegurado: "Colectivo",
      rfc: "TVE170503QW1",
      sexo: "N/A",
      direccion: "Torre Diamante 9, Monterrey",
      codigoPostal: "66220",
      fechaNacimiento: "2017-05-03",
      fechaAntiguedad: "2019-10-12",
      tipoPersona: "Persona Moral",
    },
    polizas: [
      { id: "E880301", tipoSeguro: "Auto", aseguradora: "HDI", vigencia: "06/18/2024", renovacion: "06/18/2025", proximoPago: "03/18/2025", cantidad: "$14,300", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" },
      { id: "E880302", tipoSeguro: "Exceso", aseguradora: "Chubb", vigencia: "12/01/2023", renovacion: "12/01/2024", proximoPago: "12/01/2024", cantidad: "$9,720", hasComprobante: true, consentimiento: false, certificado: true, status: "Por renovar" },
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
      { nombre: "Roberto Salinas", contacto: "+52 55 4422 1101", email: "roberto.salinas@aztlan.com.mx", acceso: "Admin" },
      { nombre: "Lucía Hernández", contacto: "+52 55 4422 1102", email: "lucia.hernandez@aztlan.com.mx", acceso: "RRHH" },
    ],
    E880201: [
      { nombre: "Jorge Méndez", contacto: "+52 33 8899 5545", email: "jorge.mendez@pacifico.mx", acceso: "Admin" },
      { nombre: "Patricia Núñez", contacto: "+52 33 8899 5546", email: "patricia.nunez@pacifico.mx", acceso: "Lectura" },
    ],
    E880301: [
      { nombre: "Daniela Ortega", contacto: "+52 81 2233 4456", email: "daniela.ortega@vertice.io", acceso: "Admin" },
    ],
  };
  const GIROS: Record<string, string> = {
    E880101: "Manufactura industrial",
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