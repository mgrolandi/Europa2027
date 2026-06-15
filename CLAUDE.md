# Europa 2027 — Contexto del proyecto

## Deploy
- **Producción**: [europa2027.vercel.app](https://europa2027.vercel.app) — conectado a rama `main`
- **Siempre pushear a `main`** para que Vercel publique automáticamente
- La rama `gh-pages` existe pero NO es la que sirve producción
- Rama de desarrollo activa: `claude/europa-2027-trip-2bjheq`

## Flujo de trabajo
1. Desarrollar en `claude/europa-2027-trip-2bjheq`
2. Pushear a `main` para publicar en Vercel
3. Opcionalmente sincronizar `gh-pages` (legacy, no prioritario)

## Clave de acceso PWA
- PIN: `Europa2027` (sensible a mayúsculas)
- Configurado en `index.html`: `var KEY='e27_auth', PASS='Europa2027'`

## Estructura del proyecto
- `index.html` — Dashboard principal con auth overlay
- `*-guia.html` — Guías por ciudad (Londres, París, Bruselas, Roma, Madrid)
- `europa2027-datos.json` — Fuente de verdad de todos los datos del viaje (v1.6)
- `sw.js` — Service Worker network-first (auto-actualiza el PWA)
- `manifest.json` — Config PWA

## Datos del viaje
- Archivo maestro: `europa2027-datos.json`
- Cargar en cada nuevo chat para mantener contexto
- Versión actual: **1.6**
