import * as THREE from 'https://esm.sh/three@0.158.0'

export function createJupiter(scene) {
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

    const band =
      Math.sin(lat * 18)           * 0.50 +
      Math.sin(lat * 36 + 0.5)     * 0.25 +
      Math.sin(lat * 9)            * 0.15

    const turb =
      Math.sin(lat * 26 + lon * 2.8 + 0.8) * 0.12 +
      Math.cos(lat * 18 + lon * 3.5 + 1.1) * 0.08

    const bv = band + turb

    const grsLat = -0.36, grsLon = 2.1
    const grsDist = Math.sqrt((lat - grsLat) ** 2 * 5 + (lon - grsLon) ** 2 * 0.5)
    const grs = Math.max(0, 1 - grsDist * 2.8) * 0.32

    let r, g, b
    if      (bv > 0.35)  { r = 0.96; g = 0.88; b = 0.76 }
    else if (bv > 0.05)  { r = 0.88; g = 0.62; b = 0.38 }
    else if (bv > -0.20) { r = 0.72; g = 0.44; b = 0.24 }
    else                 { r = 0.58; g = 0.34; b = 0.18 }
    r -= grs * 0.20; g -= grs * 0.10; b -= grs * 0.05

    colArr[i*3]   = Math.max(0, Math.min(1, r))
    colArr[i*3+1] = Math.max(0, Math.min(1, g))
    colArr[i*3+2] = Math.max(0, Math.min(1, b))
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3))
  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    vertexColors: true, shininess: 22, specular: new THREE.Color(0x332211),
  })))

  // Warm atmospheric haze
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.065, 48, 48),
    new THREE.MeshPhongMaterial({
      color: 0xdd8833, transparent: true, opacity: 0.10,
      side: THREE.FrontSide, depthWrite: false,
    })
  ))

  // Outer glow
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.20, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xcc7722, transparent: true, opacity: 0.09,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  ))

  // Wide faint ring system
  const ringGeo = new THREE.RingGeometry(radius * 1.55, radius * 2.4, 80)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xcc9966, transparent: true, opacity: 0.18,
    side: THREE.DoubleSide, depthWrite: false,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2.2
  group.add(ring)

  scene.add(group)
  return group
}
