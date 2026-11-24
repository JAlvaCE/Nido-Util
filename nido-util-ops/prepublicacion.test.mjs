import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditarPrepublicacion } from './prepublicacion.mjs';
const original=JSON.parse(readFileSync(new URL('./prepublicacion.ejemplo.json',import.meta.url),'utf8'));
const valido=()=>{const x=structuredClone(original);Object.keys(x.revision).forEach(k=>x.revision[k]=true);return x};
test('borrrador sin QA',()=>assert.equal(auditarPrepublicacion(original).estado,'BORRADOR'));
test('si todo acreditado, prepara pero no publica',()=>{const r=auditarPrepublicacion(valido());assert.equal(r.estado,'PREPARADO_PARA_REVISION_DE_PUBLICACION');assert.equal(r.publicacion_automatica,false)});
test('afirmaciones de salud sin pruebas bloquean',()=>{const x=valido();x.afirmaciones.push({texto:'cura asma',tipo:'salud',comprobada:false,fuente:'',fecha:'',revision_especialista_o_titular:false});assert.equal(auditarPrepublicacion(x).estado,'BORRADOR')});
test('IA que simula uso físico sin aclaración bloquea',()=>{const x=valido();x.medios.push({origen:'IA_CONCEPTUAL',etiqueta_conceptual:false,pretende_prueba_fisica:true});assert.equal(auditarPrepublicacion(x).estado,'BORRADOR')});
test('sin afiliación aprobada no hay ofertas',()=>{const x=valido();x.modo='COMERCIAL';assert.equal(auditarPrepublicacion(x).estado,'BORRADOR')});
test('cuenta personal y suscripciones bloquean',()=>{const x=valido();x.usa_cuenta_personal=true;x.pago_o_suscripcion=true;assert.equal(auditarPrepublicacion(x).estado,'BORRADOR')});
test('publicación automática explícita bloquea',()=>{const x=valido();x.publicacion_automatica=true;assert.equal(auditarPrepublicacion(x).estado,'BORRADOR')});

test('post-hito admite analizar software de pago con reservas y autorización',()=>{
 const x=valido();x.pago_o_suscripcion=true;
 x.finanzas={hito_verificado:true,neto_cobrado_conciliado_usd:1000,presupuesto_disponible_verificado:true,fondo_disponible_usd:200,costo_total_comprometido_usd:30,autorizacion_de_pago_especifica:true,reservas_tributarias_y_devoluciones_protegidas:true};
 const r=auditarPrepublicacion(x);
 assert.equal(r.estado,'PREPARADO_PARA_REVISION_DE_PUBLICACION');
 assert.equal(r.publicacion_automatica,false);
});
test('software de pago antes del hito o sobre presupuesto se bloquea',()=>{
 const x=valido();x.pago_o_suscripcion=true;assert.equal(auditarPrepublicacion(x).estado,'BORRADOR');
 x.finanzas={hito_verificado:true,neto_cobrado_conciliado_usd:1000,presupuesto_disponible_verificado:true,fondo_disponible_usd:200,costo_total_comprometido_usd:250,autorizacion_de_pago_especifica:true,reservas_tributarias_y_devoluciones_protegidas:true};
 assert.equal(auditarPrepublicacion(x).estado,'BORRADOR');
});
const ofertaValida=()=>{const x=valido();x.modo='COMERCIAL';x.puertas_comerciales_verificadas=true;x.oferta_comercial=Object.fromEntries(['comparacion_precio_real','envio_y_prioridad_reales','opiniones_autenticas','terminos_visibles','proteccion_de_datos_verificada'].map(k=>[k,true]));return x;};
test('oferta sin historial de precio comparación probado se bloquea',()=>{
 const x=ofertaValida();x.oferta_comercial.comparacion_precio_real=false;
 assert.equal(auditarPrepublicacion(x).estado,'BORRADOR');
});
test('cobro de envío prioritario sin prestación real se bloquea',()=>{
 const x=ofertaValida();x.oferta_comercial.upsell_sin_servicio_real=true;
 assert.equal(auditarPrepublicacion(x).estado,'BORRADOR');
});
test('testimonios inventados bloquean oferta',()=>{
 const x=ofertaValida();x.oferta_comercial.testimonios_fabricados=true;
 assert.equal(auditarPrepublicacion(x).estado,'BORRADOR');
});
test('condiciones de compra ocultas bloquean oferta',()=>{
 const x=ofertaValida();x.oferta_comercial.terminos_visibles=false;
 assert.equal(auditarPrepublicacion(x).estado,'BORRADOR');
});

test('red team: no aceptar omisión de declaraciones críticas',()=>{
 const m=valido();delete m.usa_cuenta_personal;delete m.pago_o_suscripcion;
 const r=auditarPrepublicacion(m);
 assert.equal(r.estado,'BORRADOR');
 assert.ok(r.fallos.some(x=>x.includes('Declaración obligatoria ausente')));
});
test('red team: ni después del hito se puede declarar un fondo superior al 20%',()=>{
 const m=valido();m.pago_o_suscripcion=true;
 m.finanzas={hito_verificado:true,neto_cobrado_conciliado_usd:1000,presupuesto_disponible_verificado:true,
 fondo_disponible_usd:900,costo_total_comprometido_usd:100,autorizacion_de_pago_especifica:true,
 reservas_tributarias_y_devoluciones_protegidas:true};
 const r=auditarPrepublicacion(m);
 assert.equal(r.estado,'BORRADOR');
 assert.ok(r.fallos.some(x=>x.includes('supera 20%')));
});
test('red team: una matriz en vez de manifiesto se bloquea',()=>{
 assert.equal(auditarPrepublicacion([]).estado,'BORRADOR');
});

test('red team: importes que superan precisión monetaria bloquean publicación',()=>{
 const x=valido();x.pago_o_suscripcion=true;
 x.finanzas={hito_verificado:true,neto_cobrado_conciliado_usd:1e308,
 presupuesto_disponible_verificado:true,fondo_disponible_usd:1e307,costo_total_comprometido_usd:10,
 autorizacion_de_pago_especifica:true,reservas_tributarias_y_devoluciones_protegidas:true};
 assert.equal(auditarPrepublicacion(x).estado,'BORRADOR');
});
