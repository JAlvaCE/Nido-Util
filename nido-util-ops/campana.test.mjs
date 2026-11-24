import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { verificarCampana } from './campana.mjs';
const base=JSON.parse(readFileSync(new URL('./campana.ejemplo.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(base);
test('borradores educativos no son ofertas',()=>{ const r=verificarCampana(base); assert.equal(r.estado,'EDUCATIVO_SIN_OFERTA'); assert.equal(r.venta_habilitada,false); });
test('rechaza divergencia entre video y guía',()=>{const x=clone();x.piezas.video.angulo_id='otra';assert.equal(verificarCampana(x).estado,'BLOQUEADO')});
test('rechaza prueba de producto inventada',()=>{const x=clone();x.piezas.video.aparenta_prueba_real=true;assert.equal(verificarCampana(x).estado,'BLOQUEADO')});
test('rechaza material de terceros sin derechos',()=>{const x=clone();x.piezas.carrusel.material_terceros=true;assert.equal(verificarCampana(x).estado,'BLOQUEADO')});
test('rechaza enlace faltante aunque todas las puertas se marquen',()=>{const x=clone();x.oferta.puertas=Object.fromEntries(['afiliacion_aprobada','enlace_propio_valido','comision_documentada','proveedor_responsable_de_cobro_envio_posventa','condiciones_colombia_verificadas','sin_deuda','creativos_licenciados'].map(k=>[k,true]));assert.equal(verificarCampana(x).venta_habilitada,false)});
test('las pruebas simuladas no autorizan pagos',()=>{const x=clone();x.oferta.enlace='https://example.com/a';x.oferta.puertas=Object.fromEntries(['afiliacion_aprobada','enlace_propio_valido','comision_documentada','proveedor_responsable_de_cobro_envio_posventa','condiciones_colombia_verificadas','sin_deuda','creativos_licenciados'].map(k=>[k,true]));assert.equal(verificarCampana(x).estado,'REVISAR_OFERTA');assert.equal(verificarCampana(x).venta_habilitada,false);assert.ok(verificarCampana(x).advertencia.includes('no sustituye'))});

test('oferta activa sin acreditación es BLOQUEADA',()=>{const x=clone();x.oferta.activa=true;assert.equal(verificarCampana(x).estado,'BLOQUEADO');assert.equal(verificarCampana(x).venta_habilitada,false)});
