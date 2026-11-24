# Nido Útil

**Ideas que hacen espacio.** Guías y contenido educativo para organizar mejor el hogar en Colombia.

## Repositorio independiente

Este repositorio **contiene únicamente el proyecto Nido Útil**. El portafolio personal vive en otro repositorio: `JAlvaCE/Portfolio`. **No escribir, importar ni desplegar código de Nido Útil desde Portfolio.**

- Sitio web: `docs/` (HTML/CSS estático).
- Calidad y controles operativos: `nido-util-ops/` (Node.js sin dependencias de aplicación).
- Pruebas: `node --test nido-util-ops/*.test.mjs` (suite local); GitHub Actions CI en la rama `main` ejecuta pruebas estáticas y E2E cuando esté habilitado.
- Vista de evaluación: https://nido-util-vista.vercel.app/ (protegida, no indexable hasta lanzamiento).
- Referencias editoriales y comerciales: ChatGPT Space de Nido Útil, no el repositorio del portafolio.

**Estado:** sitio educativo en validación. No está habilitado para cobrar, recibir pedidos, gestionar datos de clientes ni publicar ofertas de afiliación sin comprobaciones externas.

## Despliegue e indexación

El sitio debe desplegarse desde `docs/` **en un proyecto de hosting exclusivo de Nido Útil**. La configuración `nido-util-ops/config/vercel-preview.json` mantiene CSP y `noindex` durante revisión; cuando exista un dominio público autorizado se deben configurar canonical, sitemap y SEO técnico de producción. **No usar el proyecto Vercel `portfolio`.**

## Políticas

Sin gastos de dinero hasta cumplir el hito comercial real definido en el manual. Nada de testimonios, pruebas de producto, ventas ni enlaces afiliados inventados. Mantener cuentas de marca independientes de redes personales.

Manual: https://chatgpt.com/space/page_359b9507e5b88191826379d44c61d071
