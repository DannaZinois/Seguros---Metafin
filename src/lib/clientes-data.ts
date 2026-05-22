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
      { id: "E880101", tipoSeguro: "GMM", aseguradora: "GNP", vigencia: "02/28/2024", renovacion: "02/28/2025", proximoPago: "02/28/2025", cantidad: "$48,200", hasComprobante: true, consentimiento: true, certificado: true, status: "Por renovar" },
      { id: "E880102", tipoSeguro: "Auto", aseguradora: "Qualitas", vigencia: "07/14/2024", renovacion: "07/14/2025", proximoPago: "03/14/2025", cantidad: "$22,750", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" },
      { id: "E880103", tipoSeguro: "Exceso", aseguradora: "Chubb", vigencia: "10/30/2024", renovacion: "10/30/2025", proximoPago: "04/30/2025", cantidad: "$35,600", hasComprobante: true, consentimiento: false, certificado: true, status: "En revisión" },
      { id: "E880104", tipoSeguro: "Vida", aseguradora: "MetLife", vigencia: "06/15/2024", renovacion: "06/15/2025", proximoPago: "03/15/2025", cantidad: "$31,900", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" },
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

// Additional dummy clients (personal + empresa) appended after the curated list.
const EXTRA_PERSONAL: Cliente[] = [
  { clienteId: "P990301", tipo: "Personal", profile: { nombre: "Jorge Hernández", contacto: "+52 555 412 9981", correo: "jorge.hernandez@correo.com", tipoAsegurado: "Individual", rfc: "HEJO880214AB1", sexo: "Masculino", direccion: "Calle Roble 89, Puebla", codigoPostal: "72000", fechaNacimiento: "1988-02-14", fechaAntiguedad: "2021-03-22", tipoPersona: "Persona Física" }, polizas: [ { id: "P990301", tipoSeguro: "GMM", aseguradora: "GNP", vigencia: "02/10/2024", renovacion: "02/10/2025", proximoPago: "02/10/2025", cantidad: "$7,120", hasComprobante: true, consentimiento: true, certificado: true, status: "Por renovar" } ] },
  { clienteId: "P990302", tipo: "Personal", profile: { nombre: "Patricia Morales", contacto: "+52 555 533 1024", correo: "patricia.morales@correo.com", tipoAsegurado: "Familiar", rfc: "MOPA910625CD2", sexo: "Femenino", direccion: "Av. Hidalgo 412, Querétaro", codigoPostal: "76000", fechaNacimiento: "1991-06-25", fechaAntiguedad: "2019-09-10", tipoPersona: "Persona Física" }, polizas: [ { id: "P990302", tipoSeguro: "Vida", aseguradora: "MetLife", vigencia: "04/18/2024", renovacion: "04/18/2025", proximoPago: "03/18/2025", cantidad: "$2,450", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" }, { id: "P990303", tipoSeguro: "Auto", aseguradora: "Qualitas", vigencia: "07/05/2024", renovacion: "07/05/2025", proximoPago: "04/05/2025", cantidad: "$3,890", hasComprobante: false, consentimiento: true, certificado: false, status: "En revisión" } ] },
  { clienteId: "P990304", tipo: "Personal", profile: { nombre: "Ricardo Salgado", contacto: "+52 555 690 7733", correo: "ricardo.salgado@correo.com", tipoAsegurado: "Individual", rfc: "SARI750908EF3", sexo: "Masculino", direccion: "Paseo Tabachines 23, Cuernavaca", codigoPostal: "62440", fechaNacimiento: "1975-09-08", fechaAntiguedad: "2018-11-30", tipoPersona: "Persona Física" }, polizas: [ { id: "P990304", tipoSeguro: "GMM", aseguradora: "AXA", vigencia: "08/01/2024", renovacion: "08/01/2025", proximoPago: "04/01/2025", cantidad: "$9,650", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" } ] },
  { clienteId: "P990305", tipo: "Personal", profile: { nombre: "Laura Beltrán", contacto: "+52 555 720 8845", correo: "laura.beltran@correo.com", tipoAsegurado: "Individual", rfc: "BELA930417GH4", sexo: "Femenino", direccion: "Calle 5 de Mayo 67, Mérida", codigoPostal: "97000", fechaNacimiento: "1993-04-17", fechaAntiguedad: "2022-07-14", tipoPersona: "Persona Física" }, polizas: [ { id: "P990305", tipoSeguro: "Auto", aseguradora: "HDI", vigencia: "11/22/2024", renovacion: "11/22/2025", proximoPago: "05/22/2025", cantidad: "$3,120", hasComprobante: true, consentimiento: true, certificado: false, status: "Activa" } ] },
  { clienteId: "P990306", tipo: "Personal", profile: { nombre: "Fernando Vázquez", contacto: "+52 555 811 2266", correo: "fernando.vazquez@correo.com", tipoAsegurado: "Familiar", rfc: "VAFE860112IJ5", sexo: "Masculino", direccion: "Av. del Sol 245, Tijuana", codigoPostal: "22000", fechaNacimiento: "1986-01-12", fechaAntiguedad: "2017-05-20", tipoPersona: "Persona Física" }, polizas: [ { id: "P990306", tipoSeguro: "GMM", aseguradora: "GNP", vigencia: "03/15/2024", renovacion: "03/15/2025", proximoPago: "02/15/2025", cantidad: "$8,800", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" }, { id: "P990307", tipoSeguro: "Exceso", aseguradora: "Chubb", vigencia: "10/10/2023", renovacion: "10/10/2024", proximoPago: "10/10/2024", cantidad: "$5,300", hasComprobante: true, consentimiento: false, certificado: true, status: "Cancelada" } ] },
  { clienteId: "P990308", tipo: "Personal", profile: { nombre: "Mónica Aguilar", contacto: "+52 555 902 4413", correo: "monica.aguilar@correo.com", tipoAsegurado: "Individual", rfc: "AGMO940723KL6", sexo: "Femenino", direccion: "Privada Las Lomas 12, León", codigoPostal: "37000", fechaNacimiento: "1994-07-23", fechaAntiguedad: "2023-01-09", tipoPersona: "Persona Física" }, polizas: [ { id: "P990308", tipoSeguro: "Vida", aseguradora: "MetLife", vigencia: "06/30/2024", renovacion: "06/30/2025", proximoPago: "03/30/2025", cantidad: "$1,950", hasComprobante: false, consentimiento: true, certificado: false, status: "Por renovar" } ] },
  { clienteId: "P990309", tipo: "Personal", profile: { nombre: "Sergio Domínguez", contacto: "+52 555 118 7700", correo: "sergio.dominguez@correo.com", tipoAsegurado: "Familiar", rfc: "DOSE800505MN7", sexo: "Masculino", direccion: "Av. Universidad 1100, CDMX", codigoPostal: "03100", fechaNacimiento: "1980-05-05", fechaAntiguedad: "2016-08-15", tipoPersona: "Persona Física" }, polizas: [ { id: "P990309", tipoSeguro: "Auto", aseguradora: "Qualitas", vigencia: "05/12/2024", renovacion: "05/12/2025", proximoPago: "03/12/2025", cantidad: "$4,260", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" } ] },
  { clienteId: "P990310", tipo: "Personal", profile: { nombre: "Daniela Reyes", contacto: "+52 555 226 9090", correo: "daniela.reyes@correo.com", tipoAsegurado: "Individual", rfc: "REDA961103OP8", sexo: "Femenino", direccion: "Calle Pirules 18, Toluca", codigoPostal: "50000", fechaNacimiento: "1996-11-03", fechaAntiguedad: "2024-02-05", tipoPersona: "Persona Física" }, polizas: [ { id: "P990310", tipoSeguro: "GMM", aseguradora: "AXA", vigencia: "09/20/2024", renovacion: "09/20/2025", proximoPago: "04/20/2025", cantidad: "$6,840", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" } ] },
  { clienteId: "P990311", tipo: "Personal", profile: { nombre: "Alejandro Núñez", contacto: "+52 555 314 5577", correo: "alejandro.nunez@correo.com", tipoAsegurado: "Individual", rfc: "NUAL780816QR9", sexo: "Masculino", direccion: "Av. Cuauhtémoc 905, CDMX", codigoPostal: "03020", fechaNacimiento: "1978-08-16", fechaAntiguedad: "2015-04-22", tipoPersona: "Persona Física" }, polizas: [ { id: "P990311", tipoSeguro: "Exceso", aseguradora: "Chubb", vigencia: "01/10/2024", renovacion: "01/10/2025", proximoPago: "02/10/2025", cantidad: "$5,720", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" }, { id: "P990312", tipoSeguro: "Auto", aseguradora: "HDI", vigencia: "12/05/2023", renovacion: "12/05/2024", proximoPago: "12/05/2024", cantidad: "$3,560", hasComprobante: false, consentimiento: false, certificado: false, status: "Cancelada" } ] },
  { clienteId: "P990313", tipo: "Personal", profile: { nombre: "Verónica Solano", contacto: "+52 555 427 3311", correo: "veronica.solano@correo.com", tipoAsegurado: "Familiar", rfc: "SOVE870929ST0", sexo: "Femenino", direccion: "Calle Olmos 33, Aguascalientes", codigoPostal: "20000", fechaNacimiento: "1987-09-29", fechaAntiguedad: "2020-12-01", tipoPersona: "Persona Física" }, polizas: [ { id: "P990313", tipoSeguro: "Vida", aseguradora: "MetLife", vigencia: "07/18/2024", renovacion: "07/18/2025", proximoPago: "04/18/2025", cantidad: "$2,180", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" } ] },
];

const EXTRA_EMPRESA: Cliente[] = [
  { clienteId: "E880401", tipo: "Empresa", profile: { nombre: "Logística del Bajío", contacto: "+52 477 290 8800", correo: "operaciones@logbajio.mx", tipoAsegurado: "Colectivo", rfc: "LBA120808UV1", sexo: "N/A", direccion: "Parque Logístico KM 12, León", codigoPostal: "37200", fechaNacimiento: "2012-08-08", fechaAntiguedad: "2016-03-15", tipoPersona: "Persona Moral" }, polizas: [ { id: "E880401", tipoSeguro: "Auto", aseguradora: "Qualitas", vigencia: "03/01/2024", renovacion: "03/01/2025", proximoPago: "02/01/2025", cantidad: "$58,400", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" }, { id: "E880402", tipoSeguro: "GMM", aseguradora: "GNP", vigencia: "05/20/2024", renovacion: "05/20/2025", proximoPago: "03/20/2025", cantidad: "$41,200", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" } ] },
  { clienteId: "E880501", tipo: "Empresa", profile: { nombre: "Agroindustrias del Valle", contacto: "+52 442 718 6655", correo: "contacto@agrovalle.com.mx", tipoAsegurado: "Colectivo", rfc: "AVA080619WX2", sexo: "N/A", direccion: "Carr. Estatal 100 KM 5, Querétaro", codigoPostal: "76240", fechaNacimiento: "2008-06-19", fechaAntiguedad: "2014-07-08", tipoPersona: "Persona Moral" }, polizas: [ { id: "E880501", tipoSeguro: "Vida", aseguradora: "MetLife", vigencia: "09/15/2024", renovacion: "09/15/2025", proximoPago: "03/15/2025", cantidad: "$22,900", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" }, { id: "E880502", tipoSeguro: "Exceso", aseguradora: "Chubb", vigencia: "11/02/2023", renovacion: "11/02/2024", proximoPago: "11/02/2024", cantidad: "$17,300", hasComprobante: false, consentimiento: true, certificado: false, status: "Por renovar" } ] },
  { clienteId: "E880601", tipo: "Empresa", profile: { nombre: "Servicios Médicos Integra", contacto: "+52 55 5612 7788", correo: "rrhh@integramed.mx", tipoAsegurado: "Colectivo", rfc: "SMI150227YZ3", sexo: "N/A", direccion: "Av. Insurgentes Sur 1800, CDMX", codigoPostal: "03900", fechaNacimiento: "2015-02-27", fechaAntiguedad: "2018-09-19", tipoPersona: "Persona Moral" }, polizas: [ { id: "E880601", tipoSeguro: "GMM", aseguradora: "AXA", vigencia: "04/04/2024", renovacion: "04/04/2025", proximoPago: "03/04/2025", cantidad: "$67,500", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" } ] },
  { clienteId: "E880701", tipo: "Empresa", profile: { nombre: "Editorial Cordillera", contacto: "+52 55 4471 2030", correo: "admin@cordillera.com.mx", tipoAsegurado: "Colectivo", rfc: "EDC110410AB4", sexo: "N/A", direccion: "Calle Versalles 45, CDMX", codigoPostal: "06600", fechaNacimiento: "2011-04-10", fechaAntiguedad: "2017-01-25", tipoPersona: "Persona Moral" }, polizas: [ { id: "E880701", tipoSeguro: "Auto", aseguradora: "HDI", vigencia: "08/22/2024", renovacion: "08/22/2025", proximoPago: "03/22/2025", cantidad: "$19,650", hasComprobante: true, consentimiento: false, certificado: true, status: "En revisión" }, { id: "E880702", tipoSeguro: "Vida", aseguradora: "MetLife", vigencia: "02/14/2024", renovacion: "02/14/2025", proximoPago: "02/14/2025", cantidad: "$15,400", hasComprobante: true, consentimiento: true, certificado: true, status: "Por renovar" } ] },
  { clienteId: "E880801", tipo: "Empresa", profile: { nombre: "Energía Solar del Norte", contacto: "+52 81 3344 9988", correo: "info@solarnorte.com", tipoAsegurado: "Colectivo", rfc: "ESN191115CD5", sexo: "N/A", direccion: "Parque Industrial Apodaca 88, NL", codigoPostal: "66600", fechaNacimiento: "2019-11-15", fechaAntiguedad: "2020-06-30", tipoPersona: "Persona Moral" }, polizas: [ { id: "E880801", tipoSeguro: "GMM", aseguradora: "GNP", vigencia: "06/06/2024", renovacion: "06/06/2025", proximoPago: "03/06/2025", cantidad: "$33,800", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" }, { id: "E880802", tipoSeguro: "Exceso", aseguradora: "Chubb", vigencia: "10/18/2024", renovacion: "10/18/2025", proximoPago: "04/18/2025", cantidad: "$28,150", hasComprobante: true, consentimiento: true, certificado: true, status: "Activa" } ] },
  { clienteId: "E880901", tipo: "Empresa", profile: { nombre: "Distribuidora Maya", contacto: "+52 999 188 6611", correo: "ventas@distmaya.mx", tipoAsegurado: "Colectivo", rfc: "DMA130722EF6", sexo: "N/A", direccion: "Calle 60 No. 412, Mérida", codigoPostal: "97000", fechaNacimiento: "2013-07-22", fechaAntiguedad: "2019-02-14", tipoPersona: "Persona Moral" }, polizas: [ { id: "E880901", tipoSeguro: "Auto", aseguradora: "Qualitas", vigencia: "01/28/2024", renovacion: "01/28/2025", proximoPago: "02/28/2025", cantidad: "$24,300", hasComprobante: false, consentimiento: false, certificado: false, status: "Cancelada" } ] },
];

CLIENTES.push(...EXTRA_PERSONAL, ...EXTRA_EMPRESA);

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