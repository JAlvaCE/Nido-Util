// Nido Útil · campaña y argumento único. Validación estructural, sin red, compras o publicación.
export function verificarCampana(c){
 const errores=[];
 if(!c||typeof c!=="object")return {estado:"BLOQUEADO",errores:["Campaña inexistente"],venta_habilitada:false};
 for(const k of ["id","necesidad","audiencia","beneficio_verificable"]){
   if(typeof c[k]!=="string"||c[k].trim().length<5)errores.push("Campo incompleto: "+k);
 }
 if(c.mercado!=="CO")errores.push("Mercado distinto de Colombia");
 const tipos=["guia","video","carrusel"];
 for(const tipo of tipos){
   const p=c.piezas?.[tipo];
   if(!p||typeof p!=="object"){errores.push("Falta pieza: "+tipo);continue;}
   if(p.angulo_id!==c.id)errores.push("Ángulo divergente: "+tipo);
   if(p.beneficio_canonico!==c.beneficio_verificable)errores.push("Beneficio inconsistente: "+tipo);
   if(!["BORRADOR","REVISADO","PUBLICADO"].includes(p.estado))errores.push("Estado inválido: "+tipo);
   if(p.publicado_url&&!/^https:\/\/\S+$/i.test(p.publicado_url))errores.push("URL no HTTPS: "+tipo);
   if(p.aparenta_prueba_real===true && p.prueba_real_verificada!==true)errores.push("Prueba física no verificada: "+tipo);
   if(p.material_terceros===true && p.licencia_verificada!==true)errores.push("Material ajeno sin licencia: "+tipo);
   if(p.testimonio===true && p.testimonio_autentico_verificado!==true)errores.push("Testimonio sin respaldo: "+tipo);
 }
 if(!Array.isArray(c.fuentes)||c.fuentes.length===0)errores.push("Faltan fuentes de la promesa");
 else for(const f of c.fuentes){
   if(!f||typeof f.url!=="string"||!/^https:\/\/\S+$/i.test(f.url)||!(/^\d{4}-\d{2}-\d{2}$/.test(f.fecha||""))||typeof f.sustenta!=="string"||!f.sustenta.trim())errores.push("Fuente incompleta");
 }
 const puertas=["afiliacion_aprobada","enlace_propio_valido","comision_documentada","proveedor_responsable_de_cobro_envio_posventa","condiciones_colombia_verificadas","sin_deuda","creativos_licenciados"];
 const faltantes=puertas.filter(k=>c.oferta?.puertas?.[k]!==true);
 const link=c.oferta?.enlace||"";
 if(!/^https:\/\/\S+$/i.test(link))faltantes.push("enlace_https");
 const campos_comerciales_completos=errores.length===0 && faltantes.length===0;
 if(c.oferta?.activa===true && !campos_comerciales_completos)errores.push("Oferta marcada activa sin aprobación o enlace verificables");
 const contenido_apto=errores.length===0;
 return {id:c.id,estado:contenido_apto?(campos_comerciales_completos?"REVISAR_OFERTA":"EDUCATIVO_SIN_OFERTA"):"BLOQUEADO",contenido_apto,campos_comerciales_completos,venta_habilitada:false,errores,faltantes,
   advertencia:"La validación estructural no sustituye aprobación del afiliado, supervisión humana ni acceso a las plataformas."};
}
