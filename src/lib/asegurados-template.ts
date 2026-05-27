import * as XLSX from "xlsx";

const HEADERS = [
  "Nombre completo",
  "Correo electrónico",
  "Número de contacto",
  "RFC",
  "Número de empleado",
  "Área a la que pertenece",
  "Puesto",
  "Sexo",
  "Edad",
  "Bloque",
  "Parentesco",
];

// Sample rows showing valid values + grouping (dependientes comparten el RFC del titular)
const SAMPLE_ROWS: (string | number)[][] = [
  [
    "Juan Pérez López",
    "juan.perez@empresa.com",
    "5551234567",
    "PELJ800101AAA",
    "EMP-001",
    "Tecnología",
    "Gerente",
    "Masculino",
    44,
    "Empleado",
    "Titular",
  ],
  [
    "María García Pérez",
    "maria.garcia@correo.com",
    "5557654321",
    "PELJ800101AAA",
    "",
    "",
    "",
    "Femenino",
    42,
    "Dependiente",
    "Cónyuge",
  ],
  [
    "Diego Pérez García",
    "",
    "",
    "PELJ800101AAA",
    "",
    "",
    "",
    "Masculino",
    12,
    "Dependiente",
    "Hijo/Hija",
  ],
  [
    "Ana Rodríguez Soto",
    "ana.rodriguez@empresa.com",
    "5559876543",
    "ROSA850615BBB",
    "EMP-002",
    "Recursos Humanos",
    "Analista",
    "Femenino",
    39,
    "Empleado",
    "Titular",
  ],
];

const COL_WIDTHS = [
  { wch: 28 },
  { wch: 28 },
  { wch: 18 },
  { wch: 16 },
  { wch: 18 },
  { wch: 22 },
  { wch: 20 },
  { wch: 12 },
  { wch: 8 },
  { wch: 14 },
  { wch: 14 },
];

export function downloadAseguradosTemplate(
  fileName = "plantilla_asegurados.xlsx",
) {
  const wb = XLSX.utils.book_new();

  const data = [HEADERS, ...SAMPLE_ROWS];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = COL_WIDTHS;
  XLSX.utils.book_append_sheet(wb, ws, "Asegurados");

  // Hoja de instrucciones con valores permitidos
  const instrucciones = [
    ["Instrucciones de llenado"],
    [],
    ["Campo", "Valores permitidos / notas"],
    ["Nombre completo", "Texto libre. Obligatorio."],
    ["Correo electrónico", "Formato correo@dominio.com."],
    ["Número de contacto", "Solo dígitos."],
    [
      "RFC",
      "RFC del asegurado. Para dependientes usa el MISMO RFC del titular para agruparlos.",
    ],
    ["Número de empleado", "Solo aplica para titulares (empleados)."],
    ["Área a la que pertenece", "Solo aplica para titulares."],
    ["Puesto", "Solo aplica para titulares."],
    ["Sexo", "Masculino / Femenino."],
    ["Edad", "Número entero."],
    ["Bloque", "Empleado (si es titular) / Dependiente (si es otro parentesco)."],
    ["Parentesco", "Titular / Cónyuge / Hijo/Hija / Mamá/Papá."],
    [],
    [
      "Regla de agrupación",
      "Los dependientes deben compartir el RFC del titular al que pertenecen.",
    ],
  ];
  const wsInst = XLSX.utils.aoa_to_sheet(instrucciones);
  wsInst["!cols"] = [{ wch: 26 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsInst, "Instrucciones");

  XLSX.writeFile(wb, fileName);
}