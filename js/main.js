import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadTextures, MaterialLib, makeRooms, PAPER } from './materials.js';
import { buildWorld, PA_LEVEL } from './building.js';
import { drawSheet, SHEET, PA_SHEET_X } from './drawing.js';

const RECORD = new URLSearchParams(location.search).has('record');
const D2R = Math.PI / 180;
const TOTAL = 246; // timeline length in scroll units
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
  { name: 'estar', min: [0.1, Y - 0.31, -6.43], max: [8.47, Y + 3.06, -0.19], origin: [4.2, Y + 1.4, -5.7], radial: true, width: 1.0, t: -0.2 },
  { name: 'core', min: [0.1, Y - 0.31, -11.33], max: [8.47, Y + 4.3, -6.42], origin: [7.4, Y + 1.5, -6.6], radial: true, width: 1.0, t: -0.2 },
  { name: 'vacio', min: [2.27, -0.2, -10.18], max: [6.29, Y + 4.3, -6.42], origin: [7.4, Y + 1.5, -6.6], radial: true, width: 1.0, t: -0.2 },
  { name: 'dorm', min: [0.1, Y - 0.31, -14.26], max: [3.04, Y + 3.06, -10.18], origin: [2.9, Y + 1.5, -10.75], radial: true, width: 1.0, t: -0.2 },
  { name: 'terrace', min: [-0.01, Y - 0.31, -23.4], max: [8.57, Y + 4.3, -14.26], origin: [7.9, Y + 1.5, -14.3], radial: true, width: 1.5, t: -0.2 },
  { name: 'roof', min: [-0.01, Y + 2.9, -14.4], max: [8.57, Y + 4.3, -0.19], origin: [7.9, Y + 1.5, -14.3], radial: true, width: 1.5, t: -0.2 },
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
scene.add(new THREE.HemisphereLight('#e3e9f0', '#cbbcaa', 0.72));
// facade faces west: late sun comes from the street and swings north (-x) as the visit goes on
const SUN_A = new THREE.Vector3(-0.4, 0.36, 1).normalize();
const SUN_B = new THREE.Vector3(-0.85, 0.36, 0.62).normalize();
const SUN_COL_A = new THREE.Color('#ffe2c2');
const SUN_COL_B = new THREE.Color('#ffbf80');
const sunDir = new THREE.Vector3();

const st = {
  tx: 20, ty: 0, tz: -22, S: 64, fitW: 50, fov: 3, el: 89.9, az: 0,
  cut: 1.2, ann: 1, city: 0.0001, street: 8.56 / 48.56, road: 0.0001,
  paX: PA_SHEET_X, paY: 0.02, door: 0, lamp: 0, pane: 0, dusk: 0,
  walk: 0, wt: 0, paLamps: 1,
};

// On foot (after the living room): position and look-at keyframes, in timeline units.
// Hermite curve through them; `stop` frames hold still.
const E = PA_LEVEL + 1.6;
const PATH = [
  { t: 99, p: [3.095, 1.617, -0.794], l: [0.85, 1.85, -5.2], fov: 58, stop: true },
  { t: 104, p: [1.85, 1.65, -1.9], l: [0.62, 2.7, -4.8], fov: 60 },
  { t: 109, p: [0.68, 2.5, -3.5], l: [0.66, 3.5, -6.2], fov: 62 },
  { t: 113, p: [0.66, 3.45, -4.85], l: [2.4, 4.4, -5.95], fov: 62 },
  { t: 116.5, p: [0.85, 3.98, -5.8], l: [3.6, 5.3, -5.75], fov: 62 },
  { t: 121, p: [2.55, 5.05, -5.8], l: [5.2, 6.0, -5.2], fov: 62 },
  { t: 125, p: [4.35, E, -5.72], l: [5.6, 5.9, -3.0], fov: 62 },
  { t: 131, p: [5.3, E + 0.02, -5.65], l: [3.5, 5.55, -0.6], fov: 60, stop: true },
  { t: 136, p: [7.65, E, -4.3], l: [6.6, 5.8, -0.5], fov: 60 },
  { t: 140, p: [7.3, E, -2.1], l: [6.42, 5.7, 1.5], fov: 60 },
  { t: 143, p: [6.42, E - 0.02, -0.95], l: [6.4, 5.6, 3.0], fov: 60 },
  { t: 147, p: [6.3, E - 0.04, 0.55], l: [-3.0, 5.7, 5.0], fov: 58, stop: true },
  { t: 151, p: [6.3, E - 0.04, 0.55], l: [2.0, 5.3, 11.0], fov: 58, stop: true },
  { t: 155, p: [6.42, E - 0.02, -1.2], l: [7.4, 5.9, -5.0], fov: 60 },
  { t: 159, p: [7.45, E, -4.2], l: [7.2, 6.0, -8.0], fov: 62 },
  { t: 163, p: [7.35, E, -7.4], l: [5.0, 6.1, -8.3], fov: 64 },
  { t: 165.5, p: [6.75, 6.22, -8.3], l: [4.0, 6.3, -8.3], fov: 64 },
  { t: 167.5, p: [5.85, 6.26, -8.3], l: [3.6, 6.8, -8.4], fov: 66 },
  { t: 171, p: [4.6, 6.0, -8.0], l: [3.0, 8.0, -9.2], fov: 72, stop: true },
  { t: 175, p: [4.6, 6.0, -8.0], l: [3.4, 8.7, -7.0], fov: 72, stop: true },
  { t: 178, p: [5.85, 6.26, -8.3], l: [7.6, 6.2, -8.3], fov: 66 },
  { t: 180.5, p: [6.9, 6.1, -8.5], l: [7.3, 6.0, -11.0], fov: 62 },
  { t: 184, p: [7.3, E, -9.9], l: [5.0, 6.0, -10.8], fov: 62 },
  { t: 188, p: [4.6, E, -10.75], l: [1.5, 5.9, -10.9], fov: 62 },
  { t: 192, p: [2.85, E - 0.01, -10.8], l: [1.3, 5.4, -13.4], fov: 62 },
  { t: 196, p: [2.55, E - 0.02, -10.95], l: [0.9, 5.25, -14.0], fov: 62, stop: true },
  { t: 201, p: [2.6, E - 0.04, -12.4], l: [0.6, 5.4, -8.6], fov: 62, stop: true },
  { t: 203.5, p: [2.7, E, -11.0], l: [4.0, 6.0, -10.9], fov: 62 },
  { t: 206, p: [3.4, E, -10.75], l: [6.5, 6.0, -10.9], fov: 62 },
  { t: 209, p: [7.0, E, -10.8], l: [8.0, 6.0, -13.5], fov: 62 },
  { t: 213, p: [7.9, E, -12.6], l: [7.9, 6.0, -17.0], fov: 62 },
  { t: 217, p: [7.88, E, -14.9], l: [6.5, 5.9, -19.0], fov: 62 },
  { t: 221, p: [6.6, E + 0.01, -18.6], l: [4.2, 6.3, -14.5], fov: 60 },
  { t: 226, p: [6.8, E + 0.2, -22.2], l: [3.6, 5.6, -14.5], fov: 62, stop: true },
  { t: 234, p: [4.5, 13, -19], l: [4.3, 5.0, -10], fov: 48 },
  { t: 240, p: [-6, 19, 9], l: [4.3, 4.0, -9.5], fov: 40 },
  { t: 246, p: [-12, 24, 22], l: [4.3, 3.5, -10.5], fov: 38, stop: true },
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

  // 1 · the walls rise out of the drawing (6 → 30)
  at(6, { cut: 4.8, duration: 18, ease: 'power1.inOut' });
  at(24, { cut: 60, duration: 2, ease: 'power1.in' });
  at(7, { ann: 0, duration: 8 });
  at(8, { fov: 30, S: 52, fitW: 0, el: 46, az: -30, tx: 11.5, ty: 1.5, tz: -19, duration: 22, ease: 'power2.inOut' });
  at(21, { city: 1, street: 1, duration: 11, ease: 'power2.out' });

  // 2 · the first floor lifts off the sheet and lands on the house (30 → 44)
  at(30, { paX: 0, duration: 12, ease: 'power2.inOut' });
  at(30, { paY: 7.6, duration: 6, ease: 'power2.out' });
  at(36, { paY: PA_LEVEL, duration: 6, ease: 'power2.in' });
  at(30, { tx: 4.4, ty: 3.2, tz: -8, S: 30, el: 26, az: -32, fov: 34, duration: 14, ease: 'power2.inOut' });
  at(38, { road: 1, duration: 8, ease: 'power2.out' });

  // 3 · down to the sidewalk, in front of the door (44 → 62)
  at(44, { tx: 2.77, ty: 1.56, tz: 0, S: sFor(8.6, 50), fov: 50, el: 0.6, az: -7, duration: 17, ease: 'power2.inOut' });
  reveal('street', 48, 30, 11);
  reveal('tree', 48, 30, 11);
  reveal('facade', 51, 10.4, 11);

  // 4 · the door opens, walk in (62 → 82)
  at(62, { tz: -2.9, ty: 1.52, az: 0, el: 0.4, S: sFor(3.2, 56), fov: 56, duration: 10, ease: 'power1.inOut' });
  at(63, { door: 1, duration: 7, ease: 'power2.inOut' });
  at(72, { tx: 2.8, ty: 1.56, tz: -4.3, S: sFor(3.4, 58), fov: 58, duration: 10, ease: 'power1.inOut' });
  reveal('sala', 71, 9.5, 17);
  reveal('stair', 71, 9.5, 17);
  at(79, { lamp: 1, duration: 6 });

  // 5 · step aside and turn towards the stair (84 → 98)
  at(84, { tx: 0.85, ty: 1.85, tz: -5.2, S: sFor(4.95, 58), el: -2.7, az: 27, duration: 14, ease: 'power2.inOut' });

  // 6 · on foot from here: up the stair, through the first floor, out to the terrace (99 → 232)
  t.set(st, { walk: 1 }, 99);
  t.fromTo(st, { wt: 99 }, { wt: TOTAL, duration: TOTAL - 99 }, 99);
  at(100, { dusk: 1, duration: 130, ease: 'sine.inOut' });
  // lamps upstairs stay inside: they fade before we step out to the terrace
  at(213, { paLamps: 0, duration: 5 });
  reveal('estar', 120, 12, 13);
  at(136.5, { pane: 1, duration: 5, ease: 'power2.inOut' });
  reveal('core', 152, 11, 12);
  reveal('vacio', 152, 11, 12);
  reveal('dorm', 186, 6.5, 9);
  reveal('terrace', 212, 16, 12);
  reveal('roof', 219, 22, 14);
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
  if (st.walk > 0.5) {
    fov = samplePath(st.wt, walkP, walkL);
    camera.position.copy(walkP);
    camTarget.copy(walkL);
    dist = 0;
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
  camera.fov = (2 * Math.atan(tanV * widen)) / D2R;
  camera.aspect = aspect;
  camera.near = dist > 400 ? dist - 160 : dist > 7 ? dist * 0.15 : 0.04;
  camera.far = dist + 400;
  camera.lookAt(camTarget);
  camera.updateProjectionMatrix();

  cut.constant = st.cut;
  lib.pocheOn.value = st.cut < 12 ? 1 : 0;
  sheet.material.opacity = st.ann;
  sheet.visible = st.ann > 0.002;
  world.pa.position.set(st.paX, st.paY, 0);
  world.ctx.scale.y = st.city;
  world.ctx.visible = st.city > 0.002;
  world.walk.scale.x = st.street;
  world.road.scale.set(st.street, 1, st.road);
  world.road.visible = st.road > 0.002;
  world.door.rotation.y = -1.72 * st.door;
  world.pane.position.x = -0.85 * st.pane;
  world.lamp.intensity = 4 * st.lamp;
  for (const l of world.paLights) l.intensity = l.userData.k * st.lamp * st.paLamps * (0.6 + 0.4 * st.dusk);
  world.shade.emissiveIntensity = 1.6 * st.lamp;

  // the late sun swings and warms while we walk; the shadow box follows the camera
  sunDir.copy(SUN_A).lerp(SUN_B, st.dusk).normalize();
  sun.color.copy(SUN_COL_A).lerp(SUN_COL_B, st.dusk);
  sun.intensity = 3.3 - 0.4 * st.dusk;
  const focusZ = Math.min(-2, Math.max(-20, (camera.position.z + camTarget.z) / 2));
  sunTarget.position.set(4.3, st.walk > 0.5 ? 4.5 : 1.6, st.walk > 0.5 ? focusZ : -4.2);
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
