# App Bruxia (nativa) — estado y pendientes

App **React Native / Expo** (SDK 54, RN 0.81.5). Es el producto real, tomada de
`magnate-virtual-wallet` rama **`master`** y adaptada al stack de TecnoMind (la
base de datos) con la marca **Bruxia**.

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
- **Marca Bruxia** en UI, textos y el `name` de la app.
- **Package `com.bruxia.app`** (iOS `bundleIdentifier` + Android `package`),
  `scheme: bruxia`, `slug: bruxia-mobile`.
- **Mocks eliminados** (`data/`); el tipo que se usaba se movió a `types/dashboard.ts`.
- **Columnas**: `AuthContext` normaliza `document_number→dni` y `tax_id→cuit_cuil`
  en un solo punto.

## Pendiente

### 🎨 Logo y parte gráfica (falta el material del cliente)

- `components/LogoIcon.tsx` sigue siendo el isotipo "M" heredado (SVG).
- `assets/{icon,splash-icon,adaptive-icon,favicon}.png` son los del proyecto de
  origen. Son el ícono de la app en las tiendas y la splash.

No hay logo ni identidad visual de Bruxia todavía (lo confirmó el cliente).
Cuando llegue: reemplazar esos PNG (icon 1024×1024, adaptive-icon, splash) y el
SVG de `LogoIcon.tsx`.

### 📦 EAS / release (necesita la cuenta del cliente)

- `extra.eas.projectId` en `app.config.js` sigue siendo el de la cuenta original.
  Antes del primer build bajo la cuenta EAS de Bruxia hay que correr `eas init`
  para regenerarlo (ajusta el `slug`).
- Certificados de firma (iOS/Android) y el AuthKey de Apple: los aporta el cliente
  con su cuenta.
- OneSignal (`EXPO_PUBLIC_ONESIGNAL_APP_ID`): app de push propia de Bruxia.

### ✅ Test funcional en web (2026-09-04)

Se levantó la app en web (`expo start --web`) y se probó el flujo con la cuenta
demo: login con **PIN de 6 dígitos** → dashboard con **saldo real ($571.150)** →
movimientos agrupados por día con la contraparte resuelta → transferir. Todo con
datos reales de la base. Confirma que el auth (PIN=6), las lecturas y el mapeo de
columnas funcionan end-to-end.

Limitaciones del test en web (esperadas, no bugs): el viewport del navegador no se
pudo achicar a tamaño teléfono en el entorno (se usó un marco CSS para aproximar el
layout móvil); `expo-secure-store` y los módulos nativos (cámara, biometría, push)
no funcionan en web, por eso el device-check pide verificación — en un móvil real
anda.

### 🧪 Verificación en dispositivo

Falta el pase de QA real en Android/iOS. Cámara, biometría, SecureStore y push solo
corren en el móvil, así que las pantallas de escaneo QR, verificación de dispositivo
y notificaciones no se pudieron probar en web.

### 🔧 Menor

- ✅ **`types/database.types.ts` regenerado (2026-09-04).** El bloque `Database` se
  reemplazó por el generado desde la base (cumple el contrato de supabase-js v2), y
  los alias de dominio (`User`, `Account`, `AccountWithType`…) se conservaron, con
  los campos legacy (`dni`, `cuit_cuil`, `pin_hash`, `zapsign_*`, `web_password_hash`)
  marcados opcionales para no romper el código que los lee (AuthContext los inyecta).
  **tsc pasa de 11 a 0 errores.** Re-testeado en web: login + dashboard con datos
  reales siguen funcionando.
- El registro de la app lo revisará el cliente más adelante (depende del SMTP —
  Resend — para confirmar el email; hasta entonces el signup público está limitado).

## 🌐 Web responsive — Fase 1+2 y piloto QR (2026-09-04)

Primer avance de la adaptación a web (mismo código Expo).

- **Fundaciones:** `lib/secureStorage.ts` (+ `.web.ts`) — abstrae el almacenamiento
  del id de dispositivo: `expo-secure-store` en nativo, `localStorage` en web (antes
  fallaba y caía a "UNKNOWN_DEVICE"). `auth.service` usa el wrapper.
- **Responsive Nivel A:** `components/WebFrame.tsx` — en web centra la app con ancho
  máximo de teléfono y pinta los costados; en iOS/Android es passthrough (no cambia
  nada). Integrado en `app/_layout.tsx`.
- **Piloto QR (medición del riesgo de cámara web):** confirmado que el navegador
  ofrece `getUserMedia` pero **no `BarcodeDetector`** (ni Chrome ni Firefox/Safari),
  así que el escaneo en vivo de `expo-camera` no decodifica en web. `qr.tsx` ahora,
  en web, no monta la cámara inerte: muestra un aviso y guía a **"Cargá una imagen
  del código QR"**, que decodifica con `jsqr` (ya existía en `useQRHandler`). En
  nativo, la cámara sigue igual.

Probado en web end-to-end: login (PIN 6) → dashboard con datos reales → pantalla QR
con el fallback. tsc en 0.

### Lo que sigue si se continúa la web

- Escaneo QR en vivo por webcam decodificando frames con `jsqr` (opcional; hoy el
  fallback de subir imagen ya cubre el caso).
- Alternativas web para: foto de avatar (`expo-image-picker` → input file),
  descargar/compartir comprobante (`react-native-view-shot` → captura HTML), y el
  KYC con foto de documento del registro.
- Revisar el resto de pantallas dentro del `WebFrame` (Nivel A) y decidir si se
  quiere Nivel B (layout de escritorio con sidebar).

## 🌐 Web Fase 3 — compartir/descargar comprobante (2026-09-04)

- **Compartir/descargar imagen (comprobante y QR):** `react-native-view-shot` y
  `expo-sharing` no funcionan en web. Se creó `lib/captura.ts` (+ `.web.ts`) con
  `capturarYCompartir(ref, {nombre, titulo})`: nativo usa view-shot + expo-sharing;
  web captura el nodo DOM con `html-to-image` y usa Web Share API (si el navegador
  comparte archivos) o descarga el PNG. `success.tsx` y `share-cvu.tsx` migrados al
  helper; en `success.tsx` el `<ViewShot>` pasó a `<View>` para unificar.
- **Avatar (`expo-image-picker`):** no necesitó cambios — en web abre el selector de
  archivo nativo del navegador. Falta accionarlo en un QA real (el file-picker del
  SO no se puede automatizar en el entorno de prueba).
- **Limpieza:** `tsconfig.json` tenía `types: ["reflect-metadata"]` +
  `experimentalDecorators` (eran del DI de la carpeta `src/` eliminada). Se quitaron.
- Dependencia nueva **`html-to-image`** (solo entra al bundle web vía `.web.ts`).

Verificado en web: pantalla "Mis Datos de Cuenta" con QR real y datos reales;
"Descargar QR" corre sin errores (la descarga en sí depende del navegador). tsc: 0.

### Sigue pendiente de la web

- Escaneo QR en vivo por webcam: **descartado por decisión del cliente** (en web
  solo se sube la imagen del QR; el fallback ya lo cubre).
- **Nivel B (escritorio con sidebar): HECHO** (ver sección más abajo).
- **PDF de estado de cuenta en web: HECHO** (`statement.service.web.ts`).
- Avatar (`expo-image-picker`) y KYC real de ZapSign: falta QA con interacción
  real (file-picker del SO / credenciales reales), no automatizable acá.

## 🏷️ Rebrand a Bruxia + Web Fase 4 (KYC) + responsive completo (2026-09-04)

- **Nombre definitivo: Bruxia** (antes "Proxpera", antes "Tecnomind/Magnate");
  package `com.bruxia.app`.
- **Fuente ÚNICA de marca: `constants/brand.ts`** (`BRAND_NAME`, `BRAND_TAGLINE`,
  `SUPPORT_EMAIL`, `EMAIL_PLACEHOLDER`, `ALIAS_PREFIX`). Toda la UI/servicios la
  referencian: **renombrar la app = cambiar una línea**. Los identificadores
  nativos (name, slug `bruxia-mobile`, scheme `bruxia`, bundle/package
  `com.bruxia.app`) viven en `app.config.js` (los consume el build de Expo/EAS);
  si cambia la marca, actualizar ambos lados.
- **Eliminado `constants/AppConfig.ts`**: era código muerto (nadie lo importaba) y
  traía una **URL + anon key de Supabase hardcodeadas de un proyecto equivocado**
  (`mzxhyjgbbabnughknrxc`). Fuera.
- Barridos todos los residuos de marca en UI, comprobante (`success.tsx` decía
  "TECNOMIND"), PDF (`statement.service.ts`), alias del CVU (`generators.ts` +
  `AliasManagement.tsx` → prefijo `bruxia.`), placeholders de email y email de
  soporte, comentarios y docs.
- **KYC web (Fase 4):** `components/register/BiometricCard.web.tsx`. El nativo usa
  `react-native-webview` + `expo-camera`, que **rompían el bundle web y la ruta
  `/register`**. La variante `.web` abre la `signerUrl` de ZapSign en pestaña nueva
  (`window.open`) y verifica con polling de `verifyZapSignIdentity` (misma subida
  del PDF a Storage). Metro resuelve `.web.tsx` en web y `.tsx` en nativo.
- **Responsive Nivel A COMPLETO.** Verificadas en el navegador dentro del
  `WebFrame`: login, dashboard, movimientos, transferir, estadísticas, QR
  (fallback), compartir CVU, menú, API, acceso web, **registro** (con la tarjeta
  biométrica web), **perfil**, **dispositivos** y **configuración**. `change-pin`
  reutiliza el teclado del login. tsc: 0.
- Menor: el **título de la pestaña** del navegador todavía sale "Proxpera" hasta
  reiniciar el dev server (Metro cachea el `name` del arranque); el binario/EAS ya
  toma "Bruxia" del `app.config.js`.
- Recordatorio: hay **dispositivos de test/piloto** en `user_devices` de la cuenta
  demo (se ven en la pantalla Dispositivos) — limpiar antes de producción.

## 🖥️ Nivel B — layout de escritorio (2026-09-04)

- **`components/WebFrame.tsx`:** en web con ancho ≥ 900px (`hooks/useIsDesktop.ts`)
  y dentro de la app autenticada, renderiza `DesktopSidebar` a la izquierda +
  contenido centrado en una columna (máx. 760px). En angosto y en pantallas sin
  sesión (login/registro/verify) mantiene el marco tipo teléfono (Nivel A).
- **`components/layout/DesktopSidebar.tsx`:** navegación agrupada + tarjeta de
  usuario + cerrar sesión; resalta la ruta activa (`usePathname`).
- **`app/(tabs)/_layout.tsx`:** oculta la tab-bar inferior en escritorio.
- **`constants/navItems.ts`:** fuente ÚNICA de navegación, consumida por el menú
  móvil **y** el sidebar → agregar/quitar un destino = editar un solo archivo.
- El sidebar usa el componente `Logo` central → cuando llegue el gráfico de
  Bruxia, se cambia en `LogoIcon.tsx`/`Logo.tsx` y se propaga a todos lados.
- Verificado en el navegador: dashboard y transferir con sidebar, navegación y
  resaltado activo funcionando. tsc: 0.
- **PDF de estado de cuenta en web** (`statement.service.web.ts`): el generador de
  HTML se extrajo a `services/statement.template.ts` (neutro) y lo comparten la
  versión nativa (expo-print) y la web (abre ventana + `window.print`).

### QA en web (escritorio, 2026-09-04)

Recorrido completo del layout de escritorio (Inicio, Transferir, Movimientos,
Estadísticas, Perfil, Compartir CVU, Escanear QR) con navegación por el sidebar y
resaltado activo. **Cero errores de consola.** Un hallazgo corregido:

- **`BalanceChart`** usaba `min(windowWidth, 480)` y en escritorio quedaba topado a
  480px dejando vacío el resto de la tarjeta. Ahora mide su contenedor (`onLayout`)
  y llena el ancho disponible (teléfono ~480 / columna escritorio ~760).

Limitación del entorno: el viewport del navegador de prueba está fijo en 1920px y
no se puede achicar, así que el **Nivel A angosto** (marco teléfono + tab-bar) no
se pudo re-capturar acá; se verificó antes en el marco de 480 y su lógica no
cambió (la tab-bar solo se oculta con ancho ≥ 900). Falta QA con interacción real:
selector de archivo del avatar / "Cargar imagen" del QR / impresión del estado de
cuenta (abre diálogo modal del navegador) y el flujo real de ZapSign.
