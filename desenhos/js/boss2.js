import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

document.addEventListener('DOMContentLoaded', Start);

// ─── SCENE / CAMERA / RENDERER ───────────────────────────────────────────────

var cena = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 18);

var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

// ─── ORBIT CONTROLS ──────────────────────────────────────────────────────────

var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping  = true;
controls.dampingFactor  = 0.05;
controls.minDistance    = 6;
controls.maxDistance    = 45;

// ─── LIGHTING ────────────────────────────────────────────────────────────────

// Neutral white fill — reveals the 3-D form of dark metallic surfaces
cena.add(new THREE.AmbientLight(0xffffff, 2.0));

// Hemisphere: cool sky above, deep red ground below (evil spaceship mood)
var luzHemi = new THREE.HemisphereLight(0x445566, 0x330000, 2.8);
cena.add(luzHemi);

// Key light — warm, from top-front-left; casts shadows
var luzPrincipal = new THREE.DirectionalLight(0xfff0cc, 5.0);
luzPrincipal.position.set(-7, 14, 9);
luzPrincipal.castShadow = true;
luzPrincipal.shadow.mapSize.set(2048, 2048);
cena.add(luzPrincipal);

// Fill light — cool, from front-right, softer
var luzFill = new THREE.DirectionalLight(0xaaccff, 3.2);
luzFill.position.set(9, 5, 12);
cena.add(luzFill);

// Rim light — red from behind; defines silhouette + evil glow
var luzRim = new THREE.DirectionalLight(0xff2200, 3.0);
luzRim.position.set(0, 3, -14);
cena.add(luzRim);

// Under fill — illuminates underbelly panels
var luzBaixo = new THREE.DirectionalLight(0x445577, 2.0);
luzBaixo.position.set(0, -10, 5);
cena.add(luzBaixo);

// Reactor point — pulses red-orange from the core
var luzReator = new THREE.PointLight(0xff2200, 16.0, 34);
luzReator.position.set(0, 0.8, 0.5);
cena.add(luzReator);

// Left-wing neon point — washes left wing surface in red
var luzNeon1 = new THREE.PointLight(0xff1100, 5.5, 20);
luzNeon1.position.set(-5.5, 0.6, 0.5);
cena.add(luzNeon1);

// Right-wing neon point
var luzNeon2 = new THREE.PointLight(0xff1100, 5.5, 20);
luzNeon2.position.set(5.5, 0.6, 0.5);
cena.add(luzNeon2);

// Nose cannon glow — red accent at the front
var luzCanhao = new THREE.PointLight(0xff0000, 4.5, 12);
luzCanhao.position.set(0, 0.2, -5.8);
cena.add(luzCanhao);

// Engine exhaust point — orange from rear
var luzMotores = new THREE.PointLight(0xff4400, 7.0, 16);
luzMotores.position.set(0, 0, 6.5);
cena.add(luzMotores);

// ─── MATERIALS ───────────────────────────────────────────────────────────────

var _texCima = new THREE.TextureLoader().load('./textures/textura_boss2_cima.png');
_texCima.wrapS = _texCima.wrapT = THREE.RepeatWrapping;
_texCima.repeat.set(2, 1);

var _texCimaWing = _texCima.clone();
_texCimaWing.needsUpdate = true;
_texCimaWing.repeat.set(3, 1);

var _texBaixo = new THREE.TextureLoader().load('./textures/textura_boss2_baixo.png');
_texBaixo.wrapS = _texBaixo.wrapT = THREE.RepeatWrapping;
_texBaixo.repeat.set(2, 1);

var matCasco     = new THREE.MeshStandardMaterial({ map: _texCima,     metalness: 0.88, roughness: 0.30 });
var matCascoClaro= new THREE.MeshStandardMaterial({ map: _texCimaWing, metalness: 0.82, roughness: 0.38 });
var matEscuro    = new THREE.MeshStandardMaterial({ color: 0x0e1018,   metalness: 0.95, roughness: 0.15 });
var matPlaca     = new THREE.MeshStandardMaterial({ map: _texCima,     metalness: 0.78, roughness: 0.45 });
var matBaixo     = new THREE.MeshStandardMaterial({ map: _texBaixo,    metalness: 0.88, roughness: 0.28 });
var matNeon      = new THREE.MeshStandardMaterial({ color: 0xff1100, emissive: new THREE.Color(0xff1100), emissiveIntensity: 4.0 });
var matReator    = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: new THREE.Color(0xff3300), emissiveIntensity: 5.0, transparent: true, opacity: 0.85 });
var matReatorCo  = new THREE.MeshStandardMaterial({ color: 0xffcc88, emissive: new THREE.Color(0xff8844), emissiveIntensity: 10.0 });
var matReatorRg  = new THREE.MeshStandardMaterial({ color: 0xff1100, emissive: new THREE.Color(0xff1100), emissiveIntensity: 4.5 });
var matExhaust   = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: new THREE.Color(0xff2200), emissiveIntensity: 5.5, transparent: true, opacity: 0.88 });

// ─── BOSS GROUP ──────────────────────────────────────────────────────────────

var boss = new THREE.Group();

// ═══════════════════════════════════════════════════════════════════
// SECTION 1 — CENTRAL FUSELAGE (3D ellipsoidal hull)
// Thick dorsal spine runs nose to tail; wings attach at Y=0.
// ═══════════════════════════════════════════════════════════════════

// Main central body — elongated ellipsoid
var meshCorpo = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 32, 20),
    matCasco
);
meshCorpo.scale.set(1.6, 0.9, 5.5);
meshCorpo.castShadow = true;
boss.add(meshCorpo);

// Dorsal spine ridge (raised slab on top)
var meshSpine = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.55, 9.0), matEscuro);
meshSpine.position.set(0, 0.75, 0);
boss.add(meshSpine);

// Spine front taper
var geoSpineFront = new THREE.CylinderGeometry(0, 0.50, 2.2, 4);
geoSpineFront.rotateX(-Math.PI / 2);
var meshSpineFront = new THREE.Mesh(geoSpineFront, matEscuro);
meshSpineFront.position.set(0, 0.75, -5.5);
boss.add(meshSpineFront);

// Spine rear taper
var geoSpineRear = new THREE.CylinderGeometry(0.30, 0.50, 1.4, 4);
geoSpineRear.rotateX(Math.PI / 2);
var meshSpineRear = new THREE.Mesh(geoSpineRear, matEscuro);
meshSpineRear.position.set(0, 0.75, 5.2);
boss.add(meshSpineRear);

// Nose spike (sharp front point)
var geoSpike = new THREE.CylinderGeometry(0, 0.32, 2.5, 6);
geoSpike.rotateX(-Math.PI / 2);
var meshSpike = new THREE.Mesh(geoSpike, matEscuro);
meshSpike.position.set(0, 0.30, -6.8);
boss.add(meshSpike);

// ═══════════════════════════════════════════════════════════════════
// SECTION 2 — WINGS (thick swept delta wings with raised top surface)
// ═══════════════════════════════════════════════════════════════════

// Each wing: root slab + swept leading-edge wedge + tip slab
for (var w = 0; w < 2; w++) {
    var sx = w === 0 ? -1 : 1;

    // Root slab (thick near fuselage)
    var meshWingRoot = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.55, 5.5), matCasco);
    meshWingRoot.position.set(sx * 2.8, -0.10, 0.5);
    meshWingRoot.castShadow = true;
    boss.add(meshWingRoot);

    // Outer swept panel (thinner)
    var meshWingOuter = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.30, 3.8), matCascoClaro);
    meshWingOuter.position.set(sx * 5.25, -0.22, 0.8);
    meshWingOuter.rotation.y = sx * 0.12;
    boss.add(meshWingOuter);

    // Wing tip
    var meshWingTip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.60, 2.4), matEscuro);
    meshWingTip.position.set(sx * 6.6, -0.05, 1.0);
    boss.add(meshWingTip);

    // Leading edge (angled wedge using BoxGeometry rotated)
    var meshLE = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.20, 0.40), matEscuro);
    meshLE.position.set(sx * 3.4, -0.02, -1.8);
    meshLE.rotation.y = sx * 0.52;
    boss.add(meshLE);

    // Raised armor ridge on wing top
    var meshRidge = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 4.0), matEscuro);
    meshRidge.position.set(sx * 2.8, 0.20, 0.5);
    boss.add(meshRidge);

    // Panel detail (recessed surface markings)
    for (var p = 0; p < 3; p++) {
        var meshPanel = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 1.2), matPlaca);
        meshPanel.position.set(sx * (2.0 + p * 0.85), 0.29, -0.3 + p * 0.6);
        boss.add(meshPanel);
    }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3 — RED NEON TRIM LINES
// ═══════════════════════════════════════════════════════════════════

function neonBox(x1, z1, x2, z2, y, w) {
    var dx = x2 - x1, dz = z2 - z1;
    var len = Math.sqrt(dx * dx + dz * dz);
    var m = new THREE.Mesh(new THREE.BoxGeometry(w || 0.07, 0.05, len), matNeon);
    m.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
    m.rotation.y = Math.atan2(dx, dz);
    boss.add(m);
}

// Wing leading edges
neonBox(-1.2, -2.8, -6.5, 1.0, 0.32);
neonBox( 1.2, -2.8,  6.5, 1.0, 0.32);
// Wing trailing edges
neonBox(-6.5, 1.0, -4.2, 3.0, 0.32);
neonBox( 6.5, 1.0,  4.2, 3.0, 0.32);
// Center spine neon line
neonBox(0, -6.0, 0, 0.5, 0.82);
// Rear V-lines
neonBox(0, 0.5, -1.8, 3.8, 0.30);
neonBox(0, 0.5,  1.8, 3.8, 0.30);
// Cross chord
neonBox(-5.5, 1.0, 5.5, 1.0, 0.32);
// Inner wing accents
neonBox(-2.5, -1.2, -5.0, 1.0, 0.32);
neonBox( 2.5, -1.2,  5.0, 1.0, 0.32);

// Neon strip along spine sides
var meshNeonSpineL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 8.5), matNeon);
meshNeonSpineL.position.set(-0.50, 0.52, 0); boss.add(meshNeonSpineL);
var meshNeonSpineR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 8.5), matNeon);
meshNeonSpineR.position.set( 0.50, 0.52, 0); boss.add(meshNeonSpineR);

// ═══════════════════════════════════════════════════════════════════
// SECTION 4 — REACTOR CORE (large glowing orb, properly embedded)
// ═══════════════════════════════════════════════════════════════════

// Housing cavity ring (metallic surround)
var meshHousing = new THREE.Mesh(new THREE.TorusGeometry(1.10, 0.28, 16, 48), matEscuro);
meshHousing.position.set(0, 0.10, 0.5);
boss.add(meshHousing);

// Outer glow sphere
var meshReatorOut = new THREE.Mesh(new THREE.SphereGeometry(0.90, 32, 32), matReator);
meshReatorOut.position.set(0, 0.10, 0.5);
boss.add(meshReatorOut);

// Inner bright core
var meshReatorIn = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 24), matReatorCo);
meshReatorIn.position.set(0, 0.10, 0.5);
boss.add(meshReatorIn);

// Equatorial ring (neon red)
var meshReatorRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.065, 14, 52), matReatorRg);
meshReatorRing.position.set(0, 0.10, 0.5);
boss.add(meshReatorRing);

// Secondary ring (tilted)
var meshReatorRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.038, 10, 40), matReatorRg);
meshReatorRing2.position.set(0, 0.10, 0.5);
meshReatorRing2.rotation.x = Math.PI / 3;
boss.add(meshReatorRing2);

// Flat halo disc
var matHalo = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.14, side: THREE.DoubleSide });
var meshHalo = new THREE.Mesh(new THREE.CircleGeometry(2.0, 32), matHalo);
meshHalo.rotation.x = Math.PI / 2;
meshHalo.position.set(0, 0.28, 0.5);
boss.add(meshHalo);

// ═══════════════════════════════════════════════════════════════════
// SECTION 5 — ENGINE NACELLES (rear, fully 3D with depth)
// ═══════════════════════════════════════════════════════════════════

var engGlows = [];

[[-1.6, 4.2, 0], [0, 4.8, 0], [1.6, 4.2, 0]].forEach(function (ep) {
    var ex = ep[0], ez = ep[1], ey = ep[2];

    // Outer nacelle shroud
    var meshShroud = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.50, 1.10, 10), matEscuro);
    meshShroud.rotation.x = Math.PI / 2;
    meshShroud.position.set(ex, ey, ez);
    boss.add(meshShroud);

    // Inner bell
    var meshBell = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.35, 0.65, 10), matCasco);
    meshBell.rotation.x = Math.PI / 2;
    meshBell.position.set(ex, ey, ez + 0.22);
    boss.add(meshBell);

    // Exhaust opening ring
    var meshExRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.050, 10, 30), matReatorRg);
    meshExRing.rotation.x = Math.PI / 2;
    meshExRing.position.set(ex, ey, ez + 0.58);
    boss.add(meshExRing);

    // Exhaust glow disc
    var matEg = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: new THREE.Color(0xff2200), emissiveIntensity: 6.0, transparent: true, opacity: 0.90 });
    var disc = new THREE.Mesh(new THREE.CircleGeometry(0.28, 18), matEg);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(ex, ey, ez + 0.60);
    boss.add(disc);
    engGlows.push(matEg);

    // Exhaust cone plume
    var matPlume = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    var meshPlume = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.20, 12, 1, true), matPlume);
    meshPlume.rotation.x = -Math.PI / 2;
    meshPlume.position.set(ex, ey, ez + 1.20);
    boss.add(meshPlume);

    // Mount strut from nacelle to spine/fuselage
    var meshStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, Math.abs(ez - 1.0), 6), matEscuro);
    meshStrut.rotation.x = Math.PI / 2;
    meshStrut.position.set(ex * 0.5, ey, (ez + 1.0) * 0.5);
    boss.add(meshStrut);
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 6 — WEAPON CANNONS (near nose, 3D barrels with depth)
// ═══════════════════════════════════════════════════════════════════

[[-0.75, -3.8], [0.75, -3.8]].forEach(function (wp) {
    var wx = wp[0], wz = wp[1];

    // Cannon housing (hex prism)
    var meshHousing2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.80, 6), matEscuro);
    meshHousing2.rotation.x = Math.PI / 2;
    meshHousing2.position.set(wx, 0.05, wz);
    boss.add(meshHousing2);

    // Barrel tube
    var meshBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.10, 1.10, 8), matCasco);
    meshBarrel.rotation.x = Math.PI / 2;
    meshBarrel.position.set(wx, 0.05, wz - 0.55);
    boss.add(meshBarrel);

    // Muzzle glow
    var matWg = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: new THREE.Color(0xff0000), emissiveIntensity: 5.5 });
    var meshMuzzle = new THREE.Mesh(new THREE.CircleGeometry(0.068, 10), matWg);
    meshMuzzle.rotation.x = Math.PI / 2;
    meshMuzzle.position.set(wx, 0.05, wz - 1.12);
    boss.add(meshMuzzle);

    // Muzzle ring neon
    var meshMuzzleRing = new THREE.Mesh(new THREE.TorusGeometry(0.070, 0.020, 6, 16), matNeon);
    meshMuzzleRing.rotation.x = Math.PI / 2;
    meshMuzzleRing.position.set(wx, 0.05, wz - 1.10);
    boss.add(meshMuzzleRing);

    // Secondary barrel (below)
    var meshBarrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.065, 0.90, 6), matCasco);
    meshBarrel2.rotation.x = Math.PI / 2;
    meshBarrel2.position.set(wx, -0.18, wz - 0.44);
    boss.add(meshBarrel2);
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 7 — TURRET BLISTERS (raised dome sensors on wing surface)
// ═══════════════════════════════════════════════════════════════════

[[-3.5, 0.5], [3.5, 0.5], [-4.8, 1.2], [4.8, 1.2]].forEach(function (tp) {
    var tx = tp[0], tz = tp[1];

    var meshBase = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.34, 0.18, 10), matEscuro);
    meshBase.position.set(tx, 0.20, tz); boss.add(meshBase);

    var meshDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), matCascoClaro);
    meshDome.position.set(tx, 0.28, tz); boss.add(meshDome);

    var matSensor = new THREE.MeshStandardMaterial({ color: 0xff0800, emissive: new THREE.Color(0xff0800), emissiveIntensity: 3.5 });
    var meshSensor = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), matSensor);
    meshSensor.position.set(tx, 0.50, tz); boss.add(meshSensor);
});

// ═══════════════════════════════════════════════════════════════════
// SECTION 8 — UNDERBELLY (curved keel + ventral fins)
// ═══════════════════════════════════════════════════════════════════

// Keel ridge (elongated half-ellipsoid on bottom)
var meshKeel = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), matBaixo);
meshKeel.scale.set(1.2, 1.0, 6.0);
meshKeel.rotation.x = Math.PI;
meshKeel.position.set(0, -0.55, 0);
boss.add(meshKeel);

// Ventral cooling fins (3 small fins underneath)
[-1.2, 0, 1.2].forEach(function (fx) {
    var meshVFin = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.52, 2.20), matBaixo);
    meshVFin.position.set(fx, -0.85, 1.0);
    boss.add(meshVFin);

    // Neon edge on fin
    var meshFinNeon = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 2.20), matNeon);
    meshFinNeon.position.set(fx, -1.06, 1.0);
    boss.add(meshFinNeon);
});

// ─── STARS ───────────────────────────────────────────────────────────────────

var sp = new Float32Array(2500 * 3);
for (var si = 0; si < sp.length; si++) sp[si] = (Math.random() - 0.5) * 600;
var sg = new THREE.BufferGeometry();
sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
cena.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.30 })));

// ─── START ───────────────────────────────────────────────────────────────────

function Start() {
    cena.add(boss);
    renderer.render(cena, camera);
    requestAnimationFrame(loop);
}

// ─── LOOP ────────────────────────────────────────────────────────────────────

function loop() {
    controls.update();
    var t = Date.now() * 0.001;

    // Slow rotation + hover
    boss.rotation.y += 0.0022;
    boss.position.y  = Math.sin(t * 0.68) * 0.35;

    // Reactor pulse
    matReator.emissiveIntensity    = 4.0 + Math.sin(t * 2.6) * 2.2;
    matReatorCo.emissiveIntensity  = 8.0 + Math.sin(t * 3.1) * 4.0;
    matReatorRg.emissiveIntensity  = 3.5 + Math.sin(t * 2.0) * 1.5;
    luzReator.intensity            = 14.0 + Math.sin(t * 2.6) * 5.0;

    // Halo pulse
    matHalo.opacity = 0.10 + Math.sin(t * 2.6) * 0.07;

    // Engine exhaust flicker
    engGlows.forEach(function (m, i) {
        m.emissiveIntensity = 4.5 + Math.sin(t * 5.0 + i * 1.5) * 2.5;
    });
    luzMotores.intensity = 6.0 + Math.sin(t * 4.5) * 2.5;

    // Neon lamps flicker slightly
    matNeon.emissiveIntensity = 3.5 + Math.sin(t * 8.0) * 0.8;
    luzNeon1.intensity = 4.5 + Math.sin(t * 7.5) * 1.2;
    luzNeon2.intensity = 4.5 + Math.sin(t * 7.5 + 0.4) * 1.2;

    // Cannon glow pulses
    luzCanhao.intensity = 3.5 + Math.sin(t * 6.0) * 1.8;

    renderer.render(cena, camera);
    requestAnimationFrame(loop);
}

// ─── RESIZE ──────────────────────────────────────────────────────────────────

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
