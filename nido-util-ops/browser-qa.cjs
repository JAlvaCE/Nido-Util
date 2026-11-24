// QA de navegador real para Nido Útil. Se ejecuta en CI, nunca modifica cuentas ni datos.
// Dependencias SOLO de CI: playwright y @axe-core/playwright. No se incorporan al sitio.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.NIDO_PLAYWRIGHT_MODULE || 'playwright');
const AxeBuilder = require(process.env.NIDO_AXE_MODULE || '@axe-core/playwright').default;

const root = path.resolve(__dirname,'../docs');
const pages = ['index.html','guias/cocina-pequena.html','guias/escurridor-vajilla.html','guias/ordenar-despensa.html','transparencia.html'];
const widths = [320,360,390,768,1280,1920];
const checks = [];
let failures = [];
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server = http.createServer((req,res)=>{
 try {
  const name = decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '') || 'index.html';
  const target = path.resolve(root,name);
  if(!target.startsWith(root+path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()){
   res.writeHead(404);res.end('Not found');return;
  }
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
  res.end(fs.readFileSync(target));
 }catch(e){res.writeHead(400);res.end('Bad request');}
});
function check(name,fn){
 return Promise.resolve().then(fn).then(()=>{checks.push({name,ok:true});console.log('PASS',name);})
 .catch(e=>{checks.push({name,ok:false});failures.push({name,error:e.message});console.error('FAIL',name,e.message);});
}
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/';
 let browser;
 try {
  browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const jsErrors=[];page.on('pageerror',e=>jsErrors.push(e.message));
  for(const name of pages){
   await check(name+': carga, idioma y estructura de titulares',async()=>{
    const response=await page.goto(base+name,{waitUntil:'load'});
    assert.equal(response.status(),200);
    assert.equal(await page.locator('html').getAttribute('lang'),'es-CO');
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('main#contenido').count(),1);
    assert.equal(await page.locator('nav[aria-label]').count(),1);
   });
   await check(name+': accesibilidad WCAG con axe',async()=>{
    await page.goto(base+name,{waitUntil:'load'});
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    const bad=audit.violations.map(v=>v.id+' ['+v.impact+'] '+v.nodes.map(n=>n.target.join(' ')).join(', '));
    assert.deepEqual(bad,[],bad.join('\n'));
   });
  }
  for(const width of widths){
   await check('Responsive '+width+'px: sin desbordamiento horizontal',async()=>{
    await page.setViewportSize({width,height:850});
    for(const name of pages){
     await page.goto(base+name,{waitUntil:'load'});
     const val=await page.evaluate(()=>({screen:window.innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
     assert.ok(Math.max(val.document,val.body)<=val.screen+1,name+' '+JSON.stringify(val));
    }
   });
  }
  await check('Navegación principal lleva a guías y abre una guía real',async()=>{
   await page.setViewportSize({width:390,height:850});
   await page.goto(base+'index.html');
   await page.getByRole('link',{name:/Leer guías prácticas/}).click();
   assert.equal(new URL(page.url()).hash,'#guias');
   await page.getByRole('link',{name:/Leer guía de cocina/}).first().click();
   assert.ok(new URL(page.url()).pathname.endsWith('guias/cocina-pequena.html'));
   assert.match(await page.locator('h1').innerText(),/cocina pequeña/i);
  });
  await check('Accesibilidad teclado: primer TAB alcanza enlace para saltar contenido',async()=>{
   await page.goto(base+'index.html');
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('href')),'#contenido');
   await page.keyboard.press('Enter');
   assert.equal(new URL(page.url()).hash,'#contenido');
  });
  await check('Movimiento reducido: animación suave deshabilitada',async()=>{
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.goto(base+'index.html');
   const style=await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior);
   assert.equal(style,'auto');
  });
  await check('Sin errores JavaScript durante navegación',()=>assert.deepEqual(jsErrors,[]));
  console.log('\nQA DEL NAVEGADOR: '+(checks.length-failures.length)+'/'+checks.length+' pruebas superadas');
  if(failures.length)process.exitCode=1;
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
}
main().catch(e=>{console.error('QA runner error:',e);process.exitCode=1;server.close();});
