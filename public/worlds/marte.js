import * as THREE from 'https://esm.sh/three@0.158.0'

export function createMarte(scene) {
  const group  = new THREE.Group()
  const radius = 2.2
  const geo    = new THREE.SphereGeometry(radius, 128, 128)
  const positions = geo.attributes.position
  const colArr    = new Float32Array(positions.count * 3)

  for (let i = 0; i < positions.count; i++) {
    const x      = positions.getX(i)
    const y      = positions.getY(i)
    const z      = positions.getZ(i)
    const lat    = Math.asin(Math.max(-1, Math.min(1, y / radius)))
    const lon    = Math.atan2(z, x)
    const absLat = Math.abs(lat)

    const nv =
      Math.sin(lat * 4.2 + lon * 5.1 + 0.8) * 0.30 +
      Math.cos(lat * 7.1 - lon * 3.4 + 1.2) * 0.20 +
      Math.sin(lat * 11  + lon * 8.3)        * 0.12 +
      Math.cos(lat * 2.5 + lon * 12  + 2.1)  * 0.08

    const crater = Math.max(0,
      Math.sin(lat * 9.0 + lon * 7.5 + 1.5) *
      Math.cos(lat * 6.0 + lon * 10  + 0.9)
    ) * 0.44

    const poleBlend = Math.max(0, (absLat - 1.30) / 0.26)

    let r, g, b
    if (poleBlend > 0) {
      const p = Math.min(1, poleBlend)
      r = 0.84 + p * 0.12; g = 0.76 + p * 0.18; b = 0.72 + p * 0.22
    } else {
      const base = Math.max(0.3, Math.min(0.9, 0.58 + nv * 0.22 - crater * 0.28))
      if (nv > 0.18) {
        r = 0.76 + base * 0.14; g = 0.32 + base * 0.08; b = 0.08 + base * 0.02
      } else if (nv > -0.08) {
        r = 0.66 + base * 0.12; g = 0.26 + base * 0.05; b = 0.07
      } else {
        r = 0.48 + base * 0.08; g = 0.18; b = 0.06
      }
      r -= crater * 0.14; g -= crater * 0.07; b -= crater * 0.02
    }

    colArr[i*3]   = Math.max(0, Math.min(1, r))
    colArr[i*3+1] = Math.max(0, Math.min(1, g))
    colArr[i*3+2] = Math.max(0, Math.min(1, b))
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3))
  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    vertexColors: true, shininess: 8, specular: new THREE.Color(0x1a0400),
  })))

  // Reddish atmosphere
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.055, 48, 48),
    new THREE.MeshPhongMaterial({
      color: 0xff5500, transparent: true, opacity: 0.10,
      side: THREE.FrontSide, depthWrite: false,
    })
  ))

  // Outer dust halo
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.18, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff4400, transparent: true, opacity: 0.08,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  ))

  scene.add(group)
  return group
}
