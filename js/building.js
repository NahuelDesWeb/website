// Bahía Blanca 2559 — model built from the approved permit drawing.
// Plan coordinates in metres: x across the 8.56 m lot (0 = left party wall,
// seen from the street), d into the lot from the street line (L.O.), y up.
import * as THREE from 'three';
import { Builder } from './builder.js';

export const LOT_W = 8.56;
export const PB_TOP = 4.14; // underside of the new first-floor slab
export const PA_LEVEL = 4.44; // first floor level (+4.44)
export const RISER = 4.19 / 24; // 24 risers from +0.25 to +4.44
export const STREET_PIVOT = LOT_W / 2;

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

  return { pb, pa, ctx, walk, road, door, lamp };
}

/* ------------------------------------------------------------------ */
/* Planta baja                                                         */
/* ------------------------------------------------------------------ */
function groundFloor(b) {
  const H = PB_TOP;
  // lot and party walls
  b.box(0, LOT_W, -0.16, 0, 0.2, 48.2, 'paper', 'pb', { ...soft, cast: false });
  b.box(0, 0.15, 0, H, 0.2, 6.3, 'plaster', 'sala');
  b.box(0, 0.15, 0, H, 6.3, 23.16, 'paper', 'pb', soft);
  b.box(0, 0.15, 0, 3.0, 23.16, 25.85, 'paper', 'pb', soft);
  b.box(0, 0.15, 0, 3.45, 25.85, 34.07, 'paper', 'pb', soft);
  b.box(0, 0.15, 0, 3.0, 34.07, 48.22, 'paper', 'pb', soft);
  b.box(8.41, LOT_W, 0, H, 0.2, 23.16, 'paper', 'pb', soft);
  b.box(8.41, LOT_W, 0, 3.0, 23.16, 25.85, 'paper', 'pb', soft);
  b.box(8.41, LOT_W, 0, 3.45, 25.85, 34.07, 'paper', 'pb', soft);
  b.box(8.41, LOT_W, 0, 3.0, 34.07, 47.33, 'paper', 'pb', soft);
  const back = new THREE.BoxGeometry(Math.hypot(LOT_W, 0.89), 3.0, 0.15);
  back.rotateY(-Math.atan2(0.89, LOT_W));
  back.translate(LOT_W / 2, 1.5, -(48.22 + 47.33) / 2 - 0.07);
  b.geo(back, null, 'paper', 'pb', soft);

  // behind the living room: lift, patio under the light well, bathroom PB|02
  b.box(1.27, 1.37, 0, H, 6.45, 7.6, 'paper', 'pb', soft);
  b.box(0.15, 1.37, 0, H, 7.6, 7.7, 'paper', 'pb', soft);
  b.wall('x', 0.15, 2.38, 8.15, 8.3, 0, H, [[1.4, 2.1, 0, 2.1]], 'paper', 'pb', soft);
  b.box(2.23, 2.38, 0, H, 8.3, 9.8, 'paper', 'pb', soft);
  b.box(0.15, 3.59, 0, H, 9.8, 9.95, 'paper', 'pb', soft);
  b.box(0.3, 0.75, 0.25, 0.65, 8.5, 9.0, 'paper', 'pb', softFurn);

  // common passage (1.20 m) and unit 2 at the front
  b.box(5.07, 5.22, 0, H, 0.2, 8.25, 'paper', 'pb', soft);
  b.box(3.44, 3.59, 0, 1.8, 6.45, 9.8, 'paper', 'pb', soft);
  b.box(5.07, 5.22, 0, 1.8, 8.25, 9.95, 'paper', 'pb', soft);
  b.wall('x', 5.22, 8.41, 8.25, 8.4, 0, H, [[6.6, 7.4, 0, 2.1]], 'paper', 'pb', soft);
  b.box(6.36, 6.51, 0, H, 8.4, 9.8, 'paper', 'pb', soft);
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
  // patios with 2.00 m walls
  b.box(3.59, 3.74, 0, 2.0, 23.31, 25.85, 'paper', 'pb', soft);
  b.box(4.93, 5.08, 0, 2.0, 23.31, 25.85, 'paper', 'pb', soft);

  // rear block (existing, two storeys)
  const RH = 3.45;
  b.wall('x', 0.15, 3.43, 25.85, 26.0, 0, RH, [[2.4, 3.2, 0, 2.1], [0.6, 2.0, 1.0, 2.2]], 'paper', 'pb', soft);
  b.wall('x', 5.13, 8.41, 25.85, 26.0, 0, RH, [[5.36, 6.16, 0, 2.1], [6.6, 8.0, 1.0, 2.2]], 'paper', 'pb', soft);
  b.box(3.28, 3.43, 0, RH, 26.0, 27.5, 'paper', 'pb', soft);
  b.box(5.13, 5.28, 0, RH, 26.0, 27.5, 'paper', 'pb', soft);
  b.box(3.43, 5.13, 0, RH, 27.5, 27.65, 'paper', 'pb', soft);
  b.box(4.2, 4.36, 0, RH, 27.65, 34.07, 'paper', 'pb', soft);
  b.wall('x', 0.15, 8.41, 33.92, 34.07, 0, RH, [[1.0, 3.0, 0, 2.2], [5.5, 7.5, 0, 2.2]], 'paper', 'pb', soft);
  b.box(3.43, 3.58, 0, RH, 27.65, 29.6, 'paper', 'pb', soft);
  b.box(4.98, 5.13, 0, RH, 27.65, 29.6, 'paper', 'pb', soft);
  b.box(2.4, 4.2, 0, RH, 31.4, 32.3, 'paper', 'pb', softFurn);
  b.box(4.36, 6.16, 0, RH, 31.4, 32.3, 'paper', 'pb', softFurn);
  b.box(0.15, 0.75, 0, 0.9, 28.0, 31.0, 'paper', 'pb', softFurn);
  b.box(7.81, 8.41, 0, 0.9, 28.0, 31.0, 'paper', 'pb', softFurn);
  // back patios
  b.box(4.2, 4.36, 0, 2.0, 34.07, 47.8, 'paper', 'pb', soft);
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
  b.wall('x', 0.15, 3.44, 6.3, 6.45, 0, PB_TOP, [[2.3, 3.2, 0, 2.45]], 'plaster', z);
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
  b.box(1.25, 2.95, 0.25, 0.262, 2.15, 4.75, 'rug', z, { cast: false, poche: 'paper' });
  // sofa against the hall wall, facing the stair
  b.box(2.58, 3.34, 0.25, 0.33, 2.55, 4.35, 'steel', z, furn);
  b.box(2.5, 3.42, 0.33, 0.48, 2.45, 4.45, 'fabric', z, furn);
  b.box(2.52, 3.18, 0.48, 0.66, 2.63, 3.44, 'fabric', z, furn);
  b.box(2.52, 3.18, 0.48, 0.66, 3.46, 4.27, 'fabric', z, furn);
  b.box(3.18, 3.42, 0.48, 1.02, 2.63, 4.27, 'fabric', z, furn);
  b.box(2.5, 3.42, 0.48, 0.76, 2.45, 2.63, 'fabric', z, furn);
  b.box(2.5, 3.42, 0.48, 0.76, 4.27, 4.45, 'fabric', z, furn);
  b.box(2.98, 3.18, 0.66, 1.0, 2.72, 3.36, 'fabric', z, furn);
  b.box(2.98, 3.18, 0.66, 1.0, 3.54, 4.18, 'fabric', z, furn);
  // round travertine coffee table
  b.cyl(1.85, 3.45, 0.58, 0.63, 0.42, 'stone', z, furn);
  b.cyl(1.85, 3.45, 0.25, 0.58, 0.2, 'stone', z, { ...furn, r2: 0.24 });
  b.cyl(1.72, 3.32, 0.63, 0.7, 0.08, 'ceramic', z, { ...furn, seg: 28 });
  // oak bench under the window
  b.box(0.45, 2.05, 0.25, 0.68, 0.22, 0.62, 'oakFurn', z, furn);
  b.box(0.75, 1.15, 0.68, 0.76, 0.3, 0.52, 'ceramic', z, furn);
  // leather lounge chair turned towards the room
  lounge(b, 1.0, 1.65, 0.6);
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
  // art on the hall wall
  b.box(3.4, 3.44, 1.3, 2.45, 2.75, 4.15, 'art', z, furn);
  // oak sideboard under the stair
  b.box(1.25, 2.25, 0.25, 0.85, 5.78, 6.28, 'oakFurn', z, furn);
  b.cyl(1.6, 6.02, 0.85, 1.05, 0.11, 'ceramic', z, { ...furn, r2: 0.07, seg: 28 });
}

function lounge(b, cx, cd, rot) {
  const M = new THREE.Matrix4().makeRotationY(rot).setPosition(cx, 0, -cd);
  const part = (w, h, dp, x, y, zz, mat) => {
    const g = new THREE.BoxGeometry(w, h, dp);
    g.translate(x, y, zz);
    b.geo(g, M, mat, 'sala', furn);
  };
  part(0.74, 0.5, 0.06, 0, 0.5, 0.36, 'oakFurn');
  part(0.74, 0.5, 0.06, 0, 0.5, -0.36, 'oakFurn');
  part(0.66, 0.12, 0.66, 0.02, 0.6, 0, 'leather');
  part(0.14, 0.5, 0.66, -0.3, 0.9, 0, 'leather');
  part(0.08, 0.08, 0.66, 0.33, 0.29, 0, 'oakFurn');
}

/* ------------------------------------------------------------------ */
/* Planta alta (new, +4.44) and the existing upper rear block           */
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
  for (const [x0, x1] of [[1.47, 3.27], [5.07, 6.87]]) {
    const mid = (x0 + x1) / 2;
    b.box(x0, x1, 2.35, 2.4, 0.06, 0.14, 'steel', fz);
    b.box(x0, x1, 0, 0.03, 0.06, 0.14, 'steel', fz);
    b.box(x0, x0 + 0.05, 0.03, 2.35, 0.06, 0.14, 'steel', fz);
    b.box(x1 - 0.05, x1, 0.03, 2.35, 0.06, 0.14, 'steel', fz);
    b.box(mid - 0.03, mid + 0.03, 0.03, 2.35, 0.07, 0.13, 'steel', fz);
    b.box(x0 + 0.05, mid - 0.03, 0.03, 2.35, 0.095, 0.105, 'glass', fz, { cast: false });
    b.box(mid + 0.03, x1 - 0.05, 0.03, 2.35, 0.095, 0.105, 'glass', fz, { cast: false });
  }

  // floor slab with the stair opening and the light well
  b.slab(
    [[0.15, 0.2], [8.41, 0.2], [8.41, 23.16], [0.15, 23.16], [0.15, 6.35], [4.01, 6.35], [4.01, 5.05], [0.15, 5.05]],
    [[2.35, 6.21, 6.5, 10.1]],
    -0.3, 0, 'concrete', z, { poche: 'ink' },
  );
  b.box(0, 0.15, -0.3, 4.12, 0.2, 14.33, 'plaster', z, N);
  b.box(8.41, LOT_W, -0.3, 4.12, 0.2, 14.33, 'plaster', z, N);
  b.wall('x', 0.15, 8.41, 14.18, 14.33, 0, 4.12, [[0.6, 2.6, 0.9, 2.2], [3.5, 4.4, 1.5, 2.2], [5.0, 7.0, 0.9, 2.2], [7.45, 8.3, 0, 2.2]], 'plaster', z, N);
  // roof slab (3.00 m ceilings) with the light well
  b.slab([[0.15, 0.2], [8.41, 0.2], [8.41, 14.18], [0.15, 14.18]], [[2.2, 6.36, 6.35, 10.25]], 3.0, 3.3, 'plaster', z, N);

  // light well 4.00 x 4.00 with 1.50 x 0.60 windows
  b.wall('x', 2.2, 6.36, 6.35, 6.5, 0, 4.12, [[3.53, 5.03, 1.5, 2.1]], 'plaster', z, N);
  b.wall('x', 2.2, 6.36, 10.1, 10.25, 0, 4.12, [[3.53, 5.03, 1.5, 2.1]], 'plaster', z, N);
  b.box(2.2, 2.35, 0, 4.12, 6.5, 10.1, 'plaster', z, N);
  b.wall('d', 6.5, 10.1, 6.21, 6.36, 0, 4.12, [[7.55, 9.05, 1.5, 2.1]], 'plaster', z, N);
  // low wall around the stair (H = 1.00 m)
  b.box(0.15, 4.01, 0, 1.0, 4.9, 5.05, 'plaster', z, N);
  // lift, dressing room, bedrooms, bathroom
  const H = 3.0;
  b.box(1.27, 1.37, 0, H, 6.35, 7.6, 'plaster', z, N);
  b.box(0.15, 2.2, 0, H, 7.6, 7.75, 'plaster', z, N);
  b.box(2.96, 3.11, 0, H, 11.25, 14.18, 'plaster', z, N);
  b.wall('x', 3.11, 7.41, 11.25, 11.4, 0, H, [[3.5, 4.2, 0, 2.1], [6.5, 7.2, 0, 2.1]], 'plaster', z, N);
  b.box(4.61, 4.76, 0, H, 11.4, 14.18, 'plaster', z, N);
  b.box(7.26, 7.41, 0, H, 11.4, 14.18, 'plaster', z, N);

  // furniture (drawn only for now)
  b.box(0.15, 0.8, 0, 0.9, 0.6, 4.6, 'paper', z, furn);
  b.box(0.15, 0.5, 1.5, 2.3, 0.6, 3.4, 'paper', z, furn);
  b.box(1.6, 2.6, 0, 0.75, 1.5, 3.7, 'paper', z, furn);
  for (const d of [1.8, 2.6, 3.4]) {
    b.box(1.15, 1.55, 0, 0.45, d - 0.2, d + 0.2, 'paper', z, furn);
    b.box(2.65, 3.05, 0, 0.45, d - 0.2, d + 0.2, 'paper', z, furn);
  }
  b.box(4.9, 7.7, 0, 0.42, 3.7, 4.6, 'paper', z, furn);
  b.box(4.9, 7.7, 0.42, 0.8, 4.4, 4.6, 'paper', z, furn);
  b.box(5.6, 7.0, 0, 0.36, 2.4, 3.1, 'paper', z, furn);
  b.box(0.15, 0.75, 0, 2.4, 7.9, 10.1, 'paper', z, furn);
  b.box(0.4, 2.0, 0, 0.5, 12.1, 14.15, 'paper', z, furn);
  b.box(0.4, 2.0, 0.5, 1.1, 13.98, 14.15, 'paper', z, furn);
  b.box(5.3, 6.7, 0, 0.5, 12.1, 14.15, 'paper', z, furn);
  b.box(3.11, 4.61, 0, 0.05, 13.4, 14.18, 'paper', z, furn);
  b.box(3.7, 4.1, 0, 0.42, 11.55, 12.15, 'paper', z, furn);
  b.box(4.15, 4.61, 0, 0.85, 12.3, 13.1, 'paper', z, furn);
  // roof terrace 8.29 x 8.83 ("techo frío"), 1.80 m side walls
  b.box(0, 0.15, -0.3, 1.8, 14.33, 23.16, 'plaster', z, N);
  b.box(8.41, LOT_W, -0.3, 1.8, 14.33, 23.16, 'plaster', z, N);
  b.box(0, LOT_W, -0.3, 1.0, 23.16, 23.31, 'plaster', z, N);
  b.box(0.15, 0.75, 0, 0.6, 15.0, 22.5, 'paper', z, furn);
  b.box(2.6, 3.4, 0, 0.35, 19.0, 21.0, 'paper', z, furn);
  b.box(3.8, 4.6, 0, 0.35, 19.0, 21.0, 'paper', z, furn);

  // existing upper rear block (floor at +3.45)
  const y0 = 3.45 - PA_LEVEL;
  const y1 = 6.71 - PA_LEVEL;
  const E = { line: 'soft' };
  b.wall('x', 0, LOT_W, 25.85, 26.0, y0, y1, [[0.8, 2.6, y0 + 0.9, y0 + 2.2], [5.9, 7.7, y0 + 0.9, y0 + 2.2]], 'paper', z, E);
  b.wall('x', 0, LOT_W, 33.92, 34.07, y0, y1, [[0.8, 2.6, y0 + 0.9, y0 + 2.2], [5.9, 7.7, y0 + 0.9, y0 + 2.2]], 'paper', z, E);
  b.box(0, 0.15, y0, y1, 26.0, 33.92, 'paper', z, E);
  b.box(8.41, LOT_W, y0, y1, 26.0, 33.92, 'paper', z, E);
  b.box(4.2, 4.36, y0, y1, 26.0, 33.92, 'paper', z, E);
  b.wall('x', 0.15, 3.64, 29.0, 29.15, y0, y1, [[2.4, 3.2, y0, y0 + 2.1]], 'paper', z, E);
  b.wall('x', 0.15, 3.64, 30.65, 30.8, y0, y1, [[2.4, 3.2, y0, y0 + 2.1]], 'paper', z, E);
  b.wall('x', 4.92, 8.41, 29.0, 29.15, y0, y1, [[5.4, 6.2, y0, y0 + 2.1]], 'paper', z, E);
  b.wall('x', 4.92, 8.41, 30.65, 30.8, y0, y1, [[5.4, 6.2, y0, y0 + 2.1]], 'paper', z, E);
  b.box(1.65, 1.8, y0, y1, 29.15, 30.65, 'paper', z, E);
  b.box(6.76, 6.91, y0, y1, 29.15, 30.65, 'paper', z, E);
  b.box(0.15, 8.41, y1 - 0.15, y1, 26.0, 33.92, 'paper', z, E);
}

/* ------------------------------------------------------------------ */
/* The block around: neighbours and the street tree (always drawn)     */
/* ------------------------------------------------------------------ */
function neighbours(b) {
  const o = { line: 'soft', poche: 'paper' };
  const frame = (x0, x1, y0, y1) => {
    b.box(x0 - 0.08, x1 + 0.08, y1, y1 + 0.08, -0.05, 0, 'paper', 'ctx', o);
    b.box(x0 - 0.08, x1 + 0.08, y0 - 0.08, y0, -0.07, 0, 'paper', 'ctx', o);
    b.box(x0 - 0.08, x0, y0, y1, -0.05, 0, 'paper', 'ctx', o);
    b.box(x1, x1 + 0.08, y0, y1, -0.05, 0, 'paper', 'ctx', o);
  };
  b.box(-9, 0, 0, 7.4, 0, 17, 'paper', 'ctx', o);
  frame(-7.6, -5.7, 1.1, 2.4);
  frame(-4.4, -3.2, 0, 2.4);
  frame(-2.6, -0.7, 1.1, 2.4);
  frame(-7.6, -0.7, 4.0, 6.3);
  b.box(-7.9, -0.4, 3.6, 3.72, -1.1, 0, 'paper', 'ctx', o);
  b.box(-18, -9, 0, 10.4, 0, 22, 'paper', 'ctx', o);
  for (const y of [1.2, 4.3, 7.4]) for (const x of [-16.8, -13.2]) frame(x, x + 2.4, y, y + 1.9);
  b.box(LOT_W, 17.2, 0, 4.5, 0, 13, 'paper', 'ctx', o);
  frame(9.4, 12.2, 0, 2.6);
  frame(13.2, 16.2, 1.0, 2.4);
  b.box(17.2, 26, 0, 7.8, 0, 18, 'paper', 'ctx', o);
  for (const y of [1.0, 4.4]) frame(18.4, 24.8, y, y + 2.1);
  // street tree on the sidewalk (canopy kept as a drawing)
  b.cyl(7.9, -2.61, 0, 3.4, 0.13, 'paper', 'ctx', { ...o, r2: 0.16, seg: 10, edges: 40 });
  for (const [x, y, d, r] of [[7.9, 4.6, -2.6, 1.7], [7.0, 5.3, -2.2, 1.3], [8.7, 5.4, -3.0, 1.35], [7.8, 6.2, -2.7, 1.1]]) {
    const g = new THREE.IcosahedronGeometry(r, 1);
    g.translate(x, y, -d);
    b.geo(g, null, 'paper', 'ctx', { ...o, cast: false, edges: 30 });
  }
}
