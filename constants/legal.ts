// Términos y Condiciones: versión vigente y URL pública del PDF.
//
// El PDF se sirve como asset estático desde `public/` del repo (Vercel lo publica
// en la raíz del dominio, igual que og.png), así que la misma URL funciona en web
// y en móvil.
//
// Al publicar una versión nueva de los TyC:
//   1) subir el PDF a `public/` con un nombre nuevo (ej. terminos-condiciones-v2.pdf),
//   2) actualizar TERMS_VERSION y TERMS_PDF_URL.
// El modal (TermsGate) re-pide aceptación cuando users.terms_version != TERMS_VERSION.
export const TERMS_VERSION = '1';
export const TERMS_PDF_URL = 'https://app.burxia.com/terminos-condiciones-v1.pdf';
