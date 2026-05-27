import { createFileRoute } from "@tanstack/react-router";
import JSZip from "jszip";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const RFC_REGEX = /([A-ZÑ&]{3,4})\d{6}([A-Z\d]{2})[A\d]/;

function detectRfc(text: string): string | null {
  const m = text.toUpperCase().match(RFC_REGEX);
  return m ? m[0] : null;
}

function detectNombre(fileName: string, fallbackText?: string): string | null {
  // "APELLIDO APELLIDO NOMBRE - cualquier-cosa.pdf" o
  // "RFCXXXXXX_Nombre Apellido.pdf"
  const base = fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_\-]+/g, " ")
    .trim();
  const cleaned = base.replace(RFC_REGEX, "").replace(/\s+/g, " ").trim();
  if (cleaned.length >= 6 && /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(cleaned)) return cleaned;
  if (fallbackText) {
    const line = fallbackText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => /^[A-ZÁÉÍÓÚÑ ]{8,}$/.test(l));
    if (line) return line;
  }
  return null;
}

function mimeFor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "application/pdf";
  if (ext === "doc") return "application/msword";
  if (ext === "docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  return "application/octet-stream";
}

function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  // btoa exists in workerd / browser runtimes
  return btoa(s);
}

export const Route = createFileRoute("/api/public/asegurados/zip")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) {
            return new Response(
              JSON.stringify({ error: "file (zip) requerido" }),
              { status: 400, headers: { "Content-Type": "application/json", ...CORS } },
            );
          }
          const polizaId = (form.get("polizaId") as string | null) ?? null;
          const zipBytes = new Uint8Array(await file.arrayBuffer());
          const zip = await JSZip.loadAsync(zipBytes);
          const out: Array<{
            fileName: string;
            mime: string;
            size: number;
            base64: string;
            detectedRfc: string | null;
            detectedNombre: string | null;
            esConsentimiento: boolean;
          }> = [];

          for (const [path, entry] of Object.entries(zip.files)) {
            if (entry.dir) continue;
            const data = await entry.async("uint8array");
            const baseName = path.split("/").pop() || path;
            // Búsqueda de RFC en nombre del archivo y, para PDFs, en el flujo
            // de bytes ASCII (suficiente para PDFs sin compresión avanzada).
            const asciiSample = new TextDecoder("latin1").decode(
              data.subarray(0, Math.min(data.length, 200_000)),
            );
            const rfc =
              detectRfc(baseName) ?? detectRfc(asciiSample) ?? null;
            const nombre = detectNombre(baseName, asciiSample);
            const esConsentimiento = /consentimiento/i.test(baseName);
            out.push({
              fileName: baseName,
              mime: mimeFor(baseName),
              size: data.length,
              base64: toBase64(data),
              detectedRfc: rfc,
              detectedNombre: nombre,
              esConsentimiento,
            });
          }

          return new Response(JSON.stringify({ polizaId, files: out }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        } catch (err) {
          console.error("/api/public/asegurados/zip error", err);
          return new Response(
            JSON.stringify({ error: (err as Error).message }),
            { status: 500, headers: { "Content-Type": "application/json", ...CORS } },
          );
        }
      },
    },
  },
});
