import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditarCasoReventa,evaluarCajaAfiliacion} from './economia.mjs';
const caso=JSON.parse(readFileSync(new URL('./caso_mark_tilbury.json',import.meta.url)));
test('todas las partidas cuestan US$801,74',()=>assert.equal(auditarCasoReventa(caso).costo_total_usd,801.74));
test('resultado real de partidas US$54,01, no US$541',()=>assert.equal(auditarCasoReventa(caso).resultado_usd,54.01));
test('margen neto informado 6,31%',()=>assert.equal(auditarCasoReventa(caso).margen_pct,6.31));
test('US$300 excluye cumplimiento de pedidos',()=>{const x=auditarCasoReventa(caso);assert.equal(x.inversion_fuera_cumplimiento_usd,300);assert.equal(x.obligacion_productos_envio_usd,472.84)});
test('costos no informados bloquean estimación',()=>{const x=structuredClone(caso);delete x.costos_usd.transaccion;assert.equal(auditarCasoReventa(x).estado,'INCONCLUSO')});
test('comisión pendiente no se contabiliza como caja',()=>{const x=evaluarCajaAfiliacion([{estado:'PENDIENTE',conciliado:true,reserva_tributaria_revisada:true,neto_disponible_usd:1500}]);assert.equal(x.tope_usd,0)});
test('comisión cobrada inferior a hito bloquea inversión',()=>{const x=evaluarCajaAfiliacion([{estado:'PAGADO',conciliado:true,reserva_tributaria_revisada:true,neto_disponible_usd:999,movimiento_id:'pago-999'}]);assert.equal(x.tope_usd,0)});
test('incluso después del hito no se autorizan gastos automáticos',()=>{const x=evaluarCajaAfiliacion([{estado:'PAGADO',conciliado:true,reserva_tributaria_revisada:true,neto_disponible_usd:1000,movimiento_id:'pago-1000'}],30);assert.equal(x.tope_usd,170);assert.equal(x.permiso_para_gastar,false)});
test('netos inválidos no se suman a caja',()=>{const x=evaluarCajaAfiliacion([{estado:'PAGADO',conciliado:true,reserva_tributaria_revisada:true,neto_disponible_usd:-10,movimiento_id:'pago-negativo'}]);assert.equal(x.estado,'DATOS_INVALIDOS')});

test('red team: dos pagos con el mismo ID no duplican utilidad',()=>{
 const m={estado:'PAGADO',conciliado:true,reserva_tributaria_revisada:true,neto_disponible_usd:1000,movimiento_id:'transaccion-1'};
 const r=evaluarCajaAfiliacion([m,{...m}]);assert.equal(r.estado,'DATOS_INVALIDOS');assert.equal(r.tope_usd,0);
});
test('red team: pago sin identificador no habilita presupuesto',()=>{
 const r=evaluarCajaAfiliacion([{estado:'PAGADO',conciliado:true,reserva_tributaria_revisada:true,neto_disponible_usd:1500}]);
 assert.equal(r.estado,'DATOS_INVALIDOS');assert.equal(r.tope_usd,0);
});

test('red team: desbordamiento numérico no genera presupuesto',()=>{
 const m=n=>({estado:'PAGADO',conciliado:true,reserva_tributaria_revisada:true,neto_disponible_usd:1e308,movimiento_id:n});
 const x=evaluarCajaAfiliacion([m('uno'),m('dos')]);
 assert.equal(x.estado,'DATOS_INVALIDOS');assert.equal(x.tope_usd,0);
});
test('red team: cifras absurdas en caso reventa son inconclusas',()=>{
 const m=structuredClone(caso);m.ingresos_usd=1e308;
 assert.equal(auditarCasoReventa(m).estado,'INCONCLUSO');
});
