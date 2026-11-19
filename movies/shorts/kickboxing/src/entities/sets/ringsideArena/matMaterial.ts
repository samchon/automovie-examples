import * as THREE from "three";

/**
 * Creates the pale canvas's seeded weave as a 512 × 512 sRGB texture. The canvas owner disposes the returned standard material and its texture.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment declares the material's purpose, texture dimensions and colour space, and disposal owner.
 * @evidence contracts/development/implementation.md#principled-implementation A fixed seeded sequence gives small fibre variation; periodic threads and a broad tone pool layer over it. The texture stores four bounded byte channels per texel.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure A single loop combines independent fibre and broad tone terms, then assigns texture properties and returns the material.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The fibre parameters set the look of the production's chosen canvas; every texel is generated from its position and deterministic seed.
 * @evidence contracts/development/implementation.md#efficient-algorithms One pass writes four bytes at each of 512 squared texels. Work and retained texture storage are proportional to the texel count.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work A scene constructs its material once and renders it across frames. Separate scenes own separate disposable material and texture objects.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The return value owns one 1 MiB texture data array. The scene releases its material and texture on disposal.
 * @evidence contracts/development/entities.md#settings-realization The pale canvas in docs/body/screenplay/kickboxing/020-the-round.md#p01 is realized by the low-contrast textured surface. The set fixes its size, plane and marks separately.
 * @evidence contracts/development/entities.md#object-shape This set fragment returns a fresh Three.js material and texture. The arena owns their lifetime and positions the surface.
 * @evidence contracts/development/entities.md#controls-and-source A fixed local procedural seed, periodic fibre and tone terms generate the texture without external images or a second production form.
 */
export function matMaterial(): THREE.MeshStandardMaterial {
  const size=512, data=new Uint8Array(size*size*4);
  let seed=91711;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const u=(x+.5)/size-.5,v=(y+.5)/size-.5;
    const pool=Math.exp(-(u*u*.78+v*v)*7.0);
    const fibre=(seed/4294967296-.5)*4.6+(x%3===0 ? .9 : 0)-(y%4===0 ? .7 : 0);
    const delta=17*pool+fibre;
    const j=(y*size+x)*4;
    data[j]=189+delta;data[j+1]=186+delta;data[j+2]=167+delta;data[j+3]=255;
  }
  const map=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
  map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearFilter;map.needsUpdate=true;
  return new THREE.MeshStandardMaterial({map,roughness:.95});
}
