// Acceso temporal al recorrido.
//
// - Cada contraseña sirve para entrar durante 5 minutos desde que se genera.
// - Al entrar, la persona tiene 7 minutos para ver el recorrido; después la página se bloquea.
// - El dueño genera contraseñas nuevas en /admin, con su clave maestra.
//
// Variables de entorno del sitio en Netlify:
//   ACCESS_SECRET  firma las contraseñas y las sesiones (texto largo al azar, no se comparte)
//   ADMIN_KEY      clave maestra para entrar a /admin

const CODE_MINUTES = 5; // la contraseña sirve para entrar durante 5 minutos (hasta 6 según el minuto)
const VIEW_SECONDS = 7 * 60; // tiempo para ver el recorrido una vez adentro
const ADMIN_DAYS = 30; // el dueño queda dentro de /admin en su teléfono
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin 0/O ni 1/I para no confundirse
const WRAP = 1 << 20; // la marca de tiempo del código da la vuelta cada ~2 años

const env = (k) => globalThis.Netlify?.env.get(k) ?? globalThis.process?.env?.[k];
const enc = new TextEncoder();

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function base32(n, len) {
  let s = '';
  for (let i = 0; i < len; i++) {
    s = ALPHABET[n % 32] + s;
    n = Math.floor(n / 32);
  }
  return s;
}

async function macChars(secret, minute) {
  const b = await hmac(secret, `codigo:${minute}`);
  const n = ((b[0] << 22) | (b[1] << 14) | (b[2] << 6) | (b[3] >> 2)) >>> 0; // 30 bits
  return base32(n, 6);
}

export async function makeCode(secret, now = Date.now()) {
  const minute = Math.floor(now / 60000);
  const code = base32(minute % WRAP, 4) + (await macChars(secret, minute));
  return { code: `${code.slice(0, 5)}-${code.slice(5)}`, expires: (minute + CODE_MINUTES + 1) * 60000 };
}

export async function checkCode(secret, input, now = Date.now()) {
  const c = String(input || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (c.length !== 10 || [...c].some((ch) => !ALPHABET.includes(ch))) return false;
  let part = 0;
  for (const ch of c.slice(0, 4)) part = part * 32 + ALPHABET.indexOf(ch);
  const nowMin = Math.floor(now / 60000);
  const age = (((nowMin - part) % WRAP) + WRAP) % WRAP;
  if (age > CODE_MINUTES) return false;
  return same(c.slice(4), await macChars(secret, nowMin - age));
}

async function signed(secret, kind, exp) {
  return `${exp}.${hex(await hmac(secret, `${kind}:${exp}`)).slice(0, 40)}`;
}

async function checkSigned(secret, kind, value, now = Date.now()) {
  const [exp, sig] = String(value || '').split('.');
  if (!exp || !sig || !(+exp > now)) return 0;
  return same(sig, hex(await hmac(secret, `${kind}:${exp}`)).slice(0, 40)) ? +exp : 0;
}

function cookie(req, name) {
  const m = (req.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

const setCookie = (name, value, maxAge) => `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

const NO_STORE = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' };

function html(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', ...NO_STORE, ...extra } });
}

function redirect(to, extra = {}) {
  return new Response(null, { status: 303, headers: { location: to, ...NO_STORE, ...extra } });
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function page(title, inner) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--paper:#f2efe7;--ink:#1f1e1c;--grey:#8d887e;--red:#c9302a;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;min-height:100dvh;background:var(--paper);color:var(--ink);font-family:Jost,system-ui,sans-serif;display:flex;flex-direction:column;padding:24px 16px}
.mark{font-weight:600;letter-spacing:.32em;font-size:15px;opacity:.62}
.mark small{display:block;margin-top:5px;font-size:9px;font-weight:500;letter-spacing:.24em;text-transform:uppercase}
main{flex:1;display:grid;place-content:center;width:100%;max-width:420px;margin:0 auto;gap:14px}
.kicker{margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--grey)}
h1{margin:0;font-weight:500;font-size:34px;line-height:1.05}
p{margin:0;line-height:1.5}
form{display:grid;gap:10px;margin-top:10px}
input{font:inherit;font-size:22px;letter-spacing:.14em;text-transform:uppercase;padding:14px 16px;border:1px solid var(--ink);background:#fff;color:var(--ink);width:100%}
button,.btn{font:inherit;font-size:15px;letter-spacing:.14em;text-transform:uppercase;padding:14px 16px;border:0;background:var(--ink);color:var(--paper);cursor:pointer;text-align:center;text-decoration:none;display:block}
.btn.alt{background:transparent;color:var(--ink);border:1px solid var(--ink)}
.msg{color:var(--red);font-size:14px}
.note{font-size:13px;color:var(--grey)}
.code{font-size:40px;font-weight:600;letter-spacing:.12em;text-align:center;padding:18px 8px;border:1px solid var(--ink);background:#fff}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
[hidden]{display:none!important}
</style></head><body>
<div class="mark">NRVERTEX<small>Dejamos tu marca en lo más alto</small></div>
<main>${inner}</main></body></html>`;
}

function loginPage(error) {
  return page(
    'Bahía Blanca 2559 · Acceso',
    `<p class="kicker">Recorrido privado</p>
<h1>Bahía Blanca 2559</h1>
<p>Ingresá la contraseña que te enviaron. Vale 5 minutos y, una vez adentro, tenés 7 minutos para ver el recorrido.</p>
<form method="post" action="/acceso" autocomplete="off">
  <input name="c" placeholder="XXXXX-XXXXX" autocapitalize="characters" spellcheck="false" required>
  <button>Entrar</button>
</form>
${error ? `<p class="msg">${esc(error)}</p>` : ''}
<p class="note">¿No tenés contraseña o se venció? Pedile una nueva a NRVERTEX.</p>`,
  );
}

function adminLogin(error) {
  return page(
    'Contraseñas · NRVERTEX',
    `<p class="kicker">Solo para el dueño</p>
<h1>Contraseñas temporales</h1>
<form method="post" action="/admin" autocomplete="off">
  <input name="k" type="password" placeholder="Clave maestra" style="text-transform:none;letter-spacing:.04em" required>
  <button>Entrar</button>
</form>
${error ? `<p class="msg">${esc(error)}</p>` : ''}`,
  );
}

function adminPage() {
  return page(
    'Contraseñas · NRVERTEX',
    `<p class="kicker">Bahía Blanca 2559 · Solo para vos</p>
<h1>Contraseñas temporales</h1>
<p>Cada contraseña sirve para entrar durante 5 minutos. Adentro, la persona tiene 7 minutos para ver el recorrido.</p>
<button id="nueva">Nueva contraseña</button>
<div id="out" hidden>
  <div class="code" id="code"></div>
  <p class="note" id="vence" style="text-align:center;margin:8px 0 12px"></p>
  <div class="row">
    <button class="btn alt" id="copiar">Copiar enlace</button>
    <a class="btn" id="wa" target="_blank" rel="noopener">WhatsApp</a>
  </div>
</div>
<p class="note">El enlace de WhatsApp ya lleva la contraseña: la persona solo lo toca. No compartas esta página ni tu clave maestra.</p>
<script>
let timer;
const $ = (id) => document.getElementById(id);
$('nueva').onclick = async () => {
  const r = await fetch('/admin/nueva', { method: 'POST' });
  if (!r.ok) { location.reload(); return; }
  const { code, link, expires } = await r.json();
  $('out').hidden = false;
  $('code').textContent = code;
  const text = 'Recorrido Bahía Blanca 2559 · NRVERTEX\\n' + link + '\\nContraseña: ' + code + ' (vale 5 minutos)';
  $('wa').href = 'https://wa.me/?text=' + encodeURIComponent(text);
  $('copiar').onclick = async () => { try { await navigator.clipboard.writeText(text); $('copiar').textContent = 'Copiado'; } catch (e) {} };
  $('copiar').textContent = 'Copiar enlace';
  clearInterval(timer);
  const tick = () => {
    const s = Math.max(0, Math.round((expires - Date.now()) / 1000));
    $('vence').textContent = s > 0 ? 'Sirve para entrar durante ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : 'Vencida: generá otra';
  };
  tick();
  timer = setInterval(tick, 1000);
};
</script>`,
  );
}

// Injected into the tour: when the 7 minutes are over, the page locks.
function lockScript(exp) {
  return `<script>(() => {
  const exp = ${exp};
  const lock = () => {
    const c = document.getElementById('scene'); if (c) c.remove();
    document.documentElement.style.overflow = 'hidden';
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;z-index:99;background:#f2efe7;color:#1f1e1c;display:grid;place-content:center;gap:14px;padding:24px;text-align:center;font-family:Jost,system-ui,sans-serif';
    d.innerHTML = '<div style="font-weight:600;letter-spacing:.32em;opacity:.62">NRVERTEX</div><div style="font-size:26px;font-weight:500">El tiempo de visita terminó</div><div>Para verlo de nuevo, pedile una contraseña nueva a NRVERTEX.</div><a href="/" style="color:#1f1e1c">Ingresar otra contraseña</a>';
    document.body.appendChild(d);
  };
  const t = setInterval(() => { if (Date.now() >= exp) { clearInterval(t); lock(); } }, 1000);
})();</script>`;
}

const isPage = (path) => path === '/' || path.endsWith('.html');

export default async function handler(req, context) {
  const secret = env('ACCESS_SECRET');
  const adminKey = env('ADMIN_KEY');
  if (!secret || secret.length < 16 || !adminKey) return html(page('Configuración pendiente', '<h1>Sitio sin configurar</h1><p>Faltan las variables ACCESS_SECRET y ADMIN_KEY.</p>'), 503);

  const url = new URL(req.url);
  const path = url.pathname;
  const now = Date.now();

  // owner page
  if (path === '/admin' || path === '/admin/nueva') {
    const isAdmin = await checkSigned(secret, 'admin', cookie(req, 'nrv_admin'), now);
    if (path === '/admin/nueva') {
      if (req.method !== 'POST' || !isAdmin) return new Response('no', { status: 401, headers: NO_STORE });
      const { code, expires } = await makeCode(secret, now);
      const link = `${url.origin}/?c=${code}`;
      return new Response(JSON.stringify({ code, link, expires }), { headers: { 'content-type': 'application/json', ...NO_STORE } });
    }
    if (req.method === 'POST') {
      const k = (await req.formData()).get('k') || '';
      if (!same(String(k), adminKey)) return html(adminLogin('Clave incorrecta.'), 401);
      const exp = now + ADMIN_DAYS * 86400000;
      return redirect('/admin', { 'set-cookie': setCookie('nrv_admin', await signed(secret, 'admin', exp), ADMIN_DAYS * 86400) });
    }
    return html(isAdmin ? adminPage() : adminLogin());
  }

  // entering with a code: from the form or straight from the shared link
  const given = req.method === 'POST' && path === '/acceso' ? (await req.formData()).get('c') : url.searchParams.get('c');
  if (given != null) {
    if (await checkCode(secret, given, now)) {
      const exp = now + VIEW_SECONDS * 1000;
      return redirect('/', { 'set-cookie': setCookie('nrv_acceso', await signed(secret, 'visita', exp), VIEW_SECONDS) });
    }
    return html(loginPage('La contraseña venció o no es correcta. Pedí una nueva.'), 401);
  }

  const exp = await checkSigned(secret, 'visita', cookie(req, 'nrv_acceso'), now);
  if (!exp) return isPage(path) ? html(loginPage(), 401) : new Response('Acceso vencido', { status: 401, headers: NO_STORE });

  const res = await context.next();
  const headers = new Headers(res.headers);
  headers.set('cache-control', 'no-store');
  headers.set('x-robots-tag', 'noindex');
  if (!isPage(path) || !(res.headers.get('content-type') || '').includes('text/html')) return new Response(res.body, { status: res.status, headers });
  const body = (await res.text()).replace('</body>', `${lockScript(exp)}</body>`);
  headers.delete('content-length');
  return new Response(body, { status: res.status, headers });
}

export const config = { path: '/*' };
