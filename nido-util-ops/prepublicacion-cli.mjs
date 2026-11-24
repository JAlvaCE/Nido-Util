#!/usr/bin/env node
// Uso: node nido-util-ops/prepublicacion-cli.mjs nido-util-ops/prepublicacion.ejemplo.json
// Revisa el manifiesto, nunca conecta herramientas, despliega ni publica.
import { readFileSync } from 'node:fs';
import { auditarPrepublicacion } from './prepublicacion.mjs';
const path=process.argv[2];
if(!path){console.error('Uso: node nido-util-ops/prepublicacion-cli.mjs <archivo-manifiesto.json>');process.exitCode=2;}
else{
 try{
  const manifest=JSON.parse(readFileSync(path,'utf8'));
  const result=auditarPrepublicacion(manifest);
  console.log(JSON.stringify(result,null,2));
  if(result.estado!=='PREPARADO_PARA_REVISION_DE_PUBLICACION')process.exitCode=1;
 }catch(err){console.error('No se pudo auditar: '+err.message);process.exitCode=2;}
}
