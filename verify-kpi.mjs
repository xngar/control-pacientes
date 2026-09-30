import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => {
  const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
}));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const r = [];
const check = (n, ok, d = '') => { r.push(ok); console.log(`${ok ? 'PASA' : 'FALLA'}  ${n}${d ? `  -> ${d}` : ''}`); };
const wait = (ms) => new Promise((x) => setTimeout(x, ms));

const MARCA = 'QA-KPI-' + Date.now().toString().slice(-5);
const ids = [];
const TOTAL = 24;

const { data: link } = await admin.auth.admin.generateLink({ type: 'magiclink', email: 'mantonio.zr@gmail.com', options: { redirectTo: 'http://localhost:3000/admin' } });
const tab = await fetch('http://127.0.0.1:9341/json/new?about:blank', { method: 'PUT' }).then((x) => x.json());
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0; const pend = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (x) => { const q = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); if (q.exceptionDetails) throw new Error(q.exceptionDetails.exception?.description); return q.result.value; };

try {
  for (let i = 1; i <= TOTAL; i++) {
    const { data, error } = await admin.from('pacientes_seguimiento').insert({
      nombre: `${MARCA} ${String(i).padStart(2, '0')}`, rut: `9.888.${100 + i}-1`,
      dupla_a_cargo: `Dupla QA ${((i - 1) % 5) + 1}`, estado: 'Activo', diagnostico: `dx ${i}`,
      fecha_derivacion_dupla: '2026-01-01', total_atenciones: i,
    }).select('id').single();
    if (error) throw new Error(error.message);
    ids.push(data.id);
  }
  check(`sembramos ${TOTAL} fichas en 5 duplas`, ids.length === TOTAL);

  if (ws.readyState !== 1) await new Promise((x, rej) => { const t = setTimeout(() => rej(new Error('ws')), 20000); ws.addEventListener('open', () => { clearTimeout(t); x(); }, { once: true }); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: link.properties.action_link });
  await wait(9000);
  if ((await ev('location.pathname')) !== '/admin') { await send('Page.navigate', { url: 'http://localhost:3000/admin' }); await wait(6000); }
  await wait(2500);

  const medir = async () => ev(`(() => {
    const main = document.querySelector('main');
    const tabla = document.getElementById('pacientes');
    const cards = tabla.previousElementSibling;
    const cs = getComputedStyle(main);
    const h1 = main.querySelector('h1').getBoundingClientRect().height;
    return {
      altoMain: main.getBoundingClientRect().height,
      padding: cs.paddingTop,
      gap: cs.rowGap,
      altoTitulo: h1,
      altoKpis: cards.getBoundingClientRect().height,
      topTabla: tabla.getBoundingClientRect().top,
      filas: tabla.querySelectorAll('tbody tr').length,
      filasVisibles: Math.floor((window.innerHeight - tabla.getBoundingClientRect().top) / tabla.querySelector('tbody tr').getBoundingClientRect().height),
      scroll: window.innerHeight,
    };
  })()`);

  for (const [nombre, w, h] of [['desktop 1440', 1440, 900], ['laptop 1280', 1280, 720], ['tablet 834', 834, 1112], ['movil 390', 390, 844]]) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
    await wait(1200);
    const m = await medir();
    console.log(`\n--- ${nombre} (${w}x${h}) ---`);
    console.log(`   alto del bloque KPI: ${Math.round(m.altoKpis)}px | titulo: ${Math.round(m.altoTitulo)}px | padding main: ${m.padding} | gap: ${m.gap}`);
    console.log(`   la tabla arranca en y=${Math.round(m.topTabla)} y caben ~${m.filasVisibles} de ${m.filas} filas en el alto visible`);
    if (w === 1440) {
      check('el bloque KPI baja de 140px', m.altoKpis <= 140, Math.round(m.altoKpis) + 'px');
      check('el titulo es una sola linea', m.altoTitulo < 40, Math.round(m.altoTitulo) + 'px');
      check('la tabla ya aparece sin scrollear', m.topTabla < 300, 'top=' + Math.round(m.topTabla));
      check('se ven por lo menos 4 filas de la tabla sin scrollear', m.filasVisibles >= 4, m.filasVisibles + ' filas');
    }
    if (w === 390) {
      check('en movil la tabla tambien arranca arriba', m.topTabla < 620, 'top=' + Math.round(m.topTabla));
      const overflow = await ev(`document.documentElement.scrollWidth > window.innerWidth`);
      check('sin scroll horizontal en movil', !overflow);
    }
  }

  console.log('\n--- el contenido de las cards no se corta ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await wait(1000);
  const cortes = await ev(`(() => {
    const cards = [...document.querySelectorAll('#pacientes')].length ? [...document.querySelector('#pacientes').previousElementSibling.querySelectorAll('div')] : [];
    return [...document.querySelectorAll('main .rounded-\\\\[var\\\\(--radius-md\\\\)\\\\]')]
      .flatMap((c) => [...c.querySelectorAll('p,span,h2')])
      .filter((el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)
      .map((el) => el.className.slice(0,40) + ' :: ' + el.textContent.trim().slice(0,40));
  })()`);
  check('ningun texto se corta dentro de las cards', cortes.length === 0, cortes.join(' | '));

  // Cada tarjeta de metrica tiene un numero con clase tnum: hay que leer las 4.
  // El bloque es un grid de 3 columnas: la 2a celda es la interna de metricas.
  const kpis = await ev(`(() => {
    const kpi = document.getElementById('pacientes').previousElementSibling;
    const grupo = kpi.firstElementChild;
    return [...grupo.children].map((card) => {
      const valor = card.querySelector('.tnum');
      const label = card.querySelector('span.font-semibold');
      return { label: label?.textContent.trim(), valor: valor?.textContent.trim(), h: Math.round(card.getBoundingClientRect().height) };
    });
  })()`);
  console.log('   tarjetas:', kpis.map((k) => `${k.label}=${k.valor}(${k.h}px)`).join(' | '));
  check('los 4 indicadores muestran su numero', kpis.length === 4 && kpis.every((k) => k.valor && /\d/.test(k.valor)), kpis.map((k) => `${k.label}=${k.valor}`).join(', '));
  check('las 4 tarjetas miden lo mismo (sin texto desbordado)', new Set(kpis.map((k) => k.h)).size === 1, kpis.map((k) => k.h).join(','));
  // El grid estira las tarjetas a la fila mas alta: lo que importa es el bloque.
  check('el bloque completo cabe en 140px', Math.max(...kpis.map((k) => k.h)) <= 140, Math.max(...kpis.map((k) => k.h)) + 'px');
  const grafico = await ev(`(() => { const c = document.getElementById('pacientes').previousElementSibling.lastElementChild;
    return { h: Math.round(c.getBoundingClientRect().height), filas: c.querySelectorAll('li').length }; })()`);
  console.log('   tarjeta de duplas:', JSON.stringify(grafico));
  check('el grafico de duplas no supera el alto de las metricas', grafico.h <= Math.max(...kpis.map((k) => k.h)), 'grafico=' + grafico.h + 'px metricas=' + Math.max(...kpis.map((k) => k.h)) + 'px');
  check('el grafico sigue mostrando duplas', grafico.filas > 0, grafico.filas + ' duplas');
} catch (err) {
  check('sin excepciones', false, err.message);
} finally {
  if (ids.length) await admin.from('pacientes_seguimiento').delete().in('id', ids);
  await admin.from('pacientes_seguimiento').delete().like('nombre', MARCA + '%');
  ws.close();
  await fetch(`http://127.0.0.1:9341/json/close/${tab.id}`).catch(() => {});
}
const f = r.filter((x) => !x).length;
console.log(`\n${f === 0 ? '>>> TODAS PASARON' : '>>> ' + f + ' FALLARON'}`);