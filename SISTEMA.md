# Europa 2027 — Documentación del Sistema

**Última actualización:** Junio 14, 2026  
**Versión del proyecto:** 1.3 (datos), Fase 0 completa

---

## ¿Qué es esto?

Dashboard de planificación y coordinación del viaje familiar Europa 2027: 3 familias argentinas (Barrera, Nader, Ahmad), 14 personas, 5 ciudades, 19 días (28 ene → 15 feb 2027).

Incluye seguimiento de vuelos, hoteles, transportes, documentación y actividades pendientes, con guías detalladas por ciudad.

---

## Arquitectura

Es un sitio **completamente estático** — HTML/CSS puro, sin servidor, sin framework, sin JavaScript.

```
europa2027-datos.json      ← fuente única de verdad
        ↓
index.html                 ← dashboard principal
londres-guia.html          ← guía ciudad (x5)
paris-guia.html
bruselas-guia.html
roma-guia.html
madrid-guia.html
```

Los HTML tienen los datos incrustados manualmente a partir del JSON. No hay fetch ni rendering en runtime — todo es estático.

**Stack:**
- HTML5 semántico
- CSS3 con variables, Grid y responsive (breakpoint 640px)
- Google Fonts (Playfair Display + DM Mono) vía CDN
- Sin npm, sin build, sin dependencias

---

## Fuente de datos — `europa2027-datos.json`

Archivo central que contiene toda la información del viaje:

| Sección | Contenido |
|---|---|
| `meta` | Versión, fecha de última actualización, notas de cambio |
| `viaje` | Nombre, familias, fechas, duración |
| `personas` | 14 viajeros con nombre, rol y estado de pasaporte |
| `vuelos` | 6 segmentos con aerolínea, fecha, estado de confirmación, PNRs por familia |
| `hoteles` | Hoteles por ciudad con check-in/out, estado de confirmación por familia |
| `transporte_local` | Instrucciones de transporte en cada ciudad (Oyster, Metro, RER, etc.) |
| `pendientes` | Lista de tareas categorizadas: transportes, entradas, logística, documentación |
| `lugares` | 100+ atracciones por ciudad con descripción, precio, zona, tips y link a Maps |
| `drive` | IDs de carpetas de Google Drive (ver sección abajo) |

Para actualizar cualquier dato del viaje, **editar este archivo JSON** y luego reflejar los cambios manualmente en los HTML correspondientes.

---

## Google Drive — Documentos del viaje

El JSON almacena los IDs de las carpetas de Drive donde se guarda la documentación física:

| Carpeta | ID |
|---|---|
| Raíz del viaje | `1MxbTztDMdw7eeEMvyF9FylGm-QVnVt86` |
| Documentación general | `1Xt21_LBmvjIhx3VHUujDarJeJhx_4oJ1` |
| Pasaportes — Familia Barrera | `1NXm9D-9qMbsZy4FhErcXdAPNRwUzxXuI` |
| Pasaportes — Familia Nader | `1v5a_GNDEYWhhXCIgBR1Ddiw215P1qV7_` |
| Pasaportes — Familia Ahmad | `1haFZJON5gm_QQLhjhpkiONBBAos0qXa5` |
| Seguros y permisos | `1nj6S_Omyz8LlzCmCuKsBjOa-7rfOVR_n` |

**Importante:** El sitio no se sincroniza automáticamente con Drive. Los IDs son solo referencias para navegar a las carpetas — los documentos (pasaportes, seguros, boarding passes) se suben manualmente a Drive.

---

## Dónde corre

El sitio vive en este repositorio Git: `mgrolandi/Europa2027`

**Entorno actual:** Sesión remota efímera en la nube (Claude Code on the web). El repositorio fue clonado al iniciar la sesión. Para que los cambios persistan, deben commitearse y pushearse.

**Hosting de producción:** No hay hosting público configurado aún. Al ser un sitio 100% estático, puede desplegarse directamente en:
- **GitHub Pages** (opción más simple — gratis, se activa en Settings del repo)
- Vercel, Netlify, o cualquier CDN estático
- Un servidor web básico (nginx, Apache)

No requiere backend ni base de datos para ninguna de estas opciones.

---

## Cómo se actualiza

No hay CI/CD ni despliegue automático. El flujo manual es:

1. Editar `europa2027-datos.json` con los nuevos datos
2. Reflejar los cambios en los HTML afectados (copiar/pegar los datos actualizados en los templates)
3. Commitear los cambios con `git commit`
4. Pushear al repositorio con `git push -u origin <rama>`

**Rama de desarrollo activa:** `claude/system-documentation-xfy206`  
**Rama principal:** `main`

No hay webhooks, polling, ni sincronización automática con ninguna fuente externa.

---

## Estado actual del proyecto

**Fase 0 completada** (commit `fa6efed`):
- ✅ Dashboard principal con timeline, vuelos y pendientes
- ✅ Guías HTML para las 5 ciudades
- ✅ Base de datos de 100+ atracciones con Maps links
- ✅ Diseño responsivo mobile-first
- ✅ Seguimiento de estado de confirmaciones por familia

**Pendientes críticos a junio 2026:**
- 🔴 Entradas Premier League — sale de venta el **19 jun 2026** (5 días)
- 🔴 Vuelo Bruselas → Roma — sin aerolínea asignada aún (feb 7, 2027)
- 🔴 Hotel Bruselas — sin reserva para ninguna familia (feb 6-7, 2027)
- 🟡 Tren Thalys París → Bruselas — sin reserva (feb 6, 2027)
- 🟡 3 pasaportes de menores pendientes: Lucas Barrera, Tomás Nader, María Julieta Ahmad
- 🟡 PNRs faltantes: Barrera y Ahmad en múltiples vuelos

---

## Archivos del proyecto

```
Europa2027/
├── SISTEMA.md                  ← este documento
├── europa2027-datos.json       ← fuente de datos central
├── index.html                  ← dashboard principal
├── londres-guia.html           ← guía Londres (29 ene – 2 feb)
├── paris-guia.html             ← guía París (2 – 6 feb)
├── bruselas-guia.html          ← guía Bruselas (6 – 7 feb)
├── roma-guia.html              ← guía Roma (7 – 11 feb)
└── madrid-guia.html            ← guía Madrid (11 – 15 feb)
```
