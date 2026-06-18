# Animated Posts — hito inicial

Primer hito funcional del generador local de publicaciones animadas:

- Una plantilla real: `minimal-clean`.
- Marca y contenido validados con Zod.
- Relaciones de aspecto centralizadas.
- Registro y catálogo de plantillas coherentes.
- Timeline GSAP pausada y controlable con `window.renderAt(seconds)`.
- Captura determinística con Playwright.
- Codificación MP4 con FFmpeg.

## Requisitos

- Node.js 22 o superior.
- FFmpeg disponible en `PATH`.

## Instalación

```bash
npm install
npx playwright install chromium
```

## Validación de TypeScript

```bash
npm run check
```

## Preview manual

Terminal 1:

```bash
npm run dev
```

Abrir:

```text
http://127.0.0.1:5173/
```

Preview específico:

```text
http://127.0.0.1:5173/?template=minimal-clean&ratio=9:16
```

## Render

Con Vite todavía ejecutándose, abrir otra terminal:

```bash
npm run render
```

Elegir plantilla y formato. El resultado se guarda en `output/`.

## Alcance deliberado de esta etapa

Todavía no incluye:

- Selector automático de cliente.
- Autoajuste tipográfico.
- Validación visual de overflow.
- Procesamiento por lotes.
- Inicio automático de Vite.
- Segunda plantilla.

Esas funciones deben incorporarse después de validar este hito completo.
