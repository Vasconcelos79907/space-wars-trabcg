import * as THREE from 'https://esm.sh/three@0.158.0'

export function createUranus(scene) {
  const group  = new THREE.Group()
  const radius = 1.8
  const geo    = new THREE.SphereGeometry(radius, 96, 96)
  const positions = geo.attributes.position
  const colArr    = new Float32Array(positions.count * 3)

  for (let i = 0; i < positions.count; i++) {
    const x   = positions.getX(i)
    const y   = positions.getY(i)
    const z   = positions.getZ(i)
    const lat = Math.asin(Math.max(-1, Math.min(1, y / radius)))
    const lon = Math.atan2(z, x)
    const absLat = Math.abs(lat)

    // Extremely uniform pale blue-green with very subtle banding
    const subtle =
      Math.sin(lat * 8 + lon * 0.3) * 0.04 +
      Math.cos(lat * 4)              * 0.03

    const polar = 0.90 - absLat * 0.12

    const r = Math.max(0, (0.28 + subtle * 0.5) * polar)
    const g = Math.max(0, (0.76 + subtle)       * polar)
    const b = Math.max(0, (0.86 + subtle * 0.3) * polar)

    colArr[i * 3]     = r
    colArr[i * 3 + 1] = g
    colArr[i * 3 + 2] = b
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3))

  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    vertexColors: true, shininess: 55, specular: new THREE.Color(0x224466),
  })))

  // Thin methane haze
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.042, 32, 32),
    new THREE.MeshPhongMaterial({
      color: 0x55ccdd, transparent: true, opacity: 0.10,
      side: THREE.FrontSide, depthWrite: false,
    })
  ))

  scene.add(group)
  return group
}
