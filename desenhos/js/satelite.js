import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

document.addEventListener('DOMContentLoaded', Start);

// ─── CENA, CÂMARA E RENDERER ─────────────────────────────────────────────────

var cena = new THREE.Scene();
var camaraPerspetiva = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000008);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

camaraPerspetiva.position.set(5, 3, 9);
camaraPerspetiva.lookAt(0, 0, 0);

// ─── ORBIT CONTROLS ───────────────────────────────────────────────────────────

var controls = new OrbitControls(camaraPerspetiva, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 28;
controls.target.set(0, 0, 0);

// ─── LUZES ───────────────────────────────────────────────────────────────────

var luzAmbiente = new THREE.AmbientLight(0xaabbcc, 2.5);
cena.add(luzAmbiente);

var luzSol = new THREE.DirectionalLight(0xfff8ee, 4.5);
luzSol.position.set(8, 10, 8);
luzSol.castShadow = true;
luzSol.shadow.mapSize.set(2048, 2048);
cena.add(luzSol);

var luzFrontal = new THREE.PointLight(0xffffff, 6.0, 24);
luzFrontal.position.set(5, 3, 9);
cena.add(luzFrontal);

var luzEsq = new THREE.DirectionalLight(0x8899bb, 2.0);
luzEsq.position.set(-8, 2, 4);
cena.add(luzEsq);

var luzBaixo = new THREE.PointLight(0xff5500, 2.5, 10);
luzBaixo.position.set(0, -5, 0);
cena.add(luzBaixo);

// ─── MATERIAIS ───────────────────────────────────────────────────────────────

var matOuro      = new THREE.MeshStandardMaterial({ color: 0xc8841a, metalness: 0.55, roughness: 0.32 });
var matOuroClaro = new THREE.MeshStandardMaterial({ color: 0xe8a030, metalness: 0.48, roughness: 0.38 });
var matBanda     = new THREE.MeshStandardMaterial({ color: 0x18140a, metalness: 0.75, roughness: 0.42 });
var matEstrutura = new THREE.MeshStandardMaterial({ color: 0x22201a, metalness: 0.85, roughness: 0.22 });
var matAntena    = new THREE.MeshStandardMaterial({ color: 0xe0e4f0, metalness: 0.92, roughness: 0.10 });
var matPainel    = new THREE.MeshStandardMaterial({ color: 0x0c1845, metalness: 0.35, roughness: 0.18, emissive: 0x050d2a, emissiveIntensity: 0.40 });
var matGrade     = new THREE.MeshStandardMaterial({ color: 0x060f28, metalness: 0.55, roughness: 0.35 });
var matPrato     = new THREE.MeshStandardMaterial({ color: 0xd8e4ff, metalness: 0.65, roughness: 0.20, side: THREE.DoubleSide });
var matThruster  = new THREE.MeshStandardMaterial({ color: 0x3d4455, metalness: 0.90, roughness: 0.18 });
var matLente     = new THREE.MeshStandardMaterial({ color: 0x040410, metalness: 0.15, roughness: 0.05, emissive: 0x001144, emissiveIntensity: 2.0 });
var matTank      = new THREE.MeshStandardMaterial({ color: 0x9a9aaa, metalness: 0.88, roughness: 0.18 });
var matInst      = new THREE.MeshStandardMaterial({ color: 0x3a3848, metalness: 0.80, roughness: 0.26 });
var matRadBr     = new THREE.MeshStandardMaterial({ color: 0xeeeef5, metalness: 0.40, roughness: 0.55 });
var matRadEsc    = new THREE.MeshStandardMaterial({ color: 0x111118, metalness: 0.65, roughness: 0.40 });
var matMLI       = new THREE.MeshStandardMaterial({ color: 0xd4a020, metalness: 0.62, roughness: 0.28 });

// ─── GRUPO PRINCIPAL ─────────────────────────────────────────────────────────

var satelite = new THREE.Group();

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 1 — CORPO OCTOGONAL (cilindros 8 lados + painéis de face)
// ═══════════════════════════════════════════════════════════════
// Usamos CylinderGeometry(r,r,h,8) para forma octogonal
// r = 0.92 → face-to-face ≈ 1.697 (similar ao corpo anterior de 1.60)

var rCorpo = 0.92;

// Corpo base octogonal (ouro)
var meshCorpoOct = new THREE.Mesh(new THREE.CylinderGeometry(rCorpo, rCorpo, 2.0, 8), matOuro);
meshCorpoOct.castShadow = true;
meshCorpoOct.receiveShadow = true;
satelite.add(meshCorpoOct);

// Bandas escuras (4 bandas sobrepostas ao corpo)
var bandasY = [-0.65, -0.22, 0.22, 0.65];
for (var i = 0; i < bandasY.length; i++) {
    var meshBanda = new THREE.Mesh(new THREE.CylinderGeometry(rCorpo + 0.002, rCorpo + 0.002, 0.095, 8), matBanda);
    meshBanda.position.y = bandasY[i];
    satelite.add(meshBanda);
}

// Tampas topo e base (octogonais)
var meshTampaSup = new THREE.Mesh(new THREE.CylinderGeometry(rCorpo - 0.02, rCorpo - 0.02, 0.08, 8), matEstrutura);
meshTampaSup.position.y = 1.04;
satelite.add(meshTampaSup);

var meshTampaInf = new THREE.Mesh(new THREE.CylinderGeometry(rCorpo - 0.02, rCorpo - 0.02, 0.08, 8), matEstrutura);
meshTampaInf.position.y = -1.04;
satelite.add(meshTampaInf);

// Arestas verticais nos 8 cantos do octógono
for (var oc = 0; oc < 8; oc++) {
    var angOc = (oc / 8) * Math.PI * 2 + Math.PI / 8;
    var meshAr = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 2.08, 6), matEstrutura);
    meshAr.position.set(Math.cos(angOc) * rCorpo, 0, Math.sin(angOc) * rCorpo);
    satelite.add(meshAr);
}

// Anéis estruturais horizontais (topo, meio e base)
var arosCorpo = [-0.88, 0.0, 0.88];
for (var ar = 0; ar < arosCorpo.length; ar++) {
    var meshAroC = new THREE.Mesh(new THREE.TorusGeometry(rCorpo + 0.015, 0.018, 6, 8), matEstrutura);
    meshAroC.rotation.x = Math.PI / 2;
    meshAroC.position.y = arosCorpo[ar];
    satelite.add(meshAroC);
}

// ── PAINEL DE INSTRUMENTOS (face +Z, ângulo 90°) ─────────────────────────────

// distância da face do octógono: rCorpo * cos(π/8) ≈ 0.850
var faceZ = rCorpo * Math.cos(Math.PI / 8);

// Base do painel
var meshPainelInst = new THREE.Mesh(new THREE.BoxGeometry(1.10, 0.68, 0.052), matInst);
meshPainelInst.position.set(0, 0.10, faceZ + 0.026);
satelite.add(meshPainelInst);

// Câmara principal (barril + lente)
var meshBarril = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.138, 0.22, 20), matInst);
meshBarril.rotation.x = Math.PI / 2;
meshBarril.position.set(0, 0.10, faceZ + 0.15);
satelite.add(meshBarril);

var meshLentePrinc = new THREE.Mesh(new THREE.CircleGeometry(0.098, 32), matLente);
meshLentePrinc.position.set(0, 0.10, faceZ + 0.27);
satelite.add(meshLentePrinc);

// Anel da lente
var meshAroLente = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.014, 8, 24), matAntena);
meshAroLente.position.set(0, 0.10, faceZ + 0.265);
satelite.add(meshAroLente);

// Reflexo interno da câmara
var matRef = new THREE.MeshBasicMaterial({ color: 0x2244cc, transparent: true, opacity: 0.45 });
var meshRef = new THREE.Mesh(new THREE.CircleGeometry(0.040, 12), matRef);
meshRef.position.set(0.030, 0.132, faceZ + 0.275);
satelite.add(meshRef);

// Sensor IR
var meshSIR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.09), matInst);
meshSIR.position.set(0.38, -0.24, faceZ + 0.045);
satelite.add(meshSIR);

var meshSIRlente = new THREE.Mesh(new THREE.CircleGeometry(0.046, 12), matLente);
meshSIRlente.position.set(0.38, -0.24, faceZ + 0.095);
satelite.add(meshSIRlente);

// Sensor UV (segundo sensor, canto oposto)
var meshSUV = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.048, 0.10, 10), matInst);
meshSUV.rotation.x = Math.PI / 2;
meshSUV.position.set(-0.38, -0.24, faceZ + 0.062);
satelite.add(meshSUV);

var meshSUVlente = new THREE.Mesh(new THREE.CircleGeometry(0.030, 10), matLente);
meshSUVlente.position.set(-0.38, -0.24, faceZ + 0.118);
satelite.add(meshSUVlente);

// Caixas de electrónica
var cxFront = [
    { sx: 0.28, sy: 0.12, sz: 0.06, px: -0.42, py: 0.60 },
    { sx: 0.22, sy: 0.12, sz: 0.06, px:  0.36, py: 0.60 },
    { sx: 0.32, sy: 0.10, sz: 0.06, px:  0.04, py: -0.62 }
];
for (var cf = 0; cf < cxFront.length; cf++) {
    var cfd = cxFront[cf];
    var meshCF = new THREE.Mesh(new THREE.BoxGeometry(cfd.sx, cfd.sy, cfd.sz), matInst);
    meshCF.position.set(cfd.px, cfd.py, faceZ + 0.052);
    satelite.add(meshCF);
}

// ── RADIADOR TÉRMICO (face +X, ângulo 0°) ─────────────────────────────────────

var faceX = rCorpo * Math.cos(Math.PI / 8);
// 8 riscas alternadas (mais detalhe que as 6 anteriores)
for (var rl = 0; rl < 8; rl++) {
    var yRl  = -0.88 + rl * 0.22 + 0.11;
    var matR = (rl % 2 === 0) ? matRadBr : matRadEsc;
    var meshR = new THREE.Mesh(new THREE.BoxGeometry(0.060, 0.20, 1.65), matR);
    meshR.position.set(faceX + 0.030, yRl, 0);
    satelite.add(meshR);
}

// Aro de encaixe do radiador
var meshAroRad = new THREE.Mesh(new THREE.BoxGeometry(0.014, 1.90, 0.014), matEstrutura);
meshAroRad.position.set(faceX + 0.007, 0, 0.83);
satelite.add(meshAroRad);
var meshAroRad2 = new THREE.Mesh(new THREE.BoxGeometry(0.014, 1.90, 0.014), matEstrutura);
meshAroRad2.position.set(faceX + 0.007, 0, -0.83);
satelite.add(meshAroRad2);

// ── STAR TRACKER (face -X) ────────────────────────────────────────────────────

var meshSTB = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.092, 0.26, 14), matInst);
meshSTB.rotation.z = Math.PI / 2;
meshSTB.position.set(-faceX - 0.06, 0.52, 0.20);
satelite.add(meshSTB);

var meshSTL = new THREE.Mesh(new THREE.CircleGeometry(0.058, 14), matLente);
meshSTL.rotation.y = Math.PI / 2;
meshSTL.position.set(-faceX - 0.20, 0.52, 0.20);
satelite.add(meshSTL);

var meshSTAro = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.010, 6, 14), matAntena);
meshSTAro.rotation.z = Math.PI / 2;
meshSTAro.position.set(-faceX - 0.195, 0.52, 0.20);
satelite.add(meshSTAro);

// Escudo do star tracker
var meshSTEscudo = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.10, 14), matEstrutura);
meshSTEscudo.rotation.z = Math.PI / 2;
meshSTEscudo.position.set(-faceX + 0.02, 0.52, 0.20);
satelite.add(meshSTEscudo);

// ── MÓDULO DE PROPULSÃO ────────────────────────────────────────

var meshTank = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.50, 20), matTank);
meshTank.position.y = -1.38;
satelite.add(meshTank);

// Cinta de fixação do tank
var meshCintaTank = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.016, 8, 20), matEstrutura);
meshCintaTank.rotation.x = Math.PI / 2;
meshCintaTank.position.y = -1.18;
satelite.add(meshCintaTank);

var meshDomo = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), matTank);
meshDomo.rotation.x = Math.PI;
meshDomo.position.y = -1.63;
satelite.add(meshDomo);

var meshAroTk = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.016, 8, 28), matAntena);
meshAroTk.rotation.x = Math.PI / 2;
meshAroTk.position.y = -1.13;
satelite.add(meshAroTk);

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 2 — PAINÉIS SOLARES (9 colunas × 5 linhas — muito mais detalhe)
// ═══════════════════════════════════════════════════════════════

var grupoPainelEsq = new THREE.Group();
satelite.add(grupoPainelEsq);

var grupoPainelDir = new THREE.Group();
satelite.add(grupoPainelDir);

// Braços (mais espessos e com detalhes)
var meshBracoEsq = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.90, 8), matAntena);
meshBracoEsq.rotation.z = Math.PI / 2;
meshBracoEsq.position.set(-1.25, 0, 0);
grupoPainelEsq.add(meshBracoEsq);

var meshJuntaEsq = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), matEstrutura);
meshJuntaEsq.position.set(-0.82, 0, 0);
grupoPainelEsq.add(meshJuntaEsq);

var meshBracoDir = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.90, 8), matAntena);
meshBracoDir.rotation.z = Math.PI / 2;
meshBracoDir.position.set(1.25, 0, 0);
grupoPainelDir.add(meshBracoDir);

var meshJuntaDir = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), matEstrutura);
meshJuntaDir.position.set(0.82, 0, 0);
grupoPainelDir.add(meshJuntaDir);

function criarPainelSolar(grupo, cx) {
    var numCols = 9;
    var numRows = 5;
    var largura = 2.90;
    var altura  = 1.52;

    // Painel principal azul-escuro (células fotovoltaicas)
    var meshP = new THREE.Mesh(new THREE.BoxGeometry(largura, altura, 0.038), matPainel);
    meshP.position.x = cx;
    meshP.castShadow = true;
    grupo.add(meshP);

    // Moldura metálica (4 bordas)
    var sinal = Math.sign(cx);
    var metade = largura / 2;
    var bordas = [
        [largura + 0.06, 0.052, 0.052, cx, altura / 2 + 0.026, 0],
        [largura + 0.06, 0.052, 0.052, cx, -altura / 2 - 0.026, 0],
        [0.052, altura + 0.06, 0.052, cx + sinal * metade + sinal * 0.026, 0, 0],
        [0.052, altura + 0.06, 0.052, cx - sinal * metade - sinal * 0.026, 0, 0]
    ];
    for (var bd = 0; bd < bordas.length; bd++) {
        var brd = bordas[bd];
        var meshBrd = new THREE.Mesh(new THREE.BoxGeometry(brd[0], brd[1], brd[2]), matAntena);
        meshBrd.position.set(brd[3], brd[4], brd[5]);
        grupo.add(meshBrd);
    }

    // Divisórias verticais (9 colunas → 8 divisórias internas)
    for (var col = 1; col < numCols; col++) {
        var localX = -metade + col * (largura / numCols);
        var xDiv   = cx + sinal * localX;
        var meshDV = new THREE.Mesh(new THREE.BoxGeometry(0.012, altura, 0.050), matGrade);
        meshDV.position.set(xDiv, 0, 0);
        grupo.add(meshDV);
    }

    // Divisórias horizontais (5 linhas → 4 divisórias internas)
    for (var row = 1; row < numRows; row++) {
        var yDiv   = -altura / 2 + row * (altura / numRows);
        var meshDH = new THREE.Mesh(new THREE.BoxGeometry(largura, 0.012, 0.050), matGrade);
        meshDH.position.set(cx, yDiv, 0);
        grupo.add(meshDH);
    }

    // Cabo de ligação (no braço, linha central)
    var meshCabo = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.30, 6), matGrade);
    meshCabo.rotation.z = Math.PI / 2;
    meshCabo.position.set(cx - sinal * metade - sinal * 0.15, 0, 0);
    grupo.add(meshCabo);
}

criarPainelSolar(grupoPainelEsq, -2.30);
criarPainelSolar(grupoPainelDir,  2.30);

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 3 — ANTENA PARABÓLICA (maior, com suporte em X)
// ═══════════════════════════════════════════════════════════════

// Braço vertical
var meshBracoAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 1.20, 8), matAntena);
meshBracoAnt.position.y = 1.66;
satelite.add(meshBracoAnt);

// Articulação/junta
var meshArt = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), matEstrutura);
meshArt.position.y = 2.26;
satelite.add(meshArt);

// 4 suportes radiais (struts do feed)
for (var fs = 0; fs < 4; fs++) {
    var angFS  = (fs / 4) * Math.PI * 2;
    var meshSup = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.010, 0.92, 4), matAntena);
    meshSup.rotation.z = Math.PI / 2.5;
    meshSup.rotation.y = angFS;
    meshSup.position.set(Math.sin(angFS) * 0.20, 2.58, Math.cos(angFS) * 0.20);
    satelite.add(meshSup);
}

// Prato parabólico (maior: 1.10 vs 0.86 anterior)
var meshPrato = new THREE.Mesh(
    new THREE.SphereGeometry(1.10, 56, 28, 0, Math.PI * 2, 0, Math.PI / 2),
    matPrato
);
meshPrato.scale.y = 0.26;
meshPrato.rotation.x = Math.PI;
meshPrato.position.y = 2.90;
satelite.add(meshPrato);

var meshAroPrato = new THREE.Mesh(new THREE.TorusGeometry(1.10, 0.026, 8, 72), matAntena);
meshAroPrato.rotation.x = Math.PI / 2;
meshAroPrato.position.y = 2.90;
satelite.add(meshAroPrato);

// Feed horn (receptor central)
var meshFeed = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.056, 0.16, 12), matInst);
meshFeed.position.y = 2.90;
satelite.add(meshFeed);

// Suporte secundário do feed (diagonal)
var meshFeedArm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.55, 4), matAntena);
meshFeedArm.rotation.z = Math.PI / 5;
meshFeedArm.position.set(0.18, 2.72, 0);
satelite.add(meshFeedArm);

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 4 — BOOM DO MAGNETÓMETRO (estende-se em -Z)
// ═══════════════════════════════════════════════════════════════

// Junta de base
var meshBoomJunta = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), matEstrutura);
meshBoomJunta.position.set(0, -0.60, -rCorpo);
satelite.add(meshBoomJunta);

// Boom (3 segmentos telescópicos)
var boomSegmentos = [
    { r: 0.022, len: 0.80, z: -rCorpo - 0.40 },
    { r: 0.016, len: 0.70, z: -rCorpo - 1.15 },
    { r: 0.011, len: 0.60, z: -rCorpo - 1.80 }
];
for (var bs = 0; bs < boomSegmentos.length; bs++) {
    var bseg = boomSegmentos[bs];
    var meshBoomSeg = new THREE.Mesh(
        new THREE.CylinderGeometry(bseg.r, bseg.r, bseg.len, 6), matAntena);
    meshBoomSeg.rotation.x = Math.PI / 2;
    meshBoomSeg.position.set(0, -0.60, bseg.z);
    satelite.add(meshBoomSeg);
}

// Sensor no final do boom
var meshSensorMag = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.14), matInst);
meshSensorMag.position.set(0, -0.60, -rCorpo - 2.16);
satelite.add(meshSensorMag);

var meshSensorTopo = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), matTank);
meshSensorTopo.position.set(0, -0.60, -rCorpo - 2.30);
satelite.add(meshSensorTopo);

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 5 — HASTE OMNIDIRECIONAL (topo)
// ═══════════════════════════════════════════════════════════════

var meshHaste = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.016, 0.80, 6),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f8, metalness: 0.88, roughness: 0.12 })
);
meshHaste.position.set(0.30, 1.52, 0.30);
satelite.add(meshHaste);

var meshPontaH = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f8, metalness: 0.88, roughness: 0.12 })
);
meshPontaH.position.set(0.30, 1.94, 0.30);
satelite.add(meshPontaH);

// Segunda haste (VHF dipolo)
var meshHaste2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.012, 0.55, 6),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f8, metalness: 0.88, roughness: 0.12 })
);
meshHaste2.rotation.z = Math.PI / 4;
meshHaste2.position.set(-0.42, 1.20, -0.30);
satelite.add(meshHaste2);

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 6 — THRUSTERES (4 + skirts de saída)
// ═══════════════════════════════════════════════════════════════

var thrPos = [
    { x:  0.58, z:  0.58 },
    { x: -0.58, z:  0.58 },
    { x:  0.58, z: -0.58 },
    { x: -0.58, z: -0.58 }
];
var flamasMeshes = [];
for (var th = 0; th < thrPos.length; th++) {
    var tp = thrPos[th];

    // Skirt do thruster
    var meshThSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.080, 0.100, 0.10, 12), matEstrutura);
    meshThSkirt.position.set(tp.x, -1.12, tp.z);
    satelite.add(meshThSkirt);

    // Corpo do thruster
    var meshTh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.092, 0.19, 14), matThruster);
    meshTh.position.set(tp.x, -1.22, tp.z);
    satelite.add(meshTh);

    // Bell de saída
    var meshThBell = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.125, 0.12, 14), matThruster);
    meshThBell.position.set(tp.x, -1.38, tp.z);
    satelite.add(meshThBell);

    // Anel emissivo de saída
    var matAnelTh = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 1.8 });
    var meshAnelTh = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.012, 6, 16), matAnelTh);
    meshAnelTh.rotation.x = Math.PI / 2;
    meshAnelTh.position.set(tp.x, -1.44, tp.z);
    satelite.add(meshAnelTh);

    // Chama
    var matFlama = new THREE.MeshStandardMaterial({
        color: 0xff7700, emissive: 0xff4400, emissiveIntensity: 5.0,
        transparent: true, opacity: 0.88
    });
    var meshFlama = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.38, 12, 1, true), matFlama);
    meshFlama.position.set(tp.x, -1.70, tp.z);
    meshFlama.rotation.x = Math.PI;
    satelite.add(meshFlama);
    flamasMeshes.push(meshFlama);
}

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 7 — DETALHES DE SUPERFICIE (MLI blankets, logos, LEDs)
// ═══════════════════════════════════════════════════════════════

// LED de estado (pisca verde)
var matLed = new THREE.MeshStandardMaterial({ color: 0x00ff44, emissive: 0x00ff44, emissiveIntensity: 5.0 });
var meshLed = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), matLed);
meshLed.position.set(0.48, 1.12, faceZ + 0.01);
satelite.add(meshLed);

// LED vermelho de modo (pisca diferente)
var matLedR = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 3.0 });
var meshLedR = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), matLedR);
meshLedR.position.set(0.48, 1.06, faceZ + 0.01);
satelite.add(meshLedR);

// Painéis MLI (isolamento multi-camadas) na face superior
var meshMLI = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.065, 1.60), matMLI);
meshMLI.position.y = 1.08;
satelite.add(meshMLI);

var meshMLIInf = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.065, 1.60), matMLI);
meshMLIInf.position.y = -1.08;
satelite.add(meshMLIInf);

// ─── ÂNGULO INICIAL & ESTRELAS ────────────────────────────────────────────────

satelite.rotation.y = Math.PI / 4;
satelite.position.set(0, 0, 0);

var geometriaEstrelas = new THREE.BufferGeometry();
var posEstrelas = new Float32Array(3000 * 3);
for (var s = 0; s < 3000 * 3; s++) posEstrelas[s] = (Math.random() - 0.5) * 600;
geometriaEstrelas.setAttribute('position', new THREE.BufferAttribute(posEstrelas, 3));
cena.add(new THREE.Points(geometriaEstrelas, new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, sizeAttenuation: true })));

// ─── FUNÇÃO START ─────────────────────────────────────────────────────────────

function Start() {
    cena.add(satelite);
    renderer.render(cena, camaraPerspetiva);
    requestAnimationFrame(loop);
}

// ─── FUNÇÃO LOOP ──────────────────────────────────────────────────────────────

function loop() {
    controls.update();
    var t = Date.now() * 0.001;

    // Rotação lenta
    satelite.rotation.y = t * 0.18 + Math.PI / 4;

    // Flutuação vertical
    satelite.position.y = Math.sin(t * 0.65) * 0.28;

    // Luz frontal acompanha câmara
    luzFrontal.position.copy(camaraPerspetiva.position);

    // Painéis solares oscilam ligeiramente
    grupoPainelEsq.rotation.x = Math.sin(t * 0.30) * 0.06;
    grupoPainelDir.rotation.x = Math.sin(t * 0.30) * 0.06;

    // Brilho dos painéis (simula reflexo do sol)
    matPainel.emissiveIntensity = 0.15 + Math.abs(Math.sin(t * 0.40)) * 0.28;

    // LED verde pisca
    matLed.emissiveIntensity = 1.0 + Math.sin(t * 4.0) * 4.5;

    // LED vermelho pisca em contratempo
    matLedR.emissiveIntensity = 1.0 + Math.sin(t * 2.2 + Math.PI) * 2.5;

    // Chamas dos thrusters tremem
    for (var f = 0; f < flamasMeshes.length; f++) {
        var esc = 0.88 + Math.sin(t * 14.0 + f * 1.4) * 0.18;
        flamasMeshes[f].scale.set(esc, 0.80 + Math.random() * 0.35, esc);
        flamasMeshes[f].material.opacity = 0.65 + Math.sin(t * 10.0 + f) * 0.22;
    }

    luzBaixo.intensity = 1.5 + Math.sin(t * 8.0) * 1.2;

    renderer.render(cena, camaraPerspetiva);
    requestAnimationFrame(loop);
}

// ─── RESIZE ───────────────────────────────────────────────────────────────────

window.addEventListener('resize', function () {
    camaraPerspetiva.aspect = window.innerWidth / window.innerHeight;
    camaraPerspetiva.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
