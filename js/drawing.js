// The printed sheet of the first floor (the work): everything an architect adds on top of the cut model
// (labels, dimensions, door swings, hatches, title block). It lies on the
// floor of the model, so the drawing and the building share one space.
import { INK, RED } from './materials.js';

export const SHEET = { x0: -4, x1: 32, d0: -9, d1: 30, ppm: 64 };
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
  rect(-3.4, 31.4, -8.4, 29.4, 0.05);
  rect(-3.1, 31.1, -8.1, 29.1, 0.015);
  text('Corte horizontal a +1,20 m sobre +4,44', -2.6, -7.5, 0.3, { align: 'left', col: GREY, italic: true });

  /* ---------------- PLANTA ALTA (la obra) ---------------- */
  ox = 0;
  text('PLANTA ALTA', 4.28, 27.6, 0.95, { w: 600, ls: 0.06 });
  text('ARQUITECTURA · AMPLIACIÓN', 4.28, 26.5, 0.48, { ls: 0.05 });
  line(1.6, 26.05, 6.96, 26.05, 0.02);
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
  text('PLATAF.\nELEVADORA', 0.72, 7.0, 0.13);
  cross(0.15, 1.27, 6.45, 7.6, INK);
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
  dimH(0.15, 2.96, 13.6, '2.81');
  dimH(4.76, 7.26, 13.6, '2.50');
  text('Muro bajo H = 1,00 m', 2.0, 4.6, 0.13, { italic: true });
  for (let i = 13; i <= 23; i++) text(String(i), 1.15 + (i - 12.5) * 0.26, 5.7, 0.13);
  rect(0.15, 4.01, 5.05, 6.35, 0.012, INK, [0.12, 0.08]);
  arrow([[0.6, 5.7], [0.6, 6.05], [4.2, 6.05]]);
  door(3.5, 11.25, 0.7, 0, -90);
  door(7.2, 11.25, 0.7, 180, 270);
  door(2.96, 10.25, 0.8, 90, 180);
  door(8.3, 14.18, 0.85, 180, 90);
  door(1.37, 7.5, 0.9, 270, 360);
  text('L.O.', -0.95, 0.05, 0.5);
  text('L.O.', 9.55, 0.05, 0.5);
  text('E.D.P.', -0.55, 2.7, 0.42, { rot: 90 });
  text('E.D.P.', 9.15, 2.7, 0.42, { rot: 90 });
  dimV(0, 23.31, -1.6, '23.31');
  dimH(0, 8.56, 24.2, '8.56');
  text('VEREDA', 4.28, -2.3, 0.3, { ls: 0.08 });
  text('BAHÍA BLANCA', 4.28, -5.3, 0.62, { w: 600, ls: 0.28 });
  line(-1.8, -3.15, 10.4, -3.15, 0.02);
  g.save();
  g.strokeStyle = INK;
  g.lineWidth = L(0.014);
  g.beginPath();
  g.arc(X(7.9), Y(-2.61), L(0.55), 0, Math.PI * 2);
  g.stroke();
  g.restore();

  /* ---------------- TITLE BLOCK ---------------- */
  ox = 0;
  const TX0 = 13.0;
  const TX1 = 30.6;
  const cx = (TX0 + TX1) / 2;
  rect(TX0, TX1, -7.6, 28.6, 0.03);
  const row = (d) => line(TX0, d, TX1, d, 0.02);
  // studio and address
  text('NRVERTEX', cx, 26.4, 1.5, { w: 600, ls: 0.32 });
  text('Arquitectura · Desarrollo · Visualización', cx, 25.0, 0.32, { ls: 0.08, col: GREY });
  row(24.0);
  text('BAHÍA BLANCA 2559', cx, 22.6, 1.05, { w: 600, ls: 0.04 });
  text('CIUDAD AUTÓNOMA DE BUENOS AIRES', cx, 21.4, 0.34, { ls: 0.12 });
  text('Circ. 15 · Secc. 81 · Manz. 70 · Parc. 17 · UF 01', cx, 20.6, 0.28, { col: GREY });
  row(19.7);
  // symbology
  text('SIMBOLOGÍA', TX0 + 0.6, 18.9, 0.38, { align: 'left', w: 600, ls: 0.05 });
  fill(TX0 + 0.6, TX0 + 1.9, 17.7, 18.05, RED);
  text('Muros nuevos', TX0 + 2.3, 17.88, 0.34, { align: 'left' });
  cross(TX0 + 0.6, TX0 + 1.9, 16.75, 17.3, INK);
  rect(TX0 + 0.6, TX0 + 1.9, 16.75, 17.3, 0.012);
  text('Vacío', TX0 + 2.3, 17.03, 0.34, { align: 'left' });
  fill(cx + 0.6, cx + 1.9, 17.7, 18.05, INK);
  text('Muros existentes', cx + 2.3, 17.88, 0.34, { align: 'left' });
  level(cx + 1.05, 17.03, 'Nivel');
  row(16.1);
  // location sketch
  text('CROQUIS DE UBICACIÓN', TX0 + 0.6, 15.3, 0.38, { align: 'left', w: 600, ls: 0.05 });
  const bx0 = TX0 + 3.6;
  const bx1 = TX1 - 3.6;
  const bd0 = 8.4;
  const bd1 = 13.6;
  rect(bx0, bx1, bd0, bd1, 0.03);
  rect(bx0, bx0 + 2.6, 11.6, 12.05, 0.02);
  fill(bx0, bx0 + 2.6, 11.6, 12.05, 'rgba(201,48,42,0.6)');
  text('BAIGORRIA', cx, bd1 + 0.55, 0.32, { ls: 0.08 });
  text('MARCOS SASTRE', cx, bd0 - 0.55, 0.32, { ls: 0.08 });
  text('BAHÍA BLANCA', bx0 - 0.6, (bd0 + bd1) / 2, 0.3, { rot: 90, ls: 0.06 });
  text('J. V. GONZÁLEZ', bx1 + 0.6, (bd0 + bd1) / 2, 0.3, { rot: 90, ls: 0.04 });
  arrow([[TX1 - 1.0, 11.2], [TX1 - 1.0, 12.9]]);
  text('N', TX1 - 1.0, 13.4, 0.32, { w: 600 });
  text('Ancho calle 17,32 m · Ancho acera 3,00 m', cx, 6.9, 0.28, { col: GREY });
  row(6.2);
  // surfaces
  text('SUPERFICIES', TX0 + 0.6, 5.4, 0.38, { align: 'left', w: 600, ls: 0.05 });
  [
    ['A ampliar (planta alta)', '115,58 m²'],
    ['A modificar', '116,58 m²'],
    ['A demoler', '4,33 m²'],
    ['Total del PH', '434,75 m²'],
  ].forEach(([k, v], i) => {
    const d = 4.3 - i * 0.85;
    text(k, TX0 + 0.6, d, 0.36, { align: 'left', w: i === 0 ? 600 : 400 });
    text(v, TX1 - 0.6, d, 0.36, { align: 'right', w: i === 0 ? 600 : 400 });
    line(TX0 + 0.6, d - 0.4, TX1 - 0.6, d - 0.4, 0.008, GREY);
  });
  row(0.4);
  // works
  text('TAREA', TX0 + 0.6, -0.4, 0.28, { align: 'left', col: GREY, ls: 0.06 });
  text('Modificación y ampliación de obra\ncon demolición parcial', TX0 + 3.0, -0.65, 0.36, { align: 'left' });
  text('USO', TX0 + 0.6, -1.9, 0.28, { align: 'left', col: GREY, ls: 0.06 });
  text('Vivienda colectiva · Entre medianeras', TX0 + 3.0, -1.9, 0.36, { align: 'left' });
  row(-2.6);
  text('ESCALA', TX0 + 0.6, -3.3, 0.28, { align: 'left', col: GREY, ls: 0.06 });
  text('1:100', TX0 + 0.6, -4.05, 0.55, { align: 'left', w: 600 });
  text('LÁMINA', cx + 1.4, -3.3, 0.28, { align: 'left', col: GREY, ls: 0.06 });
  text('PA · 01', cx + 1.4, -4.05, 0.55, { align: 'left', w: 600 });
  for (let i = 0; i < 5; i++) fill(TX0 + 0.6 + i, TX0 + 1.6 + i, -5.6, -5.35, i % 2 ? '#f2efe7' : INK);
  rect(TX0 + 0.6, TX0 + 5.6, -5.6, -5.35, 0.012);
  text('0', TX0 + 0.6, -6.0, 0.24);
  text('5 m', TX0 + 5.6, -6.0, 0.24);
  text('Dibujo generado desde el modelo 3D', TX1 - 0.6, -6.9, 0.24, { align: 'right', italic: true, col: GREY });

  return c;
}
