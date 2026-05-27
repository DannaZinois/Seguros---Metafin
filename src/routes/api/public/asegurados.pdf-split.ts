import { createFileRoute } from "@tanstack/react-router";
import { PDFDocument } from "pdf-lib";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const RFC_REGEX = /([A-ZÑ&]{3,4})\d{6}([A-Z\d]{2})[A\d]/;

function detectRfcInBytes(bytes: Uint8Array): string | null {
  // Escanea texto ASCII embebido en el stream del PDF; suficiente para
  // certificados generados con texto sin compresión avanzada.
  const text = new TextDecoder("latin1").decode(bytes);
  const m = text.toUpperCase().match(RFC_REGEX);
  return m ? m[0] : null;
}

function detectNombreInBytes(bytes: Uint8Array): string | null {
  const text = new TextDecoder("latin1").decode(bytes);
  const line = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ ]{10,60}$/.test(l));
  return line ?? null;
}

function toBase64(bytes: Uint8Array): string {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

export const Route = createFileRoute("/api/public/asegurados/pdf-split")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) {
            return new Response(
              JSON.stringify({ error: "file (pdf) requerido" }),
              { status: 400, headers: { "Content-Type": "application/json", ...CORS } },
            );
          }
          const polizaId = (form.get("polizaId") as string | null) ?? null;
          const buf = new Uint8Array(await file.arrayBuffer());
          const src = await PDFDocument.load(buf);
          const total = src.getPageCount();
          const baseName = file.name.replace(/\.pdf$/i, "");
          const pages: Array<{
            page: number;
            fileName: string;
            mime: "application/pdf";
            size: number;
            base64: string;
            detectedRfc: string | null;
            detectedNombre: string | null;
          }> = [];

          for (let i = 0; i < total; i++) {
            const out = await PDFDocument.create();
            const [copied] = await out.copyPages(src, [i]);
            out.addPage(copied);
            const bytes = await out.save();
            const rfc = detectRfcInBytes(bytes);
            const nombre = detectNombreInBytes(bytes);
            pages.push({
              page: i + 1,
              fileName: `${baseName} - hoja ${i + 1}.pdf`,
              mime: "application/pdf",
              size: bytes.length,
              base64: toBase64(bytes),
              detectedRfc: rfc,
              detectedNombre: nombre,
            });
          }

          return new Response(JSON.stringify({ polizaId, pages }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        } catch (err) {
          console.error("/api/public/asegurados/pdf-split error", err);
          return new Response(
            JSON.stringify({ error: (err as Error).message }),
            { status: 500, headers: { "Content-Type": "application/json", ...CORS } },
          );
        }
      },
    },
  },
});
