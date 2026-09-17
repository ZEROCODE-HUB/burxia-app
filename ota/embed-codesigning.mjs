#!/usr/bin/env node
/**
 * Embebe el certificado PÚBLICO de firma de código en el AndroidManifest.xml del
 * proyecto nativo, sin correr `prebuild` (que resetearía la firma del keystore).
 *
 * Usa el mismo serializador que Expo (@expo/config-plugins) para que el PEM
 * multilínea quede embebido igual que en un prebuild real.
 *
 *   node ota/embed-codesigning.mjs
 *
 * Idempotente: reemplaza los meta-data si ya existen.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "@expo/config-plugins";

const { AndroidConfig } = pkg;
const { Manifest } = AndroidConfig;

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(__dirname, "..");
const MANIFEST_PATH = join(APP_DIR, "android", "app", "src", "main", "AndroidManifest.xml");
const CERT_PATH = join(__dirname, "codesigning", "certs", "certificate.pem");

const CERT_META = "expo.modules.updates.CODE_SIGNING_CERTIFICATE";
const METADATA_META = "expo.modules.updates.CODE_SIGNING_METADATA";

const certPem = readFileSync(CERT_PATH, "utf8");
const codeSigningMetadata = JSON.stringify({ keyid: "main", alg: "rsa-v1_5-sha256" });

const manifest = await Manifest.readAndroidManifestAsync(MANIFEST_PATH);
const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

AndroidConfig.Manifest.addMetaDataItemToMainApplication(mainApplication, CERT_META, certPem);
AndroidConfig.Manifest.addMetaDataItemToMainApplication(
  mainApplication,
  METADATA_META,
  codeSigningMetadata,
);

await Manifest.writeAndroidManifestAsync(MANIFEST_PATH, manifest);

console.log("✅ Certificado de firma de código embebido en AndroidManifest.xml");
console.log("   - " + CERT_META + " (PEM, " + certPem.trim().length + " chars)");
console.log("   - " + METADATA_META + " = " + codeSigningMetadata);
