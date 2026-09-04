# Instrucciones del proyecto (léelas antes de tocar nada)

> **TecnoMind.** App tomada de `magnate-virtual-wallet` rama `master`, adaptada al
> stack de TecnoMind. Apunta a la base fiat vía `.env` (no versionado; ver
> `.env.example`). Estado y pendientes en `docs/pendientes.md`.

## ⚠️ SEGURIDAD — ZapSign va por Edge Function, NO hardcodeado

La API key de ZapSign **ya no vive en la app**. Se movió a la Edge Function
`zapsign-proxy` (repo de Supabase). La app llama vía
`supabase.functions.invoke('zapsign-proxy', ...)` en `services/zapsign.service.ts`;
la key vive en `Deno.env` del servidor.

🚫 **No vuelvas a poner `EXPO_PUBLIC_ZAPSIGN_API_KEY` (ni ninguna key) en
`app.config.js` ni en `config/environment.ts`.** Todo lo `EXPO_PUBLIC_*` queda
incrustado en el binario y se extrae del APK. La versión vieja hacía eso; fue el
motivo del cambio. Las credenciales de proveedores van del lado servidor.

⚠️ **NO usar `import { Constants } from 'expo-constants'`**: en `expo-constants`
`Constants` es un export **solo de tipo**; el named import queda `undefined` en
runtime y revienta `environment.ts`. Usar el import por defecto (`import Constants
from 'expo-constants'`), como hace `utils/env.ts`.

`utils/env.ts` ya no cae a valores hardcodeados: si falta una variable, lanza. Es
preferible no arrancar a arrancar contra la base equivocada.

## Notas de build (Codemagic / EAS)
- `codemagic.yaml` tiene `ios-workflow` y `android-workflow` con el grupo
  `magnate-variables`, que debe contener al menos `EXPO_TOKEN`. Las vars de la app
  (`EXPO_PUBLIC_SUPABASE_*`) se cargan por EAS Environment Variables o `.env`.
- El paso de descarga del artifact usa `eas build --wait 2>&1 | tee` + `grep` de la URL + `curl`
  (no usar `eas build:download --profile/--output`, esos flags no existen en la CLI).
- El `.env` local está gitignoreado y es solo para dev. No se sube a Codemagic.
