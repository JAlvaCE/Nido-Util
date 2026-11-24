// Nido Útil | auditor de rentabilidad. Datos declarados != pagos propios verificados.
// No procesa dinero, no crea anuncios, no publica ni habilita gastos.
export const PARTIDAS = Object.freeze(['producto_envio','transaccion','publicidad','muestras','software','otros']);
const money = n => Math.round((n + Number.EPSILON) * 100) / 100;
const valid = n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && Number.isSafeInteger(Math.round(n*100));

export function auditarCasoReventa(caso) {
  const errores = [];
  if (!caso || typeof caso !== 'object') return { estado: 'INCONCLUSO', errores: ['Caso inexistente'] };
  if (!valid(caso.ingresos_usd)) errores.push('Ingresos brutos incompletos');
  if (!Number.isInteger(caso.ventas) || caso.ventas < 0) errores.push('Cantidad de ventas inválida');
  for (const campo of PARTIDAS) if (!valid(caso.costos_usd?.[campo])) errores.push('Falta costo: ' + campo);
  if (errores.length) return {estado:'INCONCLUSO',errores,advertencia:'No calcular rentabilidad rellenando costos desconocidos con cero.'};
  const sumaCostos = PARTIDAS.reduce((a,k)=>a+caso.costos_usd[k],0);
  if(!valid(sumaCostos) || !Number.isSafeInteger(Math.round((caso.ingresos_usd-sumaCostos)*100)))
    return {estado:'INCONCLUSO',errores:['Desbordamiento numérico o importe no seguro']};
  const costo_total_usd = money(sumaCostos);
  const resultado_usd = money(caso.ingresos_usd - costo_total_usd);
  const margen_pct = caso.ingresos_usd > 0 ? money(100*resultado_usd/caso.ingresos_usd) : null;
  const inversion_fuera_cumplimiento_usd=money(caso.costos_usd.publicidad+caso.costos_usd.muestras+caso.costos_usd.software+caso.costos_usd.otros);
  const costo_por_venta_usd=caso.ventas ? money(caso.costos_usd.publicidad/caso.ventas):null;
  return {estado:'RECONCILIACION_ARITMETICA_NO_AUDITADA',fuente:caso.fuente||'SIN FUENTE',
    ingresos_usd:money(caso.ingresos_usd),costo_total_usd,resultado_usd,margen_pct,
    inversion_fuera_cumplimiento_usd,obligacion_productos_envio_usd:money(caso.costos_usd.producto_envio),
    publicidad_por_venta_usd:costo_por_venta_usd,
    advertencia:'No demuestra flujo de caja ni rentabilidad final tras impuestos, rechazos, devoluciones o costos no informados. Costos de cumplimiento también requieren financiamiento temporal según plazos.'};
}

export function evaluarCajaAfiliacion(movimientos, gastosComprometidosUsd=0) {
  if(!Array.isArray(movimientos) || !valid(gastosComprometidosUsd)) return {estado:'DATOS_INVALIDOS',tope_usd:0};
  let total=0, elegibles=0;
  const vistos=new Set();
  for(const m of movimientos) {
    if(!m || m.estado !== 'PAGADO' || m.conciliado !== true || m.reserva_tributaria_revisada !== true)continue;
    if(typeof m.movimiento_id!=='string' || !m.movimiento_id.trim() || m.movimiento_id.length>128 || vistos.has(m.movimiento_id))
      return {estado:'DATOS_INVALIDOS',tope_usd:0,advertencia:'Movimiento pagado sin identificador único'};
    vistos.add(m.movimiento_id);
    if(!valid(m.neto_disponible_usd)) return {estado:'DATOS_INVALIDOS',tope_usd:0};
    total+=m.neto_disponible_usd; elegibles++;
  }
  if(!valid(total)) return {estado:'DATOS_INVALIDOS',tope_usd:0,advertencia:'Suma de comisiones excede precisión monetaria segura'};
  total=money(total);
  const hito = total >= 1000;
  return {estado: !elegibles?'SIN_COMISIONES_VERIFICABLES':hito?'HITO_CONTABLE_SUPERADO':'SIN_HITO',
    neto_conciliado_usd:total,tope_usd:hito?Math.max(0,money(total*0.2-gastosComprometidosUsd)):0,
    permiso_para_gastar:false,advertencia:'Sin gasto automático. Cada desembolso requiere autorización expresa; cifra es techo contable, no saldo bancario.'};
}
