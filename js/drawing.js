// The printed sheet: everything an architect adds on top of the cut model
// (labels, dimensions, door swings, hatches, title block). It lies on the
// floor of the model, so the drawing and the building share one space.
import { INK, RED } from './materials.js';

export const PA_SHEET_X = 14;
export const SHEET = { x0: -4, x1: 44, d0: -9, d1: 53, ppm: 64 };
const GREY = '#8d887e';
const FONT = 'Jost, "Futura", "Century Gothic", sans-serif';

export function drawSheet() {
  const { x0, x1, d0, d1, ppm } = SHEET;
  const c = document.createElement('canvas');
  c.width = Math.round((x1 - x0) * ppm);
  c.height = Math.round((d1 - d0) * ppm);
  const g = c.getContext('2d');
  const X = (x) => (x - x0) * ppm;
  const Y = (d) => (d1 - d) * ppm;
  const L = (m) => m * ppm;
  let ox = 0;

  const line = (xa, da, xb, db, w = 0.02, col = INK, dash = null) => {
    g.save();
    g.strokeStyle = col;
    g.lineWidth = L(w);
    if (dash) g.setLineDash(dash.map(L));
    g.beginPath();
    g.moveTo(X(xa + ox), Y(da));
    g.lineTo(X(xb + ox), Y(db));
    g.stroke();
    g.restore();
  };
  const rect = (xa, xb, da, db, w = 0.02, col = INK, dash = null) => {
    line(xa, da, xb, da, w, col, dash);
    line(xb, da, xb, db, w, col, dash);
    line(xb, db, xa, db, w, col, dash);
    line(xa, db, xa, da, w, col, dash);
  };
  const fill = (xa, xb, da, db, col) => {
    g.fillStyle = col;
    g.fillRect(X(xa + ox), Y(db), L(xb - xa), L(db - da));
  };
  const hatch = (xa, xb, da, db, step = 0.42, col = 'rgba(31,30,28,0.26)') => {
    g.save();
    g.beginPath();
    g.rect(X(xa + ox), Y(db), L(xb - xa), L(db - da));
    g.clip();
    g.strokeStyle = col;
    g.lineWidth = L(0.012);
    g.beginPath();
    const span = xb - xa + (db - da);
    for (let s = -span; s < span; s += step) {
      g.moveTo(X(xa + ox + s), Y(da));
      g.lineTo(X(xa + ox + s + (db - da)), Y(db));
    }
    g.stroke();
    g.restore();
  };
  const text = (s, x, d, size, o = {}) => {
    g.save();
    g.translate(X(x + ox), Y(d));
    if (o.rot) g.rotate((-o.rot * Math.PI) / 180);
    g.font = `${o.italic ? 'italic ' : ''}${o.w ?? 500} ${L(size)}px ${FONT}`;
    g.fillStyle = o.col ?? INK;
    g.textAlign = o.align ?? 'center';
    g.textBaseline = o.base ?? 'middle';
    if (o.ls) g.letterSpacing = `${L(o.ls)}px`;
    const lines = String(s).split('\n');
    lines.forEach((ln, i) => g.fillText(ln, 0, (i - (lines.length - 1) / 2) * L(size) * 1.18));
    g.restore();
  };
  const tag = (s, x, d, size = 0.24) => {
    text(s, x, d, size, { w: 500 });
    g.save();
    g.font = `500 ${L(size)}px ${FONT}`;
    const w = g.measureText(s).width / ppm + 0.16;
    g.restore();
    rect(x - w / 2, x + w / 2, d - size * 0.75, d + size * 0.7, 0.014);
  };
  const tick = (x, d) => line(x - 0.09, d - 0.09, x + 0.09, d + 0.09, 0.022);
  const dimH = (xa, xb, d, label, size = 0.27) => {
    line(xa - 0.12, d, xb + 0.12, d, 0.012);
    tick(xa, d);
    tick(xb, d);
    g.save();
    g.font = `500 ${L(size)}px ${FONT}`;
    const tw = g.measureText(label).width / ppm + 0.16;
    g.restore();
    fill((xa + xb) / 2 - tw / 2, (xa + xb) / 2 + tw / 2, d - size * 0.6, d + size * 0.6, '#f2efe7');
    text(label, (xa + xb) / 2, d, size);
  };
  const dimV = (da, db, x, label, size = 0.27) => {
    line(x, da - 0.12, x, db + 0.12, 0.012);
    tick(x, da);
    tick(x, db);
    g.save();
    g.font = `500 ${L(size)}px ${FONT}`;
    const tw = g.measureText(label).width / ppm + 0.16;
    g.restore();
    fill(x - size * 0.6, x + size * 0.6, (da + db) / 2 - tw / 2, (da + db) / 2 + tw / 2, '#f2efe7');
    text(label, x, (da + db) / 2, size, { rot: 90 });
  };
  const level = (x, d, label) => {
    const r = 0.17;
    g.save();
    g.translate(X(x + ox), Y(d));
    g.lineWidth = L(0.015);
    g.strokeStyle = INK;
    g.fillStyle = INK;
    g.beginPath();
    g.arc(0, 0, L(r), 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, L(r), -Math.PI / 2, 0);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, L(r), Math.PI / 2, Math.PI);
    g.closePath();
    g.fill();
    g.restore();
    line(x + r, d, x + r + 0.9, d, 0.012);
    text(label, x + r + 0.08, d + 0.2, 0.24, { align: 'left' });
  };
  // door swing; angles in plan degrees (0 = +x, 90 = into the lot)
  const door = (hx, hd, r, aClosed, aOpen) => {
    const rad = (a) => (a * Math.PI) / 180;
    line(hx, hd, hx + r * Math.cos(rad(aOpen)), hd + r * Math.sin(rad(aOpen)), 0.03);
    g.save();
    g.strokeStyle = INK;
    g.lineWidth = L(0.012);
    g.beginPath();
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const a = rad(aClosed + ((aOpen - aClosed) * i) / n);
      const px = X(hx + ox + r * Math.cos(a));
      const py = Y(hd + r * Math.sin(a));
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
    g.restore();
  };
  const cross = (xa, xb, da, db, col = GREY) => {
    line(xa, da, xb, db, 0.012, col, [0.25, 0.15]);
    line(xa, db, xb, da, 0.012, col, [0.25, 0.15]);
  };
  const arrow = (pts) => {
    for (let i = 1; i < pts.length; i++) line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 0.014);
    const [ax, ad] = pts[pts.length - 1];
    const [bx, bd] = pts[pts.length - 2];
    const a = Math.atan2(ad - bd, ax - bx);
    for (const s of [-1, 1]) line(ax, ad, ax - 0.3 * Math.cos(a + s * 0.4), ad - 0.3 * Math.sin(a + s * 0.4), 0.014);
  };

  g.clearRect(0, 0, c.width, c.height);

  /* sheet frame */
  rect(-3.4, 43.4, -8.4, 52.4, 0.05);
  rect(-3.1, 43.1, -8.1, 52.1, 0.015);
  text('Corte horizontal a +1,20 m', 0.0, -7.4, 0.32, { align: 'left', col: GREY, italic: true });

  /* ---------------- PLANTA BAJA ---------------- */
  ox = 0;
  text('PLANTA BAJA', 4.28, 51.2, 0.95, { w: 600, ls: 0.06 });
  text('ARQUITECTURA', 4.28, 50.1, 0.55, { ls: 0.05 });
  line(2.2, 49.7, 6.36, 49.7, 0.02);
  // existing / unaffected surfaces
  fill(5.22, 8.41, 0.2, 8.25, 'rgba(31,30,28,0.10)');
  fill(3.59, 5.07, 0.2, 9.95, 'rgba(31,30,28,0.16)');
  fill(3.74, 4.93, 9.95, 25.85, 'rgba(31,30,28,0.16)');
  fill(0.15, 8.41, 26.0, 33.92, 'rgba(31,30,28,0.10)');
  hatch(5.22, 8.41, 0.2, 9.8);
  hatch(0.15, 3.59, 9.95, 23.16);
  hatch(5.08, 8.41, 9.95, 23.16);
  hatch(0.15, 8.41, 26.0, 33.92);
  hatch(0.15, 3.44, 6.45, 9.8);
  // labels
  text('UF N°1', 1.75, 0.62, 0.36, { w: 600 });
  text('SALA DE\nESTAR', 2.2, 2.05, 0.3);
  tag('PB|01', 2.2, 1.35);
  level(1.55, 1.25, '+0.25');
  text('HALL\nSEMICUBIERTO', 4.33, 3.3, 0.17);
  level(4.0, 0.75, '±0.00');
  text('UF N°2', 6.8, 0.62, 0.32, { w: 600 });
  text('ESTAR\nCOMEDOR\nCOCINA\nLAVADERO', 6.6, 4.5, 0.3);
  text('BAÑO', 1.25, 9.25, 0.22);
  tag('PB|02', 1.25, 8.8, 0.18);
  text('PLATAF.\nELEVADORA', 0.72, 7.05, 0.14);
  text('PATIO', 2.95, 8.7, 0.22);
  text('PATIO', 5.75, 9.1, 0.22);
  text('CIRCULACIÓN\nDESCUBIERTA\nCOMÚN', 4.33, 12.6, 0.17);
  for (const [x, label] of [[1.85, 'UF N°3'], [6.7, 'UF N°4']]) {
    text(label, x, 16.4, 0.36, { w: 600 });
    text('ESTAR\nCOMEDOR\nCOCINA\nLAVADERO\nDORMITORIO', x, 14.2 + 4.6, 0.26);
    text('BAÑO', x + (x < 4 ? -0.6 : 0.6), 11.0, 0.2);
    text('PATIO', x, 24.5, 0.24);
    text('ESTAR\nCOMEDOR\nCOCINA', x, 30.1, 0.24);
    text('PATIO', x, 41, 0.26);
  }
  text('WC', 3.9, 28.6, 0.18);
  text('WC', 4.65, 28.6, 0.18);
  text('L.O.', -0.95, 0.05, 0.5);
  text('L.O.', 9.55, 0.05, 0.5);
  text('E.D.P.', -0.55, 2.7, 0.42, { rot: 90 });
  text('E.D.P.', 9.15, 2.7, 0.42, { rot: 90 });
  text('VEREDA', 4.28, -1.45, 0.3, { ls: 0.08 });
  text('BAHÍA BLANCA', 4.28, -5.0, 0.62, { w: 600, ls: 0.28 });
  line(-1.8, -3.15, 10.4, -3.15, 0.02);
  // street tree
  g.save();
  g.strokeStyle = INK;
  g.lineWidth = L(0.014);
  g.beginPath();
  g.arc(X(7.9), Y(-2.61), L(0.55), 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.arc(X(7.9), Y(-2.61), L(0.16), 0, Math.PI * 2);
  g.stroke();
  g.restore();
  // dimensions
  dimH(0, 8.56, -0.75, '8.56');
  dimH(0.15, 3.44, 4.95, '3.29');
  dimH(3.59, 5.07, 0.55, '1.48');
  dimH(5.22, 8.41, 2.9, '3.17');
  dimV(0.2, 6.3, 2.1, '6.20');
  dimV(0.2, 8.25, 7.95, '8.25');
  dimV(0, 48.22, -1.6, '48.22');
  dimV(0, 47.33, 10.15, '47.33');
  dimH(3.74, 4.93, 22.0, '1.20');
  // doors
  door(3.23, 0.2, 0.92, 180, 90);
  door(5.32, 0.2, 0.94, 0, 90);
  door(5.07, 1.96, 1.0, 180, 92);
  door(3.59, 17.2, 0.85, 90, 180);
  door(4.93, 17.2, 0.85, 90, 0);
  door(2.1, 8.3, 0.7, 180, 90);
  // stair: numbers, upper run dashed, arrow
  for (let i = 1; i <= 11; i++) text(String(i), 0.65, 2.6 + (i - 0.5) * 0.2455, 0.14);
  text('12', 0.65, 5.8, 0.14);
  for (let i = 13; i <= 23; i++) text(String(i), 1.15 + (i - 12.5) * 0.26, 5.8, 0.13);
  rect(1.15, 4.01, 5.3, 6.3, 0.012, INK, [0.12, 0.08]);
  for (let i = 1; i < 11; i++) line(1.15 + i * 0.26, 5.3, 1.15 + i * 0.26, 6.3, 0.01, INK, [0.12, 0.08]);
  arrow([[0.85, 2.75], [0.85, 5.55], [4.2, 5.55]]);
  text('Altura de paso libre > 2,10 m', 4.33, 6.55, 0.12, { italic: true });
  // section mark A
  for (const d of [-1.9, 49.2]) {
    line(4.4, d, 4.4, d + (d < 0 ? 0.6 : -0.6), 0.02);
    line(4.4, d, 5.0, d, 0.02);
    text('A', 5.35, d, 0.42, { w: 600 });
  }

  /* ---------------- PLANTA ALTA ---------------- */
  ox = PA_SHEET_X;
  text('PLANTA ALTA', 4.28, 51.2, 0.95, { w: 600, ls: 0.06 });
  text('ARQUITECTURA', 4.28, 50.1, 0.55, { ls: 0.05 });
  line(2.2, 49.7, 6.36, 49.7, 0.02);
  rect(0, 8.56, 0, 48.22, 0.012, GREY);
  cross(0.15, 8.41, 23.31, 25.85);
  text('VACÍO SOBRE PB', 4.28, 24.6, 0.24, { col: GREY });
  cross(0.15, 8.41, 34.07, 47.6);
  text('VACÍO SOBRE PB', 4.28, 40.8, 0.3, { col: GREY });
  fill(0.15, 8.41, 26.0, 33.92, 'rgba(31,30,28,0.10)');
  hatch(0.15, 8.41, 26.0, 33.92);
  text('DORMITORIOS EXISTENTES', 4.28, 32.4, 0.22);
  for (const [x, d, s] of [[2.0, 32.4, 'A1'], [6.5, 32.4, 'A2'], [2.0, 27.5, 'A7'], [6.5, 27.5, 'A8']]) tag(s, x, d - (s < 'A3' ? 0.9 : 0), 0.2);
  text('ESTAR COMEDOR\nCOCINA', 4.2, 1.35, 0.3);
  tag('PA|05', 4.2, 0.62);
  level(5.0, 4.15, '+4.44');
  text('BALCÓN', 4.28, -0.5, 0.26, { ls: 0.05 });
  dimH(0.355, 8.205, -1.35, '7.85');
  dimH(0.15, 8.41, 4.75, '8.29');
  dimV(0.2, 6.35, 8.0, '6.20');
  cross(2.35, 6.21, 6.5, 10.1);
  text('VACÍO\nAIRE Y LUZ', 4.28, 8.3, 0.34, { w: 600 });
  dimH(2.35, 6.21, 7.0, '4.01');
  dimV(6.5, 10.1, 5.7, '4.00');
  text('VESTIDOR', 1.35, 9.3, 0.2);
  tag('PA|04', 1.35, 8.85, 0.18);
  text('PLATAF.', 0.72, 7.0, 0.14);
  text('DORMITORIO', 1.55, 11.55, 0.22);
  tag('PA|01', 1.55, 11.0, 0.18);
  text('BAÑO', 3.86, 12.75, 0.2);
  tag('PA|02', 3.86, 12.3, 0.17);
  text('DORMITORIO', 6.0, 11.85, 0.2);
  tag('PA|03', 6.0, 12.35, 0.17);
  text('PASO', 5.4, 10.75, 0.2, { italic: true });
  text('PASO', 7.35, 8.3, 0.2, { italic: true, rot: 90 });
  text('PASO', 7.9, 12.8, 0.2, { italic: true, rot: 90 });
  text('TERRAZA ACCESIBLE', 4.28, 19.2, 0.4, { w: 600 });
  text('Techo frío · Isla de calor', 4.28, 18.55, 0.22, { italic: true });
  level(3.5, 17.4, '+4.40');
  dimV(14.33, 23.16, 1.25, '8.83');
  text('Muro bajo H = 1,00 m', 2.0, 4.6, 0.13, { italic: true });
  for (let i = 13; i <= 23; i++) text(String(i), 1.15 + (i - 12.5) * 0.26, 5.7, 0.13);
  rect(0.15, 4.01, 5.05, 6.35, 0.012, INK, [0.12, 0.08]);
  arrow([[0.6, 5.7], [0.6, 6.05], [4.2, 6.05]]);
  door(3.5, 11.25, 0.7, 0, -90);
  door(7.2, 11.25, 0.7, 180, 270);
  door(2.96, 10.25, 0.8, 90, 180);
  door(8.3, 14.18, 0.85, 180, 90);
  text('L.O.', -0.95, 0.05, 0.5);
  text('L.O.', 9.55, 0.05, 0.5);
  dimV(0, 48.22, -1.6, '48.22');

  /* ---------------- TITLE BLOCK ---------------- */
  ox = 0;
  const TX0 = 27.2;
  const TX1 = 42.6;
  const cx = (TX0 + TX1) / 2;
  rect(TX0, TX1, -7.6, 51.6, 0.03);
  const row = (d) => line(TX0, d, TX1, d, 0.02);
  // symbology
  text('SIMBOLOGÍA', TX0 + 0.6, 50.6, 0.42, { align: 'left', w: 600, ls: 0.05 });
  fill(TX0 + 0.6, TX0 + 2.0, 48.9, 49.3, INK);
  text('Muros existentes', TX0 + 2.4, 49.1, 0.36, { align: 'left' });
  fill(TX0 + 0.6, TX0 + 2.0, 47.9, 48.3, RED);
  text('Muros nuevos', TX0 + 2.4, 48.1, 0.36, { align: 'left' });
  hatch(TX0 + 0.6, TX0 + 2.0, 46.8, 47.4, 0.2);
  rect(TX0 + 0.6, TX0 + 2.0, 46.8, 47.4, 0.012);
  text('Superficie existente', TX0 + 2.4, 47.1, 0.36, { align: 'left' });
  cross(TX0 + 0.6, TX0 + 2.0, 45.8, 46.4, INK);
  rect(TX0 + 0.6, TX0 + 2.0, 45.8, 46.4, 0.012);
  text('Vacío', TX0 + 2.4, 46.1, 0.36, { align: 'left' });
  row(45.0);
  // location sketch
  text('CROQUIS DE UBICACIÓN', TX0 + 0.6, 44.0, 0.42, { align: 'left', w: 600, ls: 0.05 });
  const bx0 = TX0 + 3.0;
  const bx1 = TX1 - 3.0;
  const bd0 = 31.6;
  const bd1 = 41.4;
  rect(bx0, bx1, bd0, bd1, 0.03);
  rect(bx0, bx0 + 3.9, 37.2, 37.9, 0.02);
  fill(bx0, bx0 + 3.9, 37.2, 37.9, 'rgba(31,30,28,0.35)');
  text('BAIGORRIA', cx, bd1 + 0.75, 0.42, { ls: 0.08 });
  text('MARCOS SASTRE', cx, bd0 - 0.75, 0.42, { ls: 0.08 });
  text('BAHÍA BLANCA', bx0 - 0.8, (bd0 + bd1) / 2, 0.42, { rot: 90, ls: 0.08 });
  text('JOAQUÍN V. GONZÁLEZ', bx1 + 0.8, (bd0 + bd1) / 2, 0.36, { rot: 90, ls: 0.04 });
  text('Ancho calle 17,32 m · Ancho acera 3,00 m', cx, 29.9, 0.3, { col: GREY });
  arrow([[TX1 - 1.2, 38.6], [TX1 - 1.2, 40.6]]);
  text('N', TX1 - 1.2, 41.2, 0.36, { w: 600 });
  row(29.0);
  // surfaces
  text('SUPERFICIES', TX0 + 0.6, 28.0, 0.42, { align: 'left', w: 600, ls: 0.05 });
  const surf = [
    ['Terreno', '415,27 m²'],
    ['Existente', '323,50 m²'],
    ['A ampliar', '115,58 m²'],
    ['A demoler', '4,33 m²'],
    ['Total', '434,75 m²'],
  ];
  surf.forEach(([k, v], i) => {
    const d = 26.7 - i * 1.0;
    text(k, TX0 + 0.6, d, 0.4, { align: 'left', w: i === 4 ? 600 : 400 });
    text(v, TX1 - 0.6, d, 0.4, { align: 'right', w: i === 4 ? 600 : 400 });
    line(TX0 + 0.6, d - 0.48, TX1 - 0.6, d - 0.48, 0.008, GREY);
  });
  text('Plano límite 8,56 m · Entre medianeras · USAB 1', TX0 + 0.6, 21.5, 0.3, { align: 'left', col: GREY });
  row(20.7);
  // address
  text('BAHÍA BLANCA 2559', cx, 19.0, 1.12, { w: 600, ls: 0.04 });
  text('CIUDAD AUTÓNOMA DE BUENOS AIRES', cx, 17.7, 0.36, { ls: 0.12 });
  text('Circ. 15 · Secc. 81 · Manz. 70 · Parc. 17 · UF 01 · 03 · 04', cx, 16.8, 0.3, { col: GREY });
  row(15.8);
  // works
  const work = [
    ['PLANO', 'Obra civil · Obra menor'],
    ['TAREA', 'Modificación y ampliación de obra\ncon demolición parcial'],
    ['USO', 'Vivienda colectiva'],
  ];
  let wd = 14.8;
  for (const [k, v] of work) {
    text(k, TX0 + 0.6, wd, 0.3, { align: 'left', col: GREY, ls: 0.06 });
    const n = v.split('\n').length;
    text(v, TX0 + 3.2, wd - (n - 1) * 0.25, 0.42, { align: 'left' });
    wd -= 1.0 + (n - 1) * 0.5;
  }
  row(10.3);
  text('ESCALA', TX0 + 0.6, 9.4, 0.3, { align: 'left', col: GREY, ls: 0.06 });
  text('1:100', TX0 + 0.6, 8.6, 0.6, { align: 'left', w: 600 });
  text('LÁMINA', cx + 1.4, 9.4, 0.3, { align: 'left', col: GREY, ls: 0.06 });
  text('01 / 03', cx + 1.4, 8.6, 0.6, { align: 'left', w: 600 });
  // scale bar
  for (let i = 0; i < 5; i++) fill(TX0 + 0.6 + i, TX0 + 1.6 + i, 6.8, 7.05, i % 2 ? '#f2efe7' : INK);
  rect(TX0 + 0.6, TX0 + 5.6, 6.8, 7.05, 0.012);
  text('0', TX0 + 0.6, 6.3, 0.26);
  text('5 m', TX0 + 5.6, 6.3, 0.26);
  row(5.4);
  // studio
  text('NRVERTEX', cx, 2.6, 1.7, { w: 600, ls: 0.32 });
  text('Arquitectura · Desarrollo · Visualización', cx, 1.0, 0.34, { ls: 0.08, col: GREY });
  row(-0.2);
  text('Planta baja + planta alta · Corte a +1,20 m', cx, -1.4, 0.32);
  text('Recorrido: vereda → sala → escalera → estar → vacío → dormitorio → terraza', cx, -2.3, 0.26, { col: GREY });
  text('Dibujo generado desde el modelo 3D', cx, -6.6, 0.26, { italic: true, col: GREY });

  return c;
}
