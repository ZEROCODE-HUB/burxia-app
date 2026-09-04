# App Proxpera (nativa) — estado y pendientes

App **React Native / Expo** (SDK 54, RN 0.81.5). Es el producto real, tomada de
`magnate-virtual-wallet` rama **`master`** y adaptada al stack de TecnoMind (la
base de datos) con la marca **Proxpera**.

Apunta a la base fiat (`spieokzbbwmgkcdigsxo`) vía `.env` (no versionado; ver
`.env.example`). `utils/env.ts` falla si falta configuración en vez de caer a
valores hardcodeados.

## ✅ Resuelto

- **Saneamiento estructural (2026-09-04):** eliminada la carpeta `src/` (2544
  líneas de clean architecture con inyección de dependencias que estaba aislada y
  no entraba al bundle — nadie la importaba). Con ella se quitaron las dependencias
  `inversify` y `reflect-metadata`. La app corre por `app/` (expo-router) +
  `services/` + `hooks/` + `context/`, una sola capa. Colores hardcodeados movidos a
  los tokens de `theme/` (quedan solo el SVG del logo placeholder y rgba alpha).
  Tipos e imports muertos en `auth.service` eliminados.

- **Autenticación alineada al modelo de la base** (migración 00021): el PIN es la
  contraseña de Supabase Auth. Se eliminó el modelo viejo (auto-password cifrada,
  `pin_hash`, descifrado en el cliente). Login/registro/cambio de PIN reescritos;
  el bloqueo por intentos lo lleva la base.
- **`utils/crypto.ts` eliminado** — tenía una clave de cifrado hardcodeada
  (`'12345…'`) y quedó sin uso al cambiar el modelo de auth.
- **ZapSign fuera del binario.** La API key ya no está en la app. La Edge Function
  `zapsign-proxy` (en `Proyecto sin Cripto/supabase/functions/`) **está desplegada y
  activa** (verify_jwt on). La app la llama con `supabase.functions.invoke`. Falta
  solo cargar los secrets cuando haya credenciales reales de ZapSign:
  `ZAPSIGN_API_KEY`, `ZAPSIGN_TEMPLATE_ID`, y opcionales `ZAPSIGN_BASE_URL` /
  `ZAPSIGN_SELFIE_VALIDATION_TYPE`. Sin secrets responde 503 a usuarios
  autenticados; en modo test el KYC usa mocks, así que no bloquea.
- **Marca Proxpera** en UI, textos y el `name` de la app.
- **Package `com.proxpera.app`** (iOS `bundleIdentifier` + Android `package`),
  `scheme: proxpera`, `slug: proxpera-mobile`.
- **Mocks eliminados** (`data/`); el tipo que se usaba se movió a `types/dashboard.ts`.
- **Columnas**: `AuthContext` normaliza `document_number→dni` y `tax_id→cuit_cuil`
  en un solo punto.

## Pendiente

### 🎨 Logo y parte gráfica (falta el material del cliente)

- `components/LogoIcon.tsx` sigue siendo el isotipo "M" heredado (SVG).
- `assets/{icon,splash-icon,adaptive-icon,favicon}.png` son los del proyecto de
  origen. Son el ícono de la app en las tiendas y la splash.

No hay logo ni identidad visual de Proxpera todavía (lo confirmó el cliente).
Cuando llegue: reemplazar esos PNG (icon 1024×1024, adaptive-icon, splash) y el
SVG de `LogoIcon.tsx`.

### 📦 EAS / release (necesita la cuenta del cliente)

- `extra.eas.projectId` en `app.config.js` sigue siendo el de la cuenta original.
  Antes del primer build bajo la cuenta EAS de Proxpera hay que correr `eas init`
  para regenerarlo (ajusta el `slug`).
- Certificados de firma (iOS/Android) y el AuthKey de Apple: los aporta el cliente
  con su cuenta.
- OneSignal (`EXPO_PUBLIC_ONESIGNAL_APP_ID`): app de push propia de Proxpera.

### 🧪 Verificación en dispositivo

Nada de esto se probó en emulador/dispositivo (no hay en el entorno de trabajo). El
login se verificó a nivel base y el código compila, pero falta un pase de QA real
en Android/iOS (cámara, biometría, SecureStore y push solo corren en el móvil).

### 🔧 Menor

- `types/database.types.ts` está hecho a mano y desalineado con la base (da errores
  `never` en `tsc` que Metro ignora). Regenerar desde la base cuando se quiera
  typecheck limpio.
- El registro de la app lo revisará el cliente más adelante (depende del SMTP —
  Resend — para confirmar el email; hasta entonces el signup público está limitado).
