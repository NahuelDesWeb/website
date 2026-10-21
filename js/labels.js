// Plan annotations placed in the space: a room tag like on the sheet
// (name, PA|xx box, measures) and dimension lines drawn on the floor.
import * as THREE from 'three';
import { INK } from './materials.js';

const FONT = 'Jost, "Futura", "Century Gothic", sans-serif';
const PX = 220; // canvas pixels per metre

function texture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function material(map) {
  return new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
}

// { title, tag, lines: [] } → vertical card, height in metres
export function roomTag({ title, tag, lines = [] }, height = 0.62) {
  const pad = 26;
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const titleF = `600 46px ${FONT}`;
  const tagF = `500 32px ${FONT}`;
  const lineF = `400 30px ${FONT}`;
  g.font = titleF;
  g.letterSpacing = '4px';
  let w = g.measureText(title).width;
  g.font = lineF;
  g.letterSpacing = '1px';
  for (const l of lines) w = Math.max(w, g.measureText(l).width);
  c.width = Math.ceil(w + pad * 2 + (tag ? 150 : 0));
  c.height = 72 + lines.length * 42 + pad * 2;
  g.fillStyle = 'rgba(242,239,231,0.88)';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = INK;
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, c.width - 3, c.height - 3);
  g.fillStyle = INK;
  g.textBaseline = 'top';
  g.font = titleF;
  g.letterSpacing = '4px';
  g.fillText(title, pad, pad);
  if (tag) {
    g.font = tagF;
    g.letterSpacing = '2px';
    const tw = g.measureText(tag).width + 20;
    const tx = c.width - pad - tw;
    g.lineWidth = 2;
    g.strokeRect(tx, pad + 4, tw, 44);
    g.fillText(tag, tx + 10, pad + 12);
  }
  g.fillRect(pad, pad + 60, c.width - pad * 2, 2);
  g.font = lineF;
  g.letterSpacing = '1px';
  lines.forEach((l, i) => g.fillText(l, pad, pad + 76 + i * 42));
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry((height * c.width) / c.height, height), material(texture(c)));
  // the tag reads like a label on the sheet: always in front of the room it names
  mesh.material.depthTest = false;
  mesh.renderOrder = 6;
  return mesh;
}

// Dimension line on the floor: length in metres along local x, label in the middle.
export function floorDim(length, label) {
  const c = document.createElement('canvas');
  c.width = Math.ceil((length + 0.3) * PX);
  c.height = 110;
  const g = c.getContext('2d');
  const x0 = 0.15 * PX;
  const x1 = c.width - 0.15 * PX;
  const y = 74;
  g.strokeStyle = INK;
  g.fillStyle = INK;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(x0 - 24, y);
  g.lineTo(x1 + 24, y);
  for (const x of [x0, x1]) {
    g.moveTo(x - 16, y + 16);
    g.lineTo(x + 16, y - 16);
    g.moveTo(x, y - 30);
    g.lineTo(x, y + 30);
  }
  g.stroke();
  g.font = `500 52px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'bottom';
  g.fillText(label, c.width / 2, y - 8);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(c.width / PX, c.height / PX), material(texture(c)));
  mesh.geometry.rotateX(-Math.PI / 2);
  mesh.renderOrder = 5;
  return mesh;
}

// Level mark like on the sheet (half-filled circle and the level), flat on the floor.
export function levelMark(label) {
  const c = document.createElement('canvas');
  c.width = 420;
  c.height = 130;
  const g = c.getContext('2d');
  const r = 40;
  const cx = 60;
  const cy = 65;
  g.strokeStyle = INK;
  g.fillStyle = INK;
  g.lineWidth = 4;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.stroke();
  for (const a of [-Math.PI / 2, Math.PI / 2]) {
    g.beginPath();
    g.moveTo(cx, cy);
    g.arc(cx, cy, r, a, a + Math.PI / 2);
    g.closePath();
    g.fill();
  }
  g.font = `500 60px ${FONT}`;
  g.textBaseline = 'middle';
  g.fillText(label, cx + r + 22, cy);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(c.width / PX, c.height / PX), material(texture(c)));
  mesh.geometry.rotateX(-Math.PI / 2);
  mesh.renderOrder = 5;
  return mesh;
}
