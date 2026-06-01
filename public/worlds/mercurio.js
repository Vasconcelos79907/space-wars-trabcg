import * as THREE from 'https://esm.sh/three@0.158.0'

export function createMercurio(scene) {
  const group  = new THREE.Group()
  const radius = 1.8
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
      Math.sin(lat * 5.2 + lon * 4.1 + 0.5) * 0.32 +
      Math.cos(lat * 3.1 + lon * 8.2)        * 0.24 +
      Math.sin(lat * 9.8 - lon * 2.7 + 1.8)  * 0.16 +
      Math.cos(lat * 7.0 + lon * 5.9 + 0.9)  * 0.10

    // Heavy dual-scale cratering
    const crater1 = Math.max(0,
      Math.sin(lat * 9.5 + lon * 7.8 + 1.2) *
      Math.cos(lat * 6.5 + lon * 11  + 0.6)
    ) * 0.52
    const crater2 = Math.max(0,
      Math.sin(lat * 14  - lon * 9.0 + 2.4) *
      Math.cos(lat * 10  + lon * 6.5 + 1.0)
    ) * 0.36

    const base = Math.max(0.08, Math.min(0.92, 0.50 + nv * 0.28 - (crater1 + crater2) * 0.30))

    colArr[i * 3]     = base * 0.72
    colArr[i * 3 + 1] = base * 0.68
    colArr[i * 3 + 2] = base * 0.64
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3))

  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    vertexColors: true, shininess: 6, specular: new THREE.Color(0x141414),
  })))

  scene.add(group)
  return group
}
