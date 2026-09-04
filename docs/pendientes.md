# App TecnoMind (nativa) — estado y pendientes

App **React Native / Expo** (SDK 54, RN 0.81.5). Es el producto real, tomada de
`NoCodeHero83/magnate-virtual-wallet` rama **`master`** (la rama `main` del mismo
repo es una web distinta que no va).

Apunta a la base de TecnoMind fiat (`spieokzbbwmgkcdigsxo`). La configuración va
en `.env` (no versionado); ver `.env.example`.

## 🔴 Seguridad — resolver antes de producción

### 1. Clave de cifrado hardcodeada (crítico)

`utils/crypto.ts` cifra la contraseña automática con una clave fija escrita en el
código:

```ts
const ENCRYPTION_KEY = '12345678901234567890123456789012';
```

Está en el binario y en el repo. Cualquiera que extraiga el APK puede descifrar
las contraseñas automáticas guardadas en `user_auth_credentials`. Ver el punto de
arquitectura de auth más abajo: la solución no es rotar la clave, es eliminar el
esquema que la necesita.

### 2. Clave de API de ZapSign incrustada en el binario

`app.config.js` trae la API key del proveedor de KYC en texto plano:

```js
EXPO_PUBLIC_ZAPSIGN_API_KEY: 'ceffd5f8-...'
```

Todo lo que empieza con `EXPO_PUBLIC_` **queda dentro del binario** y se extrae del
APK. `services/zapsign.service.ts` llama a la API de ZapSign directamente con
`Authorization: Bearer <apiKey>` desde el dispositivo. Cualquiera con el APK tiene
la clave y puede gastar la cuota / operar como la cuenta.

**Solución:** las llamadas a ZapSign deben salir de una Edge Function del lado
servidor; la app le pide a esa función, nunca a ZapSign. La clave vive solo en el
servidor.

### 3. La biometría (versión anterior) fallaba abierta

En la versión de febrero, `SKIP_BIOMETRICS` tenía `"true"` como valor por defecto:
un control de seguridad que se saltea si falta la config. En esta versión de
agosto ese default ya no está — verificado. Igual, revisar que la biometría falle
**cerrada** en todos los caminos.

## 🔴 Arquitectura de autenticación — INCOMPATIBLE con la base actual

Este es el bloqueo funcional más importante. La app y la base de TecnoMind usan
**dos modelos de login distintos e incompatibles**:

| | App nativa (modelo Magnate) | Base TecnoMind (migración 00021) |
|---|---|---|
| Contraseña de Supabase Auth | una **auto-password cifrada reversible**, guardada en `user_auth_credentials`, descifrada en el cliente | **el PIN es la contraseña**, con bcrypt de Supabase |
| `users.pin_hash` | se usa, con bcrypt en el cliente | **sin usar a propósito** |
| `user_auth_credentials` | central | **sin usar a propósito** |
| Login | `get_user_login_data` → descifrar auto-password → `signInWithPassword` | `signInWithPassword({ email, password: pin })` directo |

En TecnoMind se decidió **un solo secreto** (el PIN, gestionado por Supabase
Auth): no se replica el secreto en dos lados ni se guardan contraseñas
reversibles. La app trae el esquema viejo, que es justo el que 00021 vino a
eliminar, y encima con la clave de cifrado hardcodeada del punto 1.

**Un usuario registrado por el trigger de TecnoMind (00016) no va a poder loguear
en la app tal como está**, porque la app intenta descifrar una `auto_password`
que en nuestro modelo no existe.

**Decisión pendiente (es del usuario / arquitectura):**

- **Opción A — alinear la app al modelo de TecnoMind (recomendada).** Reescribir
  `loginWithPin` y `registerUser` para que el PIN sea la contraseña de Supabase
  Auth, como hace la web. Elimina la clave hardcodeada, el descifrado en cliente y
  el doble secreto. Es trabajo acotado en `services/auth.service.ts` y toca el
  registro. Es lo coherente con lo ya construido.
- **Opción B — volver la base al modelo de la app.** Rehacer 00016/00021 y arrastrar
  la clave de cifrado hardcodeada. No recomendado.

Hasta resolver esto no tiene sentido tocar pantallas de login, registro, cambio de
PIN ni dispositivos.

## Adaptación al esquema de TecnoMind

- **Nombres de columna:** la app usa `dni` (28 veces) y `cuit_cuil` (6). En
  TecnoMind son `document_number` y `tax_id`. El registro ya manda las claves de
  metadata correctas al trigger (`nombres`, `dni`, `cuit`), así que el alta puede
  funcionar; falta revisar las **lecturas** (mappers y repositorios en `src/data`).
- **`types/database.types.ts`** está escrito a mano y desalineado con nuestra base
  (da errores `never` en `api_access`, `app_versions`, etc.). Regenerarlo desde la
  base de TecnoMind y ajustar los consumos.
- **Mocks que quedan:** `data/mockBalance.ts`, `data/mockTransactions.ts`,
  `data/statisticsData.ts`, `data/allTransactions.ts` (los mismos que se sacaron
  de la web). Usados por `components/dashboard/TransactionItem.tsx`.
- **Marca:** renombrar "Magnate" → "TecnoMind" (bundle `com.magnate.mobile`,
  splash, textos), como se hizo en la web.

## Errores de TypeScript preexistentes

`tsc --noEmit` marca errores que ya venían del repo original (módulo `../../../theme`
inexistente, propiedad `xxl`, tipos `never`). Metro transpila sin typecheck
estricto, por eso el APK de producción funciona igual. No confundir con errores
que introduzca la adaptación.
