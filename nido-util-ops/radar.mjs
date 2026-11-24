// Nido Útil · radar 1.0 — sin dependencias, sin red, sin compras, sin publicación.
// Uso: node nido-util-ops/radar.mjs nido-util-ops/candidatos.json
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PESOS = Object.freeze({
  colombia:25, utilidad:20, intencion:15, afiliacion:15,
  visual:10, riesgos:10, medios:5
});
export const PUERTAS = Object.freeze([
  'afiliado_aprobado', 'enlace_personal_valido', 'comision_documentada',
  'proveedor_cobra_y_envia', 'no_deuda_ni_depositos',
  'devoluciones_y_costos_claros', 'licencia_creativos',
  'producto_disponible_colombia'
]);
export function urlSegura(url) {
  try { const u = new URL(url); return u.protocol === 'https:' && !u.username && !u.password; }
  catch { return false; }
}
export function evaluar(c) {
  let puntos = 0, cubierto = 0;
  const errores = [];
  if (!c || typeof c !== 'object' || Array.isArray(c))
    return {id:null,producto:null,prioridad_editorial:0,cobertura_evidencia_pct:0,
      estado:'SOLO_INVESTIGACION',apto:false,venta_habilitada:false,
      errores:['Candidato inválido'],faltantes:[...PUERTAS]};
  for (const [campo,max] of Object.entries(PESOS)) {
    const valor = c.notas?.[campo];
    if (valor === null || valor === undefined) continue;
    if (!Number.isFinite(valor) || typeof valor === 'boolean' || valor < 0 || valor > max) {
      errores.push('Puntaje inválido: '+campo); continue;
    }
    puntos += valor;
    cubierto += max;
  }
  if (!Array.isArray(c.fuentes) || c.fuentes.length === 0) errores.push('Evidencia faltante');
  else for (const f of c.fuentes) {
    if (!f || typeof f !== 'object' || !urlSegura(f.url) || !/^\d{4}-\d{2}-\d{2}$/.test(f.fecha || '') || typeof f.observacion !== 'string' || !f.observacion.trim())
      errores.push('Fuente incompleta o URL no HTTPS');
  }
  const faltantes = PUERTAS.filter(k => c.puertas?.[k] !== true);
  if (!urlSegura(c.enlace_afiliado)) faltantes.push('enlace_afiliado_https');
  const apto = !errores.length && !faltantes.length;
  return {id:c.id,producto:c.producto,prioridad_editorial:puntos,
    cobertura_evidencia_pct:cubierto,estado:apto?'REVISAR_OFERTA':'SOLO_INVESTIGACION',
    apto,venta_habilitada:false,validacion_solo_declarativa:true,errores,faltantes};
}
export function evaluarPiloto(piezas,fechaCorte=new Date()) {
  if (!Array.isArray(piezas) || !(fechaCorte instanceof Date) || !Number.isFinite(fechaCorte.getTime()))
    return {estado:'INCONCLUSO',motivo:'Entrada o fecha de corte inválida'};
  const grupos = ['A','B'].map(v => piezas.filter(x => x && typeof x === 'object' && x.variante === v && x.publicacion_url && x.publicado_en));
  if (grupos.some(x => x.length < 3)) return {estado:'INCONCLUSO',motivo:'Menos de 3 piezas verificadas por grupo'};
  const resumen = {};
  for (const [indice,lista] of grupos.entries()) {
    if (lista.some(x => !urlSegura(x.publicacion_url) ||
      ![x.impresiones,x.guardados,x.compartidos].every(n=>Number.isSafeInteger(n) && n>=0)))
      return {estado:'INCONCLUSO',motivo:'URLs o métricas propias inválidas'};
    const ultima = Math.max(...lista.map(x => Date.parse(x.publicado_en+'T00:00:00Z')));
    if (!Number.isFinite(ultima) || fechaCorte.getTime() - ultima < 7*86400000)
      return {estado:'INCONCLUSO',motivo:'Faltan siete días de observación'};
    const impresiones = lista.reduce((a,x)=>a+x.impresiones,0);
    if (impresiones < 1000) return {estado:'INCONCLUSO',motivo:'Menos de 1000 impresiones por variante'};
    const relevantes = lista.reduce((a,x)=>a+x.guardados+x.compartidos,0);
    resumen[['A','B'][indice]]={piezas:lista.length,impresiones,
      interacciones_utiles_por_mil:Math.round(relevantes*100000/impresiones)/100};
  }
  return {estado:'SEÑAL_EXPLORATORIA_NO_CAUSAL',resumen,
    advertencia:'No demostrar rentabilidad sin comisiones netas pagadas; no es prueba aleatoria.'};
}
export function techoFondo(operaciones,gastado=0) {
  if (!Array.isArray(operaciones) || !Number.isSafeInteger(Math.round(gastado*100)) || gastado < 0)
    return {estado:'DATOS_INVALIDOS',tope_usd:0,puede_gastar:false};
  const pagadas = operaciones.filter(x => x && x.estado==='PAGADO' && x.conciliado === true &&
      x.reserva_fiscal_revisada === true);
  if (pagadas.some(x=>!Number.isSafeInteger(Math.round(x.neto_disponible_usd*100)) || x.neto_disponible_usd < 0))
    return {estado:'DATOS_INVALIDOS',tope_usd:0,puede_gastar:false};
  const ids = pagadas.map(x=>x.movimiento_id).filter(x=>x!==undefined);
  if (ids.length!==pagadas.length || ids.some(x=>typeof x!=='string'||!x.trim()||x.length>128) || new Set(ids).size!==ids.length)
    return {estado:'DATOS_INVALIDOS',tope_usd:0,puede_gastar:false};
  if (!pagadas.length) return {estado:'SIN_DATOS',tope_usd:0,puede_gastar:false};
  const acumulado = pagadas.reduce((a,x)=>a+x.neto_disponible_usd,0);
  if (!Number.isSafeInteger(Math.round(acumulado*100)))
    return {estado:'DATOS_INVALIDOS',tope_usd:0,puede_gastar:false};
  const neto = Math.round(acumulado*100)/100;
  const tope = neto < 1000 ? 0 : Math.max(0,Math.round((neto*.2-gastado)*100)/100);
  return {estado:neto>=1000?'HITO_ALCANZADO':'SIN_HITO',
    neto_verificado_usd:neto,tope_usd:tope,puede_gastar:false,
    aviso:'Es un techo; los pagos exigen revisión y autorización específica.'};
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const archivo=process.argv[2];if (!archivo) throw new Error('Falta ruta JSON');
  const d=JSON.parse(readFileSync(archivo,'utf8'));
  const candidatos=d.candidatos.map(evaluar).sort((a,b)=>b.prioridad_editorial-a.prioridad_editorial);
  console.log(JSON.stringify({tipo:'INVESTIGACION_NO_OFERTAS',candidatos},null,2));
}
