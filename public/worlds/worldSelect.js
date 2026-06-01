import * as THREE from 'https://esm.sh/three@0.158.0'
import { createTerra   } from './terra.js'
import { createLua     } from './moon.js'
import { createMarte   } from './marte.js'
import { createJupiter } from './jupiter.js'
import { createNeptuno } from './neptuno.js'

const worldCanvas   = document.getElementById('worldCanvas')
const loadingScreen = document.getElementById('loadingScreen')
const menu          = document.getElementById('menu')

// ── Planet definitions ────────────────────────────────────────
const PLANET_DEFS = [
  { factory:createTerra,   mapName:'terra',   name:'TERRA',   subtitle:"Home World",
    difficulty:2, danger:'MODERATE',
    desc:'The birthplace of humanity. Contested airspace above once-familiar continents.',
    glowCol:0x3355ff, partCol:[0.35,0.55,1.0], partCnt:60 },
  { factory:createLua,     mapName:'lua',     name:'LUA',     subtitle:"Earth's Moon",
    difficulty:1, danger:'LOW',
    desc:'Silent and desolate. Ancient craters conceal enemy forward operating bases.',
    glowCol:0x8899aa, partCol:[0.75,0.75,0.85], partCnt:40 },
  { factory:createMarte,   mapName:'marte',   name:'MARTE',   subtitle:"Red Planet",
    difficulty:3, danger:'HIGH',
    desc:'Iron-red dust storms mask massive enemy formations. Visibility near zero.',
    glowCol:0xff3300, partCol:[1.0,0.28,0.07], partCnt:100 },
  { factory:createJupiter, mapName:'jupiter', name:'JÚPITER', subtitle:"Gas Giant",
    difficulty:4, danger:'EXTREME',
    desc:"Crushing gravity and perpetual storms. The empire's most fortified outer bastion.",
    glowCol:0xcc7733, partCol:[0.9,0.6,0.28], partCnt:80 },
  { factory:createNeptuno, mapName:'neptuno', name:'NEPTUNO', subtitle:"Ice Giant",
    difficulty:5, danger:'CRITICAL',
    desc:'Supersonic winds and absolute darkness. The outer frontier. Pilots rarely return.',
    glowCol:0x2244ff, partCol:[0.1,0.5,1.0],  partCnt:90 },
]

// Carousel layout: (i - selIdx + 5) % 5  →  slot index into this array
const SLOTS = [
  { x:  0,   y: 0.0, z:  0,  s: 1.28, op: 1.0  },  // 0 → selected center
  { x:  8.2, y:-0.2, z: -5,  s: 0.52, op: 0.60 },  // 1 → right-near
  { x: 14.5, y:-0.6, z:-12,  s: 0.27, op: 0.22 },  // 2 → right-far
  { x:-14.5, y:-0.6, z:-12,  s: 0.27, op: 0.22 },  // 3 → left-far
  { x: -8.2, y:-0.2, z: -5,  s: 0.52, op: 0.60 },  // 4 → left-near
]

const DANGER_COL = { LOW:'#00ff88', MODERATE:'#ffdd00', HIGH:'#ff8800', EXTREME:'#ff4400', CRITICAL:'#ff0044' }

// ── Shader strings ────────────────────────────────────────────
const NV = `varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
const NF = `uniform vec3 c;uniform float o;varying vec2 v;void main(){float d=distance(v,vec2(.5));gl_FragColor=vec4(c,smoothstep(.5,.0,d)*o);}`

// ─────────────────────────────────────────────────────────────
export function startWorldSelect(onMapSelected, preloadFn, onBack) {
  if (menu) menu.style.display = 'none'
  worldCanvas.style.display = 'block'

  // ── Scene / camera / renderer ─────────────────────────────
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000510)

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 600)
  camera.position.set(0, 2.5, 22)

  const renderer = new THREE.WebGLRenderer({ canvas: worldCanvas, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // ── Lighting ──────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x0a1535, 1.5))
  const sunL = new THREE.DirectionalLight(0xfff0dd, 3.4); sunL.position.set(18,10,14); scene.add(sunL)
  const fillL = new THREE.DirectionalLight(0x1122aa, 1.0); fillL.position.set(-12,-3,-8); scene.add(fillL)
  const rimL  = new THREE.DirectionalLight(0x0055ff, 0.5); rimL.position.set(0,8,-18);  scene.add(rimL)

  // ── Background ────────────────────────────────────────────
  const starLayers = [
    buildStars(2000, 380, 0.22),
    buildStars(700,  200, 0.36),
    buildStars(220,  110, 0.55),
  ]
  starLayers.forEach(s => scene.add(s))
  const nebMeshes = buildNebulae(scene)
  buildGalaxies(scene)
  buildOrbitRing(scene)

  // ── Planets (carousel) ────────────────────────────────────
  let selIdx = 0
  const pObjs = PLANET_DEFS.map((def, i) => {
    const group = def.factory(scene)

    const glow1 = makeGlowSphere(def.glowCol, 2.8, 0.22)
    const glow2 = makeGlowSphere(def.glowCol, 4.6, 0.07)
    group.add(glow1, glow2)

    const { pts, orig } = buildParticles(def.partCol, def.partCnt)
    group.add(pts)

    return { group, def, glow1, glow2, pts, orig, pt: i * 2.3 }
  })
  placePlanets(pObjs, selIdx, 1.0)

  // ── Comets ────────────────────────────────────────────────
  const comets = []
  let nextComet = 220 + Math.random() * 350

  // ── DOM UI ────────────────────────────────────────────────
  const ui = buildUI()
  document.body.appendChild(ui.root)
  updatePanel(ui, PLANET_DEFS[selIdx], false)

  // ── State ─────────────────────────────────────────────────
  let alive      = true
  let chosen     = null
  let loadDone   = false
  let zoomDone   = false
  let assets     = null
  let proceeded  = false
  let isZooming  = false
  let t = 0, driftT = 0
  const camTgt = new THREE.Vector3(0, 2.5, 22)

  // ── Navigation ────────────────────────────────────────────
  function nav(dir) {
    if (chosen) return
    selIdx = (selIdx + dir + PLANET_DEFS.length) % PLANET_DEFS.length
    updatePanel(ui, PLANET_DEFS[selIdx], false)
  }

  function deploy() {
    if (chosen) return
    chosen = pObjs[selIdx]
    isZooming = true
    camTgt.set(0, 1.0, 10)
    updatePanel(ui, chosen.def, true)
    ui.selectBtn.disabled = true
    ui.selectBtn.textContent = 'DEPLOYING...'

    const barEl = document.getElementById('loadingBar')
    const pctEl = document.getElementById('loadingPercent')
    if (barEl) barEl.style.width = '0%'
    if (pctEl) pctEl.textContent = '0%'
    loadingScreen.style.display = 'flex'

    preloadFn(chosen.def.mapName, (l, tot) => {
      const p = Math.round(l / tot * 100)
      if (barEl) barEl.style.width = p + '%'
      if (pctEl) pctEl.textContent = p + '%'
    }).then(a => { assets = a; loadDone = true; tryFinish() })
      .catch(()=> { loadDone = true; tryFinish() })
  }

  function tryFinish() {
    if (!loadDone || !zoomDone || proceeded) return
    proceeded = true
    loadingScreen.style.display = 'none'
    cleanup()
    worldCanvas.style.display = 'none'
    onMapSelected(chosen.def.mapName, assets)
  }

  ui.selectBtn.addEventListener('click', deploy)
  ui.backBtn.addEventListener('click',   () => { cleanup(); worldCanvas.style.display = 'none'; if (onBack) onBack() })

  // ── Planet click (raycasting) ─────────────────────────────
  const raycaster = new THREE.Raycaster()
  const mouse     = new THREE.Vector2()

  // Invisible hit spheres — children of each planet group so they move/scale with it
  const hitMeshes = pObjs.map(p => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(3.8, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.FrontSide })
    )
    p.group.add(m)
    return m
  })

  const onCanvasClick = e => {
    if (chosen) return
    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObjects(hitMeshes)
    if (!hits.length) return
    const clickedIdx = hitMeshes.indexOf(hits[0].object)
    if (clickedIdx === -1) return
    const slotIdx = (clickedIdx - selIdx + PLANET_DEFS.length) % PLANET_DEFS.length
    if (slotIdx === 0) deploy()
    else nav([0, 1, 2, -2, -1][slotIdx])
  }

  const onCanvasMove = e => {
    if (chosen) return
    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const hits = raycaster.intersectObjects(hitMeshes)
    worldCanvas.style.cursor = hits.length ? 'pointer' : 'default'
  }

  worldCanvas.addEventListener('click',     onCanvasClick)
  worldCanvas.addEventListener('mousemove', onCanvasMove)

  const onKey = e => {
    if (e.key === 'ArrowLeft')  nav(-1)
    if (e.key === 'ArrowRight') nav(1)
    if (e.key === 'Enter')      deploy()
    if (e.key === 'Escape')     { cleanup(); worldCanvas.style.display = 'none'; if (onBack) onBack() }
  }
  document.addEventListener('keydown', onKey)

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)

  function cleanup() {
    alive = false
    document.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', onResize)
    worldCanvas.removeEventListener('click',     onCanvasClick)
    worldCanvas.removeEventListener('mousemove', onCanvasMove)
    worldCanvas.style.cursor = 'default'
    if (ui.root.parentNode) ui.root.parentNode.removeChild(ui.root)
    renderer.dispose()
  }

  // ── Animation loop ────────────────────────────────────────
  function animate() {
    if (!alive) return
    requestAnimationFrame(animate)
    t += 0.01

    // Camera drift
    if (!isZooming) {
      driftT += 0.004
      camTgt.set(
        Math.sin(driftT * 0.7) * 0.9,
        2.5 + Math.sin(driftT * 0.5) * 0.35,
        22  + Math.sin(driftT * 0.38) * 0.55
      )
    }
    camera.position.lerp(camTgt, isZooming ? 0.038 : 0.022)
    camera.lookAt(0, 0.3, 0)

    if (isZooming && !zoomDone && camera.position.distanceTo(camTgt) < 0.28) {
      zoomDone = true
      tryFinish()
    }

    // Carousel
    placePlanets(pObjs, selIdx, 0.07)

    pObjs.forEach((p, i) => {
      // Planet self-rotation
      p.group.rotation.y += 0.0028

      p.pt += 0.012

      // Glow pulse
      const isSel = ((i - selIdx + PLANET_DEFS.length) % PLANET_DEFS.length) === 0
      p.glow1.material.opacity = (isSel ? 0.22 : 0.10) + Math.sin(p.pt * 2.1) * 0.04
      p.glow2.material.opacity = (isSel ? 0.07 : 0.02) + Math.sin(p.pt * 1.6) * 0.02

      // Particle float
      const attr = p.pts.geometry.attributes.position
      for (let j = 0; j < attr.count; j++) {
        attr.setX(j, p.orig[j*3  ] + Math.sin(t*0.48+j*0.37)*0.10)
        attr.setY(j, p.orig[j*3+1] + Math.cos(t*0.40+j*0.55)*0.10)
        attr.setZ(j, p.orig[j*3+2] + Math.sin(t*0.55+j*0.29)*0.08)
      }
      attr.needsUpdate = true
    })

    // Nebula drift
    nebMeshes.forEach((n, i) => {
      n.position.x += Math.sin(t * 0.07 + i * 1.4) * 0.004
      n.position.y += Math.cos(t * 0.05 + i * 1.0) * 0.003
    })

    // Star parallax
    starLayers.forEach((sl, i) => {
      sl.rotation.y += 0.000055 * (i + 1)
      sl.rotation.x += 0.000025 * (i + 1)
    })

    // Comets
    nextComet--
    if (nextComet <= 0) { spawnComet(scene, comets); nextComet = 200 + Math.random() * 420 }
    for (let i = comets.length - 1; i >= 0; i--) {
      const c = comets[i]
      c.life--
      c.mesh.position.addScaledVector(c.vel, 1)
      c.mesh.material.opacity = Math.min(1, c.life / 22) * 0.85
      if (c.life <= 0) {
        scene.remove(c.mesh)
        c.mesh.geometry.dispose()
        c.mesh.material.dispose()
        comets.splice(i, 1)
      }
    }

    renderer.render(scene, camera)
  }
  animate()
}

// ─────────────────────────────────────────────────────────────
// SCENE BUILDERS
// ─────────────────────────────────────────────────────────────
function placePlanets(pObjs, selIdx, lerpT) {
  const N = pObjs.length
  pObjs.forEach((p, i) => {
    const slotIdx = (i - selIdx + N) % N
    const sl = SLOTS[slotIdx]
    const tgt = new THREE.Vector3(sl.x, sl.y, sl.z)
    if (lerpT >= 1) {
      p.group.position.copy(tgt)
      p.group.scale.setScalar(sl.s)
    } else {
      p.group.position.lerp(tgt, lerpT)
      const cs = p.group.scale.x
      p.group.scale.setScalar(cs + (sl.s - cs) * lerpT)
    }
  })
}

function buildStars(count, spread, size) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * spread
    pos[i*3+1] = (Math.random() - 0.5) * spread * 0.55
    pos[i*3+2] = (Math.random() - 0.5) * spread - 60
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xffffff, size, transparent: true, opacity: 0.78, depthWrite: false,
  }))
}

function buildNebulae(scene) {
  const cfgs = [
    { c:[.08,.03,.22], o:.55, x:-38, y: 10, z:-85,  sx:65, sy:45 },
    { c:[.02,.08,.20], o:.45, x: 42, y: -8, z:-95,  sx:55, sy:38 },
    { c:[.14,.02,.12], o:.35, x:  6, y: 22, z:-105, sx:78, sy:58 },
    { c:[.02,.10,.16], o:.42, x:-22, y:-18, z:-72,  sx:48, sy:34 },
    { c:[.06,.02,.18], o:.30, x: 30, y: 16, z:-110, sx:52, sy:42 },
  ]
  return cfgs.map(c => {
    const mat = new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Vector3(...c.c) }, o: { value: c.o } },
      vertexShader: NV, fragmentShader: NF,
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(c.sx, c.sy), mat)
    mesh.position.set(c.x, c.y, c.z)
    scene.add(mesh)
    return mesh
  })
}

function buildGalaxies(scene) {
  const configs = [
    { x:-82, y: 28, z:-200, r:9 },
    { x: 92, y:-22, z:-240, r:6 },
    { x: 22, y: 44, z:-185, r:7 },
  ]
  configs.forEach(g => {
    const n = 280, pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.pow(Math.random(), 0.5) * g.r
      pos[i*3]   = g.x + Math.cos(a) * r
      pos[i*3+1] = g.y + Math.sin(a) * r * 0.33
      pos[i*3+2] = g.z
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x9999ff, size: 0.45, transparent: true, opacity: 0.28, depthWrite: false,
    })))
  })
}

function buildOrbitRing(scene) {
  const n = 200, pos = new Float32Array(n * 3), R = 11.5
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2
    pos[i*3]   = R * Math.cos(a)
    pos[i*3+1] = -0.5
    pos[i*3+2] = R * Math.sin(a) * 0.26 - 4.5
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  scene.add(new THREE.LineLoop(geo, new THREE.LineBasicMaterial({
    color: 0x0055bb, transparent: true, opacity: 0.18, depthWrite: false,
  })))
}

function makeGlowSphere(color, radius, opacity) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshBasicMaterial({
      color, transparent: true, opacity,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  )
}

function buildParticles(rgb, count) {
  const orig = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 2.4 + Math.random() * 1.2
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.random() * Math.PI
    orig[i*3]   = r * Math.sin(phi) * Math.cos(theta)
    orig[i*3+1] = r * Math.cos(phi)
    orig[i*3+2] = r * Math.sin(phi) * Math.sin(theta)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(orig.slice(), 3))
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color: new THREE.Color(...rgb), size: 0.068, transparent: true, opacity: 0.72,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }))
  return { pts, orig }
}

function spawnComet(scene, list) {
  const side = Math.random() > 0.5 ? 1 : -1
  const y = (Math.random() - 0.5) * 20
  const z = -15 - Math.random() * 30
  const sx = side * 58
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(sx, y, z),
    new THREE.Vector3(sx - side * 11, y + (Math.random() - 0.5) * 2, z),
  ])
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
  const mesh = new THREE.Line(geo, mat)
  scene.add(mesh)
  list.push({ mesh, vel: new THREE.Vector3(-side * 0.78, (Math.random() - 0.5) * 0.06, 0), life: 75 + Math.random() * 45 })
}

// ─────────────────────────────────────────────────────────────
// DOM UI
// ─────────────────────────────────────────────────────────────
function css(el, styles) { el.style.cssText = styles }

function mkBtn(html, styles) {
  const b = document.createElement('button')
  b.innerHTML = html
  css(b, `font-family:'Courier New',monospace;cursor:pointer;pointer-events:all;transition:all .2s;${styles}`)
  return b
}

function buildUI() {
  const root = document.createElement('div')
  css(root, 'position:fixed;inset:0;pointer-events:none;z-index:10;')

  // Scanlines
  const scan = document.createElement('div')
  css(scan, `position:absolute;inset:0;pointer-events:none;z-index:0;
    background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.025) 3px,rgba(0,0,0,0.025) 4px);`)
  root.appendChild(scan)

  // Back button
  const backBtn = mkBtn('&#9664; BACK', `
    position:absolute;top:22px;left:22px;z-index:2;
    background:rgba(0,8,24,0.88);
    border:1px solid rgba(0,160,255,0.35);border-radius:4px;
    color:#0099ff;font-size:13px;font-weight:bold;letter-spacing:2px;
    padding:8px 18px;text-shadow:0 0 10px rgba(0,160,255,0.55);`)
  root.appendChild(backBtn)

  // Title
  const titleWrap = document.createElement('div')
  css(titleWrap, 'position:absolute;top:22px;left:50%;transform:translateX(-50%);text-align:center;pointer-events:none;z-index:2;')
  titleWrap.innerHTML = `
    <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:8px;color:rgba(0,180,255,0.42);margin-bottom:5px;">GALACTIC NAVIGATION SYSTEM</div>
    <div style="font-family:'Courier New',monospace;font-size:26px;font-weight:bold;letter-spacing:10px;color:#fff;
                text-shadow:0 0 28px rgba(0,140,255,0.55),0 0 65px rgba(0,80,255,0.25);">SELECT WORLD</div>
    <div style="height:1px;margin:7px auto 0;width:210px;background:linear-gradient(90deg,transparent,rgba(0,160,255,0.6),transparent);"></div>
  `
  root.appendChild(titleWrap)

  // Info panel
  const info = document.createElement('div')
  css(info, `
    position:absolute;right:26px;top:50%;transform:translateY(-50%);
    width:285px;background:rgba(0,6,20,0.92);
    border:1px solid rgba(0,140,255,0.22);border-top:2px solid rgba(0,180,255,0.50);
    border-radius:8px;overflow:hidden;pointer-events:none;z-index:2;
    box-shadow:0 0 50px rgba(0,80,255,0.08),inset 0 0 30px rgba(0,30,100,0.15);`)
  root.appendChild(info)

  // Select / deploy button
  const selectBtn = mkBtn('DEPLOY', `
    position:absolute;bottom:32px;left:50%;transform:translateX(-50%);z-index:2;
    width:230px;padding:15px 0;
    background:linear-gradient(180deg,rgba(0,80,200,0.90),rgba(0,50,140,0.96));
    border:1px solid rgba(0,180,255,0.55);border-radius:5px;
    color:#c0e8ff;font-size:16px;font-weight:bold;letter-spacing:5px;
    text-shadow:0 0 12px rgba(0,180,255,0.6);
    box-shadow:0 0 28px rgba(0,120,255,0.35),0 4px 16px rgba(0,0,0,0.7);`)
  root.appendChild(selectBtn)

  // Hint
  const hint = document.createElement('div')
  css(hint, `position:absolute;bottom:12px;left:50%;transform:translateX(-50%);z-index:2;
    font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;
    color:rgba(0,150,255,0.28);white-space:nowrap;pointer-events:none;`)
  hint.textContent = '◀ ▶  OR CLICK PLANET TO SELECT    ENTER / CLICK CENTER TO DEPLOY'
  root.appendChild(hint)

  return { root, backBtn, selectBtn, info }
}

function updatePanel(ui, def, loading) {
  const dc = DANGER_COL[def.danger] || '#fff'
  const stars = '★'.repeat(def.difficulty) + '☆'.repeat(5 - def.difficulty)
  ui.info.innerHTML = `
    <div style="background:linear-gradient(90deg,rgba(0,60,180,.92),rgba(0,40,110,.85));
                padding:15px 18px;border-bottom:1px solid rgba(0,170,255,.18);">
      <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:4px;
                  color:rgba(0,180,255,.52);margin-bottom:5px;">// WORLD DATA</div>
      <div style="font-family:'Courier New',monospace;font-size:24px;font-weight:bold;letter-spacing:5px;
                  color:#e8f5ff;text-shadow:0 0 18px rgba(0,180,255,.8);">${def.name}</div>
      <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:3px;
                  color:rgba(140,200,255,.58);margin-top:3px;">${def.subtitle}</div>
    </div>
    <div style="padding:15px 18px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;color:rgba(0,150,255,.45);">DANGER LEVEL</span>
        <span style="font-family:'Courier New',monospace;font-size:11px;font-weight:bold;letter-spacing:2px;
                     color:${dc};text-shadow:0 0 10px ${dc};">${def.danger}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:14px;">
        <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;color:rgba(0,150,255,.45);">DIFFICULTY</span>
        <span style="font-size:14px;color:#ffaa00;letter-spacing:2px;">${stars}</span>
      </div>
      <div style="height:1px;background:rgba(0,150,255,.10);margin-bottom:13px;"></div>
      <div style="font-family:'Courier New',monospace;font-size:11px;line-height:1.80;
                  color:rgba(160,205,245,.68);letter-spacing:.4px;">${def.desc}</div>
      <div style="margin-top:14px;display:flex;gap:7px;flex-wrap:wrap;">
        <span style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:1px;padding:3px 9px;
                     background:rgba(0,150,255,.07);border:1px solid rgba(0,150,255,.18);
                     border-radius:2px;color:rgba(0,200,255,.55);">SPACE COMBAT</span>
        <span style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:1px;padding:3px 9px;
                     background:rgba(0,150,255,.07);border:1px solid rgba(0,150,255,.18);
                     border-radius:2px;color:rgba(0,200,255,.55);">SURVIVAL</span>
      </div>
    </div>
    <div style="background:rgba(0,150,255,.05);padding:10px 18px;border-top:1px solid rgba(0,150,255,.09);">
      <span style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:2px;color:rgba(0,150,255,.35);">
        ${loading ? '⚡ LOADING ASSETS...' : '▶ CLICK DEPLOY TO LAUNCH'}
      </span>
    </div>
  `
}
