import * as THREE from 'https://esm.sh/three@0.158.0'

export function createSaturno(scene) {
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

    const band =
      Math.sin(lat * 12)              * 0.36 +
      Math.sin(lat * 24 + 0.4)        * 0.18 +
      Math.sin(lat * 6 + lon * 0.5)   * 0.08 +
      Math.cos(lat * 18 + lon * 0.8)  * 0.05

    let r, g, b
    if (band > 0.22) {
      r = 0.97; g = 0.90; b = 0.70     // bright cream zone
    } else if (band > -0.08) {
      r = 0.90; g = 0.78; b = 0.52     // main golden-tan band
    } else {
      r = 0.76; g = 0.60; b = 0.36     // darker band
    }

    colArr[i * 3]     = r
    colArr[i * 3 + 1] = g
    colArr[i * 3 + 2] = b
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3))

  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    vertexColors: true, shininess: 28, specular: new THREE.Color(0x443322),
  })))

  // ── RINGS ─────────────────────────────────────────────────────
  // B ring (inner, brighter)
  const ringInner = new THREE.Mesh(
    new THREE.RingGeometry(radius * 1.24, radius * 1.66, 80),
    new THREE.MeshBasicMaterial({
      color: 0xddbb88, side: THREE.DoubleSide, transparent: true, opacity: 0.72,
    })
  )
  // A ring (outer, slightly dimmer)
  const ringOuter = new THREE.Mesh(
    new THREE.RingGeometry(radius * 1.70, radius * 2.08, 80),
    new THREE.MeshBasicMaterial({
      color: 0xcc9966, side: THREE.DoubleSide, transparent: true, opacity: 0.52,
    })
  )
  // Tilt rings so they're visible from the viewing angle
  ringInner.rotation.x = Math.PI * 0.30
  ringOuter.rotation.x = Math.PI * 0.30

  group.add(ringInner, ringOuter)

  scene.add(group)
  return group
}
