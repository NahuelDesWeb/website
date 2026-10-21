// Materials that start as a line drawing (paper + ink) and turn into real,
// lit PBR surfaces when a "reveal" front sweeps across them.
import * as THREE from 'three';

const srgb = (hex) => {
  const c = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255);
};

export const PAPER = '#f2efe7';
export const INK = '#1f1e1c';
export const RED = '#c9302a';

const POCHE = { ink: srgb(INK), new: srgb(RED), paper: srgb('#e6e2d8') };

// CC0 textures from ambientCG (see assets/textures/CREDITS.md)
const TEXTURE_SETS = ['oak', 'plaster', 'plasterTex', 'concrete', 'asphalt', 'fabric', 'leather'];

const DEFS = {
  paper: { color: '#f4f1ea', roughness: 0.95 },
  plaster: { set: 'plaster', noMap: true, color: '#f1ede6', tile: 3.2, normal: 0.12, roughness: 0.9 },
  facadePB: { set: 'plaster', color: '#f4efe6', tile: 2.6, normal: 0.35 },
  facadePA: { set: 'plasterTex', color: '#f1ece3', tile: 1.4, normal: 0.8 },
  oak: { set: 'oak', color: '#f3eee9', tile: 2.0, rot: true, normal: 0.6 },
  oakFurn: { set: 'oak', color: '#c9a888', tile: 1.2, normal: 0.4 },
  doorWood: { set: 'oak', color: '#6c5a4c', tile: 1.4, rot: true, normal: 0.5 },
  concrete: { set: 'concrete', color: '#e4e0d9', tile: 2.2, normal: 0.6 },
  stone: { set: 'concrete', color: '#ead9bd', tile: 1.1, normal: 0.4, roughness: 0.55 },
  asphalt: { set: 'asphalt', color: '#cfccc6', tile: 3.5 },
  vereda: { set: 'vereda', color: '#ffffff', tile: 0.8, roughness: 0.88, normal: 1.0 },
  fabric: { set: 'fabric', color: '#e9e0d3', tile: 0.55, normal: 0.8 },
  rug: { set: 'fabric', color: '#cdbb9f', tile: 0.3, normal: 1.0 },
  leather: { set: 'leather', color: '#ffffff', tile: 0.6, normal: 0.6, roughness: 0.7 },
  steel: { color: '#1b1b1b', roughness: 0.42, metalness: 0.6 },
  brass: { color: '#b48f58', roughness: 0.3, metalness: 1 },
  glass: { color: '#b8c8cb', roughness: 0.05, glass: 0.14 },
  clay: { color: '#a86a4a', roughness: 0.75 },
  ceramic: { color: '#e5ded2', roughness: 0.3 },
  branch: { color: '#5e4b3b', roughness: 0.9 },
  shade: { color: '#f3e9d6', roughness: 0.9, emissive: '#ffc98c' },
  art: { mapKey: 'art', color: '#ffffff', roughness: 0.85 },
};

const REVEAL_GLSL = /* glsl */ `
uniform vec3 uRevO;
uniform vec3 uRevD;
uniform float uRevT;
uniform float uRevW;
uniform float uRevMode;
uniform float uRevYMax;
varying vec3 vWPos;
float revealMask(out float edge) {
  float s = uRevMode > 0.5 ? length(vWPos - uRevO) : dot(vWPos - uRevO, uRevD);
  float inY = step(vWPos.y, uRevYMax);
  edge = (1.0 - smoothstep(0.0, 0.025, abs(s - uRevT))) * inY;
  return (1.0 - smoothstep(uRevT - uRevW, uRevT, s)) * inY;
}
`;

export function makeZone(o) {
  return {
    uRevO: { value: new THREE.Vector3(...(o.origin ?? [0, 0, 0])) },
    uRevD: { value: new THREE.Vector3(...(o.dir ?? [1, 0, 0])).normalize() },
    uRevT: { value: o.t ?? -1e5 },
    uRevW: { value: o.width ?? 1 },
    uRevMode: { value: o.radial ? 1 : 0 },
    uRevYMax: { value: o.yMax ?? 1e4 },
  };
}

export async function loadTextures(renderer) {
  const loader = new THREE.TextureLoader();
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const load = (url, color) =>
    new Promise((resolve, reject) =>
      loader.load(
        url,
        (t) => {
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.anisotropy = aniso;
          if (color) t.colorSpace = THREE.SRGBColorSpace;
          resolve(t);
        },
        undefined,
        reject,
      ),
    );
  const sets = {};
  await Promise.all(
    TEXTURE_SETS.map(async (k) => {
      const base = `assets/textures/${k}/`;
      const [map, normalMap, roughnessMap] = await Promise.all([
        load(base + 'color.jpg', true),
        load(base + 'normal.jpg'),
        load(base + 'rough.jpg'),
      ]);
      sets[k] = { map, normalMap, roughnessMap };
    }),
  );
  sets.vereda = makeVereda(aniso);
  sets.art = { map: makeArt() };
  return sets;
}

export class MaterialLib {
  constructor(sets, zones) {
    this.sets = sets;
    this.zones = zones;
    this.cache = new Map();
    this.lineCache = new Map();
    this.paper = srgb(PAPER);
    this.ink = srgb(INK);
    // poché (the cut) is only shown while the drawing is being cut
    this.pocheOn = { value: 1 };
  }

  find(def, zone, poche = 'ink') {
    return this.cache.get(`${def}|${zone}|${poche}`);
  }

  surface(defKey, zoneKey, poche = 'ink') {
    const key = `${defKey}|${zoneKey}|${poche}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const def = DEFS[defKey];
    const zone = this.zones[zoneKey];
    const set = def.set ? this.sets[def.set] : def.mapKey ? this.sets[def.mapKey] : null;
    const glass = def.glass ?? 0;
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(def.color),
      roughness: def.roughness ?? 1,
      metalness: def.metalness ?? 0,
      map: def.noMap ? null : set?.map ?? null,
      normalMap: set?.normalMap ?? null,
      roughnessMap: set?.roughnessMap ?? null,
      emissive: new THREE.Color(def.emissive ?? '#000000'),
      emissiveIntensity: 0,
      side: THREE.DoubleSide,
      transparent: glass > 0,
      opacity: glass > 0 ? glass : 1,
      depthWrite: !(glass > 0),
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      envMapIntensity: 0.8,
    });
    if (m.normalMap) m.normalScale.setScalar(def.normal ?? 1);
    const uTex = new THREE.Vector4(def.set ? def.tile : 0, def.rot ? 1 : 0, 0, 0);
    const uniforms = { uTex: { value: uTex }, uPoche: { value: POCHE[poche] }, uPaper: { value: this.paper }, uInk: { value: this.ink }, uGlass: { value: glass > 0 ? 1 : 0 }, uPocheOn: this.pocheOn };
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, zone, uniforms);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNrm;\nuniform vec4 uTex;')
        .replace(
          '#include <uv_vertex>',
          /* glsl */ `#include <uv_vertex>
          {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vec3 wn = normalize(mat3(modelMatrix) * normal);
            vWPos = wp.xyz;
            vWNrm = wn;
            if (uTex.x > 0.0) {
              vec3 an = abs(wn);
              vec2 tuv;
              if (an.y >= an.x && an.y >= an.z) tuv = vec2(wp.x, -wp.z);
              else if (an.x >= an.z) tuv = vec2(-wp.z, wp.y);
              else tuv = wp.xy;
              if (uTex.y > 0.5) tuv = tuv.yx;
              tuv /= uTex.x;
              #ifdef USE_MAP
                vMapUv = tuv;
              #endif
              #ifdef USE_NORMALMAP
                vNormalMapUv = tuv;
              #endif
              #ifdef USE_ROUGHNESSMAP
                vRoughnessMapUv = tuv;
              #endif
            }
          }`,
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>\n${REVEAL_GLSL}\nvarying vec3 vWNrm;\nuniform vec3 uPoche;\nuniform vec3 uPaper;\nuniform vec3 uInk;\nuniform float uGlass;\nuniform float uPocheOn;`,
        )
        .replace(
          '#include <dithering_fragment>',
          /* glsl */ `#include <dithering_fragment>
          {
            float edge;
            float m = revealMask(edge);
            vec3 n = normalize(vWNrm);
            float shade = n.y > 0.5 ? 1.0 : (n.y < -0.5 ? 0.9 : 0.945 + 0.03 * n.z - 0.02 * n.x);
            vec3 paper = uPaper * shade;
            float alpha = 1.0;
            if (!gl_FrontFacing) paper = mix(paper, uPoche, uPocheOn);
            else if (uGlass > 0.5) alpha = 0.0;
            gl_FragColor.rgb = mix(paper, gl_FragColor.rgb, m);
            gl_FragColor.a = mix(alpha, gl_FragColor.a, m);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, uInk, edge * 0.7);
            gl_FragColor.a = max(gl_FragColor.a, edge * 0.7);
          }`,
        );
    };
    m.customProgramCacheKey = () => 'reveal-surface';
    this.cache.set(key, m);
    return m;
  }

  line(zoneKey, kind = 'ink') {
    const key = `${zoneKey}|${kind}`;
    if (this.lineCache.has(key)) return this.lineCache.get(key);
    const zone = this.zones[zoneKey];
    const m = new THREE.LineBasicMaterial({
      color: new THREE.Color(kind === 'soft' ? '#8d887e' : INK),
      transparent: true,
      opacity: kind === 'soft' ? 0.75 : 0.92,
      depthWrite: false,
    });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, zone);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
        .replace('#include <fog_vertex>', '#include <fog_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>\n${REVEAL_GLSL}`)
        .replace('#include <opaque_fragment>', '{ float e; diffuseColor.a *= 1.0 - revealMask(e); }\n#include <opaque_fragment>');
    };
    m.customProgramCacheKey = () => 'reveal-line';
    this.lineCache.set(key, m);
    return m;
  }
}

// Buenos Aires sidewalk: "baldosa vainilla" of 9 panes, 0.40 m. Texture covers 2 x 2 tiles.
function makeVereda(aniso) {
  const N = 512;
  const tile = N / 2;
  const h = new Float32Array(N * N);
  const pane = tile / 3;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const tx = x % tile;
      const ty = y % tile;
      const joint = Math.min(tx, ty, tile - tx, tile - ty);
      const px = tx % pane;
      const py = ty % pane;
      const groove = Math.min(px, py, pane - px, pane - py);
      let v = Math.min(1, groove / 6) * 0.8 + 0.2;
      if (joint < 3) v = 0;
      h[y * N + x] = v;
    }
  }
  const color = document.createElement('canvas');
  color.width = color.height = N;
  const cg = color.getContext('2d');
  const cimg = cg.createImageData(N, N);
  const normal = document.createElement('canvas');
  normal.width = normal.height = N;
  const ng = normal.getContext('2d');
  const nimg = ng.createImageData(N, N);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const tIdx = Math.floor(x / tile) + Math.floor(y / tile) * 2;
      const n = rnd() * 0.08 - 0.04 + (tIdx % 3) * 0.015;
      const base = h[i] < 0.05 ? 0.62 : 0.86 + n - (1 - h[i]) * 0.1;
      cimg.data[i * 4] = Math.min(255, 196 * base + 24);
      cimg.data[i * 4 + 1] = Math.min(255, 188 * base + 24);
      cimg.data[i * 4 + 2] = Math.min(255, 168 * base + 22);
      cimg.data[i * 4 + 3] = 255;
      const l = h[y * N + ((x - 1 + N) % N)];
      const r = h[y * N + ((x + 1) % N)];
      const u = h[((y - 1 + N) % N) * N + x];
      const d = h[((y + 1) % N) * N + x];
      const v = new THREE.Vector3((l - r) * 2.2, (d - u) * 2.2, 1).normalize();
      nimg.data[i * 4] = (v.x * 0.5 + 0.5) * 255;
      nimg.data[i * 4 + 1] = (v.y * 0.5 + 0.5) * 255;
      nimg.data[i * 4 + 2] = (v.z * 0.5 + 0.5) * 255;
      nimg.data[i * 4 + 3] = 255;
    }
  }
  cg.putImageData(cimg, 0, 0);
  ng.putImageData(nimg, 0, 0);
  const map = new THREE.CanvasTexture(color);
  map.colorSpace = THREE.SRGBColorSpace;
  const normalMap = new THREE.CanvasTexture(normal);
  for (const t of [map, normalMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = aniso;
  }
  return { map, normalMap };
}

// Abstract canvas for the living room wall: ochre field, an ink arc like a door swing.
function makeArt() {
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 680;
  const g = c.getContext('2d');
  g.fillStyle = '#ece5d8';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#c99a4f';
  g.fillRect(90, 120, 380, 460);
  g.fillStyle = '#a5532f';
  g.beginPath();
  g.arc(560, 210, 70, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#1f1e1c';
  g.lineWidth = 26;
  g.beginPath();
  g.arc(470, 580, 300, Math.PI, Math.PI * 1.5);
  g.stroke();
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(470, 580);
  g.lineTo(470, 280);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
