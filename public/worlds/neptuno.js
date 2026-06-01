import * as THREE from 'https://esm.sh/three@0.158.0'

export function createNeptuno(scene) {
  const group  = new THREE.Group()
  const radius = 2.2

  // Main body — banded deep blue
  const geo = new THREE.SphereGeometry(radius, 128, 128)
  const positions = geo.attributes.position
  const colArr    = new Float32Array(positions.count * 3)

  for (let i = 0; i < positions.count; i++) {
    const y   = positions.getY(i)
    const z   = positions.getZ(i)
    const x   = positions.getX(i)
    const lat = Math.asin(Math.max(-1, Math.min(1, y / radius)))
    const lon = Math.atan2(z, x)

    const band =
      Math.sin(lat * 12)               * 0.40 +
      Math.sin(lat * 24 + lon * 0.5)   * 0.20 +
      Math.cos(lat * 7  + lon * 1.2)   * 0.12

    const bv = 0.5 + band * 0.5
    const r = 0.08 + bv * 0.08
    const g = 0.18 + bv * 0.20
    const b = 0.55 + bv * 0.35

    colArr[i*3]   = Math.max(0, Math.min(1, r))
    colArr[i*3+1] = Math.max(0, Math.min(1, g))
    colArr[i*3+2] = Math.max(0, Math.min(1, b))
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3))
  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    vertexColors: true, shininess: 72, specular: new THREE.Color(0x3355cc),
  })))

  // Inner atmosphere
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.065, 48, 48),
    new THREE.MeshPhongMaterial({
      color: 0x2255cc, transparent: true, opacity: 0.22,
      side: THREE.FrontSide, depthWrite: false,
    })
  ))

  // Outer glow
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.22, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x1133ff, transparent: true, opacity: 0.10,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  ))

  // Rings (RingGeometry flat, tilted)
  const ringGeo = new THREE.RingGeometry(radius * 1.45, radius * 2.2, 80)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x4466cc, transparent: true, opacity: 0.28,
    side: THREE.DoubleSide, depthWrite: false,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2.6
  group.add(ring)

  // Second thinner ring
  const ring2Geo = new THREE.RingGeometry(radius * 2.3, radius * 2.55, 80)
  const ring2 = new THREE.Mesh(ring2Geo, new THREE.MeshBasicMaterial({
    color: 0x3355aa, transparent: true, opacity: 0.14,
    side: THREE.DoubleSide, depthWrite: false,
  }))
  ring2.rotation.x = Math.PI / 2.6
  group.add(ring2)

  scene.add(group)
  return group
}
