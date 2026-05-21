export interface PolizaField {
  key: string;
  label: string;
  type?: "text" | "date" | "select" | "number";
  options?: string[];
  placeholder?: string;
}

export interface PolizaSection {
  title: string;
  fields: PolizaField[];
}

/** Map of tipo de seguro -> sections of fields, sourced from Resumen_Polizas.xlsx */
export const POLIZA_FORMS: Record<string, PolizaSection[]> = {
  Auto: [
    {
      title: "Datos del asegurado",
      fields: [
        { key: "nombreAsegurado", label: "Nombre del Asegurado" },
        { key: "cpCirculacion", label: "Código Postal de circulación" },
        { key: "sexo", label: "Sexo", type: "select", options: ["Masculino", "Femenino"] },
        { key: "fechaNacimiento", label: "Fecha de nacimiento", type: "date" },
      ],
    },
    {
      title: "Descripción del vehículo",
      fields: [
        { key: "descripcionVehiculo", label: "Descripción del vehículo" },
        { key: "tipoVehiculo", label: "Tipo (opcional)" },
        { key: "anio", label: "Año", type: "number" },
        { key: "modelo", label: "Modelo" },
        { key: "marca", label: "Marca" },
        { key: "version", label: "Versión (nombre)" },
        { key: "ocupantes", label: "Número de ocupantes (opcional)", type: "number" },
      ],
    },
    {
      title: "Coberturas contratadas",
      fields: [
        { key: "sumaAsegurada", label: "Suma asegurada", placeholder: "Valor comercial / factura / convenido" },
        { key: "danosDeducible", label: "Daños materiales – Deducible", type: "select", options: ["3%", "5%", "10%", "20%"] },
        { key: "danosPrima", label: "Daños materiales – Prima ($)" },
        { key: "roboSuma", label: "Robo total – Suma asegurada ($)" },
        { key: "roboDeducible", label: "Robo total – Deducible", type: "select", options: ["3%", "5%", "10%", "20%"] },
      ],
    },
  ],
  "Gastos Médicos Mayores": [
    {
      title: "Datos generales de la póliza",
      fields: [
        { key: "tipoPlan", label: "Tipo de plan" },
        { key: "frecuenciaPago", label: "Frecuencia de pago", type: "select", options: ["Mensual", "Trimestral", "Semestral", "Anual"] },
        { key: "tipoPago", label: "Tipo de pago", type: "select", options: ["Agente", "Domiciliado", "Directo"] },
      ],
    },
    {
      title: "Datos del contratante",
      fields: [
        { key: "tipoPersona", label: "Tipo de persona", type: "select", options: ["Física", "Moral"] },
        { key: "nombreContratante", label: "Nombre del contratante" },
        { key: "cpContratante", label: "Código postal del contratante" },
        { key: "sexo", label: "Sexo", type: "select", options: ["Masculino", "Femenino"] },
        { key: "fechaNacimiento", label: "Fecha de nacimiento", type: "date" },
        { key: "correo", label: "Correo del contratante" },
        { key: "telefono", label: "Teléfono del contratante" },
      ],
    },
    {
      title: "Datos del asegurado titular",
      fields: [
        { key: "nombreTitular", label: "Nombre del asegurado titular" },
        { key: "domicilio", label: "Domicilio del asegurado" },
        { key: "ciudad", label: "Ciudad del asegurado" },
        { key: "cpAsegurado", label: "Código postal del asegurado" },
        { key: "zonaTarificacion", label: "Zona de tarificación", type: "select", options: ["Zona 1", "Zona 2", "Zona 3"] },
        { key: "sexoTitular", label: "Sexo", type: "select", options: ["Masculino", "Femenino"] },
        { key: "edad", label: "Edad", type: "number" },
        { key: "parentesco", label: "Parentesco" },
        { key: "fechaNacimientoTitular", label: "Fecha de nacimiento", type: "date" },
      ],
    },
    {
      title: "Condiciones contratadas",
      fields: [
        { key: "deducible", label: "Deducible ($)" },
        { key: "coaseguro", label: "Coaseguro (%)" },
        { key: "gamaHospitalaria", label: "Gama hospitalaria", type: "select", options: ["Normal", "Media", "Alta"] },
      ],
    },
  ],
  Exceso: [
    {
      title: "Datos del contratante / asegurado",
      fields: [
        { key: "nombreContratante", label: "Nombre del contratante / asegurado" },
        { key: "cp", label: "Código postal" },
        { key: "rfc", label: "RFC" },
        { key: "numAsegurados", label: "Número de asegurados", type: "number" },
      ],
    },
    {
      title: "Límites de cobertura",
      fields: [
        { key: "sumaExceso", label: "Suma asegurada exceso" },
        { key: "sumaActivo", label: "Suma asegurada de la póliza por activo (UMAM)" },
        { key: "deducibleEnfermedad", label: "Deducible por enfermedad (UMAM)" },
        { key: "deducibleAccidente", label: "Deducible por accidente (UMAM)" },
        { key: "coaseguroEnfermedad", label: "Coaseguro por enfermedad (%)" },
        { key: "coaseguroAccidente", label: "Coaseguro por accidente (%)" },
        { key: "topeCoaseguro", label: "Tope de coaseguro ($)" },
      ],
    },
  ],
  Vida: [
    {
      title: "Datos del contratante / asegurado",
      fields: [
        { key: "nombreContratante", label: "Nombre del contratante / asegurado" },
        { key: "cp", label: "Código postal" },
        { key: "rfc", label: "RFC" },
        { key: "fechaNacimiento", label: "Fecha de nacimiento", type: "date" },
        { key: "fuma", label: "¿Fuma?", type: "select", options: ["Sí", "No"] },
        { key: "edad", label: "Edad", type: "number" },
      ],
    },
    {
      title: "Vigencia y condiciones",
      fields: [
        { key: "moneda", label: "Moneda", type: "select", options: ["Nacional", "Dólares", "UDIS"] },
        { key: "formaPago", label: "Forma de pago", type: "select", options: ["Mensual", "Trimestral", "Semestral", "Anual"] },
      ],
    },
    {
      title: "Coberturas y primas",
      fields: [
        { key: "cobertura", label: "Cobertura (años)" },
        { key: "sumaAsegurada", label: "Suma asegurada ($)" },
      ],
    },
    {
      title: "Beneficiarios",
      fields: [
        { key: "nombreBeneficiario", label: "Nombre del beneficiario" },
        { key: "parentescoBeneficiario", label: "Parentesco del beneficiario" },
        { key: "porcentajeBeneficio", label: "Porcentaje de beneficio (%)" },
      ],
    },
  ],
};

export function getPolizaForm(tipo: string): PolizaSection[] {
  return POLIZA_FORMS[tipo] ?? [];
}