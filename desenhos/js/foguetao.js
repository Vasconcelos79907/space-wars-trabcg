import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

document.addEventListener('DOMContentLoaded', Start);

var cena = new THREE.Scene();
var camaraPerspetiva = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000008);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

camaraPerspetiva.position.set(0, 1.5, 14);

var controls = new OrbitControls(camaraPerspetiva, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 6;
controls.maxDistance = 30;

// ─── LUZES ───────────────────────────────────────────────────────────────────

var luzAmbiente = new THREE.AmbientLight(0x334455, 1.5);
cena.add(luzAmbiente);

var luzDirecional = new THREE.DirectionalLight(0xfff8ee, 3.0);
luzDirecional.position.set(7, 14, 9);
luzDirecional.castShadow = true;
luzDirecional.shadow.mapSize.set(2048, 2048);
cena.add(luzDirecional);

var luzPreenchimento = new THREE.DirectionalLight(0x6688aa, 1.2);
luzPreenchimento.position.set(-7, 2, 9);
cena.add(luzPreenchimento);

var luzContorno = new THREE.DirectionalLight(0x223355, 0.8);
luzContorno.position.set(4, -4, -8);
cena.add(luzContorno);

var luzMotor = new THREE.PointLight(0xff7700, 8, 14);
luzMotor.position.set(0, -6.5, 0);
cena.add(luzMotor);

var luzLateral = new THREE.PointLight(0xff5500, 2, 8);
luzLateral.position.set(3, -5, 3);
cena.add(luzLateral);

// ─── MATERIAIS ───────────────────────────────────────────────────────────────

var matBranco    = new THREE.MeshStandardMaterial({ color: 0xf0f2f5, metalness: 0.18, roughness: 0.28 });
var matBrancoEsc = new THREE.MeshStandardMaterial({ color: 0xd8dce4, metalness: 0.22, roughness: 0.32 });
var matPreto     = new THREE.MeshStandardMaterial({ color: 0x0c0d10, metalness: 0.60, roughness: 0.30 });
var matLaranja   = new THREE.MeshStandardMaterial({ color: 0xff4400, metalness: 0.28, roughness: 0.45 });
var matPrata     = new THREE.MeshStandardMaterial({ color: 0xb0bcc8, metalness: 0.92, roughness: 0.14 });
var matPrataEsc  = new THREE.MeshStandardMaterial({ color: 0x707888, metalness: 0.88, roughness: 0.22 });
var matTitanio   = new THREE.MeshStandardMaterial({ color: 0x606870, metalness: 0.95, roughness: 0.10 });
var matBocal     = new THREE.MeshStandardMaterial({ color: 0x7a3a00, metalness: 0.80, roughness: 0.25 });
var matBocalHot  = new THREE.MeshStandardMaterial({ color: 0x8a4200, emissive: 0x550e00, emissiveIntensity: 0.8, metalness: 0.82, roughness: 0.22 });
var matVermelho  = new THREE.MeshStandardMaterial({ color: 0xcc1100, metalness: 0.40, roughness: 0.48 });

var _bTex = new THREE.TextureLoader().load('./textures/textura_foguete.png');
_bTex.wrapS = _bTex.wrapT = THREE.RepeatWrapping;
_bTex.repeat.set(1, 1);
var matBooster = new THREE.MeshStandardMaterial({ map: _bTex, metalness: 0.30, roughness: 0.52 });

var _pTex = new THREE.TextureLoader().load('./textures/textura_ponta.png');
_pTex.wrapS = _pTex.wrapT = THREE.RepeatWrapping;
_pTex.repeat.set(1, 1);
var matPonta = new THREE.MeshStandardMaterial({ map: _pTex, metalness: 0.20, roughness: 0.60 });

var foguetao = new THREE.Group();
var flamasObjetos = [];

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 1 — CORPO PRINCIPAL (branco + faixa preta)
// ═══════════════════════════════════════════════════════════════

var meshCorpo = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.76, 4.60, 32), matBooster);
meshCorpo.castShadow = true;
meshCorpo.receiveShadow = true;
foguetao.add(meshCorpo);

// Faixa preta central (chine stripe)
var meshFaixaPreto = new THREE.Mesh(new THREE.CylinderGeometry(0.725, 0.725, 0.75, 32), matPreto);
meshFaixaPreto.position.y = -0.20;
foguetao.add(meshFaixaPreto);

// Anéis de segmento prata
var arosY = [-2.10, -1.40, -0.60, 0.20, 1.00, 1.80];
for (var i = 0; i < arosY.length; i++) {
    var meshAnel = new THREE.Mesh(new THREE.CylinderGeometry(0.778, 0.778, 0.065, 32), matPrata);
    meshAnel.position.y = arosY[i];
    foguetao.add(meshAnel);
}

// Interstage (separação 1º/2º estágio)
var meshInterstage = new THREE.Mesh(new THREE.CylinderGeometry(0.740, 0.740, 0.20, 32), matPreto);
meshInterstage.position.y = 2.31;
foguetao.add(meshInterstage);

var meshIA1 = new THREE.Mesh(new THREE.CylinderGeometry(0.755, 0.755, 0.050, 32), matPrata);
meshIA1.position.y = 2.42;
foguetao.add(meshIA1);

var meshIA2 = new THREE.Mesh(new THREE.CylinderGeometry(0.755, 0.755, 0.050, 32), matPrata);
meshIA2.position.y = 2.20;
foguetao.add(meshIA2);

// Cinto da base
var meshCintoBase = new THREE.Mesh(new THREE.CylinderGeometry(0.758, 0.762, 0.22, 32), matPreto);
meshCintoBase.position.y = -2.31;
foguetao.add(meshCintoBase);

// 3 Conduítes a 120°
var angConduits = [0, Math.PI * 2 / 3, Math.PI * 4 / 3];
for (var c = 0; c < 3; c++) {
    var meshCond = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 4.60, 8), matPrataEsc);
    meshCond.position.set(Math.cos(angConduits[c]) * 0.778, 0, Math.sin(angConduits[c]) * 0.778);
    foguetao.add(meshCond);
    for (var ac = 0; ac < 5; ac++) {
        var meshAbr = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.016, 6, 10), matPrata);
        meshAbr.rotation.x = Math.PI / 2;
        meshAbr.position.set(Math.cos(angConduits[c]) * 0.778, -1.80 + ac * 0.90, Math.sin(angConduits[c]) * 0.778);
        foguetao.add(meshAbr);
    }
}

// 4 Pods de RCS (a 45° da linha dos boosters)
for (var rcs = 0; rcs < 4; rcs++) {
    var angRcs = (rcs / 4) * Math.PI * 2 + Math.PI / 4;
    var rcsX = Math.cos(angRcs) * 0.748;
    var rcsZ = Math.sin(angRcs) * 0.748;

    var meshRcsCx = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.13), matPreto);
    meshRcsCx.position.set(rcsX, 0.80, rcsZ);
    meshRcsCx.rotation.y = angRcs;
    foguetao.add(meshRcsCx);

    for (var nr = 0; nr < 2; nr++) {
        var meshNRcs = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 0.07, 8), matTitanio);
        meshNRcs.rotation.x = Math.PI / 2;
        meshNRcs.position.set(rcsX * 1.06, 0.80 + (nr === 0 ? 0.055 : -0.055), rcsZ * 1.06);
        foguetao.add(meshNRcs);
    }
}

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 2 — OGIVA / PAYLOAD FAIRING (laranja)
// ═══════════════════════════════════════════════════════════════

// Cilindro de transição
var meshOgivaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.55, 32), matPonta);
meshOgivaBase.position.y = 3.00;
foguetao.add(meshOgivaBase);

// Cone principal (mais alto e esbelto)
var meshOgivaCone = new THREE.Mesh(new THREE.ConeGeometry(0.72, 2.40, 32), matPonta);
meshOgivaCone.position.y = 3.95;
meshOgivaCone.castShadow = true;
foguetao.add(meshOgivaCone);

// Linha de separação do fairing
var meshSepFairing = new THREE.Mesh(new THREE.CylinderGeometry(0.726, 0.726, 0.028, 32), matPreto);
meshSepFairing.position.y = 2.72;
foguetao.add(meshSepFairing);

// Riscas decorativas na ogiva (4 anéis)
for (var ro = 0; ro < 4; ro++) {
    var fracao = 0.14 + ro * 0.19;
    var raioR  = 0.72 * (1.0 - fracao);
    var altR   = 3.95 - 1.20 + 2.40 * fracao;
    var meshRiscoOg = new THREE.Mesh(
        new THREE.TorusGeometry(raioR, 0.012, 6, 40),
        new THREE.MeshStandardMaterial({ color: 0xcc2200, metalness: 0.5, roughness: 0.4 })
    );
    meshRiscoOg.rotation.x = Math.PI / 2;
    meshRiscoOg.position.y = altR;
    foguetao.add(meshRiscoOg);
}

// Ponta metálica
var meshPonta = new THREE.Mesh(new THREE.ConeGeometry(0.050, 0.30, 16),
    new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.98, roughness: 0.04 }));
meshPonta.position.y = 5.30;
foguetao.add(meshPonta);

// Para-raios (lightning rod)
var meshParaRaios = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.009, 0.40, 6),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.98, roughness: 0.05 }));
meshParaRaios.position.y = 5.65;
foguetao.add(meshParaRaios);

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 3 — JANELA / ESCOTILHA
// ═══════════════════════════════════════════════════════════════

var meshCaixilho = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.60, 0.055),
    new THREE.MeshStandardMaterial({ color: 0x1a2233, metalness: 0.82, roughness: 0.25 }));
meshCaixilho.position.set(0, 1.50, 0.758);
foguetao.add(meshCaixilho);

var meshJanela = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x050810, metalness: 0.05, roughness: 0.02, transparent: true, opacity: 0.96 })
);
meshJanela.position.set(0, 1.50, 0.765);
meshJanela.rotation.x = Math.PI / 2;
foguetao.add(meshJanela);

// Reflexo interno (simula interior iluminado)
var matReflexo = new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.16 });
var meshReflexo = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), matReflexo);
meshReflexo.position.set(-0.05, 1.55, 0.99);
meshReflexo.rotation.x = Math.PI / 2;
foguetao.add(meshReflexo);

var meshAroJan = new THREE.Mesh(new THREE.TorusGeometry(0.232, 0.042, 12, 36), matPrata);
meshAroJan.position.set(0, 1.50, 0.775);
foguetao.add(meshAroJan);

for (var pj = 0; pj < 8; pj++) {
    var angPj = (pj / 8) * Math.PI * 2;
    var meshParafuso = new THREE.Mesh(new THREE.SphereGeometry(0.020, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x889999, metalness: 0.95, roughness: 0.10 }));
    meshParafuso.position.set(Math.sin(angPj) * 0.292, 1.50 + Math.cos(angPj) * 0.292, 0.785);
    foguetao.add(meshParafuso);
}

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 4 — BOOSTERS LATERAIS (melhorados)
// ═══════════════════════════════════════════════════════════════

for (var b = 0; b < 2; b++) {
    var lx = b === 0 ? -1.58 : 1.58;
    var sinalX = b === 0 ? -1 : 1;

    var meshBstCorpo = new THREE.Mesh(new THREE.CylinderGeometry(0.252, 0.282, 2.65, 24), matBooster);
    meshBstCorpo.position.set(lx, 0.22, 0);
    meshBstCorpo.castShadow = true;
    foguetao.add(meshBstCorpo);

    // Faixa preta no booster
    var meshBstFaixa = new THREE.Mesh(new THREE.CylinderGeometry(0.258, 0.258, 0.52, 24), matPreto);
    meshBstFaixa.position.set(lx, 0.10, 0);
    foguetao.add(meshBstFaixa);

    var meshFxSup = new THREE.Mesh(new THREE.CylinderGeometry(0.291, 0.291, 0.11, 24), matVermelho);
    meshFxSup.position.set(lx, 0.85, 0);
    foguetao.add(meshFxSup);

    var meshFxInf = new THREE.Mesh(new THREE.CylinderGeometry(0.291, 0.291, 0.11, 24), matVermelho);
    meshFxInf.position.set(lx, -0.18, 0);
    foguetao.add(meshFxInf);

    for (var ab = 0; ab < 3; ab++) {
        var meshABst = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.265, 0.052, 24), matPrata);
        meshABst.position.set(lx, -0.88 + ab * 0.65, 0);
        foguetao.add(meshABst);
    }

    // Ogiva do booster (laranja)
    var meshBstOgiva = new THREE.Mesh(new THREE.ConeGeometry(0.252, 1.02, 24), matLaranja);
    meshBstOgiva.position.set(lx, 2.04, 0);
    meshBstOgiva.castShadow = true;
    foguetao.add(meshBstOgiva);

    var meshAnBstOg = new THREE.Mesh(new THREE.CylinderGeometry(0.258, 0.258, 0.09, 24), matPreto);
    meshAnBstOg.position.set(lx, 1.58, 0);
    foguetao.add(meshAnBstOg);

    // Base cónica (taper)
    var meshBstTaper = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.282, 0.38, 24), matBrancoEsc);
    meshBstTaper.position.set(lx, -1.52, 0);
    foguetao.add(meshBstTaper);

    // Nozzle com campânula
    var meshBstNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.170, 0.28, 16), matBocal);
    meshBstNozzle.position.set(lx, -1.92, 0);
    foguetao.add(meshBstNozzle);

    var matAnelBst = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff3300, emissiveIntensity: 1.5 });
    var meshAnelBst = new THREE.Mesh(new THREE.TorusGeometry(0.170, 0.016, 8, 24), matAnelBst);
    meshAnelBst.rotation.x = Math.PI / 2;
    meshAnelBst.position.set(lx, -2.06, 0);
    foguetao.add(meshAnelBst);

    // Chamas do booster (3 camadas)
    var matFBE = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.72, side: THREE.DoubleSide });
    var meshFBE = new THREE.Mesh(new THREE.ConeGeometry(0.170, 0.95, 12, 1, true), matFBE);
    meshFBE.rotation.x = Math.PI;
    meshFBE.position.set(lx, -2.53, 0);
    foguetao.add(meshFBE);
    flamasObjetos.push({ mesh: meshFBE, material: matFBE, tipo: 'ext', fase: b * 1.5 + 3.0 });

    var matFBM = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.82, side: THREE.DoubleSide });
    var meshFBM = new THREE.Mesh(new THREE.ConeGeometry(0.100, 0.68, 10, 1, true), matFBM);
    meshFBM.rotation.x = Math.PI;
    meshFBM.position.set(lx, -2.40, 0);
    foguetao.add(meshFBM);
    flamasObjetos.push({ mesh: meshFBM, material: matFBM, tipo: 'med', fase: b * 1.5 + 3.3 });

    var matFBI = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.90, side: THREE.DoubleSide });
    var meshFBI = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.44, 8, 1, true), matFBI);
    meshFBI.rotation.x = Math.PI;
    meshFBI.position.set(lx, -2.30, 0);
    foguetao.add(meshFBI);
    flamasObjetos.push({ mesh: meshFBI, material: matFBI, tipo: 'int', fase: b * 1.5 + 3.6 });

    // Mini-barbatanas do booster
    for (var mb = 0; mb < 2; mb++) {
        var angMb = mb === 0 ? Math.PI / 2 : -Math.PI / 2;
        var meshMF = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.52, 0.34), matVermelho);
        meshMF.position.set(lx, -1.26, Math.sin(angMb) * 0.38);
        foguetao.add(meshMF);
    }

    // Struts de ligação ao corpo
    var meshStrutSup = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.58, 8), matPrata);
    meshStrutSup.rotation.z = Math.PI / 2;
    meshStrutSup.position.set(sinalX * 1.04, 0.75, 0);
    foguetao.add(meshStrutSup);

    var meshStrutInf = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.58, 8), matPrata);
    meshStrutInf.rotation.z = Math.PI / 2;
    meshStrutInf.position.set(sinalX * 1.04, -0.20, 0);
    foguetao.add(meshStrutInf);

    var nosY2 = [0.75, -0.20];
    for (var ns = 0; ns < 2; ns++) {
        var meshNC = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), matPrata);
        meshNC.position.set(sinalX * 0.79, nosY2[ns], 0);
        foguetao.add(meshNC);
        var meshNB = new THREE.Mesh(new THREE.SphereGeometry(0.050, 8, 8), matPrata);
        meshNB.position.set(sinalX * 1.29, nosY2[ns], 0);
        foguetao.add(meshNB);
    }
}

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 5 — BARBATANAS DELTA (maiores e mais swept)
// ═══════════════════════════════════════════════════════════════

for (var f = 0; f < 4; f++) {
    var angFin = (f / 4) * Math.PI * 2;
    var cosF = Math.cos(angFin);
    var sinF = Math.sin(angFin);

    // Secção base larga
    var meshFinBase = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.95, 0.92), matVermelho);
    meshFinBase.position.set(cosF * 0.88, -2.72, sinF * 0.88);
    meshFinBase.rotation.y = angFin;
    meshFinBase.castShadow = true;
    foguetao.add(meshFinBase);

    // Secção superior estreita (trapézio)
    var meshFinTopo = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.72, 0.44), matVermelho);
    meshFinTopo.position.set(cosF * 0.88, -1.92, sinF * 0.88);
    meshFinTopo.rotation.y = angFin;
    foguetao.add(meshFinTopo);

    // Leading edge de titânio (aguenta calor de reentrada)
    var meshBordaDian = new THREE.Mesh(new THREE.BoxGeometry(0.036, 1.67, 0.038), matTitanio);
    meshBordaDian.position.set(cosF * 0.88, -2.34, sinF * 0.88);
    meshBordaDian.rotation.y = angFin;
    foguetao.add(meshBordaDian);

    var meshBordaTras = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.95, 0.035), matPrata);
    meshBordaTras.position.set(cosF * 0.88, -2.72, sinF * 0.88);
    meshBordaTras.rotation.y = angFin;
    foguetao.add(meshBordaTras);

    // Reforço de raiz
    var meshRaiz = new THREE.Mesh(new THREE.BoxGeometry(0.10, 1.67, 0.10), matPreto);
    meshRaiz.position.set(cosF * 0.79, -2.34, sinF * 0.79);
    meshRaiz.rotation.y = angFin;
    foguetao.add(meshRaiz);

    // Parafusos de fixação (4 por barbatana)
    for (var pf = 0; pf < 4; pf++) {
        var meshPfin = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), matPrata);
        meshPfin.position.set(cosF * 0.78, -2.92 + pf * 0.42, sinF * 0.78);
        foguetao.add(meshPfin);
    }
}

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 6 — MOTORES PRINCIPAIS (3 em triângulo, detalhados)
// ═══════════════════════════════════════════════════════════════

// Skirt de base (saia estrutural)
var meshSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.02, 0.28, 32), matPreto);
meshSkirt.position.y = -2.65;
foguetao.add(meshSkirt);

var meshPlacaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.09, 32), matPreto);
meshPlacaBase.position.y = -2.52;
foguetao.add(meshPlacaBase);

for (var m = 0; m < 3; m++) {
    var angM = (m / 3) * Math.PI * 2;
    var oxM = Math.cos(angM) * 0.36;
    var ozM = Math.sin(angM) * 0.36;

    // Garganta (convergente)
    var meshGarganta = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.098, 0.13, 20), matPreto);
    meshGarganta.position.set(oxM, -2.59, ozM);
    foguetao.add(meshGarganta);

    // Bell divergente em 2 partes
    var meshBell1 = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.195, 0.22, 20), matBocal);
    meshBell1.position.set(oxM, -2.82, ozM);
    foguetao.add(meshBell1);

    var meshBell2 = new THREE.Mesh(new THREE.CylinderGeometry(0.195, 0.355, 0.30, 20), matBocalHot);
    meshBell2.position.set(oxM, -3.14, ozM);
    foguetao.add(meshBell2);

    // Anel de saída emissivo
    var matAnelSaida = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff4400, emissiveIntensity: 2.5 });
    var meshAnelSaida = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.022, 8, 28), matAnelSaida);
    meshAnelSaida.rotation.x = Math.PI / 2;
    meshAnelSaida.position.set(oxM, -3.30, ozM);
    foguetao.add(meshAnelSaida);

    // Disco de exaustão interior
    var matDiscEx = new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true, opacity: 0.60, side: THREE.DoubleSide });
    var meshDiscEx = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), matDiscEx);
    meshDiscEx.rotation.x = Math.PI / 2;
    meshDiscEx.position.set(oxM, -3.31, ozM);
    foguetao.add(meshDiscEx);
    flamasObjetos.push({ mesh: meshDiscEx, material: matDiscEx, tipo: 'disco', fase: m * 0.7 });

    // Chama externa laranja
    var matFlamaE = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.72, side: THREE.DoubleSide });
    var meshFlamaE = new THREE.Mesh(new THREE.ConeGeometry(0.37, 2.50, 18, 1, true), matFlamaE);
    meshFlamaE.rotation.x = Math.PI;
    meshFlamaE.position.set(oxM, -4.35, ozM);
    foguetao.add(meshFlamaE);
    flamasObjetos.push({ mesh: meshFlamaE, material: matFlamaE, tipo: 'ext', fase: m * 0.9 });

    // Chama intermédia amarela
    var matFlamaM = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    var meshFlamaM = new THREE.Mesh(new THREE.ConeGeometry(0.23, 1.90, 14, 1, true), matFlamaM);
    meshFlamaM.rotation.x = Math.PI;
    meshFlamaM.position.set(oxM, -4.18, ozM);
    foguetao.add(meshFlamaM);
    flamasObjetos.push({ mesh: meshFlamaM, material: matFlamaM, tipo: 'med', fase: m * 0.9 + 0.25 });

    // Núcleo branco
    var matFlamaCore = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
    var meshFlamaCore = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.35, 10, 1, true), matFlamaCore);
    meshFlamaCore.rotation.x = Math.PI;
    meshFlamaCore.position.set(oxM, -4.02, ozM);
    foguetao.add(meshFlamaCore);
    flamasObjetos.push({ mesh: meshFlamaCore, material: matFlamaCore, tipo: 'int', fase: m * 0.9 + 0.45 });

    // Mach diamonds (efeito de choque supersónico)
    for (var md = 0; md < 2; md++) {
        var yMd  = -3.65 - md * 0.48;
        var rMd  = 0.27 - md * 0.05;
        var matMach = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 - md * 0.07, side: THREE.DoubleSide });
        var meshMach = new THREE.Mesh(new THREE.TorusGeometry(rMd, 0.022, 6, 20), matMach);
        meshMach.rotation.x = Math.PI / 2;
        meshMach.position.set(oxM, yMd, ozM);
        foguetao.add(meshMach);
        flamasObjetos.push({ mesh: meshMach, material: matMach, tipo: 'mach', fase: m * 0.5 + md * 0.8 });
    }
}

// ─── ESTRELAS ────────────────────────────────────────────────────────────────

var geometriaEstrelas = new THREE.BufferGeometry();
var posEstrelas = new Float32Array(3000 * 3);
for (var s = 0; s < 3000 * 3; s++) posEstrelas[s] = (Math.random() - 0.5) * 600;
geometriaEstrelas.setAttribute('position', new THREE.BufferAttribute(posEstrelas, 3));
cena.add(new THREE.Points(geometriaEstrelas, new THREE.PointsMaterial({ color: 0xffffff, size: 0.30, sizeAttenuation: true })));

foguetao.position.set(0, 0, 0);

// ─── FUNÇÃO START ─────────────────────────────────────────────────────────────

function Start() {
    cena.add(foguetao);
    renderer.render(cena, camaraPerspetiva);
    requestAnimationFrame(loop);
}

// ─── FUNÇÃO LOOP ──────────────────────────────────────────────────────────────

function loop() {
    controls.update();
    var t = Date.now() * 0.001;

    foguetao.rotateY(Math.PI / 180 * 0.40);
    foguetao.position.y = Math.sin(t * 0.85) * 0.28;

    for (var i = 0; i < flamasObjetos.length; i++) {
        var fl    = flamasObjetos[i];
        var pulso = Math.sin(t * 14 + fl.fase);
        var ruido = Math.sin(t * 23 + fl.fase * 2.3) * 0.5;
        if (fl.tipo === 'ext') {
            fl.material.opacity     = 0.62 + (pulso + ruido) * 0.10;
            fl.mesh.scale.y         = 0.88 + pulso * 0.14;
            fl.mesh.scale.x         = fl.mesh.scale.z = 0.96 + ruido * 0.06;
        } else if (fl.tipo === 'med') {
            fl.material.opacity     = 0.76 + pulso * 0.11;
            fl.mesh.scale.y         = 0.86 + pulso * 0.16;
        } else if (fl.tipo === 'int') {
            fl.material.opacity     = 0.84 + pulso * 0.10;
            fl.mesh.scale.y         = 0.84 + (pulso + ruido) * 0.18;
        } else if (fl.tipo === 'disco') {
            fl.material.opacity     = 0.42 + Math.abs(pulso) * 0.22;
        } else if (fl.tipo === 'mach') {
            fl.material.opacity     = 0.18 + Math.abs(Math.sin(t * 18 + fl.fase)) * 0.18;
        }
    }

    luzMotor.intensity   = 6.0 + Math.sin(t * 13) * 3.0;
    luzLateral.intensity = 1.5 + Math.sin(t * 11 + 1.2) * 0.8;

    renderer.render(cena, camaraPerspetiva);
    requestAnimationFrame(loop);
}

// ─── RESIZE ───────────────────────────────────────────────────────────────────

window.addEventListener('resize', function () {
    camaraPerspetiva.aspect = window.innerWidth / window.innerHeight;
    camaraPerspetiva.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
