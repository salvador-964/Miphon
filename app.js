/* =============================================
   GestiStock — app.js
   ============================================= */

'use strict';

// ── Estado ──────────────────────────────────────────────────────────────────
const MAX_ROWS = 20;
let inventario = [];   // [{marca, unidades}]
let historico  = [];   // [{fecha,hora,marca,undAnt,undAct,obs}]
let editIndex  = null; // índice en edición
let elimIndex  = null; // índice a eliminar

// ── Persistencia ────────────────────────────────────────────────────────────
function guardar() {
  localStorage.setItem('gs_inv', JSON.stringify(inventario));
  localStorage.setItem('gs_hist', JSON.stringify(historico));
}
function cargar() {
  try { inventario = JSON.parse(localStorage.getItem('gs_inv')) || []; } catch { inventario = []; }
  try { historico  = JSON.parse(localStorage.getItem('gs_hist')) || []; } catch { historico  = []; }
}

// ── Helpers fecha/hora ───────────────────────────────────────────────────────
function hoyISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
function ahoraHHMM() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}
function fechaHoraLegible() {
  const d = new Date();
  return `${d.toLocaleDateString('es-ES')}  ${d.toTimeString().slice(0,5)}`;
}
function isoToLocal(iso) {
  // YYYY-MM-DD → DD/MM/YYYY
  const [y, m, day] = iso.split('-');
  return `${day}/${m}/${y}`;
}

// ── Registro en histórico ────────────────────────────────────────────────────
function registrarHistorico(marca, undAnt, undAct, obs) {
  historico.push({
    fecha: hoyISO(),
    hora:  ahoraHHMM(),
    marca,
    undAnt,
    undAct,
    obs: obs || ''
  });
  guardar();
  renderHistorico();
}

// ── Render Inventario ────────────────────────────────────────────────────────
function renderInventario() {
  const tbody = document.getElementById('invBody');
  tbody.innerHTML = '';
  document.getElementById('invCount').textContent = `${inventario.length} / ${MAX_ROWS}`;
  document.getElementById('btnAnadir').disabled = inventario.length >= MAX_ROWS;

  if (inventario.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="3">No hay artículos. Añade uno para comenzar.</td></tr>';
    return;
  }
  inventario.forEach((item, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-marca">${esc(item.marca)}</td>
      <td class="cell-units">${item.unidades}</td>
      <td class="col-actions">
        <button class="btn-icon" title="Editar unidades" onclick="abrirModalEditar(${i})">✏️</button>
        <button class="btn-icon" title="Eliminar" onclick="abrirModalEliminar(${i})">🗑</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ── Render Histórico ─────────────────────────────────────────────────────────
function renderHistorico(filas) {
  const datos = filas !== undefined ? filas : historico;
  const tbody = document.getElementById('histBody');
  tbody.innerHTML = '';

  if (datos.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No hay registros.</td></tr>';
    return;
  }
  // más reciente primero
  [...datos].reverse().forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-date">${isoToLocal(r.fecha)}</td>
      <td class="cell-time">${r.hora}</td>
      <td class="cell-marca">${esc(r.marca)}</td>
      <td class="cell-prev">${r.undAnt}</td>
      <td class="cell-curr">${r.undAct}</td>
      <td class="cell-obs" title="${esc(r.obs)}">${esc(r.obs)}</td>`;
    tbody.appendChild(tr);
  });
}

// ── Vista ────────────────────────────────────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view' + capitalize(name)).classList.add('active');
  document.getElementById('nav' + capitalize(name)).classList.add('active');
  if (name === 'historico') renderHistorico();
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Modales ──────────────────────────────────────────────────────────────────
function abrirModal(id)  { document.getElementById(id).classList.add('open'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('open'); }

// Cerrar modal al clicar fuera
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
});

// ── Añadir ───────────────────────────────────────────────────────────────────
function abrirModalAnadir() {
  if (inventario.length >= MAX_ROWS) { toast('Límite de 20 artículos alcanzado'); return; }
  document.getElementById('inputMarca').value = '';
  document.getElementById('inputUnidades').value = '';
  document.getElementById('inputObsAnadir').value = '';
  abrirModal('modalAnadir');
  setTimeout(() => document.getElementById('inputMarca').focus(), 80);
}
function confirmarAnadir() {
  const marca = document.getElementById('inputMarca').value.trim();
  const und   = parseInt(document.getElementById('inputUnidades').value, 10);
  const obs   = document.getElementById('inputObsAnadir').value.trim();
  if (!marca) { toast('Indica la marca'); return; }
  if (isNaN(und) || und < 0) { toast('Unidades no válidas'); return; }
  if (inventario.find(x => x.marca.toLowerCase() === marca.toLowerCase())) {
    toast('Esa marca ya existe'); return;
  }
  inventario.push({ marca, unidades: und });
  guardar();
  registrarHistorico(marca, '—', und, obs || 'Alta en inventario');
  renderInventario();
  cerrarModal('modalAnadir');
  toast(`"${marca}" añadido`);
}

// ── Editar ───────────────────────────────────────────────────────────────────
function abrirModalEditar(i) {
  editIndex = i;
  const item = inventario[i];
  document.getElementById('editMarcaLabel').textContent = item.marca;
  document.getElementById('editUnidadesActuales').textContent = item.unidades;
  document.getElementById('editInputUnidades').value = item.unidades;
  document.getElementById('editObs').value = '';
  abrirModal('modalEditar');
  setTimeout(() => document.getElementById('editInputUnidades').focus(), 80);
}
function confirmarEditar() {
  const nuevas = parseInt(document.getElementById('editInputUnidades').value, 10);
  const obs    = document.getElementById('editObs').value.trim();
  if (isNaN(nuevas) || nuevas < 0) { toast('Unidades no válidas'); return; }
  const item = inventario[editIndex];
  const ant  = item.unidades;
  item.unidades = nuevas;
  guardar();
  registrarHistorico(item.marca, ant, nuevas, obs);
  renderInventario();
  cerrarModal('modalEditar');
  toast('Unidades actualizadas');
}

// ── Eliminar ─────────────────────────────────────────────────────────────────
function abrirModalEliminar(i) {
  elimIndex = i;
  document.getElementById('elimMarcaLabel').textContent = inventario[i].marca;
  document.getElementById('elimObs').value = '';
  abrirModal('modalEliminar');
}
function confirmarEliminar() {
  const item = inventario[elimIndex];
  const obs  = document.getElementById('elimObs').value.trim();
  registrarHistorico(item.marca, item.unidades, '—', obs || 'Baja en inventario');
  inventario.splice(elimIndex, 1);
  guardar();
  renderInventario();
  cerrarModal('modalEliminar');
  toast(`"${item.marca}" eliminado`);
}

// ── Exportar CSV ──────────────────────────────────────────────────────────────
function exportarCSV() {
  if (inventario.length === 0) { toast('No hay datos para exportar'); return; }
  let csv = 'Marca,Unidades\n';
  inventario.forEach(r => {
    csv += `"${r.marca.replace(/"/g,'""')}",${r.unidades}\n`;
  });
  descargar(csv, 'inventario_' + hoyISO() + '.csv', 'text/csv');
  toast('CSV exportado');
}

// ── Importar CSV ──────────────────────────────────────────────────────────────
function importarCSV() {
  document.getElementById('inputCSV').value = '';
  document.getElementById('inputCSV').click();
}
function leerCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split(/\r?\n/).filter(Boolean);
    let added = 0, skipped = 0;
    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().startsWith('marca')) return; // cabecera
      const parts = parseCsvLine(line);
      if (parts.length < 2) { skipped++; return; }
      const marca = parts[0].replace(/^"|"$/g,'').trim();
      const und   = parseInt(parts[1], 10);
      if (!marca || isNaN(und)) { skipped++; return; }
      if (inventario.length >= MAX_ROWS) { skipped++; return; }
      if (inventario.find(x => x.marca.toLowerCase() === marca.toLowerCase())) { skipped++; return; }
      inventario.push({ marca, unidades: und });
      registrarHistorico(marca, '—', und, 'Importación CSV');
      added++;
    });
    guardar();
    renderInventario();
    toast(`Importados: ${added}, omitidos: ${skipped}`);
  };
  reader.readAsText(file);
}
function parseCsvLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ',' && !inQ) { result.push(cur); cur = ''; continue; }
    cur += c;
  }
  result.push(cur);
  return result;
}

// ── Borrar rango histórico ────────────────────────────────────────────────────
function abrirModalBorrarRango() {
  const hoy = hoyISO();
  document.getElementById('rangoDesdeF').value = hoy;
  document.getElementById('rangoDesdeH').value = '00:00';
  document.getElementById('rangoHastaF').value = hoy;
  document.getElementById('rangoHastaH').value = '23:59';
  abrirModal('modalBorrarRango');
}
function confirmarBorrarRango() {
  const desde = `${document.getElementById('rangoDesdeF').value}T${document.getElementById('rangoDesdeH').value}`;
  const hasta = `${document.getElementById('rangoHastaF').value}T${document.getElementById('rangoHastaH').value}`;
  if (!document.getElementById('rangoDesdeF').value || !document.getElementById('rangoHastaF').value) {
    toast('Completa las fechas'); return;
  }
  const antes = historico.length;
  historico = historico.filter(r => {
    const ts = `${r.fecha}T${r.hora}`;
    return ts < desde || ts > hasta;
  });
  const borrados = antes - historico.length;
  guardar();
  renderHistorico();
  cerrarModal('modalBorrarRango');
  toast(`${borrados} registro(s) eliminado(s)`);
}

// ── Imprimir PDF ──────────────────────────────────────────────────────────────
function imprimirInventario() {
  abrirVentanaImpresion(
    'Inventario',
    `<table class="ptable">
       <thead><tr><th>Marca</th><th>Unidades</th></tr></thead>
       <tbody>${inventario.map(r => `<tr><td>${esc(r.marca)}</td><td>${r.unidades}</td></tr>`).join('')}</tbody>
     </table>`
  );
}

function imprimirHistoricoCompleto() {
  imprimirHistoricoFiltrado(historico, 'Histórico completo');
}

function abrirModalImprimirRango() {
  const hoy = hoyISO();
  document.getElementById('pDesdeF').value = hoy;
  document.getElementById('pDesdeH').value = '00:00';
  document.getElementById('pHastaF').value = hoy;
  document.getElementById('pHastaH').value = '23:59';
  abrirModal('modalImprimirRango');
}
function confirmarImprimirRango() {
  const desde = `${document.getElementById('pDesdeF').value}T${document.getElementById('pDesdeH').value}`;
  const hasta = `${document.getElementById('pHastaF').value}T${document.getElementById('pHastaH').value}`;
  if (!document.getElementById('pDesdeF').value || !document.getElementById('pHastaF').value) {
    toast('Completa las fechas'); return;
  }
  const filtrado = historico.filter(r => {
    const ts = `${r.fecha}T${r.hora}`;
    return ts >= desde && ts <= hasta;
  });
  cerrarModal('modalImprimirRango');
  const label = `Histórico ${isoToLocal(document.getElementById('pDesdeF').value)} – ${isoToLocal(document.getElementById('pHastaF').value)}`;
  imprimirHistoricoFiltrado(filtrado, label);
}

function imprimirHistoricoFiltrado(filas, titulo) {
  const rows = [...filas].reverse().map(r =>
    `<tr>
       <td>${isoToLocal(r.fecha)}</td>
       <td>${r.hora}</td>
       <td>${esc(r.marca)}</td>
       <td>${r.undAnt}</td>
       <td>${r.undAct}</td>
       <td>${esc(r.obs)}</td>
     </tr>`).join('');
  abrirVentanaImpresion(
    titulo,
    `<table class="ptable">
       <thead><tr>
         <th>Fecha</th><th>Hora</th><th>Marca</th>
         <th>Und. Ant.</th><th>Und. Act.</th><th>Observaciones</th>
       </tr></thead>
       <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#888">Sin registros</td></tr>'}</tbody>
     </table>`
  );
}

function abrirVentanaImpresion(titulo, contenidoHTML) {
  const ts = fechaHoraLegible();
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>${titulo}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 20mm 15mm; color: #111; font-size: 12px; }
    .pheader { display: flex; justify-content: space-between; align-items: flex-end;
               border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 14px; }
    .pheader-title { font-size: 18px; font-weight: 700; letter-spacing: .02em; }
    .pheader-meta { font-size: 11px; color: #555; text-align: right; }
    .ptable { width: 100%; border-collapse: collapse; }
    .ptable th { background: #f0f0f0; text-align: left; padding: 7px 10px;
                 font-size: 10px; text-transform: uppercase; letter-spacing: .05em;
                 border-bottom: 1px solid #ccc; }
    .ptable td { padding: 7px 10px; border-bottom: 1px solid #e8e8e8; }
    .ptable tbody tr:nth-child(even) td { background: #fafafa; }
    @media print { @page { margin: 15mm; } }
  </style>
</head>
<body>
  <div class="pheader">
    <div class="pheader-title">GestiStock — ${titulo}</div>
    <div class="pheader-meta">Generado: ${ts}</div>
  </div>
  ${contenidoHTML}
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) { toast('Permite ventanas emergentes para imprimir'); return; }
  win.document.write(html);
  win.document.close();
}

// ── Utilidades ───────────────────────────────────────────────────────────────
function esc(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
function descargar(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = nombre; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── Teclado: Enter en campos de modal ────────────────────────────────────────
document.getElementById('inputMarca').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('inputUnidades').focus();
});
document.getElementById('inputUnidades').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmarAnadir();
});
document.getElementById('editInputUnidades').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmarEditar();
});

// ── Service Worker ───────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ── Arranque ─────────────────────────────────────────────────────────────────
cargar();
renderInventario();
