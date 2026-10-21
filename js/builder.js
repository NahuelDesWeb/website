// Geometry builder. Plan coordinates: x across the lot (0 = left party wall),
// y up, d into the lot from the street line (L.O.). World z = -d.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const KEEP = ['position', 'normal', 'uv'];

function prep(g) {
  if (g.index) g = g.toNonIndexed();
  g.clearGroups();
  for (const k of Object.keys(g.attributes)) if (!KEEP.includes(k)) g.deleteAttribute(k);
  if (!g.attributes.uv) {
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  }
  return g;
}

function push(map, key, value) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

export class Builder {
  constructor(lib) {
    this.lib = lib;
    this.meshes = new Map();
    this.lines = new Map();
  }

  // o: { poche: 'ink' | 'new' | 'paper', line: 'ink' | 'soft', edges: angle | false, cast: bool }
  add(geom, mat, zone, o = {}) {
    const key = [mat, zone, o.poche ?? 'ink', o.cast === false ? 0 : 1].join('|');
    if (o.edges !== false) push(this.lines, `${zone}|${o.line ?? 'ink'}`, new THREE.EdgesGeometry(geom, o.edges ?? 25));
    push(this.meshes, key, prep(geom));
    return this;
  }

  box(x0, x1, y0, y1, d0, d1, mat, zone, o) {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, d1 - d0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, -(d0 + d1) / 2);
    return this.add(g, mat, zone, o);
  }

  // Any geometry placed with a matrix (rotated furniture, inclined handrails).
  geo(g, m4, mat, zone, o) {
    if (m4) g.applyMatrix4(m4);
    return this.add(g, mat, zone, o);
  }

  cyl(x, d, y0, y1, r, mat, zone, o = {}) {
    const g = new THREE.CylinderGeometry(r, o.r2 ?? r, y1 - y0, o.seg ?? 40, 1, o.open ?? false);
    g.translate(x, (y0 + y1) / 2, -d);
    return this.add(g, mat, zone, o);
  }

  // Wall along 'x' (thickness t0..t1 in d) or along 'd' (thickness t0..t1 in x).
  // holes: [a0, a1, y0, y1] along the wall. Openings that start at the wall base become notches.
  wall(axis, s0, s1, t0, t1, y0, y1, holes, mat, zone, o) {
    const ops = [...(holes ?? [])].sort((a, b) => a[0] - b[0]);
    const shape = new THREE.Shape();
    shape.moveTo(s0, y0);
    for (const [a0, a1, b0, b1] of ops) {
      if (b0 > y0 + 1e-4) continue;
      shape.lineTo(a0, y0);
      shape.lineTo(a0, b1);
      shape.lineTo(a1, b1);
      shape.lineTo(a1, y0);
    }
    shape.lineTo(s1, y0);
    shape.lineTo(s1, y1);
    shape.lineTo(s0, y1);
    for (const [a0, a1, b0, b1] of ops) {
      if (b0 <= y0 + 1e-4) continue;
      const p = new THREE.Path();
      p.moveTo(a0, b0);
      p.lineTo(a1, b0);
      p.lineTo(a1, b1);
      p.lineTo(a0, b1);
      shape.holes.push(p);
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: t1 - t0, bevelEnabled: false });
    if (axis === 'x') g.translate(0, 0, -t1);
    else {
      g.rotateY(Math.PI / 2);
      g.translate(t0, 0, 0);
    }
    return this.add(g, mat, zone, o);
  }

  // Horizontal slab from a plan outline [[x, d], ...] with rectangular holes [x0, x1, d0, d1].
  slab(outline, holes, y0, y1, mat, zone, o) {
    const shape = new THREE.Shape();
    outline.forEach(([x, d], i) => (i ? shape.lineTo(x, d) : shape.moveTo(x, d)));
    for (const [a0, a1, b0, b1] of holes ?? []) {
      const p = new THREE.Path();
      p.moveTo(a0, b0);
      p.lineTo(a1, b0);
      p.lineTo(a1, b1);
      p.lineTo(a0, b1);
      shape.holes.push(p);
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    g.translate(0, y0, 0);
    return this.add(g, mat, zone, o);
  }

  build(group, ox = 0) {
    for (const [key, list] of this.meshes) {
      const [mat, zone, poche, cast] = key.split('|');
      const g = mergeGeometries(list);
      if (ox) g.translate(ox, 0, 0);
      const mesh = new THREE.Mesh(g, this.lib.surface(mat, zone, poche));
      mesh.castShadow = cast === '1';
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    for (const [key, list] of this.lines) {
      const [zone, kind] = key.split('|');
      const g = mergeGeometries(list);
      if (ox) g.translate(ox, 0, 0);
      const lines = new THREE.LineSegments(g, this.lib.line(zone, kind));
      lines.renderOrder = 2;
      group.add(lines);
    }
    return group;
  }
}
