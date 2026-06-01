// Importação da biblioteca ThreeJS baseada no importmap
import * as THREE from 'three';

// Importação da biblioteca OrbitControls para drag/zoom
import { OrbitControls } from 'OrbitControls';

// Indica ao documento HTML que quando acabar de carregar todo o seu conteúdo
// deve chamar a função "Start".
document.addEventListener('DOMContentLoaded', Start);

// ─── CENA, CÂMARA E RENDERER ─────────────────────────────────────────────────

var cena = new THREE.Scene();

var camaraPerspetiva = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;

camaraPerspetiva.position.set(0, 3, 10);

// ─── ORBIT CONTROLS ───────────────────────────────────────────────────────────

var controls = new OrbitControls(camaraPerspetiva, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 4;
controls.maxDistance = 24;

// ─── LUZES ───────────────────────────────────────────────────────────────────

// Ambient fraco — espaço profundo quase sem luz
var luzAmbiente = new THREE.AmbientLight(0x060d18, 1.0);
cena.add(luzAmbiente);

// Key light — branco frio vindo de cima/frente
var luzDirecional = new THREE.DirectionalLight(0xc8e8ff, 4.5);
luzDirecional.position.set(8, 14, 8);
luzDirecional.castShadow = true;
luzDirecional.shadow.mapSize.set(2048, 2048);
cena.add(luzDirecional);

// Rim light — azul/roxo vindo de trás para silhueta dramática
var luzRim = new THREE.DirectionalLight(0x3366ff, 2.8);
luzRim.position.set(-10, 2, -12);
cena.add(luzRim);

// Fill light — verde suave do lado esquerdo
var luzPreenchimento = new THREE.DirectionalLight(0x22cc66, 1.0);
luzPreenchimento.position.set(-10, 4, 6);
cena.add(luzPreenchimento);

// Contra-luz inferior — realça o feixe e emissores
var luzContorno = new THREE.DirectionalLight(0x00ff88, 0.8);
luzContorno.position.set(0, -10, -4);
cena.add(luzContorno);

// Glow do motor verde (pulsante)
var luzUFO = new THREE.PointLight(0x00ff44, 9.0, 18);
luzUFO.position.set(0, -1.2, 0);
cena.add(luzUFO);

// Luz orbitante — cria reflexos dinâmicos nas laterais texturizadas
var luzOrbita = new THREE.PointLight(0x44ddff, 6.0, 20);
luzOrbita.position.set(6, 3, 0);
cena.add(luzOrbita);

// Luz de acento púrpura — destaca a cúpula e janelas
var luzAccent = new THREE.PointLight(0xaa44ff, 3.5, 12);
luzAccent.position.set(0, 4, 5);
cena.add(luzAccent);

// ─── MATERIAIS ───────────────────────────────────────────────────────────────

var _texLateral = new THREE.TextureLoader().load('./textures/textura_ufo_laterias.png');
_texLateral.wrapS = _texLateral.wrapT = THREE.RepeatWrapping;
_texLateral.repeat.set(4, 1);
var matDisco = new THREE.MeshStandardMaterial({ map: _texLateral, metalness: 0.58, roughness: 0.42 });

var _texBaixo = new THREE.TextureLoader().load('./textures/textura_ufo_baixo.png');
_texBaixo.wrapS = _texBaixo.wrapT = THREE.RepeatWrapping;
_texBaixo.repeat.set(2, 1);
var matBaixo = new THREE.MeshStandardMaterial({ map: _texBaixo, metalness: 0.68, roughness: 0.36 });

var matDiscoEscuro = new THREE.MeshStandardMaterial({ color: 0x2d4a22, metalness: 0.72, roughness: 0.32 });
var matCupula = new THREE.MeshStandardMaterial({ color: 0x1a4a3a, metalness: 0.38, roughness: 0.28 });
var matMetal = new THREE.MeshStandardMaterial({ color: 0x889988, metalness: 0.80, roughness: 0.22 });
var matRanhura = new THREE.MeshStandardMaterial({ color: 0x182a12, metalness: 0.82, roughness: 0.28 });

// ─── GRUPO PRINCIPAL ─────────────────────────────────────────────────────────

var ufo = new THREE.Group();

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 1 — DISCO PRINCIPAL
// ═══════════════════════════════════════════════════════════════

// 1a. Corpo do disco (cilindro achatado)
var meshCorpo = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.9, 0.26, 64), matDisco);
meshCorpo.castShadow = true;
meshCorpo.receiveShadow = true;
ufo.add(meshCorpo);

// 1b. Calota superior convexa (meia esfera achatada sobre o disco)
var meshCalota = new THREE.Mesh(new THREE.SphereGeometry(2.7, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), matDisco);
meshCalota.scale.y = 0.20;
meshCalota.position.y = 0.13;
meshCalota.castShadow = true;
ufo.add(meshCalota);

// 1c. Ranhuras/painéis concêntricos no topo do disco (4 anéis planos)
// Alturas calculadas à superfície da calota: y = 0.13 + 0.54*sqrt(1-(r/2.7)^2)
var ranhurasDados = [
    { raio: 0.80, posY: 0.64 },
    { raio: 1.35, posY: 0.60 },
    { raio: 1.85, posY: 0.52 },
    { raio: 2.35, posY: 0.40 }
];
for (var r = 0; r < ranhurasDados.length; r++) {
    var rd = ranhurasDados[r];
    var meshRan = new THREE.Mesh(new THREE.TorusGeometry(rd.raio, 0.020, 6, 72), matRanhura);
    meshRan.rotation.x = Math.PI / 2;
    meshRan.position.y = rd.posY;
    ufo.add(meshRan);
}

// 1d. Anel exterior de blindagem (borda do disco)
var meshAnel = new THREE.Mesh(new THREE.TorusGeometry(2.82, 0.17, 16, 80), matDisco);
meshAnel.rotation.x = Math.PI / 2;
meshAnel.castShadow = true;
ufo.add(meshAnel);

// 1e. Segundo anel interior (ranhura de separação mais próxima do anel exterior)
var meshAnelInt = new THREE.Mesh(new THREE.TorusGeometry(2.50, 0.040, 8, 64), matRanhura);
meshAnelInt.rotation.x = Math.PI / 2;
meshAnelInt.position.y = 0.02;
ufo.add(meshAnelInt);

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 2 — CÚPULA E JANELAS
// ═══════════════════════════════════════════════════════════════

// 2a. Banda base da cúpula (torus onde assentam as janelas)
var meshBandaCupula = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.085, 12, 60), matDiscoEscuro);
meshBandaCupula.rotation.x = Math.PI / 2;
meshBandaCupula.position.y = 0.58;
ufo.add(meshBandaCupula);

// 2b. Cúpula principal (verde escuro)
var meshCupula = new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), matCupula);
meshCupula.position.y = 0.54;
meshCupula.castShadow = true;
ufo.add(meshCupula);

// 2c. Anel de reforço a meio da cúpula
var meshAnelCupula = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.032, 8, 48), matMetal);
meshAnelCupula.rotation.x = Math.PI / 2;
meshAnelCupula.position.y = 0.90;
ufo.add(meshAnelCupula);

// 2d. Núcleo luminoso dentro da cúpula
var matNucleo = new THREE.MeshStandardMaterial({
    color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 3.5, transparent: true, opacity: 0.72
});
var meshNucleo = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), matNucleo);
meshNucleo.position.y = 0.95;
ufo.add(meshNucleo);

// 2e. Janelas azuis + aros metálicos (8 unidades)
var numJanelas = 8;
var matJanela = new THREE.MeshStandardMaterial({ color: 0x2255dd, emissive: 0x1133bb, emissiveIntensity: 2.8 });
var matAroJanela = new THREE.MeshStandardMaterial({ color: 0x335533, metalness: 0.88, roughness: 0.18 });
for (var j = 0; j < numJanelas; j++) {
    var angJ = (j / numJanelas) * Math.PI * 2;
    var cx = Math.cos(angJ) * 0.91;
    var cz = Math.sin(angJ) * 0.91;

    // Janela retangular
    var meshJan = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.07), matJanela);
    meshJan.position.set(cx, 0.60, cz);
    meshJan.rotation.y = -angJ;
    ufo.add(meshJan);

    // Aro elíptico em redor da janela
    var meshAroJan = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.026, 8, 22), matAroJanela);
    meshAroJan.scale.x = 1.45;
    meshAroJan.position.set(cx, 0.60, cz);
    meshAroJan.rotation.y = -angJ;
    ufo.add(meshAroJan);
}

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 3 — ANTENA NO TOPO
// ═══════════════════════════════════════════════════════════════

// 3a. Base da antena (cápsula cilíndrica)
var meshBaseAntena = new THREE.Mesh(new THREE.CylinderGeometry(0.090, 0.130, 0.20, 12), matCupula);
meshBaseAntena.position.y = 1.58;
ufo.add(meshBaseAntena);

// 3b. Haste fina
var meshHasteAntena = new THREE.Mesh(
    new THREE.CylinderGeometry(0.020, 0.020, 0.70, 8),
    new THREE.MeshStandardMaterial({ color: 0x889999, metalness: 0.92, roughness: 0.10 })
);
meshHasteAntena.position.y = 2.03;
ufo.add(meshHasteAntena);

// 3c. Pequeno anel a meio da haste
var meshAnelAntena = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.018, 6, 16), matMetal);
meshAnelAntena.rotation.x = Math.PI / 2;
meshAnelAntena.position.y = 2.03;
ufo.add(meshAnelAntena);

// 3d. Esfera luminosa vermelha no topo (pisca na animação)
var matBolha = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 4.0 });
var meshBolhaAntena = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), matBolha);
meshBolhaAntena.position.y = 2.40;
ufo.add(meshBolhaAntena);

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 4 — PARTE INFERIOR DO DISCO
// ═══════════════════════════════════════════════════════════════

// 4a. Pequena calota inferior (bump central por baixo)
var meshCalotaInf = new THREE.Mesh(
    new THREE.SphereGeometry(0.80, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    matBaixo
);
meshCalotaInf.scale.y = 0.40;
meshCalotaInf.position.y = -0.15;
ufo.add(meshCalotaInf);

// 4b. Ranhuras concêntricas no inferior (3 anéis)
var ranhurasInf = [0.55, 1.10, 1.75];
for (var ri = 0; ri < ranhurasInf.length; ri++) {
    var meshRanInf = new THREE.Mesh(new THREE.TorusGeometry(ranhurasInf[ri], 0.018, 6, 60), matRanhura);
    meshRanInf.rotation.x = Math.PI / 2;
    meshRanInf.position.y = -0.14;
    ufo.add(meshRanInf);
}

// 4c. 6 emissores na parte inferior (efeito antigravidade)
var matEmissor = new THREE.MeshStandardMaterial({ color: 0x00cc44, emissive: 0x00cc44, emissiveIntensity: 3.0 });
for (var e = 0; e < 6; e++) {
    var angE = (e / 6) * Math.PI * 2;
    var meshEm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.120, 0.10, 16), matEmissor.clone());
    meshEm.position.set(Math.cos(angE) * 1.52, -0.16, Math.sin(angE) * 1.52);
    ufo.add(meshEm);

    // Halo plano por baixo de cada emissor
    var meshHaloEm = new THREE.Mesh(
        new THREE.CircleGeometry(0.14, 16),
        new THREE.MeshBasicMaterial({ color: 0x00ff55, transparent: true, opacity: 0.30, side: THREE.DoubleSide })
    );
    meshHaloEm.rotation.x = Math.PI / 2;
    meshHaloEm.position.set(Math.cos(angE) * 1.52, -0.22, Math.sin(angE) * 1.52);
    ufo.add(meshHaloEm);
}

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 5 — LUZES DO ANEL EXTERIOR (12 esferas que pulsam em onda)
// ═══════════════════════════════════════════════════════════════

var pontosLuz = [];
for (var p = 0; p < 12; p++) {
    var angP = (p / 12) * Math.PI * 2;
    var matP = new THREE.MeshStandardMaterial({ color: 0x00ff66, emissive: 0x00ff66, emissiveIntensity: 2.5 });
    var meshP = new THREE.Mesh(new THREE.SphereGeometry(0.072, 8, 8), matP);
    meshP.position.set(Math.cos(angP) * 2.84, 0.005, Math.sin(angP) * 2.84);
    ufo.add(meshP);
    pontosLuz.push({ mat: matP, fase: (p / 12) * Math.PI * 2 });
}

// ═══════════════════════════════════════════════════════════════
// SECÇÃO 6 — FEIXE DE LUZ VERDE (TRACTOR BEAM)
// ═══════════════════════════════════════════════════════════════

var materialFeixe = new THREE.MeshBasicMaterial({
    color: 0x00ff44, transparent: true, opacity: 0.09, side: THREE.DoubleSide
});
var meshFeixe = new THREE.Mesh(new THREE.ConeGeometry(1.55, 4.0, 32, 1, true), materialFeixe);
meshFeixe.rotation.x = Math.PI;
meshFeixe.position.y = -2.2;
ufo.add(meshFeixe);

var materialFeixeMed = new THREE.MeshBasicMaterial({
    color: 0x44ff88, transparent: true, opacity: 0.13, side: THREE.DoubleSide
});
var meshFeixeMed = new THREE.Mesh(new THREE.ConeGeometry(0.70, 4.0, 20, 1, true), materialFeixeMed);
meshFeixeMed.rotation.x = Math.PI;
meshFeixeMed.position.y = -2.2;
ufo.add(meshFeixeMed);

var materialFeixeCore = new THREE.MeshBasicMaterial({
    color: 0xaaffcc, transparent: true, opacity: 0.20, side: THREE.DoubleSide
});
var meshFeixeCore = new THREE.Mesh(new THREE.ConeGeometry(0.25, 4.0, 12, 1, true), materialFeixeCore);
meshFeixeCore.rotation.x = Math.PI;
meshFeixeCore.position.y = -2.2;
ufo.add(meshFeixeCore);

// Disco de saída do feixe (base do cone)
var matDiscFeixe = new THREE.MeshBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
var meshDiscFeixe = new THREE.Mesh(new THREE.CircleGeometry(1.55, 32), matDiscFeixe);
meshDiscFeixe.rotation.x = Math.PI / 2;
meshDiscFeixe.position.y = -0.22;
ufo.add(meshDiscFeixe);

ufo.position.set(0, 0, 0);

// ─── ESTRELAS ────────────────────────────────────────────────────────────────

var geometriaEstrelas = new THREE.BufferGeometry();
var numEstrelas = 2500;
var posEstrelas = new Float32Array(numEstrelas * 3);
for (var s = 0; s < numEstrelas * 3; s++) {
    posEstrelas[s] = (Math.random() - 0.5) * 500;
}
geometriaEstrelas.setAttribute('position', new THREE.BufferAttribute(posEstrelas, 3));
var estrelas = new THREE.Points(geometriaEstrelas, new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, sizeAttenuation: true }));
cena.add(estrelas);

// ─── FUNÇÃO START ─────────────────────────────────────────────────────────────

function Start() {
    cena.add(ufo);
    renderer.render(cena, camaraPerspetiva);
    requestAnimationFrame(loop);
}

// ─── FUNÇÃO LOOP ──────────────────────────────────────────────────────────────

function loop() {
    controls.update();

    var t = Date.now() * 0.001;

    // Rotação lenta no eixo Y
    ufo.rotateY(Math.PI / 180 * 0.50);

    // Movimento lado a lado (X) + flutuação vertical (Y)
    ufo.position.x = Math.sin(t * 0.38) * 3.2 + Math.sin(t * 0.17) * 0.9;
    ufo.position.y = Math.sin(t * 0.90) * 0.50 + Math.cos(t * 0.55) * 0.18;

    // Glow verde do motor — pulsa forte
    luzUFO.intensity = 7.5 + Math.sin(t * 3.2) * 3.5;

    // Luz orbitante circula em volta do UFO
    luzOrbita.position.x = Math.cos(t * 0.55) * 7;
    luzOrbita.position.z = Math.sin(t * 0.55) * 7;
    luzOrbita.position.y = 2.0 + Math.sin(t * 0.30) * 1.5;
    luzOrbita.intensity  = 5.0 + Math.sin(t * 1.8) * 2.0;

    // Luz de acento — oscila intensidade
    luzAccent.intensity = 2.5 + Math.sin(t * 2.5 + 1.0) * 1.5;

    // Pulsação do feixe (3 camadas)
    materialFeixe.opacity    = 0.07 + Math.sin(t * 1.8) * 0.04;
    materialFeixeMed.opacity = 0.11 + Math.sin(t * 2.2) * 0.06;
    materialFeixeCore.opacity= 0.18 + Math.sin(t * 3.0) * 0.09;
    matDiscFeixe.opacity     = 0.16 + Math.sin(t * 3.2) * 0.08;

    // Luzes do anel em efeito de onda (chase lights) — mais rápido e intenso
    for (var p = 0; p < pontosLuz.length; p++) {
        var pulso = 0.5 + 0.5 * Math.sin(t * 5.0 + pontosLuz[p].fase);
        pontosLuz[p].mat.emissiveIntensity = pulso * 6.0;
    }

    // Núcleo da cúpula pulsa
    matNucleo.emissiveIntensity = 3.0 + Math.sin(t * 2.4) * 2.2;

    // Antena pisca
    matBolha.emissiveIntensity = 1.0 + Math.sin(t * 5.5) * 4.5;

    renderer.render(cena, camaraPerspetiva);
    requestAnimationFrame(loop);
}

// ─── RESIZE ───────────────────────────────────────────────────────────────────

window.addEventListener('resize', function () {
    camaraPerspetiva.aspect = window.innerWidth / window.innerHeight;
    camaraPerspetiva.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
