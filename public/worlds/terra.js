import * as THREE from 'https://esm.sh/three@0.158.0'

export function createTerra(scene) {
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
      Math.sin(lat * 4.5 + 0.8) * Math.cos(lon * 7.2) * 0.55 +
      Math.sin(lat * 7.1 + lon * 3.4)                  * 0.28 +
      Math.cos(lat * 2.8 - lon * 5.5)                  * 0.17 +
      Math.sin(lat * 11  + lon * 8.6 + 1.2)            * 0.10 +
      Math.cos(lat * 5.5 - lon * 2.8 + 2.4)            * 0.08

    const poleBlend = Math.max(0, (absLat - 1.10) / 0.47)
    if (poleBlend > 0) {
      const p = Math.min(1, poleBlend)
      colArr[i*3]   = 0.82 + p * 0.16
      colArr[i*3+1] = 0.88 + p * 0.10
      colArr[i*3+2] = 0.92 + p * 0.07
    } else if (nv > 0.08) {
      if (nv > 0.54) {
        const snow = Math.min(1, (nv - 0.54) * 2.6)
        colArr[i*3]   = 0.50 + snow * 0.46
        colArr[i*3+1] = 0.50 + snow * 0.46
        colArr[i*3+2] = 0.48 + snow * 0.48
      } else {
        const tropicBias = Math.max(0, 1.0 - absLat / 0.52)
        if (tropicBias > 0.55) {
          const gv = 0.40 + Math.sin(lat * 14 + lon * 11) * 0.06
          colArr[i*3] = 0.44; colArr[i*3+1] = gv; colArr[i*3+2] = 0.10
        } else {
          const gv = 0.44 + Math.sin(lat * 12 + lon * 9) * 0.08
          colArr[i*3] = 0.11; colArr[i*3+1] = gv; colArr[i*3+2] = 0.14
        }
      }
    } else {
      const coastal = Math.max(0, (nv + 0.06) / 0.14)
      const bv = 0.54 + Math.cos(lat * 9 + lon * 7) * 0.07
      colArr[i*3]   = 0.03 + coastal * 0.07
      colArr[i*3+1] = 0.22 + coastal * 0.20
      colArr[i*3+2] = bv   + coastal * 0.07
    }
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3))
  group.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
    vertexColors: true, shininess: 70, specular: new THREE.Color(0x1a4488),
  })))

  // Cloud layer (animates in worldSelect loop via group.rotation)
  const cloudMesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.042, 64, 32),
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false })
  )
  cloudMesh.userData.cloudLayer = true
  group.add(cloudMesh)

  // Inner atmosphere
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.085, 48, 48),
    new THREE.MeshPhongMaterial({
      color: 0x3366ff, transparent: true, opacity: 0.22,
      side: THREE.FrontSide, depthWrite: false, shininess: 100,
    })
  ))

  // Outer atmosphere glow (additive, backside)
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.18, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x2255cc, transparent: true, opacity: 0.12,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  ))

  scene.add(group)
  return group
}
