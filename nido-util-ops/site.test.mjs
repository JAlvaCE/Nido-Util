// Nido Útil · pruebas estáticas sin dependencias ni red, sobre /docs.
// Ejecutar: node --test nido-util-ops/site.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = new URL('../docs/', import.meta.url);
const names = ['index.html','transparencia.html','guias/cocina-pequena.html','guias/escurridor-vajilla.html','guias/ordenar-despensa.html'];
const docUrl = name => new URL(name,base);
const read = name => readFileSync(docUrl(name),'utf8');
const home = read('index.html');

for(const name of names){
  test(name + ': SEO y jerarquía semántica',()=>{
    const html=read(name);
    assert.match(html,/<html[^>]*\blang="es(?:-CO)?"/i);
    assert.match(html,/<meta[^>]*name="viewport"/i);
    assert.match(html,/<meta[^>]*name="description"/i);
    assert.match(html,/<main\b/i);
    assert.equal((html.match(/<h1\b/gi)||[]).length,1);
  });
  test(name + ': enlaces internos y anclas realmente resueltos',()=>{
    const html=read(name);
    for(const [,href] of html.matchAll(/\bhref=["']([^"']+)["']/g)){
      if(/^(https?:|mailto:|tel:)/i.test(href)) continue;
      const dest=new URL(href,docUrl(name));
      assert.ok(existsSync(fileURLToPath(dest)),name+' -> archivo faltante: '+href);
      if(dest.hash){
        const target=readFileSync(fileURLToPath(dest),'utf8');
        const anchor=decodeURIComponent(dest.hash.slice(1));
        assert.ok(target.includes('id="'+anchor+'"') || target.includes("id='"+anchor+"'"),name+' -> ancla faltante: '+href);
      }
    }
  });
  test(name + ': versión educativa sin checkout ni tracking',()=>{
    const html=read(name);
    assert.doesNotMatch(html,/<form\b|<script\b|<input\b/i);
    assert.doesNotMatch(html,/\bhref=["'](?:checkout|cart|payment)\b/i);
  });
}
test('CTA de cabecera y principal conducen a guías accesibles',()=>{
  assert.match(home,/<a class="button" href="#guias">Explorar guías/);
  assert.match(home,/<a href="#guias" class="button">Leer guías prácticas/);
  for(const file of names.filter(x=>x.startsWith('guias/')))assert.ok(home.includes('href="'+file+'"'),file);
});
test('el menú sigue visible en móvil',()=>{
  assert.match(home,/@media\(max-width:760px\)[\s\S]*?\.nav-links\{display:flex/);
  assert.doesNotMatch(home,/\.nav-links\{display:none\}/);
});
test('la web no insinúa ofrecer venta propia antes de habilitar proveedores',()=>{
  assert.match(home,/No aceptamos pedidos ni pagos/);
  assert.match(read('transparencia.html'),/Actualmente no hay enlaces afiliados activos/);
});

test('prueba CSP de ambos hosts y protección noindex del preview',()=>{
  const netlify=readFileSync(new URL('../docs/_headers',import.meta.url),'utf8');
  const preview=JSON.parse(readFileSync(new URL('./config/vercel-preview.json',import.meta.url),'utf8'));
  const hdrs=Object.fromEntries(preview.headers.flatMap(r=>r.headers).map(h=>[h.key.toLowerCase(),h.value]));
  assert.match(netlify,/Content-Security-Policy: default-src 'none'; script-src 'none'/);
  assert.match(hdrs['content-security-policy'],/default-src 'none'; script-src 'none'/);
  assert.match(hdrs['content-security-policy'],/frame-ancestors 'none'/);
  assert.match(hdrs['content-security-policy'],/form-action 'none'/);
  assert.equal(hdrs['x-frame-options'],'DENY');
  assert.equal(hdrs['x-content-type-options'],'nosniff');
  assert.match(hdrs['x-robots-tag'],/noindex/);
  assert.match(netlify,/X-Frame-Options: DENY/);
});

test('QA a11y: cinco páginas admiten navegación por teclado hacia contenido',()=>{
  for(const name of names){
    const html=read(name);
    assert.match(html,/<a class="skip-link" href="#contenido">Saltar al contenido principal<\/a>/,name);
    assert.match(html,/<main id="contenido"/,name);
    assert.match(html,/<nav[^>]+aria-label="[^"]+"/,name);
    assert.match(html,/\.skip-link:focus\{top:0\}/,name);
  }
});
test('QA SEO social: metadatos diferenciados y ausencia de canonical inventada',()=>{
  const titles=new Set();
  for(const name of names){
    const html=read(name);
    const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title?.includes('Nido Útil'),name+' title');
    assert.ok(!titles.has(title),name+' duplicate title');
    titles.add(title);
    assert.match(html,/<meta[^>]*property="og:title"/,name);
    assert.doesNotMatch(html,/<link[^>]*rel="canonical"/,name);
  }
});
test('QA CRO: hero comunica propuesta, gratuidad y próximo paso legítimo',()=>{
  assert.match(home,/3 guías gratuitas · Sin registro/);
  assert.match(home,/<a href="#guias" class="button">Leer guías prácticas/);
  assert.match(home,/Sin ventas ni pagos hasta que se confirme un proveedor/);
});
test('QA UI: tipografía pequeña en fondos claros supera contraste mínimo AA en paleta auditada',()=>{
  function luminancia(hex){
    const rgb=hex.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16)/255);
    const linear=rgb.map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
    return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
  }
  function contraste(fondo,frente){
    const a=luminancia(fondo),b=luminancia(frente);
    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  }
  const colors=[
    ['#f8f6f0','#536d56','eyebrow'],
    ['#f8f6f0','#526c5f','sección y microcopy'],
    ['#ffffff','#5c7065','tarjetas'],
    ['#ffffff','#805c41','etiquetas tarjeta'],
    ['#faf8f3','#52675c','pie de guías'],
  ];
  for(const [bg,fg,id] of colors) assert.ok(contraste(bg,fg)>=4.5,id+' debe cumplir 4.5:1');
  assert.match(home,/\.eyebrow\{[^}]*color:#536d56/);
  assert.match(home,/\.card p\{color:#5c7065/);
  assert.match(home,/prefers-reduced-motion:reduce/);
});
