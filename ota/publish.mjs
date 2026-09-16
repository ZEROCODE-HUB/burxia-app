#!/usr/bin/env node
/**
 * Burxia OTA — publicar una actualización (corre en TU PC).
 *
 *   npm run ota:publish
 *
 * Qué hace:
 *   1) `expo export` de android+ios (genera bundle + assets + metadata).
 *   2) Calcula hashes y arma el manifiesto de expo-updates por plataforma.
 *   3) Sube bundle, assets, manifiesto y el puntero "latest" a R2 (vía wrangler,
 *      con TU login local — no hay credenciales en este repo).
 *
 * Config: ota/ota.config.json  → { bucket, baseUrl, platforms }
 *   - bucket:  nombre del bucket R2 (el que creaste en Cloudflare).
 *   - baseUrl: URL del Worker SIN /manifest (ej. https://burxia-ota.xxx.workers.dev).
 *
 * Requisitos: `npm i -g wrangler` y `wrangler login` hechos una vez.
 */
import { execFileSync } from "node:child_process";
import { createHash, randomUUID, createSign } from "node:crypto";
import { readFileSync, writeFileSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(__dirname, "..");
const EXPORT_DIR = join(__dirname, ".export");
const TMP_DIR = join(__dirname, ".tmp");

const config = JSON.parse(readFileSync(join(__dirname, "ota.config.json"), "utf8"));
const BUCKET = config.bucket;
const BASE_URL = String(config.baseUrl || "").replace(/\/$/, "");
const PLATFORMS = config.platforms?.length ? config.platforms : ["android", "ios"];

if (!BUCKET || BASE_URL.includes("REEMPLAZAR")) {
  console.error(
    "\n✖ Falta configurar ota/ota.config.json (bucket y baseUrl del Worker).\n",
  );
  process.exit(1);
}

// ── helpers ────────────────────────────────────────────────────────────────
// En Windows, spawnear .cmd (npx/wrangler) requiere shell:true (Node 20+ tira
// EINVAL si no). shell:true es seguro acá porque ningún arg lleva espacios.
const isWin = process.platform === "win32";
const SHELL = isWin;

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { stdio: "inherit", shell: SHELL, ...opts });
}

function wrangler(args) {
  return run("wrangler", args, { cwd: APP_DIR });
}

function toBase64Url(b64) {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function sha256Base64Url(buf) {
  return toBase64Url(createHash("sha256").update(buf).digest("base64"));
}
function md5Hex(buf) {
  return createHash("md5").update(buf).digest("hex");
}

const MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  ttf: "font/ttf",
  otf: "font/otf",
  woff: "font/woff",
  woff2: "font/woff2",
  json: "application/json",
  mp4: "video/mp4",
  db: "application/octet-stream",
  bin: "application/octet-stream",
};
function mimeForExt(ext) {
  return MIME[String(ext || "").toLowerCase()] ?? "application/octet-stream";
}

function putObject(key, filePath, contentType) {
  const args = [
    "r2",
    "object",
    "put",
    `${BUCKET}/${key}`,
    `--file=${filePath}`,
    "--remote",
  ];
  if (contentType) args.push(`--content-type=${contentType}`);
  wrangler(args);
}

// ── firma de código ──────────────────────────────────────────────────────────
// La clave privada vive solo acá (gitignored). Si falta, se publica SIN firmar
// (y un APK con firma activada rechazaría el update: por eso avisamos fuerte).
const PRIVATE_KEY_PATH = join(__dirname, "codesigning", "keys", "private-key.pem");
const PRIVATE_KEY = existsSync(PRIVATE_KEY_PATH)
  ? readFileSync(PRIVATE_KEY_PATH, "utf8")
  : null;

/** Firma exacta de los bytes `body` → header expo-signature (structured field). */
function signBody(body) {
  const signer = createSign("RSA-SHA256"); // = rsa-v1_5-sha256 (PKCS#1 v1.5)
  signer.update(body);
  signer.end();
  const sig = signer.sign(PRIVATE_KEY, "base64");
  return `sig="${sig}", keyid="main", alg="rsa-v1_5-sha256"`;
}

// ── 1) expo export ───────────────────────────────────────────────────────────
console.log("\n▶ 1/4  expo export (android + ios)…\n");
rmSync(EXPORT_DIR, { recursive: true, force: true });
const platformArgs = PLATFORMS.flatMap((p) => ["--platform", p]);
run("npx", ["expo", "export", "--output-dir", EXPORT_DIR, ...platformArgs], {
  cwd: APP_DIR,
});

// ── 2) leer metadata + config resuelta ───────────────────────────────────────
const metadata = JSON.parse(readFileSync(join(EXPORT_DIR, "metadata.json"), "utf8"));

// Config resuelta desde app.config.js (fuente confiable de version/runtimeVersion).
const rawConfig = execFileSync("npx", ["expo", "config", "--json"], {
  cwd: APP_DIR,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
  shell: SHELL,
});
const expoConfig = JSON.parse(rawConfig.slice(rawConfig.indexOf("{")));

// Con policy "appVersion", el runtimeVersion embebido en el APK = version.
const runtimeVersion =
  typeof expoConfig.runtimeVersion === "string"
    ? expoConfig.runtimeVersion
    : String(expoConfig.version ?? "");
if (!runtimeVersion) {
  console.error("✖ No pude resolver runtimeVersion desde expoConfig.json");
  process.exit(1);
}

const updateId = randomUUID();
const createdAt = new Date().toISOString();
console.log(`\n▶ 2/4  runtimeVersion=${runtimeVersion}  updateId=${updateId}\n`);

rmSync(TMP_DIR, { recursive: true, force: true });
mkdirSync(TMP_DIR, { recursive: true });

// Para no subir el mismo asset dos veces en una corrida (android+ios comparten).
const uploaded = new Set();

function assetEntry(relPath, ext, isLaunch) {
  const abs = join(EXPORT_DIR, relPath);
  const buf = readFileSync(abs);
  const hash = sha256Base64Url(buf);
  const key = md5Hex(buf);
  const contentType = isLaunch ? "application/javascript" : mimeForExt(ext);
  return {
    _abs: abs,
    hash,
    key,
    fileExtension: isLaunch ? ".bundle" : `.${ext}`,
    contentType,
    url: `${BASE_URL}/assets/${hash}`,
  };
}

// ── 3) por plataforma: armar manifiesto + subir bundle/assets ────────────────
console.log("▶ 3/4  subiendo bundles y assets a R2…\n");
const manifestsByPlatform = {};

for (const platform of PLATFORMS) {
  const fm = metadata.fileMetadata?.[platform];
  if (!fm) {
    console.warn(`  · (sin export para ${platform}, lo salto)`);
    continue;
  }

  const launch = assetEntry(fm.bundle, "bundle", true);
  const assets = (fm.assets ?? []).map((a) => assetEntry(a.path, a.ext, false));

  // subir bytes (dedup por hash)
  for (const a of [launch, ...assets]) {
    if (uploaded.has(a.hash)) continue;
    putObject(`assets/${a.hash}`, a._abs, a.contentType);
    uploaded.add(a.hash);
  }

  const manifest = {
    id: updateId,
    createdAt,
    runtimeVersion,
    launchAsset: strip(launch),
    assets: assets.map(strip),
    metadata: {},
    extra: { expoClient: expoConfig },
  };
  manifestsByPlatform[platform] = manifest;
}

function strip(a) {
  const { _abs, ...rest } = a;
  return rest;
}

// ── 4) subir manifiestos + mover el puntero "latest" ─────────────────────────
console.log("\n▶ 4/4  publicando manifiestos y puntero latest…\n");
if (!PRIVATE_KEY) {
  console.warn(
    "⚠️  Sin clave privada en ota/codesigning/keys/: se publica SIN firmar.\n" +
      "    Un APK con firma de código activada RECHAZARÁ este update.\n",
  );
}
for (const [platform, manifest] of Object.entries(manifestsByPlatform)) {
  // Firmamos EXACTAMENTE los bytes que sirve el Worker (el archivo tal cual).
  const manifestString = JSON.stringify(manifest);
  const manifestFile = join(TMP_DIR, `manifest-${platform}.json`);
  writeFileSync(manifestFile, manifestString);
  putObject(
    `updates/${runtimeVersion}/${updateId}/manifest-${platform}.json`,
    manifestFile,
    "application/json",
  );

  if (PRIVATE_KEY) {
    const sigFile = join(TMP_DIR, `signature-${platform}.txt`);
    writeFileSync(sigFile, signBody(manifestString));
    putObject(
      `updates/${runtimeVersion}/${updateId}/signature-${platform}.txt`,
      sigFile,
      "text/plain",
    );
  }

  // El puntero es lo ÚLTIMO que se mueve: hasta acá, el update viejo sigue vivo.
  const pointerFile = join(TMP_DIR, `pointer-${platform}.json`);
  writeFileSync(pointerFile, JSON.stringify({ updateId, createdAt, runtimeVersion }));
  putObject(`pointers/${runtimeVersion}/${platform}.json`, pointerFile, "application/json");
}

// Firma de la directiva "noUpdateAvailable" (constante). El Worker la adjunta
// cuando no hay update, así el cliente con firma activada no la rechaza.
if (PRIVATE_KEY) {
  const directiveBody = JSON.stringify({ type: "noUpdateAvailable" });
  const dirSigFile = join(TMP_DIR, "directive-noupdate.txt");
  writeFileSync(dirSigFile, signBody(directiveBody));
  putObject("directives/noUpdateAvailable.sig", dirSigFile, "text/plain");
}

rmSync(TMP_DIR, { recursive: true, force: true });

// Historial local (para rollback offline: wrangler CLI no lista objetos R2).
const historyPath = join(__dirname, ".history.json");
let history = [];
if (existsSync(historyPath)) {
  try {
    history = JSON.parse(readFileSync(historyPath, "utf8"));
  } catch {
    history = [];
  }
}
history.push({
  runtimeVersion,
  updateId,
  createdAt,
  platforms: Object.keys(manifestsByPlatform),
});
writeFileSync(historyPath, JSON.stringify(history, null, 2));

console.log(`\n✅ Publicado.  runtimeVersion=${runtimeVersion}  updateId=${updateId}`);
console.log("   La próxima vez que se abra la app (misma versión), se actualiza.\n");
console.log(`   Rollback:  npm run ota:rollback -- ${runtimeVersion}\n`);
