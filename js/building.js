// Bahía Blanca 2559 — model built from the approved permit drawing.
// Plan coordinates in metres: x across the 8.56 m lot (0 = left party wall,
// seen from the street), d into the lot from the street line (L.O.), y up.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Builder } from './builder.js';

export const LOT_W = 8.56;
export const PB_TOP = 4.14; // underside of the new first-floor slab
export const PA_LEVEL = 4.44; // first floor level (+4.44)
export const RISER = 4.19 / 24; // 24 risers from +0.25 to +4.44
export const STREET_PIVOT = LOT_W / 2;
export const LOT_D_L = 48.22; // depth of the lot along the left party wall
export const LOT_D_R = 47.33; // and along the right one

const soft = { line: 'soft' };
const softFurn = { line: 'soft', poche: 'paper' };
const furn = { poche: 'paper' };

export function buildWorld(lib) {
  const pb = new THREE.Group();
  const pa = new THREE.Group();
  const ctx = new THREE.Group();
  const walk = new THREE.Group();
  const road = new THREE.Group();

  const P = new Builder(lib);
  groundFloor(P);
  facadePB(P);
  livingRoom(P);
  P.build(pb);

  const door = new THREE.Group();
  door.position.set(3.23, 0, -0.1);
  const D = new Builder(lib);
  D.box(-0.92, 0, 0.1, 2.25, -0.025, 0.025, 'doorWood', 'facade');
  D.box(-0.84, -0.81, 0.85, 1.75, -0.07, -0.025, 'steel', 'facade');
  D.box(-0.84, -0.81, 0.85, 1.75, 0.025, 0.07, 'steel', 'facade');
  D.build(door);
  pb.add(door);

  const A = new Builder(lib);
  firstFloor(A);
  A.build(pa);

  // right pane of the right balcony window, slides open towards the left
  const pane = new THREE.Group();
  const W = new Builder(lib);
  W.box(6.0, 6.82, 0.03, 2.35, 0.115, 0.125, 'glass', 'facade', { cast: false });
  W.box(5.97, 6.03, 0.03, 2.35, 0.105, 0.135, 'steel', 'facade');
  W.build(pane);
  pa.add(pane);

  // ascensor (the plan's plataforma elevadora, 1.15 x 1.00 m): enclosed car, glazed towards the stair,
  // closed sliding doors on the lobby side; rides from +0.25 to +4.44 next to the stair
  const lift = new THREE.Group();
  const Lb = new Builder(lib);
  const lz = 'sala';
  Lb.box(0.2, 1.22, -0.12, 0, 6.46, 7.2, 'steel', lz);
  Lb.box(0.22, 1.2, 0, 0.012, 6.48, 7.16, 'stone', lz, { cast: false });
  Lb.box(0.2, 1.22, 0, 2.15, 7.14, 7.2, 'oakFurn', lz);
  Lb.box(0.2, 0.25, 0, 2.15, 6.46, 7.14, 'oakFurn', lz);
  // glass front towards the stair, slim steel frame
  Lb.box(0.25, 1.17, 0, 0.12, 6.46, 6.5, 'steel', lz);
  Lb.box(0.25, 1.17, 2.09, 2.15, 6.46, 6.5, 'steel', lz);
  Lb.box(0.25, 1.17, 0.12, 2.09, 6.475, 6.485, 'glass', lz, { cast: false });
  // car doors (lobby side): two telescopic leaves, closed while riding
  Lb.box(1.17, 1.22, 0, 2.15, 6.46, 6.58, 'steel', lz);
  Lb.box(1.17, 1.22, 2.06, 2.15, 6.58, 7.14, 'steel', lz);
  Lb.box(1.18, 1.2, 0, 2.06, 6.58, 6.855, 'steel', lz);
  Lb.box(1.19, 1.21, 0, 2.06, 6.865, 7.14, 'steel', lz);
  // ceiling with a light panel, brass handrails, control panel
  Lb.box(0.2, 1.22, 2.15, 2.22, 6.46, 7.2, 'steel', lz);
  Lb.box(0.38, 1.04, 2.135, 2.15, 6.6, 7.04, 'shade', lz, { cast: false, edges: false });
  Lb.box(0.32, 1.1, 0.9, 0.94, 7.08, 7.12, 'brass', lz);
  Lb.box(0.27, 0.31, 0.9, 0.94, 6.62, 7.08, 'brass', lz);
  Lb.box(0.25, 0.27, 0.98, 1.5, 6.94, 7.1, 'steel', lz);
  for (const y of [1.16, 1.3]) Lb.box(0.27, 0.28, y, y + 0.05, 7.0, 7.04, 'shade', lz, { cast: false, edges: false });
  // sling: car frame to the guide rails at the back of the shaft
  Lb.box(0.26, 0.38, -0.12, 2.36, 7.2, 7.3, 'steel', lz);
  Lb.box(1.04, 1.16, -0.12, 2.36, 7.2, 7.3, 'steel', lz);
  Lb.box(0.26, 1.16, 2.22, 2.36, 7.2, 7.3, 'steel', lz);
  Lb.build(lift);
  const liftLight = new THREE.PointLight('#ffd2a0', 0, 2.6, 2);
  liftLight.position.set(0.71, 1.9, -6.85);
  lift.add(liftLight);
  lift.position.y = 0.25;
  pb.add(lift);

  // practical lights upstairs: dining pendant, living lamp, bedside lamps
  const paLights = [
    [2.05, 1.6, -2.6, 3.5],
    [7.12, 1.55, -4.35, 2.5],
    [0.41, 0.85, -13.93, 1.2],
    [2.63, 0.85, -13.93, 1.2],
  ].map(([x, y, zz, k]) => {
    const l = new THREE.PointLight('#ffb36b', 0, 0, 2);
    l.position.set(x, y, zz);
    l.userData.k = k;
    pa.add(l);
    return l;
  });

  const C = new Builder(lib);
  neighbours(C);
  C.build(ctx);

  const S = new Builder(lib);
  S.box(-20, 28.56, -0.16, 0, -3.0, 0, 'vereda', 'street', { cast: false });
  S.box(-20, 28.56, -0.3, 0, -3.14, -3.0, 'concrete', 'street', { cast: false });
  S.box(7.4, 8.4, -0.16, -0.02, -3.0, -2.2, 'paper', 'ctx', { ...soft, cast: false });
  S.build(walk, -STREET_PIVOT);
  walk.position.x = STREET_PIVOT;

  const R = new Builder(lib);
  R.box(-20, 28.56, -0.34, -0.16, -20.3, -3.14, 'asphalt', 'street', { cast: false, edges: false });
  R.box(-20, 28.56, -0.3, 0, -20.44, -20.3, 'concrete', 'street', { cast: false });
  R.box(-20, 28.56, -0.16, 0, -23.44, -20.44, 'vereda', 'street', { cast: false });
  R.build(road, -STREET_PIVOT);
  road.position.x = STREET_PIVOT;

  const lamp = new THREE.PointLight('#ffb36b', 0, 0, 2);
  lamp.position.set(3.12, 1.6, -4.75);
  pb.add(lamp);

  return { pb, pa, ctx, walk, road, door, lamp, pane, paLights, lift, liftLight };
}

/* ------------------------------------------------------------------ */
/* Planta baja                                                         */
/* ------------------------------------------------------------------ */
function groundFloor(b) {
  const H = PB_TOP;
  // the whole lot, from the street line to the back (48.22 m left, 47.33 m right), and party walls
  b.slab([[0, 0.2], [LOT_W, 0.2], [LOT_W, LOT_D_R], [0, LOT_D_L]], null, -0.16, 0, 'paper', 'pb', { ...soft, cast: false });
  b.box(0, 0.15, 0, H, 0.2, 6.3, 'plaster', 'sala');
  b.box(0, 0.15, 0, H, 6.3, 23.31, 'paper', 'pb', soft);
  b.box(8.41, LOT_W, 0, H, 0.2, 23.31, 'paper', 'pb', soft);

  // behind the living room: lift shaft and lobby (covered), patio under the light well, bathroom PB|02
  b.wall('d', 6.45, 7.6, 1.27, 1.37, 0, H, [[6.6, 7.5, 0.25, 2.35]], 'plaster', 'sala');
  // guide rails of the lift, from the pit to the machine head upstairs
  for (const x of [0.28, 1.06]) {
    b.box(x, x + 0.08, -0.1, PA_LEVEL + 2.62, 7.3, 7.36, 'steel', 'sala', { edges: 40 });
    b.box(x + 0.03, x + 0.05, -0.1, PA_LEVEL + 2.62, 7.36, 7.44, 'steel', 'sala', { edges: 40 });
    for (let y = 0.9; y < PA_LEVEL + 2.4; y += 1.6) b.box(x - 0.02, x + 0.1, y, y + 0.08, 7.44, 7.6, 'steel', 'sala');
  }
  b.box(0.15, 1.27, -0.12, 0.0, 6.41, 7.6, 'concrete', 'sala', { cast: false });
  // landing door at +0.25: two closed steel leaves, frame and call button (lobby side)
  b.box(1.37, 1.43, 0.25, 2.41, 6.54, 6.6, 'steel', 'sala');
  b.box(1.37, 1.43, 0.25, 2.41, 7.5, 7.56, 'steel', 'sala');
  b.box(1.37, 1.43, 2.35, 2.41, 6.6, 7.5, 'steel', 'sala');
  b.box(1.37, 1.4, 0.25, 2.35, 6.6, 7.045, 'steel', 'sala');
  b.box(1.37, 1.4, 0.25, 2.35, 7.055, 7.5, 'steel', 'sala');
  b.box(1.37, 1.39, 1.05, 1.3, 6.46, 6.52, 'steel', 'sala');
  b.box(1.385, 1.395, 1.15, 1.2, 6.475, 6.505, 'shade', 'sala', { cast: false, edges: false });
  b.box(0.15, 1.37, 0, H, 7.6, 7.7, 'plaster', 'sala');
  // lobby wall towards the patio, with a glazed door
  b.wall('d', 6.45, 8.3, 2.23, 2.38, 0, H, [[6.95, 7.85, 0.25, 2.35]], 'plaster', 'sala');
  b.box(2.26, 2.35, 0.25, 2.35, 6.95, 6.99, 'steel', 'sala');
  b.box(2.26, 2.35, 0.25, 2.35, 7.81, 7.85, 'steel', 'sala');
  b.box(2.26, 2.35, 2.31, 2.35, 6.99, 7.81, 'steel', 'sala');
  b.box(2.29, 2.31, 0.25, 2.31, 6.99, 7.81, 'glass', 'sala', { cast: false });
  b.box(1.37, 2.23, 0, 0.25, 6.45, 8.15, 'oak', 'sala', { cast: false });
  b.wall('x', 0.15, 2.38, 8.15, 8.3, 0, H, [[1.4, 2.1, 0, 2.1]], 'paper', 'pb', soft);
  b.box(2.23, 2.38, 0, H, 8.3, 9.8, 'paper', 'pb', soft);
  b.box(0.15, 3.59, 0, H, 9.8, 9.95, 'paper', 'pb', soft);
  b.box(0.3, 0.75, 0.25, 0.65, 8.5, 9.0, 'paper', 'pb', softFurn);

  // patios under the light well (plan: 2,70 + 1,20 m, walls h 1,80 m) — open to the sky
  for (const [x0, x1] of [[2.38, 3.44], [5.22, 6.36]]) {
    b.box(x0, x1, 0, 0.03, 6.45, 9.8, 'paper', 'pb', { ...soft, cast: false });
    b.box(x0, x1, 0, 1.8, 8.65, 8.75, 'paper', 'pb', soft);
    b.box((x0 + x1) / 2 - 0.08, (x0 + x1) / 2 + 0.08, 0.03, 0.035, 7.5, 7.66, 'steel', 'pb', { cast: false });
  }

  // common passage (1.20 m) and unit 2 at the front
  b.box(5.07, 5.22, 0, H, 0.2, 6.3, 'paper', 'pb', soft);
  b.box(3.44, 3.59, 0, 1.8, 6.45, 9.8, 'paper', 'pb', soft);
  b.box(5.07, 5.22, 0, 1.8, 6.3, 9.95, 'paper', 'pb', soft);
  b.wall('x', 5.22, 6.51, 6.3, 6.45, 0, H, [[5.45, 6.15, 1.0, 2.2]], 'paper', 'pb', soft);
  b.wall('d', 6.45, 9.8, 6.36, 6.51, 0, H, [[7.0, 7.8, 0, 2.1]], 'paper', 'pb', soft);
  b.wall('x', 6.51, 8.41, 8.25, 8.4, 0, H, [[6.9, 7.6, 0, 2.1]], 'paper', 'pb', soft);
  b.box(5.07, 8.41, 0, H, 9.8, 9.95, 'paper', 'pb', soft);
  b.box(7.8, 8.41, 0, 0.9, 3.0, 5.6, 'paper', 'pb', softFurn);
  b.box(5.6, 7.4, 0, 0.42, 1.2, 2.1, 'paper', 'pb', softFurn);
  // gate inside the semi-covered hall
  b.box(3.59, 5.07, 0, 0.05, 1.9, 1.96, 'steel', 'pb', soft);
  b.box(3.59, 5.07, 2.35, 2.4, 1.9, 1.96, 'steel', 'pb', soft);
  b.box(4.31, 4.35, 0.05, 2.35, 1.9, 1.96, 'steel', 'pb', soft);
  b.box(3.59, 5.07, 0.05, 2.35, 1.92, 1.94, 'glass', 'pb', { ...soft, cast: false });
  b.box(3.59, 5.07, 2.4, H, 1.9, 1.96, 'paper', 'pb', soft);

  // units 3 and 4 (existing, to be modified)
  const doorUF = [[17.2, 18.1, 0, 2.1]];
  b.wall('d', 9.95, 23.16, 3.59, 3.74, 0, H, doorUF, 'paper', 'pb', soft);
  b.wall('d', 9.95, 23.16, 4.93, 5.08, 0, H, doorUF, 'paper', 'pb', soft);
  for (const [x0, x1, flip] of [[0.15, 3.59, false], [5.08, 8.41, true]]) {
    const bx0 = flip ? 6.36 : 0.15;
    const bx1 = flip ? 8.41 : 2.36;
    b.wall('x', bx0, bx1, 11.9, 12.05, 0, H, [[flip ? 6.9 : 1.4, flip ? 7.6 : 2.1, 0, 2.1]], 'paper', 'pb', soft);
    b.box(flip ? 6.36 : 2.21, flip ? 6.51 : 2.36, 0, H, 9.95, 11.9, 'paper', 'pb', soft);
    b.wall('x', flip ? 5.08 : 2.36, flip ? 6.36 : 3.59, 11.3, 11.45, 0, H, [[flip ? 5.3 : 2.6, flip ? 6.1 : 3.4, 1.0, 2.2]], 'paper', 'pb', soft);
    b.wall('x', x0, x1, 23.16, 23.31, 0, H, [[flip ? 6.0 : 1.4, flip ? 6.9 : 2.3, 0, 2.1]], 'paper', 'pb', soft);
    const k = (v) => (flip ? 8.56 - v : v);
    const xs = (a, c) => [Math.min(k(a), k(c)), Math.max(k(a), k(c))];
    b.box(...xs(0.15, 0.75), 0, 0.9, 13.0, 16.2, 'paper', 'pb', softFurn);
    b.box(...xs(1.3, 2.4), 0, 0.75, 14.4, 15.6, 'paper', 'pb', softFurn);
    b.box(...xs(0.45, 2.05), 0, 0.5, 20.9, 22.95, 'paper', 'pb', softFurn);
    b.box(...xs(0.15, 3.0), 0, 1.0, 18.3, 18.42, 'paper', 'pb', soft);
  }
  rearOfLot(b);
}

/* ------------------------------------------------------------------ */
/* Rest of the PH, existing and untouched (white model): 4,00 m of     */
/* aire y luz, the two units at the back with their upper floor, and   */
/* the back patios up to the end of the lot.                           */
/* ------------------------------------------------------------------ */
function rearOfLot(b) {
  const z = 'pb';
  const o = soft;
  const f = softFurn;
  const mirror = (x0, x1) => [LOT_W - x1, LOT_W - x0];
  const both = (fn) => {
    fn((x0, x1) => [x0, x1], false);
    fn(mirror, true);
  };
  const glass = (axis, a0, a1, y0, y1, t) => {
    if (axis === 'x') b.box(a0, a1, y0, y1, t - 0.01, t + 0.01, 'glass', z, { cast: false, edges: false });
    else b.box(t - 0.01, t + 0.01, y0, y1, a0, a1, 'glass', z, { cast: false, edges: false });
  };

  // aire y luz (d 23.31 → 27.31): patios of 2,90 and 1,00 m with walls h 2,00 m, the passage goes on
  const A0 = 23.31;
  const A1 = 27.31;
  b.box(0, 0.15, 0, 3.0, A0, A1, 'paper', z, o);
  b.box(8.41, LOT_W, 0, 3.0, A0, A1, 'paper', z, o);
  b.box(3.59, 3.74, 0, 2.0, A0, 26.21, 'paper', z, o);
  b.box(4.93, 5.08, 0, 2.0, A0, 26.21, 'paper', z, o);
  b.box(0.15, 3.74, 0, 2.0, 26.21, 26.31, 'paper', z, o);
  b.box(4.93, 8.41, 0, 2.0, 26.21, 26.31, 'paper', z, o);
  // the passage opens up towards the hall of the back units
  for (const [xa, xb] of [[3.66, 3.33], [5.0, 5.23]]) {
    const len = Math.hypot(xb - xa, 1.0);
    const g = new THREE.BoxGeometry(0.15, 2.0, len);
    g.rotateY(Math.atan2(xa - xb, 1.0));
    g.translate((xa + xb) / 2, 1.0, -(26.31 + A1) / 2);
    b.geo(g, null, 'paper', z, o);
  }

  // the two units at the back: PB 3,02 m, upper floor at +3,45, roof +6,71
  const B0 = A1;
  const B1 = 35.53;
  const TOP = 6.71;
  const PA = 3.45;
  b.box(0, 0.15, 0, TOP, B0, B1, 'paper', z, o);
  b.box(8.41, LOT_W, 0, TOP, B0, B1, 'paper', z, o);
  // front wall: hall entrance, a window per unit, upper windows of the front bedrooms
  const front = [[3.38, 5.18, 0, 2.3], [0.9, 2.6, 1.0, 2.2], [5.96, 7.66, 1.0, 2.2], [1.0, 2.6, PA + 0.9, PA + 2.1], [5.96, 7.56, PA + 0.9, PA + 2.1]];
  b.wall('x', 0.15, 8.41, B0, B0 + 0.15, 0, TOP, front, 'paper', z, o);
  for (const [x0, x1, y0, y1] of front.slice(1)) glass('x', x0, x1, y0, y1, B0 + 0.075);
  // back wall: a door and a window per unit to its patio, upper windows of the back bedrooms
  const back = [];
  both((m) => {
    back.push([...m(0.8, 1.6), 0, 2.1], [...m(2.0, 3.2), 1.0, 2.2], [...m(0.9, 2.6), PA + 0.9, PA + 2.1]);
  });
  back.sort((p, q) => p[0] - q[0]);
  b.wall('x', 0.15, 8.41, B1 - 0.15, B1, 0, TOP, back, 'paper', z, o);
  for (const [x0, x1, y0, y1] of back) if (y0 > 0) glass('x', x0, x1, y0, y1, B1 - 0.075);
  for (const [x0, x1, y0] of back) if (y0 === 0) b.box(x0, x1, 0, 2.1, B1 - 0.12, B1 - 0.1, 'paper', z, o);
  // party wall between the units, upper floor slab with the stair openings, roof
  b.box(4.2, 4.36, 0, TOP, 29.27, B1 - 0.15, 'paper', z, o);
  b.slab(
    [[0.15, B0 + 0.15], [8.41, B0 + 0.15], [8.41, B1 - 0.15], [0.15, B1 - 0.15]],
    [[3.3, 4.2, 30.9, 33.4], [4.36, 5.26, 30.9, 33.4]],
    3.02, PA, 'paper', z, o,
  );
  b.box(0, LOT_W, 6.5, TOP, B0, B1, 'paper', z, o);
  b.box(0, LOT_W, TOP, TOP + 0.25, B0, B0 + 0.12, 'paper', z, o);
  b.box(0, LOT_W, TOP, TOP + 0.25, B1 - 0.12, B1, 'paper', z, o);
  // common hall (2,00 x 1,71 m) with a door to each unit
  b.wall('d', B0 + 0.15, 29.27, 3.28, 3.38, 0, 3.02, [[28.0, 28.85, 0, 2.1]], 'paper', z, o);
  b.wall('d', B0 + 0.15, 29.27, 5.18, 5.28, 0, 3.02, [[28.0, 28.85, 0, 2.1]], 'paper', z, o);
  b.box(3.28, 5.28, 0, 3.02, 29.17, 29.27, 'paper', z, o);
  // each unit: estar · comedor · cocina · lavadero, WC under the stair, straight stair to +3,45
  both((m) => {
    b.box(...m(0.15, 0.75), 0, 0.9, 29.6, 32.2, 'paper', z, f);
    b.box(...m(0.15, 0.75), 0.9, 0.94, 29.6, 32.2, 'stone', z, f);
    b.box(...m(1.2, 2.4), 0, 0.75, 32.6, 33.6, 'paper', z, f);
    b.wall('d', 29.27, 30.85, ...m(3.2, 3.3), 0, 2.2, [[29.6, 30.3, 0, 2.0]], 'paper', z, o);
    b.box(...m(3.3, 4.2), 0, 2.2, 30.75, 30.85, 'paper', z, o);
    b.cyl((m(3.75, 3.75)[0]), 29.6, 0, 0.42, 0.19, 'ceramic', z, { ...f, seg: 20 });
    const n = 18;
    const run = (35.2 - 30.9) / n;
    for (let i = 0; i < n; i++) {
      const d1 = 35.2 - i * run;
      b.box(...m(3.3, 4.2), Math.max(0, (i + 1) * (PA / n) - 0.2), (i + 1) * (PA / n), d1 - run, d1, 'paper', z, f);
    }
  });

  // back patios (about 12 m) divided by a wall h 2,00 m; party walls and back wall h 3,00 m
  const C0 = B1;
  b.box(0, 0.15, 0, 3.0, C0, LOT_D_L, 'paper', z, o);
  b.box(8.41, LOT_W, 0, 3.0, C0, LOT_D_R, 'paper', z, o);
  b.box(4.21, 4.35, 0, 2.0, C0, (LOT_D_L + LOT_D_R) / 2 - 0.1, 'paper', z, o);
  {
    const len = Math.hypot(LOT_W, LOT_D_L - LOT_D_R);
    const g = new THREE.BoxGeometry(len, 3.0, 0.15);
    g.rotateY(-Math.atan2(LOT_D_L - LOT_D_R, LOT_W));
    g.translate(LOT_W / 2, 1.5, -((LOT_D_L + LOT_D_R) / 2 - 0.075));
    b.geo(g, null, 'paper', z, o);
  }
}

/* ------------------------------------------------------------------ */
/* Street front of the ground floor ("fino + pintura", pilasters)      */
/* ------------------------------------------------------------------ */
function facadePB(b) {
  const F = 'facadePB';
  const z = 'facade';
  b.wall('x', 0, LOT_W, 0, 0.2, 0, PB_TOP, [
    [0.42, 2.1, 0.9, 2.2],
    [2.27, 3.27, 0, 2.3],
    [3.74, 4.8, 0, 3.05],
    [5.28, 6.3, 0, 2.3],
    [6.45, 8.12, 0.9, 2.2],
  ], F, z);
  for (const [x0, x1] of [[0, 0.32], [3.42, 3.74], [4.8, 5.12], [8.24, LOT_W]]) {
    b.box(x0, x1, 0.45, 3.9, -0.07, 0, F, z);
    b.box(x0 - (x0 > 0 ? 0.03 : 0), x1 + (x1 < LOT_W ? 0.03 : 0), 0, 0.45, -0.1, 0, F, z);
  }
  b.box(0, LOT_W, 3.9, PB_TOP, -0.14, 0, F, z);
  for (const [x0, x1] of [[0.32, 3.42], [3.74, 4.8], [5.12, 8.24]]) b.box(x0, x1, 3.05, 3.15, -0.04, 0, F, z);

  const molding = (x0, x1, y0, y1, sill) => {
    b.box(x0 - 0.1, x1 + 0.1, y1, y1 + 0.1, -0.03, 0, F, z);
    b.box(x0 - 0.1, x0, y0, y1, -0.03, 0, F, z);
    b.box(x1, x1 + 0.1, y0, y1, -0.03, 0, F, z);
    if (sill) b.box(x0 - 0.12, x1 + 0.12, y0 - 0.08, y0, -0.07, 0, F, z);
  };
  molding(0.42, 2.1, 0.9, 2.2, true);
  molding(6.45, 8.12, 0.9, 2.2, true);
  b.box(2.2, 2.27, 0, 2.3, -0.03, 0, F, z);
  b.box(3.27, 3.37, 0, 2.3, -0.03, 0, F, z);
  b.box(2.2, 3.37, 2.3, 2.4, -0.03, 0, F, z);
  b.box(2.32, 3.22, 2.5, 2.72, -0.03, 0, F, z);
  b.box(5.21, 5.28, 0, 2.3, -0.03, 0, F, z);
  b.box(6.3, 6.4, 0, 2.3, -0.03, 0, F, z);
  b.box(5.21, 6.4, 2.3, 2.4, -0.03, 0, F, z);
  b.box(5.33, 6.25, 2.5, 2.72, -0.03, 0, F, z);
  // meters (luz / gas)
  b.box(0.45, 0.78, 0.22, 0.7, -0.06, 0, 'steel', z);
  b.box(7.55, 8.05, 0, 0.74, -0.07, 0, F, z);
  // thresholds
  b.box(2.22, 3.32, 0, 0.08, -0.22, 0.2, 'stone', z);
  b.box(5.23, 6.35, 0, 0.08, -0.22, 0.2, 'stone', z);

  // windows: black steel frames, single mullion
  for (const [x0, x1] of [[0.42, 2.1], [6.45, 8.12]]) {
    const mid = (x0 + x1) / 2;
    b.box(x0, x1, 2.15, 2.2, 0.06, 0.14, 'steel', z);
    b.box(x0, x1, 0.9, 0.95, 0.06, 0.14, 'steel', z);
    b.box(x0, x0 + 0.05, 0.95, 2.15, 0.06, 0.14, 'steel', z);
    b.box(x1 - 0.05, x1, 0.95, 2.15, 0.06, 0.14, 'steel', z);
    b.box(mid - 0.025, mid + 0.025, 0.95, 2.15, 0.06, 0.14, 'steel', z);
    b.box(x0 + 0.05, x1 - 0.05, 0.95, 2.15, 0.095, 0.105, 'glass', z, { cast: false });
  }
  // door frames (UF1 opens, UF2 stays closed)
  b.box(2.27, 2.31, 0, 2.3, 0, 0.2, 'steel', z);
  b.box(3.23, 3.27, 0, 2.3, 0, 0.2, 'steel', z);
  b.box(2.27, 3.27, 2.26, 2.3, 0, 0.2, 'steel', z);
  b.box(5.28, 5.32, 0, 2.3, 0, 0.2, 'steel', z);
  b.box(6.26, 6.3, 0, 2.3, 0, 0.2, 'steel', z);
  b.box(5.28, 6.3, 2.26, 2.3, 0, 0.2, 'steel', z);
  b.box(5.32, 6.26, 0.1, 2.25, 0.075, 0.125, 'doorWood', z);
  b.box(5.4, 5.43, 0.85, 1.75, 0.03, 0.075, 'steel', z);
}

/* ------------------------------------------------------------------ */
/* PB|01 — Sala de estar, 3.29 x 6.20 m, 4.03 m high, stair to +4.44    */
/* ------------------------------------------------------------------ */
function livingRoom(b) {
  const z = 'sala';
  b.box(0.15, 3.44, 0, 0.25, 0.2, 6.3, 'oak', z, { cast: false });
  b.box(3.44, 3.59, 0, PB_TOP, 0.2, 5.3, 'plaster', z);
  b.box(3.44, 3.59, 0, 3.5, 5.3, 6.3, 'plaster', z);
  // back wall: door to the lift lobby, window to the patio
  b.wall('x', 1.27, 3.44, 6.3, 6.45, 0, PB_TOP, [[1.42, 2.18, 0, 2.45], [2.55, 3.25, 1.0, 2.3]], 'plaster', z);
  b.box(2.55, 3.25, 1.0, 1.03, 6.32, 6.43, 'steel', z);
  b.box(2.55, 3.25, 2.27, 2.3, 6.32, 6.43, 'steel', z);
  b.box(2.55, 2.58, 1.03, 2.27, 6.32, 6.43, 'steel', z);
  b.box(3.22, 3.25, 1.03, 2.27, 6.32, 6.43, 'steel', z);
  b.box(2.58, 3.22, 1.03, 2.27, 6.37, 6.38, 'glass', z, { cast: false });
  // glazed lift shaft (plataforma elevadora 1.15 x 1.00 m)
  b.box(0.15, 1.27, 0.25, PB_TOP, 6.36, 6.38, 'glass', z, { cast: false });
  for (const x of [0.15, 0.69, 1.21]) b.box(x, x + 0.06, 0.25, PB_TOP, 6.33, 6.41, 'steel', z);
  for (const y of [0.25, 2.2, PB_TOP - 0.06]) b.box(0.15, 1.27, y, y + 0.06, 6.33, 6.41, 'steel', z);
  b.box(0.15, 3.44, 4.1, 4.13, 0.2, 5.05, 'plaster', z);
  b.box(0.15, 3.44, 0.25, 0.33, 0.2, 0.22, 'oakFurn', z, { edges: false });

  // stair: floating concrete treads, 11 + corner + 11, last riser lands on the slab
  const tread = (x0, x1, d0, d1, top) => b.box(x0, x1, Math.max(0.25, top - 0.3), top, d0, d1, 'concrete', z);
  const d1 = 2.6;
  const run = (5.3 - d1) / 11;
  for (let i = 1; i <= 11; i++) tread(0.15, 1.15, d1 + (i - 1) * run, d1 + i * run, 0.25 + i * RISER);
  tread(0.15, 1.15, 5.3, 6.3, 0.25 + 12 * RISER);
  for (let i = 13; i <= 23; i++) {
    const x0 = 1.15 + (i - 13) * 0.26;
    tread(x0, x0 + 0.26, 5.3, 6.3, 0.25 + i * RISER);
  }
  // handrails 1.10 m, black steel
  const rail = 0.92;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  {
    const ya = 0.25 + RISER + rail;
    const yb = 0.25 + 11 * RISER + rail;
    const len = Math.hypot(5.3 - d1, yb - ya);
    q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.atan2(yb - ya, 5.3 - d1));
    m.compose(new THREE.Vector3(1.13, (ya + yb) / 2, -(d1 + 5.3) / 2), q, new THREE.Vector3(1, 1, 1));
    b.geo(new THREE.BoxGeometry(0.035, 0.045, len), m, 'steel', z);
    for (let i = 1; i <= 11; i += 2) {
      const dc = d1 + (i - 0.5) * run;
      const top = 0.25 + i * RISER;
      b.box(1.12, 1.14, top, ya + ((dc - d1) / (5.3 - d1)) * (yb - ya), dc - 0.01, dc + 0.01, 'steel', z);
    }
  }
  {
    const xa = 1.15;
    const xb = 4.01;
    const ya = 0.25 + 13 * RISER + rail;
    const yb = 0.25 + 23 * RISER + rail;
    const len = Math.hypot(xb - xa, yb - ya);
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.atan2(yb - ya, xb - xa));
    m.compose(new THREE.Vector3((xa + xb) / 2, (ya + yb) / 2, -5.32), q, new THREE.Vector3(1, 1, 1));
    b.geo(new THREE.BoxGeometry(len, 0.045, 0.035), m, 'steel', z);
    for (let i = 13; i <= 23; i += 2) {
      const xc = 1.15 + (i - 12.5) * 0.26;
      const top = 0.25 + i * RISER;
      b.box(xc - 0.01, xc + 0.01, top, ya + ((xc - xa) / (xb - xa)) * (yb - ya), 5.31, 5.33, 'steel', z);
    }
  }

  // furniture
  b.box(0.5, 2.65, 0.25, 0.262, 1.15, 3.35, 'rug', z, { cast: false, poche: 'paper' });
  // sofa under the street window, facing the room
  b.box(0.5, 2.2, 0.25, 0.33, 0.33, 0.97, 'steel', z, furn);
  b.box(0.42, 2.28, 0.33, 0.48, 0.28, 1.05, 'fabric', z, furn);
  b.box(0.6, 1.4, 0.48, 0.66, 0.46, 1.05, 'fabric', z, furn);
  b.box(1.42, 2.1, 0.48, 0.66, 0.46, 1.05, 'fabric', z, furn);
  b.box(0.6, 2.1, 0.48, 1.0, 0.28, 0.46, 'fabric', z, furn);
  b.box(0.42, 0.6, 0.48, 0.76, 0.28, 1.05, 'fabric', z, furn);
  b.box(2.1, 2.28, 0.48, 0.76, 0.28, 1.05, 'fabric', z, furn);
  b.box(0.7, 1.32, 0.66, 0.98, 0.48, 0.62, 'fabric', z, furn);
  b.box(1.5, 2.0, 0.66, 0.98, 0.48, 0.62, 'fabric', z, furn);
  // round travertine coffee table
  b.cyl(1.45, 1.75, 0.58, 0.63, 0.34, 'stone', z, furn);
  b.cyl(1.45, 1.75, 0.25, 0.58, 0.17, 'stone', z, { ...furn, r2: 0.2 });
  b.cyl(1.35, 1.66, 0.63, 0.7, 0.07, 'ceramic', z, { ...furn, seg: 28 });
  // leather lounge chair facing the sofa
  lounge(b, 2.3, 3.0, -2.0);
  // 2 bicycle spaces against the hall wall (plan: Art. 3.8.8.7, C.E.)
  bike(b, 3.22, 2.4, z);
  bike(b, 2.94, 2.4, z);
  b.box(3.4, 3.44, 1.55, 1.6, 2.3, 4.25, 'steel', z);
  // floor lamp
  b.cyl(3.12, 4.75, 0.25, 0.27, 0.16, 'steel', z, furn);
  b.cyl(3.12, 4.75, 0.27, 1.45, 0.012, 'brass', z, { ...furn, seg: 12, edges: 40 });
  b.cyl(3.12, 4.75, 1.42, 1.74, 0.21, 'shade', z, { ...furn, open: true, cast: false });
  // floor vase with dry branches
  const vase = new THREE.LatheGeometry(
    [[0, 0], [0.15, 0], [0.21, 0.16], [0.2, 0.42], [0.11, 0.58], [0.085, 0.64], [0.095, 0.67]].map(([x, y]) => new THREE.Vector2(x, y)),
    32,
  );
  vase.translate(0.6, 0.25, -2.28);
  b.geo(vase, null, 'clay', z, { ...furn, edges: 12 });
  const branch = (len, ax, az) => {
    const g = new THREE.CylinderGeometry(0.006, 0.01, len, 6);
    g.translate(0, len / 2, 0);
    const mm = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(ax, 0, az));
    mm.setPosition(0.6, 0.86, -2.28);
    b.geo(g, mm, 'branch', z, { ...furn, edges: 40 });
  };
  branch(1.45, 0.12, 0.18);
  branch(1.2, -0.25, -0.1);
  branch(1.6, 0.05, -0.32);
  branch(1.05, -0.4, 0.35);
  branch(1.3, 0.35, 0.05);
  // art on the hall wall, above the bicycles
  b.box(3.4, 3.44, 1.75, 2.75, 2.85, 4.05, 'art', z, furn);
  // oak sideboard under the stair
  b.box(1.25, 2.25, 0.25, 0.85, 5.78, 6.28, 'oakFurn', z, furn);
  b.cyl(1.6, 6.02, 0.85, 1.05, 0.11, 'ceramic', z, { ...furn, r2: 0.07, seg: 28 });
}

function lounge(b, cx, cd, rot, zone = 'sala', base = 0.25) {
  const M = new THREE.Matrix4().makeRotationY(rot).setPosition(cx, base - 0.25, -cd);
  const part = (w, h, dp, x, y, zz, mat) => {
    const g = new THREE.BoxGeometry(w, h, dp);
    g.translate(x, y, zz);
    b.geo(g, M, mat, zone, furn);
  };
  part(0.74, 0.5, 0.06, 0, 0.5, 0.36, 'oakFurn');
  part(0.74, 0.5, 0.06, 0, 0.5, -0.36, 'oakFurn');
  part(0.66, 0.12, 0.66, 0.02, 0.6, 0, 'leather');
  part(0.14, 0.5, 0.66, -0.3, 0.9, 0, 'leather');
  part(0.08, 0.08, 0.66, 0.33, 0.29, 0, 'oakFurn');
}

// City bicycle standing along the wall, wheels in the plane x = const (base +0.25).
function bike(b, x, dRear, zone) {
  const o = { poche: 'paper', edges: 40 };
  const y0 = 0.25 + 0.34;
  const P = (d, y) => new THREE.Vector3(x, y0 + y, -(dRear + 0.34 + d));
  const tube = (a, c, r = 0.014, mat = 'steel') => {
    const len = a.distanceTo(c);
    const g = new THREE.CylinderGeometry(r, r, len, 8);
    const m = new THREE.Matrix4().lookAt(a, c, new THREE.Vector3(0, 1, 0));
    g.rotateX(Math.PI / 2);
    g.applyMatrix4(m);
    g.translate((a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2);
    b.geo(g, null, mat, zone, o);
  };
  for (const d of [0, 1.06]) {
    const w = new THREE.TorusGeometry(0.32, 0.022, 8, 40);
    w.rotateY(Math.PI / 2);
    w.translate(x, y0, -(dRear + 0.34 + d));
    b.geo(w, null, 'leather', zone, o);
    tube(P(d, 0).add(new THREE.Vector3(-0.04, 0, 0)), P(d, 0).add(new THREE.Vector3(0.04, 0, 0)), 0.02);
  }
  const rear = P(0, 0);
  const bb = P(0.44, -0.04);
  const seat = P(0.3, 0.5);
  const head = P(0.94, 0.46);
  const headLow = P(0.97, 0.3);
  tube(rear, bb);
  tube(rear, seat);
  tube(bb, seat, 0.016);
  tube(seat, head, 0.016);
  tube(bb, headLow, 0.018);
  tube(headLow, P(1.06, 0));
  tube(head, P(0.92, 0.6));
  tube(P(0.92, 0.6).add(new THREE.Vector3(-0.24, 0, 0)), P(0.92, 0.6).add(new THREE.Vector3(0.24, 0, 0)), 0.012);
  tube(seat, P(0.27, 0.6), 0.012);
  b.box(x - 0.07, x + 0.07, y0 + 0.6, y0 + 0.66, dRear + 0.34 + 0.18, dRear + 0.34 + 0.4, 'leather', zone, o);
  b.cyl(x, dRear + 0.34 + 0.44, y0 - 0.06, y0 - 0.02, 0.1, 'steel', zone, { ...o, seg: 20 });
}

/* ------------------------------------------------------------------ */
/* Planta alta (new, +4.44)                                            */
/* ------------------------------------------------------------------ */
function firstFloor(b) {
  const N = { poche: 'new' };
  const z = 'pa';
  const fz = 'facade';
  // street front: "revestimiento plástico texturado", two sliding windows, balcony
  b.wall('x', 0, LOT_W, 0, 0.2, -0.3, 4.12, [[1.47, 3.27, 0, 2.4], [5.07, 6.87, 0, 2.4]], 'facadePA', fz, N);
  b.box(0, LOT_W, 4.12, 4.17, -0.04, 0.24, 'facadePA', fz, N);
  b.box(0.355, 8.205, -0.22, 0, -1.0, 0, 'facadePA', fz);
  for (let x = 0.42; x < 8.14; x += 0.11) b.box(x, x + 0.018, 0.04, 1.0, -0.97, -0.952, 'steel', fz);
  for (let d = -0.86; d < -0.05; d += 0.11) {
    b.box(0.4, 0.418, 0.04, 1.0, d, d + 0.018, 'steel', fz);
    b.box(8.142, 8.16, 0.04, 1.0, d, d + 0.018, 'steel', fz);
  }
  b.box(0.38, 8.18, 1.0, 1.05, -0.99, -0.93, 'steel', fz);
  b.box(0.38, 0.44, 1.0, 1.05, -0.93, 0, 'steel', fz);
  b.box(8.12, 8.18, 1.0, 1.05, -0.93, 0, 'steel', fz);
  // balcony: two planters and a pair of chairs facing the street
  b.box(0.45, 1.25, 0, 0.45, -0.9, -0.5, 'concrete', fz);
  b.box(0.5, 1.2, 0.45, 0.85, -0.86, -0.54, 'hedge', fz);
  b.box(7.3, 8.1, 0, 0.45, -0.9, -0.5, 'concrete', fz);
  b.box(7.35, 8.05, 0.45, 0.85, -0.86, -0.54, 'hedge', fz);
  for (const x of [2.2, 3.0]) {
    b.box(x, x + 0.55, 0.38, 0.44, -0.75, -0.25, 'oakFurn', fz);
    b.box(x, x + 0.55, 0.44, 0.86, -0.27, -0.21, 'oakFurn', fz);
    b.box(x, x + 0.04, 0, 0.38, -0.75, -0.21, 'steel', fz);
    b.box(x + 0.51, x + 0.55, 0, 0.38, -0.75, -0.21, 'steel', fz);
  }
  for (const [x0, x1] of [[1.47, 3.27], [5.07, 6.87]]) {
    const mid = (x0 + x1) / 2;
    b.box(x0, x1, 2.35, 2.4, 0.06, 0.14, 'steel', fz);
    b.box(x0, x1, 0, 0.03, 0.06, 0.14, 'steel', fz);
    b.box(x0, x0 + 0.05, 0.03, 2.35, 0.06, 0.14, 'steel', fz);
    b.box(x1 - 0.05, x1, 0.03, 2.35, 0.06, 0.14, 'steel', fz);
    b.box(mid - 0.03, mid + 0.03, 0.03, 2.35, 0.07, 0.1, 'steel', fz);
    b.box(x0 + 0.05, mid - 0.03, 0.03, 2.35, 0.08, 0.09, 'glass', fz, { cast: false });
    // the right pane of the right window slides open (see buildWorld)
    if (x0 < 4) b.box(mid + 0.03, x1 - 0.05, 0.03, 2.35, 0.115, 0.125, 'glass', fz, { cast: false });
  }

  // smooth interior lining of the street wall
  b.wall('x', 0.15, 8.41, 0.2, 0.215, 0, 3.0, [[1.47, 3.27, 0, 2.4], [5.07, 6.87, 0, 2.4]], 'plaster', z, N);
  // floor slab (microcement) with the stair opening and the light well
  b.slab(
    [[0.15, 0.2], [8.41, 0.2], [8.41, 23.16], [0.15, 23.16], [0.15, 7.6], [1.27, 7.6], [1.27, 6.35], [4.01, 6.35], [4.01, 5.05], [0.15, 5.05]],
    [[2.35, 6.21, 6.5, 10.1]],
    -0.3, 0, 'concrete', z, { poche: 'ink' },
  );
  b.box(0, 0.15, -0.3, 4.12, 0.2, 14.33, 'plaster', z, N);
  b.box(8.41, LOT_W, -0.3, 4.12, 0.2, 14.33, 'plaster', z, N);
  b.wall('x', 0.15, 8.41, 14.18, 14.33, 0, 4.12, [[0.6, 2.6, 0.9, 2.2], [3.5, 4.4, 1.5, 2.2], [5.0, 7.0, 0.9, 2.2], [7.45, 8.3, 0, 2.2]], 'plaster', z, N);
  // window frames towards the terrace
  for (const [x0, x1, y0] of [[0.6, 2.6, 0.9], [3.5, 4.4, 1.5], [5.0, 7.0, 0.9]]) {
    b.box(x0, x1, y0, y0 + 0.04, 14.2, 14.31, 'steel', z);
    b.box(x0, x1, 2.16, 2.2, 14.2, 14.31, 'steel', z);
    b.box(x0, x0 + 0.04, y0, 2.2, 14.2, 14.31, 'steel', z);
    b.box(x1 - 0.04, x1, y0, 2.2, 14.2, 14.31, 'steel', z);
    b.box(x0 + 0.04, x1 - 0.04, y0 + 0.04, 2.16, 14.25, 14.26, 'glass', z, { cast: false });
  }
  b.box(7.45, 7.49, 0, 2.2, 14.18, 14.33, 'steel', z);
  b.box(8.26, 8.3, 0, 2.2, 14.18, 14.33, 'steel', z);
  b.box(7.45, 8.3, 2.16, 2.2, 14.18, 14.33, 'steel', z);
  // roof slab (3.00 m ceilings) with the light well
  b.slab([[0.15, 0.2], [8.41, 0.2], [8.41, 14.18], [0.15, 14.18]], [[2.2, 6.36, 6.35, 10.25]], 3.0, 3.3, 'plaster', z, N);

  // light well 4.00 x 4.00 with 1.50 x 0.60 windows
  b.wall('x', 2.2, 6.36, 6.35, 6.5, 0, 4.12, [[3.53, 5.03, 1.5, 2.1]], 'plaster', z, N);
  b.wall('x', 2.2, 6.36, 10.1, 10.25, 0, 4.12, [[3.53, 5.03, 1.5, 2.1]], 'plaster', z, N);
  b.box(2.2, 2.35, 0, 4.12, 6.5, 10.1, 'plaster', z, N);
  b.wall('d', 6.5, 10.1, 6.21, 6.36, 0, 4.12, [[7.55, 9.05, 1.5, 2.1]], 'plaster', z, N);
  for (const [axis, a0, a1, t0, t1] of [['x', 3.53, 5.03, 6.4, 6.45], ['x', 3.53, 5.03, 10.15, 10.2], ['d', 7.55, 9.05, 6.26, 6.31]]) {
    const ax = (u0, u1, y0, y1, v0, v1, mat, o) => (axis === 'x' ? b.box(u0, u1, y0, y1, v0, v1, mat, z, o) : b.box(v0, v1, y0, y1, u0, u1, mat, z, o));
    ax(a0, a1, 1.5, 1.53, t0 - 0.03, t1 + 0.03, 'steel');
    ax(a0, a1, 2.07, 2.1, t0 - 0.03, t1 + 0.03, 'steel');
    ax(a0, a1, 1.53, 2.07, t0, t1, 'glass', { cast: false });
  }
  // low wall around the stair (H = 1.00 m), oak cap
  b.box(0.15, 4.01, 0, 1.0, 4.9, 5.05, 'plaster', z, N);
  b.box(0.15, 4.01, 1.0, 1.04, 4.88, 5.07, 'oakFurn', z);
  // lift, dressing room, bedrooms, bathroom
  const H = 3.0;
  b.wall('d', 6.35, 7.6, 1.27, 1.37, 0, H, [[6.5, 7.5, 0, 2.1]], 'plaster', z, N);
  // lift shaft glass towards the stair opening
  b.box(0.15, 1.27, 0, 2.2, 6.36, 6.38, 'glass', z, { cast: false });
  for (const x of [0.15, 1.21]) b.box(x, x + 0.06, 0, 2.2, 6.33, 6.41, 'steel', z);
  b.box(0.15, 1.27, 2.2, 2.26, 6.33, 6.41, 'steel', z);
  b.box(0.15, 1.27, 2.26, H, 6.35, 6.41, 'plaster', z, N);
  // landing door at +4.44 (closed leaves, frame, call button) and the machine head on top of the shaft
  b.box(1.37, 1.43, 0, 2.16, 6.44, 6.5, 'steel', z);
  b.box(1.37, 1.43, 0, 2.16, 7.5, 7.56, 'steel', z);
  b.box(1.37, 1.43, 2.1, 2.16, 6.5, 7.5, 'steel', z);
  b.box(1.37, 1.4, 0, 2.1, 6.5, 6.995, 'steel', z);
  b.box(1.37, 1.4, 0, 2.1, 7.005, 7.5, 'steel', z);
  b.box(1.37, 1.39, 0.95, 1.2, 7.6, 7.66, 'steel', z);
  b.box(1.385, 1.395, 1.05, 1.1, 7.615, 7.645, 'shade', z, { cast: false, edges: false });
  b.box(0.2, 1.22, 2.62, 2.98, 6.45, 7.58, 'steel', z);
  b.box(2.96, 3.11, 0, H, 11.25, 14.18, 'plaster', z, N);
  b.wall('x', 3.11, 7.41, 11.25, 11.4, 0, H, [[3.5, 4.2, 0, 2.1], [6.5, 7.2, 0, 2.1]], 'plaster', z, N);
  b.box(4.61, 4.76, 0, H, 11.4, 14.18, 'plaster', z, N);
  b.box(7.26, 7.41, 0, H, 11.4, 14.18, 'plaster', z, N);
  b.box(3.42, 3.5, 0, 2.1, 11.28, 11.37, 'oakFurn', z);
  b.box(6.42, 6.5, 0, 2.1, 11.28, 11.37, 'oakFurn', z);

  // PA|05 estar · comedor · cocina
  b.box(0.15, 0.8, 0, 0.86, 0.6, 4.3, 'oakFurn', z, furn);
  b.box(0.15, 0.83, 0.86, 0.9, 0.6, 4.3, 'stone', z, furn);
  b.box(0.15, 0.8, 0, 2.4, 4.3, 4.88, 'oakFurn', z, furn);
  for (let d = 0.6; d < 4.2; d += 0.6) b.box(0.8, 0.805, 0.1, 0.8, d + 0.01, d + 0.59, 'oakFurn', z, { ...furn, cast: false });
  b.box(0.15, 0.45, 1.6, 1.64, 0.8, 3.8, 'oakFurn', z, furn);
  b.box(0.15, 0.45, 2.2, 2.24, 0.8, 3.8, 'oakFurn', z, furn);
  b.box(0.27, 0.72, 0.9, 0.905, 1.9, 2.5, 'steel', z, furn);
  b.box(0.27, 0.68, 0.86, 0.905, 3.1, 3.6, 'steel', z, { ...furn, edges: 30 });
  for (const [d, h] of [[1.0, 0.22], [1.25, 0.3], [2.9, 0.16]]) b.cyl(0.3, d, 1.64, 1.64 + h, 0.07, 'ceramic', z, { ...furn, seg: 24 });
  // dining table, six chairs, pendant
  b.box(1.55, 2.55, 0.72, 0.76, 1.5, 3.7, 'oakFurn', z, furn);
  for (const [x, d] of [[1.62, 1.57], [2.42, 1.57], [1.62, 3.57], [2.42, 3.57]]) b.box(x - 0.03, x + 0.03, 0, 0.72, d - 0.03, d + 0.03, 'oakFurn', z, furn);
  for (const d of [1.85, 2.6, 3.35]) {
    for (const [x0, x1, bx0, bx1] of [[1.08, 1.48, 1.08, 1.12], [2.62, 3.02, 2.98, 3.02]]) {
      b.box(x0, x1, 0.42, 0.47, d - 0.21, d + 0.21, 'leather', z, furn);
      b.box(bx0, bx1, 0.47, 0.86, d - 0.2, d + 0.2, 'oakFurn', z, furn);
      b.box(x0, x1, 0, 0.42, d - 0.21, d - 0.18, 'steel', z, furn);
      b.box(x0, x1, 0, 0.42, d + 0.18, d + 0.21, 'steel', z, furn);
    }
  }
  b.cyl(2.05, 2.6, 2.95, 3.0, 0.004, 'steel', z, { ...furn, seg: 6, edges: 40 });
  b.cyl(2.05, 2.6, 1.95, 2.95, 0.006, 'steel', z, { ...furn, seg: 6, edges: 40 });
  b.cyl(2.05, 2.6, 1.72, 1.95, 0.3, 'shade', z, { ...furn, r2: 0.1, open: true, cast: false });
  // living: rug, sofa facing the balcony, coffee table, lounge chair, lamp, credenza
  b.box(4.0, 7.2, 0, 0.012, 1.6, 4.3, 'rug', z, { ...furn, cast: false });
  b.box(4.38, 6.82, 0, 0.08, 3.78, 4.52, 'steel', z, furn);
  b.box(4.3, 6.9, 0.08, 0.42, 3.7, 4.6, 'sofaPA', z, furn);
  b.box(4.48, 5.58, 0.42, 0.6, 3.72, 4.35, 'sofaPA', z, furn);
  b.box(5.62, 6.72, 0.42, 0.6, 3.72, 4.35, 'sofaPA', z, furn);
  b.box(4.3, 6.9, 0.42, 0.85, 4.35, 4.6, 'sofaPA', z, furn);
  b.box(4.3, 4.48, 0.42, 0.66, 3.7, 4.35, 'sofaPA', z, furn);
  b.box(6.72, 6.9, 0.42, 0.66, 3.7, 4.35, 'sofaPA', z, furn);
  b.box(4.9, 6.3, 0, 0.34, 2.4, 3.1, 'stone', z, furn);
  b.cyl(5.3, 2.75, 0.34, 0.46, 0.09, 'clay', z, { ...furn, r2: 0.06, seg: 24 });
  lounge(b, 4.55, 1.9, -0.5, z, 0);
  b.cyl(7.12, 4.35, 0, 0.02, 0.16, 'steel', z, furn);
  b.cyl(7.12, 4.35, 0.02, 1.45, 0.012, 'brass', z, { ...furn, seg: 12, edges: 40 });
  b.cyl(7.12, 4.35, 1.42, 1.74, 0.21, 'shade', z, { ...furn, open: true, cast: false });
  b.box(8.0, 8.41, 0, 0.62, 0.7, 3.3, 'oakFurn', z, furn);
  b.box(8.0, 8.41, 0.62, 0.65, 0.7, 3.3, 'stone', z, furn);
  b.cyl(8.2, 1.2, 0.65, 0.95, 0.09, 'ceramic', z, { ...furn, r2: 0.05, seg: 24 });
  b.cyl(8.2, 2.6, 0.65, 0.8, 0.12, 'clay', z, { ...furn, seg: 24 });
  b.box(5.2, 6.15, 1.05, 2.15, 6.33, 6.35, 'art', z, furn);

  // PA|04 vestidor: oak wardrobes, leather bench
  for (let d = 7.9; d < 10.05; d += 0.55) b.box(0.15, 0.75, 0, 2.4, d, d + 0.54, 'oakFurn', z, furn);
  b.box(1.2, 1.7, 0, 0.42, 8.6, 9.4, 'leather', z, furn);
  // PA|01 dormitorio: bed under the window, nightstands, reading lamps
  b.box(0.45, 2.65, 0, 0.012, 11.5, 14.0, 'rug', z, { ...furn, cast: false });
  b.box(0.75, 2.35, 0, 0.3, 12.1, 14.15, 'oakFurn', z, furn);
  b.box(0.77, 2.33, 0.3, 0.52, 12.15, 14.02, 'linen', z, furn);
  b.box(0.76, 2.34, 0.52, 0.57, 12.15, 12.85, 'throw', z, furn);
  b.box(0.85, 1.5, 0.52, 0.66, 13.6, 13.98, 'linen', z, furn);
  b.box(1.6, 2.25, 0.52, 0.66, 13.6, 13.98, 'linen', z, furn);
  b.box(0.7, 2.4, 0, 0.88, 14.02, 14.17, 'oakFurn', z, furn);
  for (const x of [0.2, 2.42]) {
    b.box(x, x + 0.42, 0, 0.48, 13.7, 14.15, 'oakFurn', z, furn);
    b.cyl(x + 0.21, 13.93, 0.48, 0.78, 0.015, 'brass', z, { ...furn, seg: 10, edges: 40 });
    b.cyl(x + 0.21, 13.93, 0.72, 0.9, 0.11, 'shade', z, { ...furn, open: true, cast: false });
  }
  // PA|03 dormitorio: bed, nightstand with lamp, desk under the light
  b.box(4.85, 7.15, 0, 0.012, 11.7, 14.0, 'rug', z, { ...furn, cast: false });
  b.box(5.3, 6.7, 0, 0.3, 12.1, 14.15, 'oakFurn', z, furn);
  b.box(5.32, 6.68, 0.3, 0.52, 12.15, 14.02, 'linen', z, furn);
  b.box(5.31, 6.69, 0.52, 0.57, 12.15, 12.75, 'throw', z, furn);
  b.box(5.4, 5.95, 0.52, 0.66, 13.6, 13.98, 'linen', z, furn);
  b.box(6.05, 6.6, 0.52, 0.66, 13.6, 13.98, 'linen', z, furn);
  b.box(5.25, 6.75, 0, 0.88, 14.02, 14.17, 'oakFurn', z, furn);
  b.box(4.8, 5.2, 0, 0.48, 13.72, 14.15, 'oakFurn', z, furn);
  b.cyl(5.0, 13.93, 0.48, 0.78, 0.015, 'brass', z, { ...furn, seg: 10, edges: 40 });
  b.cyl(5.0, 13.93, 0.72, 0.9, 0.11, 'shade', z, { ...furn, open: true, cast: false });
  b.box(4.78, 5.33, 0.72, 0.76, 11.5, 12.6, 'oakFurn', z, furn);
  b.box(4.82, 4.86, 0, 0.72, 11.55, 12.55, 'steel', z, furn);
  b.box(5.25, 5.29, 0, 0.72, 11.55, 12.55, 'steel', z, furn);
  b.box(5.45, 5.85, 0.42, 0.47, 11.85, 12.25, 'leather', z, furn);
  b.box(5.81, 5.85, 0.47, 0.84, 11.85, 12.25, 'oakFurn', z, furn);
  b.box(5.45, 5.85, 0, 0.42, 11.85, 11.88, 'steel', z, furn);
  b.box(5.45, 5.85, 0, 0.42, 12.22, 12.25, 'steel', z, furn);
  b.cyl(4.98, 11.75, 0.76, 0.92, 0.06, 'ceramic', z, { ...furn, seg: 20 });
  // PA|02 baño: walk-in shower at the window, floating oak vanity, mirror
  b.box(3.11, 4.61, 0, 0.03, 13.38, 14.18, 'stone', z, furn);
  b.box(3.11, 3.95, 0.03, 2.1, 13.36, 13.38, 'glass', z, { ...furn, cast: false });
  b.box(3.93, 3.96, 0.03, 2.1, 13.34, 13.4, 'steel', z, furn);
  b.cyl(3.6, 13.95, 2.05, 2.08, 0.13, 'steel', z, { ...furn, seg: 24 });
  b.box(3.58, 3.62, 2.08, 2.3, 14.05, 14.18, 'steel', z, furn);
  b.box(3.14, 3.56, 0, 0.42, 12.25, 12.85, 'ceramic', z, furn);
  b.box(3.11, 3.3, 0.42, 0.9, 12.3, 12.8, 'ceramic', z, furn);
  b.box(4.13, 4.61, 0.45, 0.82, 12.15, 13.2, 'oakFurn', z, furn);
  b.box(4.12, 4.61, 0.82, 0.85, 12.12, 13.23, 'stone', z, furn);
  b.cyl(4.36, 12.68, 0.85, 0.97, 0.19, 'ceramic', z, { ...furn, r2: 0.14, seg: 28 });
  b.box(4.56, 4.61, 1.1, 1.95, 12.2, 13.15, 'glass', z, { ...furn, cast: false });
  b.box(4.55, 4.61, 1.95, 1.98, 12.2, 13.15, 'brass', z, furn);
  b.box(3.11, 3.15, 1.2, 1.24, 13.0, 13.3, 'brass', z, furn);
  b.box(3.15, 3.2, 0.7, 1.22, 13.02, 13.28, 'throw', z, furn);

  // roof terrace 8.29 x 8.83 ("techo frío"), 1.80 m side walls
  b.box(0, 0.15, -0.3, 1.8, 14.33, 23.16, 'plaster', z, N);
  b.box(8.41, LOT_W, -0.3, 1.8, 14.33, 23.16, 'plaster', z, N);
  b.box(0, LOT_W, -0.3, 1.0, 23.16, 23.31, 'plaster', z, N);
  b.box(0.75, 8.41, 0, 0.04, 14.33, 23.16, 'deck', z, { cast: false });
  b.box(0.15, 0.75, 0, 0.6, 14.6, 23.0, 'concrete', z, furn);
  b.box(0.2, 0.7, 0.6, 1.3, 14.65, 22.95, 'hedge', z, furn);
  b.box(0.75, 8.41, 0, 0.5, 22.55, 23.16, 'concrete', z, furn);
  b.box(0.8, 8.36, 0.5, 0.95, 22.6, 23.1, 'hedge', z, furn);
  for (const x of [2.6, 3.8]) {
    b.box(x, x + 0.8, 0.04, 0.3, 18.8, 20.8, 'oakFurn', z, furn);
    b.box(x + 0.03, x + 0.77, 0.3, 0.4, 18.85, 20.75, 'fabric', z, furn);
    b.box(x + 0.03, x + 0.77, 0.4, 0.78, 20.45, 20.75, 'fabric', z, furn);
  }
  b.cyl(3.6, 18.4, 0.04, 0.45, 0.22, 'stone', z, furn);
  b.box(5.9, 7.7, 0.72, 0.76, 16.0, 17.0, 'oakFurn', z, furn);
  b.box(6.0, 7.6, 0.04, 0.72, 16.45, 16.55, 'steel', z, furn);
  b.box(5.9, 7.7, 0.04, 0.45, 15.45, 15.8, 'oakFurn', z, furn);
  b.box(5.9, 7.7, 0.04, 0.45, 17.2, 17.55, 'oakFurn', z, furn);
}

// Leaves as small cards scattered in an ellipsoid: hatching while drawn, foliage once real.
function foliage(b, [cx, cy, cd], [rx, ry, rz], n, size, zone, seed) {
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const leaves = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < n; i++) {
    do v.set(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
    while (v.lengthSq() > 1 || v.lengthSq() < 0.25);
    const g = new THREE.PlaneGeometry(size * (0.7 + rnd() * 0.6), size * 0.16);
    q.setFromEuler(e.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI));
    m.compose(new THREE.Vector3(cx + v.x * rx, cy + v.y * ry, -cd + v.z * rz), q, one);
    g.applyMatrix4(m);
    leaves.push(g);
  }
  b.geo(mergeGeometries(leaves), null, 'leaf', zone, { line: 'soft', poche: 'paper', cast: false, edges: 1 });
}

/* ------------------------------------------------------------------ */
/* The block around: neighbours and the street tree (always drawn)     */
/* ------------------------------------------------------------------ */
function neighbours(b) {
  const o = { line: 'soft', poche: 'paper' };
  // street tree on the sidewalk
  b.cyl(7.9, -2.61, 0, 3.4, 0.13, 'branch', 'ctx', { ...o, r2: 0.16, seg: 10, edges: 40 });
  for (const [x, y, d, r, k] of [[8.3, 4.4, -3.0, 1.4, 1], [9.2, 5.0, -3.3, 1.1, 2], [7.9, 5.6, -3.4, 1.0, 3], [8.8, 6.0, -2.8, 0.9, 4]]) {
    foliage(b, [x, y, d], [r, r * 0.75, r], Math.round(520 * r * r), 0.24, 'ctx', 20 + k);
  }
}
