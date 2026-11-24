import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluar,evaluarPiloto,techoFondo,urlSegura} from './radar.mjs';
const c=JSON.parse(readFileSync(new URL('./candidatos.json',import.meta.url),'utf8')).candidatos;
test('cuatro candidatos quedan bloqueados',()=>{
  assert.equal(c.length,4);
  assert.deepEqual(c.map(x=>evaluar(x).prioridad_editorial),[45,40,37,30]);
  assert.ok(c.every(x=>!evaluar(x).apto));
  assert.ok(c.every(x=>evaluar(x).errores.length===0),'Las evidencias fechadas deben ser válidas');
});
test('sin enlace afiliado seguro no hay oferta',()=>{
  const p={id:'prueba',producto:'test',fuentes:[{url:'https://example.com',fecha:'2026-11-23',observacion:'x'}],
    notas:{colombia:20},puertas:Object.fromEntries([
    'afiliado_aprobado','enlace_personal_valido','comision_documentada',
    'proveedor_cobra_y_envia','no_deuda_ni_depositos','devoluciones_y_costos_claros',
    'licencia_creativos','producto_disponible_colombia'].map(x=>[x,true]))};
  assert.equal(evaluar(p).apto,false);
  p.enlace_afiliado='https://example.com/a';
  assert.equal(evaluar(p).apto,true);
  p.enlace_afiliado='javascript:evil()';
  assert.equal(evaluar(p).apto,false);
});
test('sin métricas propias no declarar ganador',()=>{
  assert.equal(evaluarPiloto([]).estado,'INCONCLUSO');
  assert.equal(urlSegura('http://example.com'),false);
});
test('protección de caja y umbral',()=>{
  assert.equal(techoFondo([]).tope_usd,0);
  const p={estado:'PAGADO',conciliado:true,reserva_fiscal_revisada:true,neto_disponible_usd:999,movimiento_id:'pago-prueba'};
  assert.equal(techoFondo([p]).tope_usd,0);
  p.neto_disponible_usd=1000;
  assert.equal(techoFondo([p]).tope_usd,200);
  assert.equal(techoFondo([p],25).tope_usd,175);
  p.conciliado=false;
  assert.equal(techoFondo([p]).tope_usd,0);
});

test('red team: gasto negativo no aumenta el fondo disponible',()=>{
 const movimientos=[{estado:'PAGADO',conciliado:true,reserva_fiscal_revisada:true,neto_disponible_usd:1000,movimiento_id:'pago-1'}];
 const result=techoFondo(movimientos,-50);
 assert.equal(result.estado,'DATOS_INVALIDOS');assert.equal(result.tope_usd,0);assert.equal(result.puede_gastar,false);
});
test('red team: movimientos repetidos no duplican presupuesto',()=>{
 const m={estado:'PAGADO',conciliado:true,reserva_fiscal_revisada:true,neto_disponible_usd:1000,movimiento_id:'pago-1'};
 const r=techoFondo([m,{...m}],0);
 assert.equal(r.estado,'DATOS_INVALIDOS');assert.equal(r.tope_usd,0);
});
test('red team: un importe negativo pagado o NaN no crea inversión',()=>{
 for(const amount of [-1,NaN]){
 const r=techoFondo([{estado:'PAGADO',conciliado:true,reserva_fiscal_revisada:true,neto_disponible_usd:amount}],0);
 assert.equal(r.estado,'DATOS_INVALIDOS');assert.equal(r.tope_usd,0);
 }
});
test('red team: métricas de campaña negativas bloquean cualquier señal exploratoria',()=>{
 const piezas=['A','B'].flatMap(variante=>Array.from({length:3},(_,i)=>({
 variante,publicacion_url:'https://example.com/post-'+variante+i,publicado_en:'2026-10-01',
 impresiones:1200,guardados:i===0?-7:10,compartidos:12
 })));
 const r=evaluarPiloto(piezas,new Date('2026-11-23T00:00:00Z'));
 assert.equal(r.estado,'INCONCLUSO');
});
test('red team: JSON corrupto o fuentes null no derriban el radar',()=>{
 assert.equal(evaluar(null).apto,false);
 assert.equal(evaluar({id:'x',fuentes:[null],notas:{},puertas:{}}).estado,'SOLO_INVESTIGACION');
 assert.equal(evaluarPiloto([null]).estado,'INCONCLUSO');
 assert.equal(techoFondo(null).tope_usd,0);
});
test('red team: validar una oferta no autoriza ventas automáticamente',()=>{
 const c={id:'prototipo',producto:'pieza',fuentes:[{url:'https://example.com',fecha:'2026-11-23',observacion:'solo prueba'}],
 notas:{colombia:10},puertas:Object.fromEntries(['afiliado_aprobado','enlace_personal_valido','comision_documentada','proveedor_cobra_y_envia','no_deuda_ni_depositos','devoluciones_y_costos_claros','licencia_creativos','producto_disponible_colombia'].map(x=>[x,true])),enlace_afiliado:'https://example.com/item'};
 const r=evaluar(c);
 assert.equal(r.estado,'REVISAR_OFERTA');assert.equal(r.venta_habilitada,false);
});

test('red team: faltan IDs únicos, no se habilita fondo',()=>{
 const r=techoFondo([{estado:'PAGADO',conciliado:true,reserva_fiscal_revisada:true,neto_disponible_usd:1200}]);
 assert.equal(r.estado,'DATOS_INVALIDOS');assert.equal(r.tope_usd,0);
});

test('red team: desbordamiento de cobros no genera fondo Infinity',()=>{
 const m=n=>({estado:'PAGADO',conciliado:true,reserva_fiscal_revisada:true,neto_disponible_usd:1e308,movimiento_id:n});
 const x=techoFondo([m('m1'),m('m2')]);
 assert.equal(x.estado,'DATOS_INVALIDOS');assert.equal(x.tope_usd,0);
});
