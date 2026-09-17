/**
 * Burxia OTA — Cloudflare Worker (servidor de actualizaciones expo-updates).
 *
 * Diseño "Worker tonto": todo el trabajo pesado del protocolo de Expo (hashing,
 * armado de manifiesto) se hace en tu PC al publicar (ota/publish.mjs). Este
 * Worker solo:
 *   GET /manifest         → lee el puntero "latest" y devuelve el manifiesto
 *                           (multipart/mixed) o una directiva noUpdateAvailable.
 *   GET /assets/<hash>    → sirve el bundle/asset desde R2.
 *
 * Layout en el bucket R2 (BUCKET):
 *   pointers/<runtimeVersion>/<platform>.json     → { "updateId": "...", ... }
 *   updates/<runtimeVersion>/<updateId>/manifest-<platform>.json
 *   assets/<sha256-base64url>                      → bytes (bundle o asset)
 *
 * Protocolo: https://docs.expo.dev/technical-specs/expo-updates-1/
 */

export interface Env {
  BUCKET: R2Bucket;
}

const MANIFEST_BOUNDARY = "BURXIA_OTA_BOUNDARY";

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (req.method !== "GET" && req.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (url.pathname === "/manifest") {
      return handleManifest(req, env, url);
    }

    if (url.pathname.startsWith("/assets/")) {
      return handleAsset(req, env, url);
    }

    // Puente HTTPS → deep link de la app. ZapSign solo permite redirect https,
    // así que su "redirect después de firmar" apunta acá y esto rebota a la app
    // (bruxia://kyc-done), que openAuthSessionAsync captura para cerrar el KYC.
    if (url.pathname === "/kyc-done") {
      const html =
        "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\">" +
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
        "<meta http-equiv=\"refresh\" content=\"0;url=bruxia://kyc-done\">" +
        "<title>Burxia</title></head>" +
        "<body style=\"font-family:system-ui,Arial,sans-serif;background:#2D2154;color:#fff;text-align:center;padding:64px 24px\">" +
        "<h2 style=\"color:#AA91C4;margin:0 0 12px\">Burxia</h2>" +
        "<p>Verificación completa. Volviendo a la app…</p>" +
        "<p style=\"margin-top:24px\"><a href=\"bruxia://kyc-done\" style=\"display:inline-block;background:#5A4F9D;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600\">Abrir Burxia</a></p>" +
        "<script>location.replace('bruxia://kyc-done');</script>" +
        "</body></html>";
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      });
    }

    // Descarga pública del APK (link que funciona desde cualquier red).
    if (url.pathname === "/download/bruxia.apk" || url.pathname === "/download") {
      const obj = await env.BUCKET.get("app/bruxia.apk");
      if (!obj) return new Response("APK no disponible", { status: 404 });
      const headers = new Headers();
      headers.set("content-type", "application/vnd.android.package-archive");
      headers.set("content-disposition", 'attachment; filename="bruxia.apk"');
      headers.set("cache-control", "public, max-age=300");
      obj.writeHttpMetadata(headers);
      headers.set("etag", obj.httpEtag);
      return new Response(req.method === "HEAD" ? null : obj.body, { status: 200, headers });
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response("Burxia OTA server OK", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleManifest(req: Request, env: Env, url: URL): Promise<Response> {
  const platform =
    req.headers.get("expo-platform") ?? url.searchParams.get("platform") ?? "android";
  const runtimeVersion =
    req.headers.get("expo-runtime-version") ??
    url.searchParams.get("runtime-version") ??
    "";
  const protocolVersion = req.headers.get("expo-protocol-version") ?? "1";

  if (!runtimeVersion) {
    return new Response(JSON.stringify({ error: "missing runtime version" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  if (platform !== "android" && platform !== "ios") {
    return new Response(JSON.stringify({ error: "invalid platform" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // 1) Puntero al update actual para este runtime+plataforma.
  const pointerObj = await env.BUCKET.get(`pointers/${runtimeVersion}/${platform}.json`);
  if (!pointerObj) {
    // No hay nada publicado para este runtime → directiva "sin update".
    return noUpdateAvailable(env, protocolVersion);
  }
  const pointer = (await pointerObj.json()) as { updateId?: string };
  const updateId = pointer.updateId;
  if (!updateId) return noUpdateAvailable(env, protocolVersion);

  // 2) Manifiesto ya armado (por publish.mjs).
  const manifestObj = await env.BUCKET.get(
    `updates/${runtimeVersion}/${updateId}/manifest-${platform}.json`,
  );
  if (!manifestObj) return noUpdateAvailable(env, protocolVersion);
  const manifestJson = await manifestObj.text();

  // 3) (Opcional) firma de código, si publish.mjs la generó.
  const signatureObj = await env.BUCKET.get(
    `updates/${runtimeVersion}/${updateId}/signature-${platform}.txt`,
  );
  const signature = signatureObj ? (await signatureObj.text()).trim() : null;

  const body = buildMultipartManifest(manifestJson, signature);
  return new Response(body, {
    status: 200,
    headers: {
      "expo-protocol-version": "1",
      "expo-sfv-version": "0",
      "cache-control": "private, max-age=0",
      "content-type": `multipart/mixed; boundary=${MANIFEST_BOUNDARY}`,
    },
  });
}

async function handleAsset(req: Request, env: Env, url: URL): Promise<Response> {
  const hash = decodeURIComponent(url.pathname.slice("/assets/".length));
  if (!hash) return new Response("Not Found", { status: 404 });

  const obj = await env.BUCKET.get(`assets/${hash}`);
  if (!obj) return new Response("Not Found", { status: 404 });

  const contentType =
    obj.httpMetadata?.contentType ??
    url.searchParams.get("contentType") ??
    "application/octet-stream";

  const headers = new Headers();
  headers.set("content-type", contentType);
  // Los assets están nombrados por su hash → inmutables, cacheables agresivamente.
  headers.set("cache-control", "public, max-age=31536000, immutable");
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);

  return new Response(req.method === "HEAD" ? null : obj.body, { status: 200, headers });
}

/** Cuerpo multipart/mixed con la parte "manifest" (y firma opcional). */
function buildMultipartManifest(manifestJson: string, signature: string | null): string {
  const CRLF = "\r\n";
  let part = `--${MANIFEST_BOUNDARY}${CRLF}`;
  part += `content-type: application/json; charset=utf-8${CRLF}`;
  part += `content-disposition: form-data; name="manifest"${CRLF}`;
  if (signature) {
    part += `expo-signature: ${signature}${CRLF}`;
  }
  part += CRLF;
  part += manifestJson + CRLF;
  part += `--${MANIFEST_BOUNDARY}--${CRLF}`;
  return part;
}

/** Directiva protocolo v1: no hay actualización disponible (firmada si hay sig). */
async function noUpdateAvailable(env: Env, protocolVersion: string): Promise<Response> {
  const CRLF = "\r\n";
  const directive = JSON.stringify({ type: "noUpdateAvailable" });

  // Firma precalculada de la directiva constante (publish.mjs la sube). Necesaria
  // para que un cliente con firma de código activada no rechace el "sin update".
  const sigObj = await env.BUCKET.get("directives/noUpdateAvailable.sig");
  const signature = sigObj ? (await sigObj.text()).trim() : null;

  let body = `--${MANIFEST_BOUNDARY}${CRLF}`;
  body += `content-type: application/json; charset=utf-8${CRLF}`;
  body += `content-disposition: form-data; name="directive"${CRLF}`;
  if (signature) body += `expo-signature: ${signature}${CRLF}`;
  body += CRLF;
  body += directive + CRLF;
  body += `--${MANIFEST_BOUNDARY}--${CRLF}`;

  // Protocolo 0 no soporta directivas: en ese caso devolvemos 204.
  if (protocolVersion === "0") {
    return new Response(null, { status: 204, headers: { "expo-protocol-version": "0" } });
  }

  return new Response(body, {
    status: 200,
    headers: {
      "expo-protocol-version": "1",
      "expo-sfv-version": "0",
      "cache-control": "private, max-age=0",
      "content-type": `multipart/mixed; boundary=${MANIFEST_BOUNDARY}`,
    },
  });
}
