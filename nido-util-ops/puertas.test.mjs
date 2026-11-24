import test from 'node:test';
import assert from 'node:assert/strict';
import { NIVELES,auditarEtapas } from './puertas.mjs';
const prueba=()=>({verificado:true,fecha:'2026-11-23',ref:'DOC:test-local'});
function completar(state,id){
  const n=NIVELES.find(n=>n.id===id);
  for(const key of n.campos)state.hechos[key]=prueba();
}
test('sin pruebas: sin publicación, enlace, dinero ni escalamiento',()=>{
 const r=auditarEtapas({hechos:{}});
 assert.equal(r.maximo_nivel_consecutivo,0);
 assert.equal(r.permite_publicacion_educativa,false);
 assert.equal(r.permite_enlaces_comerciales,false);
 assert.equal(r.puede_ejecutar_pagos,false);
});
test('la investigación puede avanzar sin permisos de redes, pero no habilita ofertas',()=>{
 const s={hechos:{}}; completar(s,'PRODUCTO'); completar(s,'CONTENIDO');
 const r=auditarEtapas(s);
 assert.equal(r.maximo_nivel_consecutivo,0);
 assert.equal(r.etapas[1].completado,true);
 assert.equal(r.permite_publicacion_educativa,false);
});
test('sin afiliación personal no hay enlace comercial aunque pueda publicar',()=>{
 const s={hechos:{}};completar(s,'IDENTIDAD');completar(s,'CONTENIDO');
 const r=auditarEtapas(s);
 assert.equal(r.permite_publicacion_educativa,true);
 assert.equal(r.permite_enlaces_comerciales,false);
});
test('no admitir comprobantes falsos, fechas inválidas ni referencia privada arbitraria',()=>{
 const s={hechos:{}};completar(s,'IDENTIDAD');
 s.hechos.perfil_marca={verificado:true,fecha:'2026-02-30',ref:'DOC:test-local'};
 assert.equal(auditarEtapas(s).etapas[0].completado,false);
 s.hechos.perfil_marca={verificado:true,fecha:'2026-11-23',ref:'no-documentada'};
 assert.equal(auditarEtapas(s).etapas[0].completado,false);
});
test('comprobar las siete puertas con datos simulados no autoriza gastos',()=>{
 const s={hechos:{}}; NIVELES.forEach(n=>completar(s,n.id));
 const r=auditarEtapas(s);
 assert.equal(r.maximo_nivel_consecutivo,7);
 assert.equal(r.permite_enlaces_comerciales,true);
 assert.equal(r.demuestra_rentabilidad,true);
 assert.equal(r.puede_ejecutar_pagos,false);
});
