import * as THREE from 'https://esm.sh/three@0.158.0'

export function createVenus(scene) {
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

    // Thick swirling cloud bands
    const band =
      Math.sin(lat * 3.0) * 0.38 +
      Math.sin(lat * 7.5 + lon * 1.4 + 0.8) * 0.20 +
      Math.cos(lat * 5.2 - lon * 0.9 + 1.3) * 0.14 +
      Math.sin(lat * 13  + lon * 2.8 + 2.1) * 0.08 +
      Math.cos(lat * 9   + lon * 4.5 + 0.5) * 0.05

    const base = Math.max(0.42, Math.min(0.98, 0.74 + band * 0.18))

    const r = Math.min(1.0, base * 1.00)
    const g = Math.min(1.0, base * 0.78 - Math.abs(band) * 0.06)
    const b = Math.min(1.0, base * 0.28 - Math.abs(band) * 0.04)

    colArr[i * 3]     = r
    colArr[i * 3 + 1] = Math.max(0, g)
    colArr[i * 3 + 2] = Math.max(0, b)
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3))

  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    vertexColors: true, shininess: 50, specular: new THREE.Color(0x553300),
  })))

  // Thick cloud/haze layer
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.065, 48, 48),
    new THREE.MeshPhongMaterial({
      color: 0xffaa22, transparent: true, opacity: 0.18,
      side: THREE.FrontSide, depthWrite: false,
      shininess: 80, specular: new THREE.Color(0xffdd88),
    })
  ))

  scene.add(group)
  return group
}
