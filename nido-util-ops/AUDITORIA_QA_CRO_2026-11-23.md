# Nido Útil · Auditoría QA + UX/CRO · 23/11/2026

**Alcance:** cinco páginas editoriales de `docs/`, navegación, estilos y despliegue protegido de Nido Útil. Rama `nido-util-staging`, sin modificar `main`. No se han creado cuentas, contratado servicios ni habilitado comercio.

## Resultado verificable

- **107 comprobaciones estructurales ejecutadas sobre los 5 HTML actuales descargados del conector GitHub: 107 aprobadas, 0 incidencias tras correcciones.** Se evaluaron rutas y anclas, H1 por página, semántica básica, etiquetas de navegación, salto al contenido, títulos SEO únicos, descripciones, Open Graph, ausencia de scripts/formularios, transparencia y texto del CTA. Estas **no son pruebas en navegador**.
- **Rendimiento de recursos (inspección estática):** HTML de portada ~10,9 KB y guías ~4 KB cada una; sin JS ni peticiones a scripts externos detectados. No se ha ejecutado Lighthouse ni medido LCP, INP o CLS reales; no afirmar puntajes de PageSpeed.
- **Playwright + axe-core** se agregó a `nido-util-ops/browser-qa.cjs` y al job `browser-e2e-accessibility` de `.github/workflows/nido-util-ci.yml`. Comprueba cinco páginas, seis tamaños de pantalla (320, 360, 390, 768, 1280, 1920), overflow horizontal, navegación y acceso por teclado, ausencia de errores de script, movimiento reducido y reglas WCAG 2.1 AA con axe. **Ejecución y resultado remoto del job pendiente de verificar**; el navegador del entorno local está bloqueado por políticas administradas, por lo que NO se reporta QA visual completo ni resultados de axe/Lighthouse.
- **Preview:** último despliegue probado por Vercel **READY**: `dpl_BgxvGoE5B3tmq12gNVXDuwPhbyWA`, alias [Nido Útil](https://nido-util-vista.vercel.app/). Sigue protegido en Vercel y con `noindex` + CSP estricta. Despliegue correcto no equivale a auditoría de accesibilidad ni comercial.

## Informe QA (problema → intervención → validación)

| ID | Gravedad | Observación confirmada mediante código/contraste | Corrección |
|---|---|---|---|
| QA-01 | Media | No existía enlace para saltar al contenido con teclado ni ancla principal identificada | Añadido `skip-link` enfocable, `main#contenido` y navegación con `aria-label` a las cinco páginas. Verificado estructuralmente; prueba real de teclado en job E2E pendiente |
| QA-02 | Media | Contraste insuficiente en etiquetas pequeñas: `#6e8b70` sobre `#f8f6f0` ≈3,48:1; textos de tarjetas `#687d72` sobre blanco ≈4,41:1 | Paleta ajustada: etiquetas `#536d56` ≈5,27:1 y tarjetas `#5c7065` ≈5,30:1, sin variar verde principal. Otras descripciones y pies corregidos; paleta revisada con cálculo sRGB y control en tests |
| QA-03 | Baja | `scroll-behavior:smooth` sin alternativa para quienes prefieren menos movimiento | Se añadió `prefers-reduced-motion:reduce`. Regresión estática verificada; comprobación CSS real en E2E pendiente |
| QA-04 | Baja | Faltaban metadatos Open Graph para compartir guías y portada | Añadidos `og:title`, `og:locale`, `og:type` y descripción de marca donde corresponde. Sin `og:image` inventada |
| QA-05 | Media | Falta verificación real de seis viewports, teclado y axe sobre el HTML actual | Se añadió suite dedicada Playwright + axe en GitHub Actions. **Pendiente primera ejecución remota acreditada** |
| QA-06 | Baja | Lectura móvil de tabla del escurridor sin anchura de columnas predecible | `table-layout:fixed` en tabla editorial; visual pendiente |
| QA-07 | Media de lanzamiento | Vista protegida `noindex`; aún sin dominio público definitivo ni sitemap/canonical configurados | **No desbloquear indexación en preview**. Configurar dominio, canonical y sitemap cuando esté aprobada publicación pública, comprobar Search Console antes de declarar éxito SEO |

### Límites de la evidencia

La revisión estática prueba consistencia del HTML, pero no detecta todas las diferencias entre motores de navegador, el orden de foco real ni accesibilidad completa. El job browser E2E está escrito y conectado, pero al cierre de esta intervención **su ejecución en GitHub Actions no está confirmada mediante logs**. Una eventual pantalla de autenticación Vercel se debe a la protección deliberada del preview y no es un fallo de contenido.

## Auditoría de UX / CRO (hipótesis, no métricas)

**Objetivo comercial actual:** aumentar la proporción de visitantes que entienden el beneficio y hacen clic en una guía relevante. Hasta disponer de un programa afiliado aprobado no hay funnel de compra propio; **ninguna conversión comercial fue medida ni estimada**.

1. **CRO-01 / Aplicado:** conservar el titular aspiracional de marca que aprobó el propietario y reemplazar la explicación vaga del hero por una propuesta específica («cocina pequeña», «escurridor que encaje», «ordenar la despensa») para que el beneficio se entienda en tres segundos.
2. **CRO-02 / Aplicado:** microprueba de confianza conceptual **sin experimentación real aún**: «3 guías gratuitas · Sin registro · Consejos antes de comprar» junto a CTA. Es verdadero porque actualmente no hay formularios ni cobro; no inventa reseñas, precios ni ventas.
3. **CRO-03 / Conservado:** los botones principales conducen a `#guias`, y las tarjetas enlazan a las tres guías. No cambiar a CTA «Comprar ahora» sin enlace de afiliado y permiso.
4. **CRO-04 / Pendiente:** las ilustraciones originales tienen carácter editorial, pero aún faltan fotografías de productos realmente licenciadas/probadas y ejemplos visuales de dimensiones que puedan incrementar confianza. Priorizar **después de validar SKU y permisos** para evitar fotografías engañosas.
5. **CRO-05 / Pendiente:** cuando exista publicación indexable, analítica autorizada y volumen suficiente, evaluar A/B de mensaje hero y orden de tarjetas; no declarar ganador por gustos, likes, ni por ausencia de datos. Métricas: clic a guía por sesión, profundidad de lectura, clic en enlaces remunerados válidos y **comisión neta cobrada**. Respetar consentimiento y políticas de privacidad al instrumentar.

**Impacto del cambio:** se conserva diseño, color principal y composición; se mejora claridad y accesibilidad. Ninguna cifra de ventas o mejora porcentual está demostrada.

## Siguientes puertas de lanzamiento

1. Confirmar ejecución verde de job E2E/axe en GitHub y, si falla, corregir por evidencia y repetir.
2. Verificar visualmente portada y guías a 320–1920px en un navegador **no bloqueado**, y evaluar lectura, foco y ritmo visual antes de aprobar.
3. En entorno público definitivo: Google Search Console, robots/indexación, sitemap, URL canónica, enlaces en móvil, métricas de rendimiento de campo si existe tráfico.
4. Alta de perfiles **de marca** y aprobación comercial real antes de cualquier CTA de venta. No operar con la cuenta personal ni gastar antes del umbral financiero vigente.

**Referencias internas:**
- [Portada de prueba](https://nido-util-vista.vercel.app/)
- [Código de las pruebas E2E](https://github.com/JAlvaCE/Nido-Util/blob/main/nido-util-ops/browser-qa.cjs)
- [Suite QA estructural](https://github.com/JAlvaCE/Nido-Util/blob/main/nido-util-ops/site.test.mjs)
- [Workflow GitHub Actions](https://github.com/JAlvaCE/Portfolio/actions/workflows/nido-util-ci.yml)
- [Auditoría arquitectura/seguridad/red team precedente](https://github.com/JAlvaCE/Nido-Util/blob/main/nido-util-ops/AUDITORIA_ARQUITECTURA_SEGURIDAD_REDTEAM_2026-11-24.md)
