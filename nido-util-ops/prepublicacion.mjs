// Nido Útil · puerta declarativa antes de publicar. Sin llamadas externas ni gasto.
export function auditarPrepublicacion(data){
  const fallos=[];
  const dineroSeguro=n=>typeof n==="number"&&Number.isFinite(n)&&n>=0&&Number.isSafeInteger(Math.round(n*100));
  if(!data||typeof data!=="object") return {estado:"BORRADOR",fallos:["Falta manifiesto"],publicacion_automatica:false};
  // Este módulo NO publica y sus banderas son autodeclaradas: nunca son evidencias externas.
  if (Array.isArray(data)) return {estado:"BORRADOR",fallos:["El manifiesto debe ser objeto"],publicacion_automatica:false};
  for(const flag of ["pago_o_suscripcion","usa_cuenta_personal","claves_en_repositorio","publicacion_automatica"]){
    if(typeof data[flag]!=="boolean") fallos.push("Declaración obligatoria ausente: "+flag);
  }
  const revision=data.revision||{};
  const checks=["revision_editorial","prueba_movil_390","prueba_tablet_768","prueba_escritorio_1280","enlaces_internos_validos","accesibilidad_basica","transparencia_visible","cuenta_marca_correcta"];
  for(const name of checks) if(revision[name]!==true) fallos.push("No acreditado: "+name);
  if(data.pago_o_suscripcion===true){
    const fin=data.finanzas||{};
    if(fin.hito_verificado!==true||!dineroSeguro(fin.neto_cobrado_conciliado_usd)||fin.neto_cobrado_conciliado_usd<1000)
      fallos.push("Gasto antes de hito real de US$1.000");
    if(fin.presupuesto_disponible_verificado!==true||!dineroSeguro(fin.fondo_disponible_usd))
      fallos.push("Fondo de reinversión no acreditado");
    if(Number.isFinite(fin.neto_cobrado_conciliado_usd)&&Number.isFinite(fin.fondo_disponible_usd)&&
      fin.fondo_disponible_usd>Math.round(fin.neto_cobrado_conciliado_usd*0.2*100)/100)
      fallos.push("Fondo declarado supera 20% de neto disponible");
    if(!dineroSeguro(fin.costo_total_comprometido_usd)||fin.costo_total_comprometido_usd>fin.fondo_disponible_usd)
      fallos.push("Costo total excede fondo o está incompleto");
    if(fin.autorizacion_de_pago_especifica!==true) fallos.push("Falta autorización de pago concreta");
    if(fin.reservas_tributarias_y_devoluciones_protegidas!==true) fallos.push("Reservas no protegidas");
  }
  if(data.usa_cuenta_personal===true) fallos.push("Cuenta personal excluida");
  if(data.claves_en_repositorio===true) fallos.push("Posible filtración de credenciales");
  if(data.publicacion_automatica===true) fallos.push("No desplegar/publicar automáticamente");
  if(!Array.isArray(data.afirmaciones))fallos.push("No hay inventario de afirmaciones");
  else for(const [i,a] of data.afirmaciones.entries()){
    if(!a||typeof a.texto!=="string"||!a.texto.trim()) {fallos.push("Afirmación vacía "+i);continue;}
    if(a.comprobada!==true||!(/^https:\/\/\S+$/i.test(a.fuente||""))||!(/^\d{4}-\d{2}-\d{2}$/.test(a.fecha||"")))
      fallos.push("Afirmación sin fuente y fecha verificada: "+i);
    if(["salud","seguridad","antes_despues","testimonio","garantia","envio","descuento"].includes(a.tipo) && a.revision_especialista_o_titular!==true)
      fallos.push("Afirmación sensible sin revisión explícita: "+i);
    if(a.testimonio_fabricado===true||a.transformacion_inventada===true)fallos.push("Fabricación prohibida: "+i);
  }
  if(!Array.isArray(data.medios))fallos.push("No hay inventario de imágenes/vídeos");
  else for(const [i,m] of data.medios.entries()){
    if(!m||!["PROPIO","LICENCIADO","IA_CONCEPTUAL"].includes(m.origen)) {fallos.push("Origen visual desconocido: "+i);continue;}
    if(m.origen==="LICENCIADO" && m.licencia_confirmada!==true) fallos.push("Licencia no verificada: "+i);
    if(m.origen==="IA_CONCEPTUAL" && (m.etiqueta_conceptual!==true||m.pretende_prueba_fisica===true))fallos.push("Imagen IA engañosa: "+i);
    if(m.finge_testimonio===true||m.finge_resultado_real===true)fallos.push("Medio engañoso: "+i);
  }
  if(data.modo==="COMERCIAL"){
    if(data.puertas_comerciales_verificadas!==true) fallos.push("Falta afiliación/link propio o puerta comercial");
    const o=data.oferta_comercial||{};
    const proofs=["comparacion_precio_real","envio_y_prioridad_reales","opiniones_autenticas","terminos_visibles","proteccion_de_datos_verificada"];
    for(const k of proofs) if(o[k]!==true)fallos.push("Falta prueba comercial: "+k);
    if(o.urgencia_ficticia===true||o.testimonios_fabricados===true||o.upsell_sin_servicio_real===true)
      fallos.push("Oferta engañosa prohibida");
  }
  if(!["EDITORIAL","COMERCIAL"].includes(data.modo)) fallos.push("Modo no válido");
  return {estado:fallos.length?"BORRADOR":"PREPARADO_PARA_REVISION_DE_PUBLICACION",
    fallos, publicacion_automatica:false,
    aviso:"Solo comprobación local declarativa: requiere contrastar pruebas reales, autorizar cuenta y verificar URL. No publica ni realiza pagos."};
}
