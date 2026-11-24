# Nido Útil — Auditoría de arquitectura, seguridad y red team ético

**Fecha:** 24/11/2026 (America/Bogota)  
**Alcance autorizado:** rama `main` del repositorio independiente `JAlvaCE/Nido-Util` (migrado desde Portfolio), cinco archivos HTML de `docs/`, herramientas de `nido-util-ops/` y despliegue dedicado `nido-util-vista` en Vercel. No incluye otras propiedades, cuentas ajenas, carga de tráfico, penetración autenticada ni operación con dinero real.  
**Método:** arquitecto → seguridad → pruebas adversariales no destructivas → correcciones de arquitectura/código → revalidación de seguridad.  
**Estado:** endurecimiento parcial aplicado; **NO equivale a certificación de producción, auditoría de terceros ni pentest completo**.

## 1. Diagnóstico del arquitecto

- **Fortaleza A-01:** sitio editorial estático con cinco páginas, HTML semántico, sin backend, formularios ni JavaScript de terceros detectados en el conjunto desplegado. Dependencias en tiempo de ejecución del sitio: ninguna visible. Superficie de ataque limitada para la fase sin afiliado y sin pedidos.
- **Fortaleza A-02:** rama de trabajo separada de `main`, código de evaluación de producto, experimentación, prepublicación y tesorería. Las ofertas continúan inhabilitadas salvo revisiones documentales externas.
- **A-03 / MEDIA / ABIERTA:** reglas y estado dispersos entre ChatGPT Space Pages, JSON local y varios validadores JavaScript. No hay base transaccional ni contrato ejecutable único; un documento puede quedar desalineado del código. **Recomendación:** diseñar dominio unificado `Producto → Oferta → Evidencia → Campaña → Comisión → Movimiento`, con identificadores y versiones; integrar solo cuando exista flujo comercial real, no sobrediseñar la web informativa.
- **A-04 / MEDIA / ABIERTA:** `nido-util-staging` está en un repositorio denominado `Portfolio`; riesgos de confundir despliegues y de mezclar políticas de seguridad. Separar Nido Útil en repositorio propio cuando la migración pueda hacerse sin romper la URL ni la identidad visual. No tocar `main` accidentalmente.
- **A-05 / ALTA / CORREGIDA EN CÓDIGO:** no había verificación automática de pruebas antes de cambios. Se agregó [CI de Nido Útil](https://github.com/JAlvaCE/Nido-Util/blob/main/.github/workflows/nido-util-ci.yml) para `push` solo en rama staging y `workflow_dispatch`, ejecutor estándar Linux, `contents: read`, `persist-credentials: false`, acción checkout fijada a commit, sin paquetes ni secretos, 5 minutos máximos. El repositorio está confirmado como **público**; GitHub indica que ejecutores estándar de Actions son gratuitos en repos públicos. **Ejecución en GitHub Actions aún no certificada mediante logs remotos en esta revisión**.
- **A-06 / MEDIA / ABIERTA:** el despliegue Vercel de evaluación es manual, no sincroniza commits automáticamente ni garantiza que GitHub contenga cada recurso publicado. Se versionó `config/vercel-preview.json` y se comprobó su coincidencia exacta con el archivo de despliegue. Futuro: despliegue reproducible a preview a partir del commit comprobado, revisión antes de promover a producción.

## 2. Revisión independiente de seguridad

- **S-01 / MEDIA / CORREGIDA EN DESPLIEGUE:** vista anterior con protección de acceso y `X-Robots-Tag` pero sin CSP y antiframe completos. Nuevo despliegue de evaluación `dpl_BPmCkBjzLZpJxcBqEV5EyfB4M9rc`, estado `READY`, política versionada en [Vercel preview](https://github.com/JAlvaCE/Nido-Util/blob/main/nido-util-ops/config/vercel-preview.json). Contiene `default-src 'none'`, `script-src 'none'`, `connect-src 'none'`, `form-action 'none'`, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, política de referentes y permisos del navegador. Protección de SEO: `noindex,nofollow,noarchive` mientras sea una vista de evaluación. Se alineó también `docs/_headers` para Netlify. **Se verificó el JSON realmente enviado y almacenado en el despliegue, no se verificó mediante HTTP independiente el header recibido por un navegador externo**.
- **S-02 / ALTA FUTURA / ABIERTA:** una marca `verificado:true` o referencia `DOC:...` es **autodeclarada**. Los validadores comprueban forma, NO autenticidad del proveedor, contrato, permiso, identidad o conciliación bancaria. En el red team una referencia inventada completó el diagnóstico de siete etapas, aunque `puede_ejecutar_pagos` siguió en `false`. **No conectar nunca decisiones de publicación, compras, gastos, alta de pagos o acceso a cuentas directamente a estos indicadores**. Exigir recibos verificables del conector oficial o revisión humana documentada, con trazabilidad, fechas, responsable y expiración.
- **S-03 / MEDIA / CORREGIDA:** doble cómputo financiero de movimientos: `radar.techoFondo` y `economia.evaluarCajaAfiliacion` ahora exigen `movimiento_id` único en cada movimiento pagado y rechazan duplicados, IDs vacíos y datos financieros malformados.
- **S-04 / MEDIA / CORREGIDA:** desbordamientos numéricos y saldos anómalos (`NaN`, infinito, importes fuera de precisión de centavos) ya se rechazan de modo conservador en `radar.mjs`, `economia.mjs` y `prepublicacion.mjs`.
- **S-05 / MEDIA / CORREGIDA:** parámetros obligatorios omitidos en manifiestos de prepublicación ahora fallan; importe de fondo mayor de 20% de neto declarado se bloquea; el validador **no ejecuta** una compra ni una publicación, incluso al superar los controles.
- **S-06 / MEDIA / ABIERTA:** el sitio usa estilos HTML incrustados, por lo que `style-src 'unsafe-inline'` sigue siendo necesario. Es tolerable para HTML estático sin scripts de usuario, pero al evolucionar a componentes dinámicos mover CSS a recursos versionados y revisar CSP sin relajaciones innecesarias. La CSP precisa ensayo visual en navegador real.
- **S-07 / ABIERTA:** no se hizo escaneo exhaustivo de secretos de **todo el historial** GitHub, ni revisión de autenticación del proveedor comercial, ni evaluación jurídica de tratamiento de datos de clientes o procesamiento de pagos; servicios aún no existen o no están conectados. Activar controles de 2FA, mínimo privilegio y secret-scanning/branch protection antes de integraciones privadas.
- **S-08 / CONTROL ACTUAL:** el proyecto no debe usar Instagram personal, ni publicar historias/ads en nombre de Nido Útil sin una cuenta de marca verificada. Los programas de afiliados y comisiones siguen sin aprobación ni cobros comprobados.

## 3. Red team ético → tickets devueltos al arquitecto → verificación final

| ID | Vector adversarial local | Antes | Corrección de ingeniería | Revisión posterior |
|---|---|---|---|---|
| RT-01 | `gastado=-50` aumentaba presupuesto | Fallo lógico | Rechazo de gastos negativos | PASS |
| RT-02 | Dos comisiones con mismo ID contaban dos veces o IDs ausentes | Integridad débil | ID obligatorio y único | PASS |
| RT-03 | Vistas, guardados, compartidos negativos / `NaN` | Señales sesgadas | Métricas enteras, no negativas y válidas | PASS |
| RT-04 | Candidato nulo o fuente `null` | Excepción | Bloqueo conservador, sin caída | PASS |
| RT-05 | Manifiesto sin declaraciones clave | Posible preparación indebida | Campos booleanos explícitos | PASS |
| RT-06 | Fondo declarado mayor de 20% | Bypass del límite financiero | Validación de techo | PASS |
| RT-07 | `1e308 + 1e308` | Presupuesto `Infinity`, serializable como `null` | Comprobación de precisión monetaria y acumulación | PASS |
| RT-08 | Cadena URL `javascript:` o `http:` | Ya restringido | Se mantiene HTTPS/credenciales bloqueadas; NO hay fetch remoto | PASS |
| RT-09 | `DOC:inexistente` con verificado=true | Evidencia fingida completa un diagnóstico | **Pendiente:** verificaciones externas + auditoría de procedencia. El sistema no ejecuta pagos | ABIERTO |
| RT-10 | Clickjacking, scripts inyectados, formularios no permitidos | Cabeceras incompletas; HTML estático | CSP/no iframe/no script; ningún formulario en los 5 HTML | CONFIGURACIÓN VERIFICADA; respuesta HTTP pendiente |

**Verificación ejecutada realmente:** Node.js 22.16.0 en entorno local, **46 pruebas completadas, 46 aprobadas**, incluyendo **21 pruebas adversariales** (varias cubren más de un vector), **600 escenarios deterministas de presupuesto** dentro de una de ellas, pruebas económicas preexistentes y pruebas de siete puertas. No se afirma haber ejecutado el runner remoto de GitHub Actions ni una suite de browser-end-to-end.  
**Integridad de las copias ensayadas:** hashes Git blob de los cuatro módulos verificados contra los ficheros actuales de GitHub:
- `radar.mjs` — `ccc445760d2c01da8f3d4a41f487badc892bf534`
- `economia.mjs` — `0d9a1d619d08c2d22e1c2fc29b5cab3c28426069`
- `prepublicacion.mjs` — `c0b5ad0290f80d6c0b0b41ea9bf29f36809e9a3b`
- `puertas.mjs` — `c5bbff8dc437d70cd2e2f82b65c647ecab684a3f`

**Pruebas de código en GitHub:** [radar](https://github.com/JAlvaCE/Nido-Util/blob/main/nido-util-ops/radar.test.mjs), [economía](https://github.com/JAlvaCE/Nido-Util/blob/main/nido-util-ops/economia.test.mjs), [prepublicación](https://github.com/JAlvaCE/Nido-Util/blob/main/nido-util-ops/prepublicacion.test.mjs), [página y cabeceras](https://github.com/JAlvaCE/Nido-Util/blob/main/nido-util-ops/site.test.mjs). El archivo `site.test.mjs` también se ejecutará como parte del flujo CI, pero la inspección del navegador de verdad y sus resultados remotos no están acreditados aquí.

## 4. Decisión de seguridad sobre la liberación

- **Vista de evaluación:** `https://nido-util-vista.vercel.app/` — despliegue `READY`, acceso actualmente protegido por Vercel según configuración de proyecto. Cabeceras CSP y noindex versionadas y leídas de vuelta del despliegue. Apta para revisión humana de interfaz con acceso autorizado, **no** para lanzar campañas ni recibir pedidos.
- **Producción indexable/comercial:** **NO AUTORIZADA** por esta auditoría. Faltan identificación real de cuentas de marca, consentimiento y términos de proveedores, enlace remunerado y atribución, auditoría de identidad externa, ejecución remota CI confirmada, QA móvil/a11y/SEO con navegador real, prueba de cabeceras HTTP recibidas, URL final y política de datos si hay analítica o checkout. Quitar noindex y publicar sitemap/canonical solo en versión definitivamente pública.
- **Protecciones comerciales:** ningún script efectúa gastos; el US$0 hasta el hito de US$1.000 netos cobrados y la reinversión hasta 20% después siguen vigentes. Ninguna de las pruebas autoriza Shopify, ads o cuentas nuevas automáticamente.
- **Regla de desarrollo:** todo hallazgo siguiente crea primero una prueba reproducible, luego una corrección del arquitecto, después la verificación de seguridad; proteger las soluciones que ya funcionan y no introducir servicios pagados solo para hacer más complejo el sistema.

**Referencias técnicas públicas:** [OWASP HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html), [OWASP Secure Headers Project](https://secure-headers-project.owasp.org/best-practices/), [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy), [GitHub Actions runners](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job).
