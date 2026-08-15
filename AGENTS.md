# Instrucciones del proyecto (léelas antes de tocar nada)

## ⚠️ SEGURIDAD — ZapSign sandbox hardcodeado (QA)

Las credenciales de **sandbox** de ZapSign están **hardcodeadas en `app.config.js`**
(`extra.EXPO_PUBLIC_ZAPSIGN_API_KEY` y `EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID`, y
`EXPO_PUBLIC_APP_ENV: 'test'`). Esto es **SOLO para QA / demos**: permite que el build
funcione sin configurar EAS, porque los builds de EAS se compilan en los servidores de EAS
y solo las variables de entorno de **EAS** (no las del grupo de Codemagic) llegan al empaquetado.

La app resuelve estas vars en `config/environment.ts` vía `readEnv()`, que primero intenta
`process.env.EXPO_PUBLIC_*` (inline de EAS cuando existe) y luego cae a
`Constants.expoConfig.extra.*` (el valor embebido). Por eso funciona aunque EAS no tenga las vars.

### Para PRODUCCIÓN REAL (OBLIGATORIO antes de release):
- **NO** enviés el sandbox hardcodeado a producción.
- En EAS → Environment Variables (visibility = **plain**), setear:
  - `EXPO_PUBLIC_APP_ENV` = `production`
  - `EXPO_PUBLIC_ZAPSIGN_API_KEY_PROD` = key real de producción
  - `EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID_PROD` = template real de producción
  - (opcional) `EXPO_PUBLIC_ZAPSIGN_SELFIE_VALIDATION_TYPE` = `liveness-document-match` | `identity-verification-global`
- Borrá los valores hardcodeados de sandbox de `app.config.js` (dejá solo los `_PROD` leyendo de `process.env`).
- En producción, `verifyZapSignIdentity` exige biometría estricta solo si
  `EXPO_PUBLIC_ZAPSIGN_SELFIE_VALIDATION_TYPE` está configurado.

## Notas de build (Codemagic)
- `codemagic.yaml` tiene `ios-workflow` y `android-workflow`, ambos usando el grupo `magnate-variables`.
  Ese grupo debe contener al menos `EXPO_TOKEN` (para autenticar `eas build`). Las vars de ZapSign
  ya van embebidas en el build vía `app.config.js`, así que no hacen falta en el grupo para QA.
- El paso de descarga del artifact usa `eas build --wait 2>&1 | tee` + `grep` de la URL + `curl`
  (no usar `eas build:download --profile/--output`, esos flags no existen en la CLI).
- El `.env` local está gitignoreado y es solo para dev. No se sube a Codemagic.
