import * as THREE from 'https://esm.sh/three@0.158.0'

export function createLua(scene) {
  const group  = new THREE.Group()
  const radius = 2.2
  const geo    = new THREE.SphereGeometry(radius, 128, 128)
  const positions = geo.attributes.position
  const colArr    = new Float32Array(positions.count * 3)

  for (let i = 0; i < positions.count; i++) {
    const x   = positions.getX(i)
    const y   = positions.getY(i)
    const z   = positions.getZ(i)
    const lat = Math.asin(Math.max(-1, Math.min(1, y / radius)))
    const lon = Math.atan2(z, x)

    const nv =
      Math.sin(lat * 5.2 + lon * 4.1) * 0.30 +
      Math.cos(lat * 3.1 + lon * 7.8) * 0.22 +
      Math.sin(lat * 9.4 - lon * 2.3) * 0.15 +
      Math.cos(lat * 6.6 + lon * 5.5) * 0.10 +
      Math.sin(lat * 14  - lon * 11)  * 0.06

    const crater = Math.max(0,
      Math.sin(lat * 8.0 + lon * 6.2 + 1.5) *
      Math.cos(lat * 5.5 + lon * 9.1 + 0.8)
    ) * 0.40

    const base = Math.max(0.15, Math.min(0.85, 0.55 + nv * 0.24 - crater * 0.34))
    colArr[i*3]   = base
    colArr[i*3+1] = base
    colArr[i*3+2] = base + 0.04
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3))
  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    vertexColors: true, shininess: 10, specular: new THREE.Color(0x282828),
  })))

  // Very faint grey haze
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.06, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x99aacc, transparent: true, opacity: 0.05,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  ))

  scene.add(group)
  return group
}
