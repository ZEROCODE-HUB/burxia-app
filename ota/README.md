# Burxia OTA (actualizaciones over-the-air, self-hosted en Cloudflare)

Actualizaciones de **JS/assets** sin reenviar el APK, usando `expo-updates` con un
servidor propio: un **Cloudflare Worker** + **R2** (almacenamiento). El Worker es
"tonto": todo el armado del manifiesto se precalcula en tu PC al publicar.

```
Tu PC:  npm run ota:publish  →  expo export  →  sube a R2 (bundle + assets + manifest + puntero latest)
Cloudflare:  R2 (bytes)  ←→  Worker (/manifest, /assets/:hash)
App:  al abrir en frío → busca update → descarga → recarga con la versión nueva (con pantalla de carga)
```

## ⚠️ Qué se puede y qué no por OTA
- ✅ Cambios de **JS, estilos, imágenes/fuentes** (bugfixes, UI, lógica).
- ❌ Cambios **nativos** (permisos, módulos nativos nuevos, subir de SDK): requieren
  **APK nuevo**. En ese caso subí `version` en `app.config.js` y recompilá.

El `runtimeVersion` usa policy `appVersion`: un update solo cae en un APK con la
**misma** `version`. Así nunca le mandás JS incompatible a un binario viejo.

---

## 1) Setup en Cloudflare (una vez)

1. Cuenta en Cloudflare (el free tier alcanza: R2 10 GB, Workers 100k req/día).
2. **R2 → Create bucket** → nombre **`burxia-ota`** (si usás otro, cambialo en
   `ota/ota.config.json` y en `ota/worker/wrangler.toml`).
3. Instalar y loguear wrangler:
   ```
   npm i -g wrangler
   wrangler login
   ```
4. Desplegar el Worker:
   ```
   cd ota/worker
   npm install          # instala wrangler local + types (opcional pero recomendado)
   wrangler deploy
   ```
   Copiá la **URL** que imprime (ej. `https://burxia-ota.TUUSUARIO.workers.dev`).

   > Si tu login tiene varias cuentas, descomentá `account_id` en `wrangler.toml`.

5. Pegá esa URL en dos lugares:
   - `ota/ota.config.json` → `"baseUrl": "https://burxia-ota.TUUSUARIO.workers.dev"`
     (SIN `/manifest`).
   - Variable de entorno de build **`EXPO_PUBLIC_OTA_URL`** =
     `https://burxia-ota.TUUSUARIO.workers.dev/manifest` (CON `/manifest`).
     Va en el `.env` que se usa al compilar el APK.

---

## 2) Recompilar el APK (una sola vez)

El **primer** APK con OTA hay que compilarlo con `EXPO_PUBLIC_OTA_URL` seteada y
reinstalarlo. Desde ahí, los updates entran solos. (El plugin de `expo-updates`
inyecta la config nativa; si el proyecto nativo `android/` ya existe, correr
`npx expo prebuild -p android` incremental y **verificar que la firma del keystore
siga en `android/app/build.gradle`** antes de `assembleRelease`.)

## 3) Publicar una actualización (flujo diario)

```
npm run ota:publish
```
Hace `expo export`, sube todo a R2 y mueve el puntero `latest`. La próxima vez que
alguien abra la app (misma `version`), se actualiza al abrir.

## 4) Rollback
```
npm run ota:rollback -- <runtimeVersion>            # vuelve al update anterior
npm run ota:rollback -- <runtimeVersion> <updateId> # a uno específico
```
Solo mueve el puntero (instantáneo). El historial está en `ota/.history.json`.

---

## Layout en R2
```
pointers/<runtimeVersion>/<platform>.json      → { updateId, createdAt }
updates/<runtimeVersion>/<updateId>/manifest-<platform>.json
assets/<sha256-base64url>                       → bytes (bundle o asset)
```

## Firma de código (ACTIVADA)
El APK embebe el **certificado público** (`ota/codesigning/certs/certificate.pem`)
y **rechaza** cualquier update cuyo manifiesto no venga firmado con la **clave
privada** (`ota/codesigning/keys/private-key.pem`, gitignored, vive solo en tu PC
como el keystore). `publish.mjs` firma automáticamente cada manifiesto + la
directiva `noUpdateAvailable`; el Worker adjunta la firma (`expo-signature`).

- Metadata: `{ keyid: "main", alg: "rsa-v1_5-sha256" }` (RSA PKCS#1 v1.5 SHA-256).
- Config en `app.config.js` → `updates.codeSigningCertificate` + `codeSigningMetadata`.
- El cert se embebió en `AndroidManifest.xml` con `node ota/embed-codesigning.mjs`
  (sin `prebuild`, para no tocar la firma del keystore).
- ⚠️ **Si perdés la clave privada**, no podés firmar updates para los APK que ya
  tienen ese cert: habría que generar otro par y recompilar. Guardala/respaldala.
- Un `ota:publish` sin la clave privada avisa y publica SIN firmar (esos updates
  serían rechazados por el APK).
