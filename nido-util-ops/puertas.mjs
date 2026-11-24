// NU-LEVEL-03 · Control de etapas de Nido Útil.
// Clasificador informativo: nunca ejecuta compras, publicaciones, contratos ni pagos.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const NIVELES = Object.freeze([
  {id:'IDENTIDAD',nombre:'Canal propio y transparencia',campos:['perfil_marca','permiso_publicar','sitio_o_guia_publica','transparencia']},
  {id:'PRODUCTO',nombre:'Necesidad real en Colombia',campos:['necesidad_comprobada','evidencia_fecha_url','cobertura_colombia','riesgos_revisados']},
  {id:'CONTENIDO',nombre:'Contenido original y móvil',campos:['original_licenciado','afirmaciones_comprobadas','prueba_movil','hipotesis_previa']},
  {id:'AFILIACION',nombre:'Enlace y vendedor aprobados',campos:['cuenta_afiliada_aprobada','enlace_propio_validado','comision_terminos','checkout_externo_y_posventa','sin_deuda_ni_depositos']},
  {id:'PRUEBA',nombre:'Interés comercial observado',campos:['url_publicacion_propia','metricas_propias_denominador','revision_7dias','decision_con_evidencia']},
  {id:'TESORERIA',nombre:'Comisión pagada, neto comprobado',campos:['comision_pagada','conciliacion','costos_y_reservas_revisados']},
  {id:'ESCALAMIENTO',nombre:'Repetibilidad y riesgos',campos:['muestra_repetible','rentabilidad_neta','riesgos_controlados','autorizacion_especifica_para_gastos_si_aplica']}
]);

function evidenciaValida(v) {
  if (!v || v.verificado !== true || typeof v.ref !== 'string' || !v.ref.trim()) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.fecha || '')) return false;
  const fecha=new Date(v.fecha+'T00:00:00Z');
  if (!Number.isFinite(fecha.getTime()) || fecha.toISOString().slice(0,10)!==v.fecha) return false;
  return (/^https:\/\/[^\s]+$/i.test(v.ref) || /^DOC:[A-Za-z0-9._-]{2,80}$/.test(v.ref));
}
export function auditarEtapas(estado) {
  const hechos=estado && typeof estado==='object' && estado.hechos && typeof estado.hechos==='object' ? estado.hechos : {};
  let consecutivos=0,detenido=false;
  const etapas=NIVELES.map((n,i)=>{
    const pendientes=n.campos.filter(c=>!evidenciaValida(hechos[c]));
    const completado=pendientes.length===0;
    if (!detenido && completado) consecutivos=i+1;
    else detenido=true;
    return {nivel:i+1,id:n.id,nombre:n.nombre,completado,pendientes};
  });
  const p=(id)=>etapas.find(x=>x.id===id)?.completado===true;
  return {
    clasificacion:'DIAGNOSTICO_NO_AUTORIZACION',
    maximo_nivel_consecutivo:consecutivos,
    proxima_puerta:etapas[consecutivos]?.id||null,
    etapas,
    puede_preparar_borradores:true,
    permite_publicacion_educativa:p('IDENTIDAD')&&p('CONTENIDO'),
    permite_enlaces_comerciales:p('IDENTIDAD')&&p('CONTENIDO')&&p('AFILIACION'),
    demuestra_rentabilidad:p('TESORERIA'),
    permite_escalamiento_organico:p('TESORERIA')&&p('ESCALAMIENTO'),
    puede_ejecutar_pagos:false,
    aviso:'Faltas de evidencia bloquean autorización: no crear tiendas, compras, campañas ni pagos desde este script.'
  };
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(!process.argv[2]) throw new Error('Usar: node nido-util-ops/puertas.mjs estado.json');
  const o=JSON.parse(readFileSync(process.argv[2],'utf8'));
  console.log(JSON.stringify(auditarEtapas(o),null,2));
}
