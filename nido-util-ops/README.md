# Nido Útil · Radar comercial reproducible

Herramienta operativa propia, sin dependencias externas ni APIs de pago. Código y pruebas están en el repositorio propio `JAlvaCE/Nido-Util`, rama `main`. No escribir en JAlvaCE/Portfolio.

## Ejecución

```bash
node nido-util-ops/radar.mjs nido-util-ops/candidatos.json
node --test nido-util-ops/radar.test.mjs
```

- Candidatos: **familias de producto para estudiar**, no referencias listas para vender.
- Puntuación 0–100: cobertura Colombia 25; utilidad 20; intención 15; programa afiliado 15; gancho visual 10; riesgos 10; derechos creativos 5. `null` significa **SIN DATOS** y aporta 0.
- Ocho puertas duras, todas obligatorias, antes de publicar un SKU o enlace comercial.
- Experimento comparativo de seis vídeos: 3+3 con ventana >=7 días e impresiones >=1.000 por variante: señal **exploratoria**, no causal ni estadística.
- Tesorería: únicamente movimientos PAGADO/conciliado/reserva fiscal revisada. US$0 de inversión hasta el primer hito de US$1.000 netos disponibles cobrados; después como máximo 20%, sin autorización automática de gasto.

## Coordinación

[08 · Radar de productos y aprendizaje](https://chatgpt.com/space/page_d93af0d33ebc819190d693775cd0b19f) es fuente operativa; automatización Radar actualiza esa página, Prospección actualiza 02 Proveedores, Editorial actualiza 04 Calendario, y Optimización actualiza 03 SOP/05 Tesorería. Los cambios en código no se sincronizan solos con las páginas, ni viceversa. La información financiera privada nunca debe subir a GitHub público.

Referencia de estudio: https://www.youtube.com/watch?v=b6TD48HmmKE. Foco: probar producto útil+gancho original+audiencia que puede comprar, no replicar clips, no sobreinterpretar vistas ni facturación autodeclarada.

**Estado al 23/11/2026:** 4 familias bajo investigación, ninguna oferta aprobada, sin cuenta de marca publicable confirmada, sin ventas/comisiones conciliadas.

## NU-LEVEL-03: siete puertas verificables (Adrián Sáenz, 23/11/2026)

Nuevo módulo autónomo sin dependencias externas:

```bash
node nido-util-ops/puertas.mjs nido-util-ops/estado.template.json
node --test nido-util-ops/puertas.test.mjs
```

- `puertas.mjs`: devuelve nivel consecutivo, etapa siguiente, requisitos ausentes, permisos de contenido/ofertas y aviso de seguridad. Nunca crea una publicación, cuenta ni pago.
- `puertas.test.mjs`: cinco pruebas unitarias, **5/5 superadas en Node.js local**; los tres archivos se contrastaron con los hashes Git blob de la rama, por lo que el código probado coincide con GitHub.
- `estado.template.json`: plantilla deliberadamente **sin datos comprobados**. Antes de pasar un campo a verificado se exige referencia HTTPS o `DOC:identificador`, fecha real, comprobación de fuente y registro bajo control del propietario. El script comprueba formato, **no** autenticidad de un documento ni derecho contractual.
- Puertas: identidad de marca; investigación de producto; creatividad y móvil; afiliación sin deuda; señal orgánica válida; comisiones pagadas y conciliadas; escalamiento solo con rentabilidad real.
- La evaluación puede mostrar investigación avanzada aunque el nivel consecutivo siga en 0 por falta de cuenta oficial: investigar y producir borradores es permitido, pero publicidad y ofertas exigen todos los permisos. El proyecto no automatiza Shopify, AutoDS, medios de pago ni inventario.
- Las tareas recurrentes consultan las reglas de [06 Manual](https://chatgpt.com/space/page_359b9507e5b88191826379d44c61d071), [08 Radar](https://chatgpt.com/space/page_d93af0d33ebc819190d693775cd0b19f) y [05 Finanzas](https://chatgpt.com/space/page_3a9d5308bd648191a2224b760c67bce3). **El script no se ejecuta automáticamente por estar en GitHub**; el control de las automaciones es lógico y documentado, no integración CI conectada a los paneles.

Referencia del tercer caso: https://www.youtube.com/watch?v=_cL6dYjz5H0. Adoptar disciplina de pruebas, caja, confianza y puertas, pero no los servicios de pago ni los CPA del comercio de terceros.

## Caso 4: un único ángulo de valor en los tres medios

- Código: `campana.mjs`; plantilla: `campana.ejemplo.json`; pruebas: `campana.test.mjs`.
- Ejecutar validaciones con Node.js: `node --test nido-util-ops/campana.test.mjs`. Los tests en GitHub no se ejecutan solos.
- Ejemplo de campaña `NU-ANG-01`: beneficio honesto «Medir ancho, profundidad y altura antes de elegir escurridor» en la **misma** guía/vídeo/carrusel.
- `EDUCATIVO_SIN_OFERTA` es aprobación de estructura, **no** autorización para publicación si aún no existe cuenta social de marca.
- `REVISAR_OFERTA` es exclusivamente revisión técnica de campos de un supuesto; nunca prueba documental de afiliación ni permiso de publicar. Se requiere evidencia privada y autorización real.
- Primeras 2 cuentas pueden ser gratuitas en Zernio según términos públicos (23/11/2026); ninguna se ha conectado. Usar vidIQ si cubre los permisos antes de instalar dos herramientas.
- Prohibidos Shopify, AutoDS, saldos, créditos, autocompras para medir éxito, paid ads y medios sin licencia en etapa de capital US$0.
- Fuente: https://www.youtube.com/watch?v=UXSxWVajMBg y docs oficiales https://zernio.com/blog/pay-per-account-pricing.

## Auditoría de prepublicación con IA (NU-QA-01)

El agente puede preparar contenido y página en rama staging; **nunca publica automáticamente ni contrata servicios**. Debe conservarse el manifiesto auditado y su evidencia, sin contraseñas ni cuentas bancarias. Revisión: afirmaciones y fuentes, licencias y visuales IA, prueba móvil/tableta/desktop, enlaces, accesibilidad, transparencia, y —para ofertas comerciales— autorización de afiliado y URL atribuible.

```bash
node --test nido-util-ops/prepublicacion.test.mjs
node nido-util-ops/prepublicacion-cli.mjs nido-util-ops/prepublicacion.ejemplo.json
```

La plantilla **debe devolver BORRADOR y código de salida 1** porque ninguna comprobación real se declara aprobada. Es una propiedad de seguridad, no un fallo. La herramienta verifica declaraciones estructuradas; los responsables deben obtener pruebas auténticas antes de marcar cada control verdadero. Aunque el código devuelva PREPARADO_PARA_REVISION_DE_PUBLICACION, ello no sustituye validación humana/contractual, no permite usar Instagram personal y no publica.

Referencia: [demostración Claude + Shopify](https://www.youtube.com/watch?v=DRE8lqZoIn0). No activar Shopify, herramientas de pago ni API comerciales por esta revisión.

## Caso Mark Tilbury: rentabilidad real de un experimento (2026-11-23)

El reto público de siete días, hecho en un modelo de **reventa con publicidad** (NO afiliación de Nido Útil), presentó US$855,75 de facturación y US$801,74 de costos enumerados (producto/envío 472,84 + tarifas 28,90 + ads 249,66 + muestras 48,35 + software 1,99). Resultado aritmético = **US$54,01, margen 6,31%**, no US$541. El presupuesto del desafío US$300 EXCLUYÓ el costo de cumplimiento de pedidos y tarifas; ingresos de clientes no garantizan liquidez disponible antes de pagar proveedores.

Reproducir sin dependencias:

```bash
node --test nido-util-ops/economia.test.mjs
node --input-type=module -e "import{readFileSync}from'node:fs';import{auditarCasoReventa}from'./nido-util-ops/economia.mjs';console.log(auditarCasoReventa(JSON.parse(readFileSync('nido-util-ops/caso_mark_tilbury.json','utf8'))))"
```

Los datos del creador son **autodeclarados y no auditados**. No inferir impuestos, devoluciones u otros gastos no publicados; `otros:0` solo cierra la suma de partidas reveladas. `evaluarCajaAfiliacion` exige comisión PAGADA, conciliada y reserva fiscal revisada para estudiar un techo; siempre devuelve `permiso_para_gastar:false`. Evitar convertir ingresos brutos de otros en comisiones de Nido Útil.

La fuente del [caso](https://www.youtube.com/watch?v=mUz_tHYLhUs) también evidencia oportunidades de respuesta a objeciones: tamaño, compatibilidad, resistencia, durabilidad, disponibilidad y envío. Registrar fuentes/fechas y preguntas anonimizadas, no reutilizar reseñas de otros vendedores como clientes propios. Ver fuente canónica [08 · Radar](https://chatgpt.com/space/page_d93af0d33ebc819190d693775cd0b19f).
