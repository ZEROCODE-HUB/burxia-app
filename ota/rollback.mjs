#!/usr/bin/env node
/**
 * Burxia OTA — rollback (volver a un update anterior).
 *
 *   npm run ota:rollback -- <runtimeVersion> [updateId]
 *
 * Sin updateId: vuelve al update INMEDIATAMENTE anterior al actual (según el
 * historial local ota/.history.json). Con updateId: apunta "latest" a ese id.
 *
 * Solo mueve el puntero (los manifiestos/assets del update destino ya están en
 * R2 de cuando se publicó). Instantáneo.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(__dirname, "..");
const TMP_DIR = join(__dirname, ".tmp-rollback");

const config = JSON.parse(readFileSync(join(__dirname, "ota.config.json"), "utf8"));
const BUCKET = config.bucket;

const [runtimeVersion, explicitId] = process.argv.slice(2);
if (!runtimeVersion) {
  console.error("Uso: npm run ota:rollback -- <runtimeVersion> [updateId]");
  process.exit(1);
}

const historyPath = join(__dirname, ".history.json");
if (!existsSync(historyPath)) {
  console.error("✖ No hay ota/.history.json. Pasá el updateId explícito para el rollback.");
  process.exit(1);
}
const history = JSON.parse(readFileSync(historyPath, "utf8")).filter(
  (h) => h.runtimeVersion === runtimeVersion,
);
if (history.length === 0) {
  console.error(`✖ Sin historial para runtimeVersion=${runtimeVersion}`);
  process.exit(1);
}

let target;
let platforms;
if (explicitId) {
  target = explicitId;
  platforms =
    history.find((h) => h.updateId === explicitId)?.platforms ?? ["android", "ios"];
} else {
  if (history.length < 2) {
    console.error("✖ No hay un update anterior al actual para este runtimeVersion.");
    process.exit(1);
  }
  const prev = history[history.length - 2]; // el anterior al último publicado
  target = prev.updateId;
  platforms = prev.platforms ?? ["android", "ios"];
}

const SHELL = process.platform === "win32"; // Node 20+ en Windows: .cmd requiere shell
function putObject(key, filePath) {
  execFileSync(
    "wrangler",
    ["r2", "object", "put", `${BUCKET}/${key}`, `--file=${filePath}`, "--remote", "--content-type=application/json"],
    { stdio: "inherit", cwd: APP_DIR, shell: SHELL },
  );
}

rmSync(TMP_DIR, { recursive: true, force: true });
mkdirSync(TMP_DIR, { recursive: true });

console.log(`\n▶ Rollback runtimeVersion=${runtimeVersion} → updateId=${target}\n`);
for (const platform of platforms) {
  const pointerFile = join(TMP_DIR, `pointer-${platform}.json`);
  writeFileSync(
    pointerFile,
    JSON.stringify({ updateId: target, createdAt: new Date().toISOString(), runtimeVersion, rolledBack: true }),
  );
  putObject(`pointers/${runtimeVersion}/${platform}.json`, pointerFile);
}
rmSync(TMP_DIR, { recursive: true, force: true });

console.log(`\n✅ Rollback hecho. "latest" ahora apunta a ${target}.\n`);
