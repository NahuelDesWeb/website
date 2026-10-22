import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadTextures, MaterialLib, makeRooms, PAPER } from './materials.js';
import { buildWorld, PA_LEVEL } from './building.js';
import { drawSheet, SHEET } from './drawing.js';
import { roomTag, floorDim, levelMark } from './labels.js';

const RECORD = new URLSearchParams(location.search).has('record');
const D2R = Math.PI / 180;
const TOTAL = 284; // timeline length in scroll units
if (RECORD) document.documentElement.classList.add('is-recording');

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(RECORD ? 1 : Math.min(devicePixelRatio, innerWidth < 760 ? 1.75 : 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;

// One horizontal cut for the whole drawing: below it, the plan; raising it raises the walls.
const cut = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.2);
renderer.clippingPlanes = [cut];

const scene = new THREE.Scene();
scene.background = new THREE.Color(PAPER);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(3, innerWidth / innerHeight, 1, 2000);

// Rooms in world space (z = -d). Each turns from drawing into material when its front passes.
const Y = PA_LEVEL;
const { uniforms: revealUniforms, rooms } = makeRooms([
  { name: 'street', min: [-30, -1, 0], max: [40, 0.05, 30], origin: [0, 0, 26], dir: [0, 0, -1], width: 3, t: -10 },
  { name: 'tree', min: [6.0, -0.2, 1.2], max: [10.5, 8.5, 4.2], origin: [0, 0, 26], dir: [0, 0, -1], width: 3, t: -10 },
  { name: 'facade', min: [-0.01, -0.5, -0.2], max: [8.57, 9.0, 1.1], origin: [-0.8, 0, 0], dir: [1, 0, 0], width: 1.6, t: -1 },
  { name: 'sala', min: [0.1, -0.5, -6.38], max: [3.52, 4.135, -0.19], origin: [2.77, 1.25, -0.35], radial: true, width: 0.7, t: -0.2 },
  { name: 'stair', min: [0.1, 0.2, -6.4], max: [4.05, Y + 0.01, -5.0], origin: [2.77, 1.25, -0.35], radial: true, width: 0.7, t: -0.2 },
  { name: 'shaft', min: [0.1, -0.5, -7.72], max: [2.25, Y + 3.06, -6.3], origin: [2.77, 1.25, -0.35], radial: true, width: 0.7, t: -0.2 },
  { name: 'estar', min: [0.1, Y - 0.31, -6.43], max: [8.47, Y + 3.06, -0.19], origin: [4.2, Y + 1.4, -5.7], radial: true, width: 1.0, t: -0.2 },
  { name: 'core', min: [2.12, Y - 0.31, -11.33], max: [8.47, Y + 4.3, -6.42], origin: [7.4, Y + 1.5, -6.6], radial: true, width: 1.0, t: -0.2 },
  { name: 'vacio', min: [2.27, -0.2, -10.18], max: [6.29, Y + 4.3, -6.42], origin: [7.4, Y + 1.5, -6.6], radial: true, width: 1.0, t: -0.2 },
  { name: 'vestidor', min: [0.1, Y - 0.31, -10.18], max: [2.28, Y + 3.06, -7.68], origin: [2.7, Y + 1.5, -10.75], radial: true, width: 0.8, t: -0.2 },
  { name: 'dorm', min: [0.1, Y - 0.31, -14.26], max: [3.04, Y + 3.06, -10.18], origin: [2.9, Y + 1.5, -10.75], radial: true, width: 1.0, t: -0.2 },
  { name: 'bano', min: [3.03, Y - 0.31, -14.26], max: [4.69, Y + 3.06, -11.32], origin: [3.85, Y + 1.5, -11.3], radial: true, width: 0.8, t: -0.2 },
  { name: 'dorm3', min: [4.68, Y - 0.31, -14.26], max: [7.34, Y + 3.06, -11.32], origin: [6.85, Y + 1.5, -11.3], radial: true, width: 0.9, t: -0.2 },
  { name: 'paso2', min: [7.3, Y - 0.31, -14.26], max: [8.47, Y + 3.06, -11.2], origin: [6.85, Y + 1.5, -11.3], radial: true, width: 0.9, t: -0.2 },
  { name: 'terrace', min: [-0.01, Y - 0.31, -23.4], max: [8.57, Y + 4.3, -14.26], origin: [7.9, Y + 1.5, -14.3], radial: true, width: 1.5, t: -0.2 },
  { name: 'roof', min: [-0.01, Y + 2.9, -14.4], max: [8.57, Y + 4.3, -0.19], origin: [7.9, Y + 1.5, -14.3], radial: true, width: 1.5, t: -0.2 },
  { name: 'all', min: [-0.05, -0.5, -48.4], max: [8.61, 9.0, 0.05], origin: [4.3, 9.0, -12.0], radial: true, width: 3, t: -0.2 },
]);

const sun = new THREE.DirectionalLight('#ffe2c2', 3.3);
const sunTarget = new THREE.Object3D();
sunTarget.position.set(3.2, 1.6, -4.2);
sun.target = sunTarget;
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 5, far: 90 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun, sunTarget);
const hemi = new THREE.HemisphereLight('#e3e9f0', '#cbbcaa', 0.72);
scene.add(hemi);
// facade faces west: late sun comes from the street and swings north (-x) as the visit goes on
const SUN_A = new THREE.Vector3(-0.4, 0.36, 1).normalize();
const SUN_B = new THREE.Vector3(-0.85, 0.36, 0.62).normalize();
const SUN_COL_A = new THREE.Color('#ffe2c2');
const SUN_COL_B = new THREE.Color('#ffbf80');
const sunDir = new THREE.Vector3();
const SUN_HIGH = new THREE.Vector3(-0.35, 1, 0.25).normalize();
const UP_PORTRAIT = new THREE.Vector3(0, 0, -1);
const UP_LANDSCAPE = new THREE.Vector3(-1, 0, 0);
const planP = new THREE.Vector3();
const planL = new THREE.Vector3();
const planUp = new THREE.Vector3();
let planMix = 0;

const st = {
  tx: 14, ty: 0, tz: -10.5, S: 41, fitW: 38, fov: 3, el: 89.9, az: 0,
  cut: 1.2, ann: 1, city: 0.0001, street: 8.56 / 48.56, road: 0.0001,
  pb: 0, door: 0, lamp: 0, lift: 0, pane: 0, dusk: 0,
  walk: 0, wt: 0, paLamps: 1,
};

// On foot (after the living room): position and look-at keyframes, in timeline units.
// Hermite curve through them; `stop` frames hold still.
const E = PA_LEVEL + 1.6;
const PATH = [
  { t: 56, p: [1.722, 1.65, 8.536], l: [2.77, 1.56, 0], fov: 50, stop: true },
  { t: 61, p: [2.77, 1.56, 1.6], l: [2.77, 1.5, -2.5], fov: 56 },
  { t: 65, p: [2.75, 1.6, -1.0], l: [1.6, 1.9, -5.0], fov: 58 },
  { t: 69, p: [2.65, 1.62, -2.0], l: [0.75, 2.2, -6.3], fov: 60, stop: true },
  { t: 75, p: [2.65, 1.62, -2.0], l: [0.8, 2.5, -6.4], fov: 60, stop: true },
  { t: 78, p: [1.1, 1.7, -2.3], l: [0.66, 2.9, -5.4], fov: 60 },
  { t: 82, p: [0.68, 2.5, -3.5], l: [0.66, 3.5, -6.2], fov: 62 },
  { t: 86, p: [0.66, 3.45, -4.85], l: [2.4, 4.4, -5.95], fov: 62 },
  { t: 89.5, p: [0.85, 3.98, -5.8], l: [3.6, 5.3, -5.75], fov: 62 },
  { t: 94, p: [2.55, 5.05, -5.8], l: [5.2, 6.0, -5.2], fov: 62 },
  { t: 98, p: [4.35, E, -5.6], l: [3.0, 5.8, -4.6], fov: 62 },
  { t: 100.5, p: [3.0, E, -4.45], l: [1.0, 5.5, -6.6], fov: 62 },
  { t: 103, p: [1.75, E, -4.35], l: [0.7, 5.25, -6.8], fov: 62, stop: true },
  { t: 106, p: [1.75, E, -4.35], l: [0.9, 5.0, -6.9], fov: 62, stop: true },
  { t: 110, p: [5.0, E, -5.0], l: [4.0, 5.7, -1.0], fov: 60 },
  { t: 114, p: [5.3, E + 0.02, -5.65], l: [3.5, 5.55, -0.6], fov: 60, stop: true },
  { t: 119, p: [5.3, E + 0.02, -5.65], l: [2.4, 5.5, -1.4], fov: 60, stop: true },
  { t: 123, p: [7.65, E, -4.3], l: [6.6, 5.8, -0.5], fov: 60 },
  { t: 126, p: [7.3, E, -2.1], l: [6.42, 5.7, 1.5], fov: 60 },
  { t: 129, p: [6.42, E - 0.02, -0.95], l: [6.4, 5.6, 3.0], fov: 60 },
  { t: 131, p: [6.3, E - 0.04, 0.5], l: [3.0, 5.6, 0.8], fov: 60 },
  { t: 133, p: [6.3, E - 0.04, 0.55], l: [0.5, 5.4, 0.45], fov: 60, stop: true },
  { t: 137, p: [6.3, E - 0.04, 0.55], l: [0.6, 5.6, 0.9], fov: 60, stop: true },
  { t: 141, p: [6.42, E - 0.02, -1.2], l: [7.4, 5.9, -5.0], fov: 60 },
  { t: 145, p: [7.45, E, -4.2], l: [7.2, 6.0, -8.0], fov: 62 },
  { t: 149, p: [7.35, E, -7.4], l: [5.0, 6.1, -8.3], fov: 64 },
  { t: 151.5, p: [6.75, 6.22, -8.3], l: [4.0, 6.3, -8.3], fov: 64 },
  { t: 153.5, p: [5.85, 6.26, -8.3], l: [3.6, 6.8, -8.4], fov: 66 },
  { t: 157, p: [4.6, 6.0, -8.0], l: [3.0, 8.0, -9.2], fov: 72, stop: true },
  { t: 161, p: [4.6, 6.0, -8.0], l: [3.4, 8.7, -7.0], fov: 72, stop: true },
  { t: 164, p: [5.85, 6.26, -8.3], l: [7.6, 6.2, -8.3], fov: 66 },
  { t: 166.5, p: [6.9, 6.1, -8.5], l: [7.3, 6.0, -11.0], fov: 62 },
  { t: 170, p: [7.3, E, -9.9], l: [5.0, 6.0, -10.8], fov: 62 },
  { t: 174, p: [4.6, E, -10.75], l: [1.5, 5.9, -10.9], fov: 62 },
  { t: 177.5, p: [2.75, E, -10.75], l: [1.2, 5.6, -9.0], fov: 62 },
  { t: 181, p: [1.8, E, -11.35], l: [1.0, 5.4, -8.2], fov: 64, stop: true },
  { t: 185, p: [1.8, E, -11.35], l: [0.5, 5.6, -8.8], fov: 64, stop: true },
  { t: 189, p: [2.55, E - 0.02, -10.95], l: [0.9, 5.25, -14.0], fov: 62, stop: true },
  { t: 193, p: [2.55, E - 0.02, -10.95], l: [1.4, 5.3, -14.1], fov: 62, stop: true },
  { t: 196, p: [2.85, E, -10.75], l: [4.5, 6.0, -10.8], fov: 62 },
  { t: 199, p: [3.85, E, -10.75], l: [3.85, 5.6, -13.0], fov: 66 },
  { t: 202.5, p: [3.85, E, -11.05], l: [3.9, 5.3, -14.0], fov: 70, stop: true },
  { t: 206, p: [3.85, E, -11.05], l: [3.6, 5.5, -14.0], fov: 70, stop: true },
  { t: 209, p: [3.85, E, -10.75], l: [6.8, 5.9, -10.8], fov: 64 },
  { t: 213, p: [6.85, E, -10.75], l: [6.85, 5.6, -13.0], fov: 64 },
  { t: 216.5, p: [6.95, E, -11.55], l: [5.3, 5.3, -14.0], fov: 66, stop: true },
  { t: 220, p: [6.95, E, -11.55], l: [5.6, 5.5, -14.1], fov: 66, stop: true },
  { t: 223, p: [7.0, E, -10.9], l: [8.0, 6.0, -13.5], fov: 62 },
  { t: 227, p: [7.9, E, -12.6], l: [7.9, 6.0, -17.0], fov: 62 },
  { t: 231, p: [7.88, E, -14.9], l: [6.5, 5.9, -19.0], fov: 62 },
  { t: 235, p: [6.6, E + 0.01, -18.6], l: [4.2, 6.3, -14.5], fov: 60 },
  { t: 240, p: [6.8, E + 0.2, -22.2], l: [3.6, 5.6, -14.5], fov: 62, stop: true },
  { t: 244, p: [6.8, E + 0.2, -22.2], l: [3.2, 5.9, -14.0], fov: 62, stop: true },
  // up from the terrace: the rest of the PH, to the end of the lot
  { t: 248.5, p: [5.6, 9.0, -20.5], l: [4.3, 3.2, -31.0], fov: 56 },
  { t: 252.5, p: [4.3, 25, -16.5], l: [4.3, 0, -38.0], fov: 52, stop: true },
  { t: 257.5, p: [4.3, 25, -16.5], l: [4.3, 0, -39.0], fov: 52, stop: true },
  // the whole ground floor, cut at 2 m like a plan
  { t: 261, p: [4.3, 36, -9.5], l: [4.3, 0, -25.0], fov: 52 },
  { t: 264.5, p: [4.3, 58, -5.0], l: [4.3, 0, -22.6], fov: 50, stop: true },
  { t: 272, p: [4.3, 58, -5.0], l: [4.3, 0, -22.9], fov: 50, stop: true },
  { t: 278, p: [-11, 27, 9], l: [4.3, 2.5, -19.5], fov: 44 },
  { t: 284, p: [-15, 24, 15], l: [4.3, 2.5, -20.5], fov: 40, stop: true },
];

// Plan annotations shown at each stop, facing the camera of that stop.
const NOTES = [
  { t: [68, 77], at: [1.35, 2.05, -4.3], tag: { title: 'ESCALERA', lines: ['24 escalones · +0,25 → +4,44', 'Hormigón, baranda h 1,10 m'] }, h: 0.42 },
  { t: [68, 77], at: [0.7, 1.35, -6.22], tag: { title: 'ASCENSOR', lines: ['Plataforma elevadora 1,15 × 1,00 m', '2 paradas · +0,25 y +4,44'] }, h: 0.38 },
  { t: [68, 77], at: [2.0, 0.262, -3.2], level: '+0,25' },
  { t: [101, 107], at: [1.05, 6.2, -6.0], tag: { title: 'LLEGADA +4,44', lines: ['Escalera y ascensor'] }, h: 0.24 },
  { t: [101, 107], at: [2.7, 4.452, -4.55], level: '+4,44' },
  { t: [113, 121], at: [4.8, 6.5, -2.4], tag: { title: 'ESTAR COMEDOR COCINA', tag: 'PA|05', lines: ['46,39 m² · 8,29 × 6,20 m', 'Microcemento, roble y piedra'] }, h: 0.45 },
  { t: [113, 121], at: [4.28, 4.452, -4.8], dim: [8.26, '8.29'], rotY: Math.PI },
  { t: [132, 139], at: [3.6, 6.25, 0.85], tag: { title: 'BALCÓN', lines: ['7,85 × 1,00 m sobre Bahía Blanca'] }, h: 0.4 },
  { t: [156, 163], at: [3.6, 7.25, -8.7], tag: { title: 'VACÍO DE AIRE Y LUZ', lines: ['4,00 × 4,00 m · abierto al cielo'] }, h: 0.36, face: true },
  { t: [180, 187], at: [1.45, 6.25, -9.6], tag: { title: 'VESTIDOR', tag: 'PA|04', lines: ['2,15 × 2,49 m · 5,35 m²', 'Placares de roble'] }, h: 0.45 },
  { t: [188, 195], at: [1.55, 6.4, -13.3], tag: { title: 'DORMITORIO', tag: 'PA|01', lines: ['2,81 × 3,94 m · 11,07 m²'] }, h: 0.42 },
  { t: [188, 195], at: [1.555, 4.452, -11.7], dim: [2.81, '2.81'] },
  { t: [201, 208], at: [3.86, 6.3, -13.0], tag: { title: 'BAÑO', tag: 'PA|02', lines: ['1,50 × 2,81 m · 4,22 m²'] }, h: 0.32 },
  { t: [215, 222], at: [5.9, 6.35, -13.1], tag: { title: 'DORMITORIO', tag: 'PA|03', lines: ['2,50 × 2,81 m · 7,03 m²'] }, h: 0.4 },
  { t: [215, 222], at: [6.01, 4.452, -11.75], dim: [2.5, '2.50'] },
  { t: [239, 246], at: [5.0, 6.25, -18.8], tag: { title: 'TERRAZA ACCESIBLE', lines: ['8,29 × 8,83 m · +4,40', 'Techo frío, muros de 1,80 m'] }, h: 0.45 },
  { t: [239, 246], at: [5.4, 4.49, -19.4], level: '+4,40' },
  // ground floor cut at 2 m: every part of the PH, front to back
  ...[
    [[1.8, -2.6], 'UF 1 · SALA', 'PB|01', ['Escalera, ascensor', 'y 2 bicicletas']],
    [[6.8, -3.4], 'UF 2', null, ['Existente']],
    [[4.3, -8.2], 'PASILLO COMÚN', null, ['1,20 m · patios', 'bajo el vacío']],
    [[1.9, -16.0], 'UF 3', null, ['Existente']],
    [[6.7, -16.0], 'UF 4', null, ['Existente']],
    [[2.2, -24.6], 'AIRE Y LUZ', null, ['4,00 m · patios']],
    [[6.4, -31.4], 'FONDO', null, ['2 unidades existentes', 'con planta alta']],
    [[2.2, -41.6], 'PATIOS', null, ['Hasta 48,22 m', 'desde la L.O.']],
  ].map(([[x, z], title, tag, lines]) => ({ t: [263, 273], at: [x, 1.3, z], tag: { title, tag, lines }, h: 2.8, face: true, bill: true })),
];

const tangents = PATH.map((k, i) => {
  if (k.stop || i === 0 || i === PATH.length - 1) return { p: [0, 0, 0], l: [0, 0, 0], fov: 0 };
  const a = PATH[i - 1];
  const b = PATH[i + 1];
  const dt = b.t - a.t;
  return {
    p: k.p.map((_, j) => (b.p[j] - a.p[j]) / dt),
    l: k.l.map((_, j) => (b.l[j] - a.l[j]) / dt),
    fov: (b.fov - a.fov) / dt,
  };
});

function samplePath(time, outP, outL) {
  let i = 0;
  while (i < PATH.length - 2 && time > PATH[i + 1].t) i++;
  const a = PATH[i];
  const b = PATH[i + 1];
  const h = b.t - a.t;
  const s = Math.min(1, Math.max(0, (time - a.t) / h));
  const s2 = s * s;
  const s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1;
  const h10 = s3 - 2 * s2 + s;
  const h01 = -2 * s3 + 3 * s2;
  const h11 = s3 - s2;
  const ta = tangents[i];
  const tb = tangents[i + 1];
  const f = (va, vb, ma, mb) => h00 * va + h10 * h * ma + h01 * vb + h11 * h * mb;
  outP.set(f(a.p[0], b.p[0], ta.p[0], tb.p[0]), f(a.p[1], b.p[1], ta.p[1], tb.p[1]), f(a.p[2], b.p[2], ta.p[2], tb.p[2]));
  outL.set(f(a.l[0], b.l[0], ta.l[0], tb.l[0]), f(a.l[1], b.l[1], ta.l[1], tb.l[1]), f(a.l[2], b.l[2], ta.l[2], tb.l[2]));
  return f(a.fov, b.fov, ta.fov, tb.fov);
}

let world;
let lib;
let sheet;
let tl;
let shadowFrames = 0;
let wideShadow = false;
const notes = [];

async function init() {
  await Promise.all([document.fonts.load('500 40px Jost'), document.fonts.load('600 40px Jost'), document.fonts.load('italic 400 40px Jost')]);
  const sets = await loadTextures(renderer);
  lib = new MaterialLib(sets, revealUniforms);
  world = buildWorld(lib);
  scene.add(world.pb, world.pa, world.ctx, world.walk, world.road);
  world.shade = lib.find('shade', 'paper');

  const tex = new THREE.CanvasTexture(drawSheet());
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const w = SHEET.x1 - SHEET.x0;
  const h = SHEET.d1 - SHEET.d0;
  sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }),
  );
  sheet.rotation.x = -Math.PI / 2;
  sheet.position.set((SHEET.x0 + SHEET.x1) / 2, 0.27, -(SHEET.d0 + SHEET.d1) / 2);
  sheet.renderOrder = 3;
  scene.add(sheet);

  for (const n of NOTES) {
    const mesh = n.tag ? roomTag(n.tag, n.h) : n.dim ? floorDim(...n.dim) : levelMark(n.level);
    mesh.position.set(...n.at);
    if (n.tag) {
      const stop = PATH.filter((k) => k.stop && k.t >= n.t[0] && k.t <= n.t[1])[0];
      mesh.lookAt(stop.p[0], n.face ? stop.p[1] : n.at[1], stop.p[2]);
    } else if (n.rotY) mesh.rotation.y = n.rotY;
    mesh.visible = false;
    scene.add(mesh);
    notes.push({ mesh, t: n.t, bill: !!n.bill });
  }

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), lib.surface('paper', 'ctx', 'paper'));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.17;
  ground.receiveShadow = true;
  scene.add(ground);

  tl = buildTimeline();
  update();
  renderer.compile(scene, camera);

  if (RECORD) {
    window.__seek = (p) => {
      tl.progress(p);
      update();
      renderer.shadowMap.needsUpdate = true;
      renderer.render(scene, camera);
    };
    window.__ready = true;
  } else {
    startScroll();
  }
  document.querySelector('.loader').classList.add('is-done');
}

const sFor = (dist, fov) => 2 * dist * Math.tan((fov * D2R) / 2);

function buildTimeline() {
  const t = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const at = (pos, vars) => t.to(st, vars, pos);
  const reveal = (room, pos, to, duration) => t.to(rooms[room], { t: to, duration, ease: 'power1.inOut' }, pos);
  t.set({}, {}, TOTAL);

  // 1 · the first-floor walls rise out of the drawing (6 → 26)
  at(6, { cut: 4.8, duration: 14, ease: 'power1.inOut' });
  at(20, { cut: 60, duration: 2, ease: 'power1.in' });
  at(7, { ann: 0, duration: 8 });
  at(8, { fov: 30, S: 30, fitW: 0, el: 42, az: -32, tx: 4.3, ty: 1.0, tz: -11.6, duration: 18, ease: 'power2.inOut' });

  // 2 · the ground floor grows underneath and lifts the work to +4.44 (24 → 40)
  at(24, { pb: 1, duration: 15, ease: 'power2.inOut' });
  at(26, { tx: 4.3, ty: 3.2, tz: -10.5, S: 30, el: 22, az: -36, fov: 34, duration: 14, ease: 'power2.inOut' });
  at(26, { city: 1, street: 1, duration: 12, ease: 'power2.out' });
  at(30, { road: 1, duration: 10, ease: 'power2.out' });

  // 3 · down to the sidewalk, in front of the door (40 → 56)
  at(40, { tx: 2.77, ty: 1.56, tz: 0, S: sFor(8.6, 50), fov: 50, el: 0.6, az: -7, duration: 15, ease: 'power2.inOut' });
  reveal('street', 42, 30, 10);
  reveal('tree', 42, 30, 10);
  reveal('facade', 45, 10.4, 10);

  // 4 · on foot: in through the door, the stair and the lift, up to +4.44 (56 → 107)
  t.set(st, { walk: 1 }, 56);
  t.fromTo(st, { wt: 56 }, { wt: TOTAL, duration: TOTAL - 56 }, 56);
  at(57, { door: 1, duration: 5, ease: 'power2.inOut' });
  reveal('sala', 60, 9.5, 12);
  reveal('stair', 60, 9.5, 12);
  reveal('shaft', 60, 9.5, 12);
  at(66, { lamp: 1, duration: 6 });
  at(79, { lift: 1, duration: 21, ease: 'sine.inOut' });

  // 5 · every room of the first floor, front to back, then the terrace (100 → 264)
  at(100, { dusk: 1, duration: 145, ease: 'sine.inOut' });
  reveal('estar', 94, 12, 14);
  at(121, { pane: 1, duration: 5, ease: 'power2.inOut' });
  reveal('core', 143, 11, 10);
  reveal('vacio', 143, 11, 10);
  reveal('vestidor', 172, 5, 8);
  reveal('dorm', 182, 6.5, 8);
  reveal('bano', 196, 4.5, 8);
  reveal('dorm3', 210, 5, 8);
  reveal('paso2', 210, 5, 8);
  // lamps upstairs stay inside: they fade before we step out to the terrace
  at(225, { paLamps: 0, duration: 5 });
  reveal('terrace', 226, 16, 12);
  reveal('roof', 233, 22, 14);
  reveal('all', 240, 50, 18);

  // 6 · the rest of the PH and the whole ground floor, cut at 2 m; then the walls rise again (246 → 284)
  at(258, { cut: 7.5, duration: 0.6, ease: 'power1.in' });
  at(258.6, { cut: 2.1, duration: 5.6, ease: 'power2.inOut' });
  at(272.5, { cut: 7.5, duration: 4.5, ease: 'power2.inOut' });
  at(277, { cut: 60, duration: 1, ease: 'power1.in' });
  return t;
}

const camTarget = new THREE.Vector3();
const walkP = new THREE.Vector3();
const walkL = new THREE.Vector3();

function update() {
  const aspect = innerWidth / innerHeight;
  // On narrow (phone) screens keep the same camera path but open the lens,
  // so the rooms keep most of their width. The sheet already fits the width.
  const narrow = aspect < 16 / 9 ? Math.sqrt(16 / 9 / aspect) : 1;
  const widen = 1 + (narrow - 1) * (1 - Math.min(1, st.fitW / 50));
  let fov;
  let dist;
  planMix = 0;
  camera.up.set(0, 1, 0);
  if (st.walk > 0.5) {
    fov = samplePath(st.wt, walkP, walkL);
    camera.position.copy(walkP);
    camTarget.copy(walkL);
    dist = 0;
    // the whole ground floor seen from straight above, laid out along the long side of the screen
    planMix = Math.min(smooth((st.wt - 258.8) / 5.2), smooth((277 - st.wt) / 5));
    if (planMix > 0) {
      const tanV = Math.tan(25 * D2R);
      const portrait = aspect < 1;
      // portrait: room for the caption below; landscape: room for the rail on the right
      const h = portrait ? 35 / tanV : 31 / (tanV * aspect);
      const dc = portrait ? 14.8 : 28.0;
      planP.set(4.3, h, -dc);
      planL.set(4.3, 0, -dc - 0.001);
      camera.position.lerp(planP, planMix);
      camTarget.lerp(planL, planMix);
      fov += (50 - fov) * planMix;
      planUp.set(0, 1, 0).lerp(portrait ? UP_PORTRAIT : UP_LANDSCAPE, planMix).normalize();
      camera.up.copy(planUp);
    } else camera.up.set(0, 1, 0);
  } else {
    const S = Math.max(st.S, st.fitW / aspect);
    dist = S / (2 * Math.tan((st.fov * D2R) / 2));
    const el = st.el * D2R;
    const az = st.az * D2R;
    camTarget.set(st.tx, st.ty, st.tz);
    camera.position.set(st.tx + dist * Math.cos(el) * Math.sin(az), st.ty + dist * Math.sin(el), st.tz + dist * Math.cos(el) * Math.cos(az));
    fov = st.fov;
  }
  const tanV = Math.tan((fov * D2R) / 2);
  camera.fov = (2 * Math.atan(tanV * (1 + (widen - 1) * (1 - planMix)))) / D2R;
  camera.aspect = aspect;
  camera.near = dist > 400 ? dist - 160 : dist > 7 ? dist * 0.15 : camera.position.y > 9 ? 0.5 : 0.04;
  camera.far = dist + 400;
  camera.lookAt(camTarget);
  camera.updateProjectionMatrix();

  cut.constant = st.cut;
  lib.pocheOn.value = st.cut < 12 ? 1 : 0;
  lib.planOn.value = planMix;
  sheet.material.opacity = st.ann;
  sheet.visible = st.ann > 0.002;
  world.pb.scale.y = Math.max(st.pb, 0.0001);
  world.pb.visible = st.pb > 0.002;
  world.pa.position.y = 0.02 + st.pb * (PA_LEVEL - 0.02);
  world.lift.position.y = 0.25 + st.lift * (PA_LEVEL - 0.25);
  world.walk.visible = st.city > 0.002;
  for (const n of notes) {
    const o = Math.min(smooth((st.wt - n.t[0]) / 1.5), smooth((n.t[1] - st.wt) / 1.5)) * (st.walk > 0.5 ? 1 : 0);
    n.mesh.material.opacity = o;
    n.mesh.visible = o > 0.002;
    if (n.bill && n.mesh.visible) n.mesh.quaternion.copy(camera.quaternion);
  }
  world.ctx.scale.y = st.city;
  world.ctx.visible = st.city > 0.002;
  world.walk.scale.x = st.street;
  world.road.scale.set(st.street, 1, st.road);
  world.road.visible = st.road > 0.002;
  world.door.rotation.y = -1.72 * st.door;
  world.pane.position.x = -0.85 * st.pane;
  world.lamp.intensity = 4 * st.lamp;
  world.liftLight.intensity = 1.6 * st.lamp;
  for (const l of world.paLights) l.intensity = l.userData.k * st.lamp * st.paLamps * (0.6 + 0.4 * st.dusk);
  world.shade.emissiveIntensity = 1.6 * st.lamp;

  // the late sun swings and warms while we walk; the shadow box follows the camera
  sunDir.copy(SUN_A).lerp(SUN_B, st.dusk).lerp(SUN_HIGH, planMix).normalize();
  sun.color.copy(SUN_COL_A).lerp(SUN_COL_B, st.dusk);
  // seen from above as a plan, soft even light: the cut-away slabs would still cast shadows
  sun.intensity = (3.3 - 0.4 * st.dusk) * (1 - 0.8 * planMix);
  hemi.intensity = 0.72 + 1.6 * planMix;
  const focusZ = Math.min(-2, Math.max(-20, (camera.position.z + camTarget.z) / 2));
  // high views over the whole lot need a wider shadow box
  const wide = st.walk > 0.5 && camera.position.y > 9;
  if (wide !== wideShadow) {
    wideShadow = wide;
    const e = wide ? 30 : 13;
    Object.assign(sun.shadow.camera, { left: -e, right: e, top: e, bottom: -e });
    sun.shadow.camera.updateProjectionMatrix();
  }
  if (wide) sunTarget.position.set(4.3, 2, -24);
  else sunTarget.position.set(4.3, st.walk > 0.5 ? 4.5 : 1.6, st.walk > 0.5 ? focusZ : -4.2);
  sun.position.copy(sunTarget.position).addScaledVector(sunDir, 40);

  const time = tl.time();
  for (const el of document.querySelectorAll('[data-from]')) {
    const a = +el.dataset.from;
    const b = +el.dataset.to;
    const f = 2.5;
    const o = Math.min(smooth((time - a) / f), smooth((b - time) / f));
    el.style.opacity = o.toFixed(3);
    el.style.transform = el.classList.contains('intro') && innerWidth > 760 ? `translateY(calc(-50% + ${(1 - o) * 12}px))` : `translateY(${(1 - o) * 12}px)`;
  }
  const stops = document.querySelectorAll('.rail li');
  stops.forEach((li, i) => {
    const next = stops[i + 1];
    li.classList.toggle('is-active', time >= +li.dataset.at - 1e-3 && (!next || time < +next.dataset.at));
  });
  document.querySelector('.rail__bar span').style.transform = `scaleY(${(time / TOTAL).toFixed(4)})`;
  // shadows only matter once real materials appear
  if (time > 44) renderer.shadowMap.needsUpdate = true;
  else if (shadowFrames++ < 2) renderer.shadowMap.needsUpdate = true;
}

function smooth(x) {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

function startScroll() {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.85 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.create({
    trigger: '#track',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    animation: tl,
  });
  gsap.ticker.add(() => {
    update();
    renderer.render(scene, camera);
  });
}

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight, false);
  if (tl) update();
});

init().catch((err) => {
  console.error(err);
  document.querySelector('.loader__label').textContent = 'No se pudo cargar la escena';
});
