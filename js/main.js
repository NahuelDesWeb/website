import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadTextures, MaterialLib, makeZone, PAPER } from './materials.js';
import { buildWorld, PA_LEVEL } from './building.js';
import { drawSheet, SHEET, PA_SHEET_X } from './drawing.js';

const RECORD = new URLSearchParams(location.search).has('record');
const D2R = Math.PI / 180;
if (RECORD) document.documentElement.classList.add('is-recording');

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(RECORD ? 1 : Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
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

// Reveal fronts: where the real materials have already arrived.
const zones = {
  pb: makeZone({}),
  pa: makeZone({}),
  ctx: makeZone({}),
  street: makeZone({ origin: [0, 0, 26], dir: [0, 0, -1], width: 3, t: -2 }),
  facade: makeZone({ origin: [-0.8, 0, 0], dir: [1, 0, 0], width: 1.6, t: -1 }),
  sala: makeZone({ origin: [2.77, 1.25, -0.35], radial: true, width: 0.7, t: -0.2, yMax: 4.3 }),
};

const sun = new THREE.DirectionalLight('#ffe2c2', 3.3);
const sunTarget = new THREE.Object3D();
sunTarget.position.set(3.2, 1.6, -4.2);
// facade faces west: late sun comes from the street, a little from the north (-x)
sun.position.copy(sunTarget.position).add(new THREE.Vector3(-0.4, 0.36, 1).normalize().multiplyScalar(40));
sun.target = sunTarget;
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 5, far: 90 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun, sunTarget);
scene.add(new THREE.HemisphereLight('#e3e9f0', '#cbbcaa', 0.62));

const st = {
  tx: 20, ty: 0, tz: -22, S: 64, fitW: 50, fov: 3, el: 89.9, az: 0,
  cut: 1.2, ann: 1, city: 0.0001, street: 8.56 / 48.56, road: 0.0001,
  paX: PA_SHEET_X, paY: 0.02, door: 0, lamp: 0,
};

let world;
let lib;
let sheet;
let tl;
let shadowFrames = 0;

async function init() {
  await Promise.all([document.fonts.load('500 40px Jost'), document.fonts.load('600 40px Jost'), document.fonts.load('italic 400 40px Jost')]);
  const sets = await loadTextures(renderer);
  lib = new MaterialLib(sets, zones);
  world = buildWorld(lib);
  scene.add(world.pb, world.pa, world.ctx, world.walk, world.road);
  world.shade = lib.find('shade', 'sala', 'paper');

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
  t.set({}, {}, 100);

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
  t.to(zones.street.uRevT, { value: 30, duration: 11, ease: 'power1.inOut' }, 48);
  t.to(zones.facade.uRevT, { value: 10.4, duration: 11, ease: 'power1.inOut' }, 51);

  // 4 · the door opens, walk in (62 → 82)
  at(62, { tz: -2.9, ty: 1.52, az: 0, el: 0.4, S: sFor(3.2, 56), fov: 56, duration: 10, ease: 'power1.inOut' });
  at(63, { door: 1, duration: 7, ease: 'power2.inOut' });
  at(72, { tx: 2.8, ty: 1.56, tz: -4.3, S: sFor(3.4, 58), fov: 58, duration: 10, ease: 'power1.inOut' });
  t.to(zones.sala.uRevT, { value: 9.5, duration: 17, ease: 'power1.inOut' }, 71);
  at(79, { lamp: 1, duration: 6 });

  // 5 · step aside and turn towards the stair (84 → 98)
  at(84, { tx: 0.85, ty: 1.85, tz: -5.2, S: sFor(4.95, 58), el: -2.7, az: 27, duration: 14, ease: 'power2.inOut' });
  return t;
}

const camTarget = new THREE.Vector3();

function update() {
  const aspect = innerWidth / innerHeight;
  const S = Math.max(st.S, st.fitW / aspect);
  const dist = S / (2 * Math.tan((st.fov * D2R) / 2));
  const el = st.el * D2R;
  const az = st.az * D2R;
  camTarget.set(st.tx, st.ty, st.tz);
  camera.position.set(st.tx + dist * Math.cos(el) * Math.sin(az), st.ty + dist * Math.sin(el), st.tz + dist * Math.cos(el) * Math.cos(az));
  camera.fov = st.fov;
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
  world.lamp.intensity = 4 * st.lamp;
  world.shade.emissiveIntensity = 1.6 * st.lamp;

  const p = tl.progress();
  for (const el2 of document.querySelectorAll('[data-from]')) {
    const a = +el2.dataset.from;
    const b = +el2.dataset.to;
    const f = 0.025;
    const o = Math.min(smooth((p - a) / f), smooth((b - p) / f));
    el2.style.opacity = o.toFixed(3);
    el2.style.transform = el2.classList.contains('intro') && innerWidth > 760 ? `translateY(calc(-50% + ${(1 - o) * 12}px))` : `translateY(${(1 - o) * 12}px)`;
  }
  const stops = document.querySelectorAll('.rail li');
  stops.forEach((li, i) => {
    const next = stops[i + 1];
    li.classList.toggle('is-active', p >= +li.dataset.at - 1e-4 && (!next || p < +next.dataset.at));
  });
  document.querySelector('.rail__bar span').style.transform = `scaleY(${p.toFixed(4)})`;
  // shadows only matter once real materials appear
  if (p > 0.44) renderer.shadowMap.needsUpdate = true;
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
