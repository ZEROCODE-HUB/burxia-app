// Post-build para la web (SPA). Con web.output 'single', Expo no aplica
// app/+html.tsx, así que inyectamos las meta tags de Open Graph directamente en
// dist/index.html para que al compartir el link (WhatsApp, etc.) salga con
// título, descripción y miniatura. Idempotente. Se corre tras `expo export -p web`.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'dist/index.html';
const SITE = 'https://burxia-app.vercel.app';
const DESC =
  'Settlement instantáneo. Disciplina bursátil. Operá con la confianza de un banco y la agilidad de una app.';

let html = readFileSync(FILE, 'utf8');

if (!html.includes('og:image')) {
  const tags = `    <meta name="description" content="${DESC}" />
    <meta name="theme-color" content="#2D2154" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Burxia" />
    <meta property="og:title" content="Burxia" />
    <meta property="og:description" content="${DESC}" />
    <meta property="og:url" content="${SITE}/" />
    <meta property="og:image" content="${SITE}/og.png" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1024" />
    <meta property="og:image:height" content="1024" />
    <meta property="og:image:alt" content="Burxia" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Burxia" />
    <meta name="twitter:description" content="${DESC}" />
    <meta name="twitter:image" content="${SITE}/og.png" />
`;
  html = html.replace('</head>', `${tags}  </head>`);
}

html = html.replace('<html lang="en">', '<html lang="es">');

writeFileSync(FILE, html);
console.log('[inject-og] meta tags de Open Graph inyectadas en', FILE);
