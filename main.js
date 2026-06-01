// =========================
// IMPORTS
// =========================
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { startWorldSelect } from './public/worlds/worldSelect.js'

// ── GLB loader wrapped in a Promise ───────────────────────
function loadGLTFPromise(path) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(path, resolve, undefined, reject)
  })
}

// =========================
// DOM
// =========================
const startBtn     = document.getElementById('startBtn')
const menu         = document.getElementById('menu')
const rulesBtn     = document.getElementById('rulesBtn')
const backBtn      = document.getElementById('backBtn')
const rulesScreen  = document.getElementById('rulesScreen')
const shipBtn      = document.getElementById('shipBtn')
const shipScreen   = document.getElementById('shipScreen')
const backShipBtn  = document.getElementById('backShipBtn')
const selectBtn    = document.getElementById('selectBtn')
const gameCanvas   = document.getElementById('gameCanvas')
const pauseBtn       = document.getElementById('pauseBtn')
const pauseOverlay   = document.getElementById('pauseOverlay')
const continueBtn    = document.getElementById('continueBtn')
const mainMenuBtn    = document.getElementById('mainMenuBtn')
const sfxBtn         = document.getElementById('sfxBtn')
const musicBtn       = document.getElementById('musicBtn')
const hud              = document.getElementById('hud')
const scoreValueEl     = document.getElementById('scoreValue')
const shieldBarEl      = document.getElementById('shieldBar')
const shieldPctEl      = document.getElementById('shieldPct')
const integrityBarEl   = document.getElementById('integrityBar')
const integrityPctEl   = document.getElementById('integrityPct')
const gameOverScreen   = document.getElementById('gameOverScreen')
const goScoreEl        = document.getElementById('goScore')
const goBestScoreEl    = document.getElementById('goBestScore')
const restartBtn       = document.getElementById('restartBtn')
const goMenuBtn        = document.getElementById('goMenuBtn')
const countdownOverlay = document.getElementById('countdownOverlay')
const countdownText    = document.getElementById('countdownText')
const powerupHudEl     = document.getElementById('powerupHud')
const screenFlashEl    = document.getElementById('screenFlash')
const bossWarningEl    = document.getElementById('bossWarning')
const comboDisplayEl   = document.getElementById('comboDisplay')
const killStreakEl     = document.getElementById('killStreakDisplay')
const damageNumbersEl  = document.getElementById('damageNumbers')
const xpLevelEl        = document.getElementById('xpLevel')
const xpBarFillEl      = document.getElementById('xpBarFill')

// =========================
// HP / SCORE
// =========================
let playerHP      = 10
const playerMaxHP = 10
let score         = 0
let bestScore     = parseInt(localStorage.getItem('spacewarsBestScore') || '0')

// ── Persistent progression ────────────────────────────────
let playerXP    = parseInt(localStorage.getItem('spacewarsXP')    || '0')
let playerLevel = parseInt(localStorage.getItem('spacewarsLevel') || '1')
let totalKills    = parseInt(localStorage.getItem('spacewarsTotalKills')    || '0')
let totalBossKills = parseInt(localStorage.getItem('spacewarsTotalBossKills') || '0')
let totalWaves    = parseInt(localStorage.getItem('spacewarsTotalWaves')    || '0')
let totalPowerups = parseInt(localStorage.getItem('spacewarsTotalPowerups') || '0')
let highestCombo  = parseInt(localStorage.getItem('spacewarsHighCombo')     || '0')
let gotGodlike    = localStorage.getItem('spacewarsGodlike') === '1'
const unlockedAchievements = new Set(JSON.parse(localStorage.getItem('spacewarsAchievements') || '[]'))

function xpForLevel(lvl) { return 50 + lvl * 25 }   // level 1→2: 75 XP, level 10→11: 300 XP

// ── Achievements definitions ──────────────────────────────
const ACHIEVEMENTS = [
  { id:'kill_1',     name:'First Blood',       desc:'Destroy your first enemy',         icon:'🎯', check:s=>s.totalKills>=1 },
  { id:'kill_10',    name:'Ace Pilot',         desc:'Destroy 10 enemies',               icon:'⭐', check:s=>s.totalKills>=10 },
  { id:'kill_100',   name:'Veteran',           desc:'Destroy 100 enemies',              icon:'🌟', check:s=>s.totalKills>=100 },
  { id:'kill_1000',  name:'Legend',            desc:'Destroy 1000 enemies',             icon:'💫', check:s=>s.totalKills>=1000 },
  { id:'kill_5000',  name:'Galaxy Destroyer',  desc:'Destroy 5000 enemies',             icon:'🔥', check:s=>s.totalKills>=5000 },
  { id:'level_5',    name:'Rising Star',       desc:'Reach Level 5',                    icon:'📈', check:s=>s.playerLevel>=5 },
  { id:'level_10',   name:'Elite Pilot',       desc:'Reach Level 10',                   icon:'🏆', check:s=>s.playerLevel>=10 },
  { id:'level_25',   name:'Commander',         desc:'Reach Level 25',                   icon:'👑', check:s=>s.playerLevel>=25 },
  { id:'level_50',   name:'Admiral',           desc:'Reach Level 50',                   icon:'🌠', check:s=>s.playerLevel>=50 },
  { id:'level_100',  name:'God of War',        desc:'Reach Level 100',                  icon:'💀', check:s=>s.playerLevel>=100 },
  { id:'boss_1',     name:'Boss Slayer',       desc:'Defeat your first boss',           icon:'💥', check:s=>s.totalBossKills>=1 },
  { id:'boss_5',     name:'Boss Hunter',       desc:'Defeat 5 bosses',                  icon:'🎖️', check:s=>s.totalBossKills>=5 },
  { id:'boss_10',    name:'Titan Slayer',      desc:'Defeat 10 bosses',                 icon:'⚔️', check:s=>s.totalBossKills>=10 },
  { id:'wave_5',     name:'Survivor',          desc:'Complete 5 waves',                 icon:'🌊', check:s=>s.totalWaves>=5 },
  { id:'wave_25',    name:'Iron Survivor',     desc:'Complete 25 waves',                icon:'🏄', check:s=>s.totalWaves>=25 },
  { id:'wave_50',    name:'Unbreakable',       desc:'Complete 50 waves',                icon:'🛡️', check:s=>s.totalWaves>=50 },
  { id:'powerup_10', name:'Power Up!',         desc:'Collect 10 power-ups',             icon:'⚡', check:s=>s.totalPowerups>=10 },
  { id:'powerup_50', name:'Power Hungry',      desc:'Collect 50 power-ups',             icon:'🔋', check:s=>s.totalPowerups>=50 },
  { id:'score_1000', name:'High Scorer',       desc:'Score 1000 points in one game',    icon:'💰', check:s=>s.bestScore>=1000 },
  { id:'score_5000', name:'Master Scorer',     desc:'Score 5000 points in one game',    icon:'💎', check:s=>s.bestScore>=5000 },
  { id:'combo_5',    name:'Combo King',        desc:'Achieve a 5x combo',               icon:'🎮', check:s=>s.highestCombo>=5 },
  { id:'combo_10',   name:'Combo Master',      desc:'Achieve a 10x combo',              icon:'🕹️', check:s=>s.highestCombo>=10 },
  { id:'godlike',    name:'GODLIKE',           desc:'Achieve a GODLIKE kill streak',    icon:'👾', check:s=>s.gotGodlike },
  { id:'ship_2',     name:'Fleet Expansion',   desc:'Unlock your second ship (Lv 5)',   icon:'🚀', check:s=>s.playerLevel>=5 },
  { id:'all_ships',  name:'Fleet Commander',   desc:'Unlock all ships (Lv 35)',         icon:'🛸', check:s=>s.playerLevel>=35 },
]

function getAchievementState() {
  return { totalKills, totalBossKills, totalWaves, totalPowerups, bestScore, highestCombo, gotGodlike, playerLevel }
}

let _toastQueue = []
let _toastBusy  = false
function showAchievement(ach) {
  _toastQueue.push(ach)
  if (!_toastBusy) processToastQueue()
}
function processToastQueue() {
  if (!_toastQueue.length) { _toastBusy = false; return }
  _toastBusy = true
  const ach = _toastQueue.shift()
  const el = document.createElement('div')
  el.className = 'achievement-toast'
  el.innerHTML = `<span class="ach-toast-icon">${ach.icon}</span><div><div class="ach-toast-title">ACHIEVEMENT UNLOCKED</div><div class="ach-toast-name">${ach.name}</div><div class="ach-toast-desc">${ach.desc}</div></div>`
  document.body.appendChild(el)
  setTimeout(() => el.classList.add('show'), 50)
  setTimeout(() => {
    el.classList.remove('show')
    setTimeout(() => { el.remove(); processToastQueue() }, 520)
  }, 3800)
}

function checkAchievements() {
  const s = getAchievementState()
  for (const ach of ACHIEVEMENTS) {
    if (!unlockedAchievements.has(ach.id) && ach.check(s)) {
      unlockedAchievements.add(ach.id)
      localStorage.setItem('spacewarsAchievements', JSON.stringify([...unlockedAchievements]))
      showAchievement(ach)
    }
  }
}

// ── Game feel state ────────────────────────────────────────
let shakeIntensity       = 0
let flashTimer           = 0
let flashColor           = 'rgba(255,0,0,0.5)'
let comboCount           = 0
let comboTimer           = 0
let killStreak           = 0
let killStreakTimer       = 0
const COMBO_TIMEOUT      = 150
const STREAK_TIMEOUT     = 200
const explosionParticles = []
let audioCtx             = null
let bossWarningActive    = false

let _prevShldPct = 100
let _prevHullPct = 100

function flashBar(el) {
  if (!el) return
  el.classList.remove('bar-hit')
  void el.offsetWidth
  el.classList.add('bar-hit')
}

function updateHUD() {
  const half    = Math.ceil(playerMaxHP / 2)
  const shldPct = activePowerups.shield
    ? 100
    : Math.round(Math.max(0, (playerHP - half) / half * 100))
  const hullPct = Math.round(Math.min(100, Math.max(0, playerHP / half * 100)))
  if (shldPct < _prevShldPct) flashBar(shieldBarEl)
  if (hullPct < _prevHullPct) flashBar(integrityBarEl)
  _prevShldPct = shldPct; _prevHullPct = hullPct
  if (integrityBarEl) integrityBarEl.style.width = hullPct + '%'
  if (integrityPctEl) integrityPctEl.textContent = hullPct + '%'
  if (shieldBarEl)    shieldBarEl.style.width    = shldPct + '%'
  if (shieldPctEl)    shieldPctEl.textContent    = shldPct + '%'
  if (scoreValueEl)   scoreValueEl.textContent   = score
}

function cleanupGameState() {
  ++currentLoopId  // stops the running game loop immediately

  // Remove boss HP bar from DOM
  if (bossData) {
    if (bossData.hpBarEl && bossData.hpBarEl.parentNode) bossData.hpBarEl.remove()
    bossData = null
  }
  bossActive = false

  // Remove boss lasers and bombs from scene
  bossLasers.forEach(l => { if (gScene) { gScene.remove(l.mesh); gScene.remove(l.meshOut) } })
  bossLasers.length = 0
  bossBombs.forEach(b => { if (gScene) { gScene.remove(b.mesh); gScene.remove(b.warnMesh) } })
  bossBombs.length = 0

  // Remove enemies and all bullets
  enemies.forEach(e => { if (gScene) gScene.remove(e.mesh) })
  enemies.length = 0
  enemyBullets.forEach(b => { if (gScene) gScene.remove(b.mesh) })
  enemyBullets.length = 0
  bullets.forEach(b => { if (gScene) gScene.remove(b.mesh) })
  bullets.length = 0

  // Remove powerups and shield
  powerups.forEach(p => { if (gScene) gScene.remove(p.mesh) })
  powerups.length = 0
  shieldMesh = null
  Object.keys(activePowerups).forEach(k => { activePowerups[k] = 0 })

  // Reset wave state
  currentWave        = 0
  waveEnemiesSpawned = 0
  betweenWaves       = false
  betweenWavesTimer  = 0

  // Reset game-feel (playerXP / playerLevel persist — saved to localStorage)
  shakeIntensity = 0
  flashTimer     = 0
  comboCount     = 0
  comboTimer     = 0
  killStreak     = 0
  killStreakTimer = 0
  if (comboDisplayEl) comboDisplayEl.style.display = 'none'
  if (killStreakEl)   killStreakEl.style.display   = 'none'
  for (const p of explosionParticles) { if (gScene) { gScene.remove(p.mesh); p.mesh.geometry.dispose(); p.mat.dispose() } }
  explosionParticles.length = 0
  updateXPDisplay()
}

// =========================
// GAME FEEL FUNCTIONS
// =========================

// ── Audio ─────────────────────────────────────────────────
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

const _SFX = {
  shoot:   { t:'sine',     f0:900, f1:120,  g:0.12, fr:0.06, gr:0.07, stop:0.08 },
  hit:     { t:'square',   f0:600, f1:150,  g:0.22, fr:0.12, gr:0.13, stop:0.14 },
  damage:  { t:'sawtooth', f0:200, f1:60,   g:0.38, fr:0.22, gr:0.24, stop:0.25 },
  powerup: { t:'sine',     f0:400, f1:1200, g:0.25, fr:0.15, gr:0.18, stop:0.20 },
}
const _NOISE = {
  explosion:     { dur:0.35, g:0.55, freq:320, exp:1.8 },
  bossExplosion: { dur:0.80, g:0.90, freq:200, exp:1.2 },
}

function playSfx(type) {
  if (!sfxOn) return
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    if (_SFX[type]) {
      const d = _SFX[type], osc = ctx.createOscillator()
      osc.type = d.t; osc.connect(gain)
      osc.frequency.setValueAtTime(d.f0, now)
      osc.frequency.exponentialRampToValueAtTime(d.f1, now + d.fr)
      gain.gain.setValueAtTime(d.g, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + d.gr)
      osc.start(now); osc.stop(now + d.stop)
    } else if (_NOISE[type]) {
      const d = _NOISE[type]
      const bufLen = Math.floor(ctx.sampleRate * d.dur)
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, d.exp)
      const src = ctx.createBufferSource(); src.buffer = buf
      const filt = ctx.createBiquadFilter()
      filt.type = 'lowpass'; filt.frequency.value = d.freq
      src.connect(filt); filt.connect(gain)
      gain.gain.setValueAtTime(d.g, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + d.dur)
      src.start(now)
    }
  } catch (_) {}
}

// ── Screen shake ──────────────────────────────────────────
function triggerShake(intensity) {
  shakeIntensity = Math.max(shakeIntensity, intensity)
}

// ── Screen flash ──────────────────────────────────────────
function triggerFlash(color, duration) {
  if (!screenFlashEl) return
  flashColor = color
  flashTimer = duration
  screenFlashEl.style.background = color
  screenFlashEl.style.transition = 'none'
  screenFlashEl.style.opacity    = '1'
}

function updateFlash() {
  if (flashTimer <= 0 || !screenFlashEl) return
  flashTimer--
  const t = flashTimer / 15
  screenFlashEl.style.opacity = Math.min(1, t).toString()
  if (flashTimer <= 0) screenFlashEl.style.opacity = '0'
}

// ── Explosion particles ───────────────────────────────────
const _shockGeo = new THREE.RingGeometry(0.05, 0.22, 32)

function spawnExplosion(x, y, z, count, colorHex) {
  if (!gScene) return
  count    = count    || 14
  colorHex = colorHex || 0xff6600

  // Layer 1 — bright white core flash
  const coreCount = Math.max(3, Math.ceil(count * 0.25))
  for (let i = 0; i < coreCount; i++) {
    const r   = 0.04 + Math.random() * 0.08
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false })
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 4, 4), mat)
    mesh.position.set(x, y, z)
    const spd = 0.25 + Math.random() * 0.30
    const a = Math.random() * Math.PI * 2, pitch = (Math.random() - 0.5) * Math.PI
    const maxLife = 10 + Math.floor(Math.random() * 8)
    explosionParticles.push({ mesh, mat, vx: Math.cos(a)*Math.cos(pitch)*spd, vy: Math.sin(pitch)*spd*0.5, vz: Math.sin(a)*Math.cos(pitch)*spd, life: maxLife, maxLife, drag: 0.88 })
    gScene.add(mesh)
  }

  // Layer 2 — main color debris
  for (let i = 0; i < count; i++) {
    const r   = 0.06 + Math.random() * 0.13
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 5, 4), mat)
    mesh.position.set(x, y, z)
    const spd = 0.10 + Math.random() * 0.24
    const a = Math.random() * Math.PI * 2, pitch = (Math.random() - 0.45) * Math.PI
    const maxLife = 24 + Math.floor(Math.random() * 18)
    explosionParticles.push({ mesh, mat, vx: Math.cos(a)*Math.cos(pitch)*spd, vy: Math.sin(pitch)*spd*0.55, vz: Math.sin(a)*Math.cos(pitch)*spd, life: maxLife, maxLife, drag: 0.93 })
    gScene.add(mesh)
  }

  // Layer 3 — dark ember embers (slower, lingering)
  const emberCount = Math.max(2, Math.ceil(count * 0.3))
  for (let i = 0; i < emberCount; i++) {
    const r   = 0.05 + Math.random() * 0.09
    const mat = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 4, 4), mat)
    mesh.position.set(x, y, z)
    const spd = 0.05 + Math.random() * 0.12
    const a = Math.random() * Math.PI * 2
    const maxLife = 32 + Math.floor(Math.random() * 20)
    explosionParticles.push({ mesh, mat, vx: Math.cos(a)*spd, vy: (Math.random()-0.3)*0.06, vz: Math.sin(a)*spd, life: maxLife, maxLife, drag: 0.97 })
    gScene.add(mesh)
  }

  // Shockwave ring
  const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.70, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
  const ringMesh = new THREE.Mesh(_shockGeo, ringMat)
  ringMesh.position.set(x, y, z)
  ringMesh.rotation.x = Math.random() * Math.PI
  ringMesh.rotation.z = Math.random() * Math.PI
  gScene.add(ringMesh)
  explosionParticles.push({ mesh: ringMesh, mat: ringMat, vx: 0, vy: 0, vz: 0, life: 16, maxLife: 16, drag: 1, isRing: true })
}

function updateExplosions() {
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    const p = explosionParticles[i]
    if (p.isRing) {
      const t = 1 - p.life / p.maxLife
      const s = 0.5 + t * 6
      p.mesh.scale.set(s, s, s)
      p.mat.opacity = (p.life / p.maxLife) * 0.6
    } else {
      p.mesh.position.x += p.vx
      p.mesh.position.y += p.vy
      p.mesh.position.z += p.vz
      p.vx *= p.drag; p.vz *= p.drag; p.vy *= 0.97
      p.mat.opacity = Math.pow(p.life / p.maxLife, 1.4) * 0.95
    }
    p.life--
    if (p.life <= 0) {
      gScene.remove(p.mesh)
      if (!p.isRing) p.mesh.geometry.dispose()
      p.mat.dispose()
      explosionParticles.splice(i, 1)
    }
  }
}

// ── Floating damage numbers ────────────────────────────────
function spawnDamageNumber(x, y, z, value, big) {
  if (!damageNumbersEl || !gCamera) return
  const vec = new THREE.Vector3(x, y, z)
  vec.project(gCamera)
  if (vec.z > 1) return
  const sx = (vec.x  + 1) / 2 * window.innerWidth
  const sy = (-vec.y + 1) / 2 * window.innerHeight
  const el = document.createElement('div')
  el.className = big ? 'dmg-num big' : 'dmg-num'
  el.textContent = '+' + value
  el.style.left  = (sx - 14) + 'px'
  el.style.top   = (sy - 10) + 'px'
  damageNumbersEl.appendChild(el)
  setTimeout(() => { if (el.parentNode) el.remove() }, 1400)
}

// ── Boss warning cinematic ────────────────────────────────
function showBossWarning(onDone) {
  if (!bossWarningEl) { onDone(); return }
  bossWarningActive = true
  bossWarningEl.classList.add('active')
  playSfx('damage')
  setTimeout(() => {
    bossWarningEl.classList.remove('active')
    bossWarningActive = false
    onDone()
  }, 3000)
}

// ── Combo & kill streak ───────────────────────────────────
const STREAK_LABELS = { 3:'TRIPLE KILL!', 5:'RAMPAGE!', 8:'UNSTOPPABLE!', 12:'GODLIKE!' }

function showBanner(text, dur) {
  if (!killStreakEl) return
  killStreakEl.textContent = text
  killStreakEl.style.display = 'block'
  killStreakEl.style.animation = 'none'
  void killStreakEl.offsetWidth
  killStreakEl.style.animation = 'comboPop 0.4s ease-out'
  clearTimeout(killStreakEl._t)
  killStreakEl._t = setTimeout(() => { killStreakEl.style.display = 'none' }, dur)
}

function addKill(points) {
  // Persistent kill tracking
  totalKills++
  localStorage.setItem('spacewarsTotalKills', totalKills)

  comboCount++
  comboTimer = COMBO_TIMEOUT
  if (comboCount > highestCombo) {
    highestCombo = comboCount
    localStorage.setItem('spacewarsHighCombo', highestCombo)
  }
  killStreak++
  killStreakTimer = STREAK_TIMEOUT

  if (comboDisplayEl) {
    if (comboCount >= 2) {
      comboDisplayEl.textContent = comboCount + 'x COMBO'
      comboDisplayEl.style.display = 'block'
      comboDisplayEl.style.animation = 'none'
      void comboDisplayEl.offsetWidth
      comboDisplayEl.style.animation = 'comboPop 0.3s ease-out'
    }
  }

  if (STREAK_LABELS[killStreak]) {
    if (killStreak === 12) { gotGodlike = true; localStorage.setItem('spacewarsGodlike', '1') }
    showBanner(STREAK_LABELS[killStreak], 1600)
  }

  const multiplier = comboCount >= 5 ? 3 : comboCount >= 3 ? 2 : 1
  addXP(points * multiplier)
  checkAchievements()
}

function updateComboAndStreak() {
  if (comboTimer > 0) {
    comboTimer--
    if (comboTimer <= 0 && comboDisplayEl) {
      comboCount = 0
      comboDisplayEl.style.display = 'none'
    }
  }
  if (killStreakTimer > 0) {
    killStreakTimer--
    if (killStreakTimer <= 0) killStreak = 0
  }
}

// ── XP / Level ───────────────────────────────────────────
function addXP(amount) {
  playerXP += amount
  let threshold = xpForLevel(playerLevel)
  while (playerXP >= threshold) {
    playerXP -= threshold
    playerLevel++
    threshold = xpForLevel(playerLevel)
    localStorage.setItem('spacewarsLevel', playerLevel)
    triggerFlash('rgba(100,255,200,0.35)', 12)
    triggerShake(0.12)
    showBanner('LEVEL UP! LVL ' + playerLevel, 2000)
    checkAchievements()
  }
  localStorage.setItem('spacewarsXP', playerXP)
  updateXPDisplay()
}

function updateXPDisplay() {
  const threshold = xpForLevel(playerLevel)
  if (xpBarFillEl) xpBarFillEl.style.width = (playerXP / threshold * 100) + '%'
  if (xpLevelEl)   xpLevelEl.textContent   = playerLevel
}

// ── Trigger player hit effects ────────────────────────────
function triggerPlayerHit() {
  triggerShake(0.28)
  triggerFlash('rgba(255, 30, 30, 0.45)', 14)
  playSfx('damage')
}

// Returns true if the game ended (caller should return immediately)
function applyDamage(dmg) {
  if (activePowerups.shield) {
    activePowerups.shield = 0; removeShieldMesh(); updatePowerupHUD()
    return false
  }
  playerHP = Math.max(0, playerHP - dmg)
  updateHUD(); triggerPlayerHit()
  if (playerHP <= 0) { triggerGameOver(); return true }
  return false
}

function triggerGameOver() {
  gameActive = false
  cleanupGameState()
  // Kill flash immediately so it doesn't bleed into the game-over screen
  if (screenFlashEl) { screenFlashEl.style.opacity = '0'; screenFlashEl.style.transition = 'none' }
  flashTimer = 0
  if (bossWarningEl) bossWarningEl.classList.remove('active')
  if (score > bestScore) {
    bestScore = score
    localStorage.setItem('spacewarsBestScore', bestScore)
    checkAchievements()
  }
  if (hud)            hud.style.display     = 'none'
  if (pauseBtn)       pauseBtn.style.display = 'none'
  if (goScoreEl)      goScoreEl.textContent  = 'SCORE: ' + score
  if (goBestScoreEl)  goBestScoreEl.textContent = '★ BEST: ' + bestScore
  if (gameOverScreen) gameOverScreen.style.display = 'flex'
  ensureMenuMusic()  // switch to menu music on game over
}

if (restartBtn) restartBtn.addEventListener('click', () => {
  if (gameOverScreen) gameOverScreen.style.display = 'none'
  if (pauseBtn) pauseBtn.style.display = 'flex'
  if (hud) hud.style.display = 'flex'
  playerHP = playerMaxHP; score = 0; updateHUD()
  startGameScene(currentMapName)
})
if (goMenuBtn) goMenuBtn.addEventListener('click', () => {
  if (gameOverScreen) gameOverScreen.style.display = 'none'
  returnToMainMenu()
})

// =========================
// PAUSE STATE
// =========================
let isPaused = false
let sfxOn    = true
let musicOn  = true

// =========================
// MUSIC SYSTEM
// =========================
const MUSIC_VOL = 0.55
const MENU_VOL  = 0.42

function _makeTrack(filename) {
  const a = new Audio('./public/music/' + filename)
  a.loop = true; a.volume = 0; a.preload = 'auto'
  return a
}
const MUSIC = {
  menu:  _makeTrack('Menu_Soundtrack.mp3'),
  wave1: _makeTrack('Wave1.mp3'),
  wave2: _makeTrack('Wave2.mp3'),
  wave3: _makeTrack('Wave3.mp3'),
  wave4: _makeTrack('Wave4.mp3'),
  boss1: _makeTrack('Boss1.mp3'),
  boss2: _makeTrack('Boss2.mp3'),
}

let _curTrack = null

function _fadeOut(trk, cb) {
  if (!trk || trk.paused) { if (cb) cb(); return }
  const step = Math.max(0.03, trk.volume / 10)
  const id = setInterval(() => {
    if (trk.volume <= step) {
      trk.pause(); trk.volume = 0
      clearInterval(id); if (cb) cb()
    } else {
      trk.volume = Math.max(0, trk.volume - step)
    }
  }, 22)
}

function _fadeIn(trk, target) {
  trk.volume = 0
  const step = target / 14
  const id = setInterval(() => {
    if (trk.volume >= target - step / 2) { trk.volume = target; clearInterval(id) }
    else trk.volume = Math.min(target, trk.volume + step)
  }, 22)
}

// Returns the music key for a given wave number
function getMusicForWave(waveNum) {
  if (waveNum % 5 === 0) {
    // Boss wave — alternates Boss1 / Boss2
    return (Math.ceil(waveNum / 5)) % 2 === 1 ? 'boss1' : 'boss2'
  }
  // Regular wave — cycles Wave1…Wave4 within each set of 5
  return 'wave' + (((waveNum - 1) % 5) + 1)
}

// Play a music track (crossfade). Does nothing if already on that track.
function playMusic(key) {
  const next = MUSIC[key]
  if (!next) return
  if (_curTrack === next) return          // already playing, don't restart

  const vol = (key === 'menu') ? MENU_VOL : MUSIC_VOL

  _fadeOut(_curTrack)
  _curTrack = next
  if (key !== 'menu') next.currentTime = 0  // wave/boss tracks always restart
  if (musicOn) {
    next.play().catch(() => {})
    _fadeIn(next, vol)
  }
}

// Stop all music with fade
function stopMusic() {
  _fadeOut(_curTrack)
  _curTrack = null
}

// Called when musicOn toggle changes
function _applyMusicOn() {
  if (!_curTrack) return
  if (musicOn) {
    const vol = (_curTrack === MUSIC.menu) ? MENU_VOL : MUSIC_VOL
    _curTrack.play().catch(() => {})
    _fadeIn(_curTrack, vol)
  } else {
    _fadeOut(_curTrack)
  }
}

// Starts / continues menu music. Never restarts if already playing.
function ensureMenuMusic() {
  if (_curTrack === MUSIC.menu) return  // already on menu track — don't restart
  _fadeOut(_curTrack)
  _curTrack = MUSIC.menu
  if (musicOn) {
    MUSIC.menu.play().catch(() => {})
    _fadeIn(MUSIC.menu, MENU_VOL)
  }
}

// Bootstrap: start menu music on very first user click (browser autoplay policy)
document.addEventListener('click', function _initMusic() {
  ensureMenuMusic()
  document.removeEventListener('click', _initMusic, true)
}, { capture: true, once: true })

// =========================
// PAUSE / RESUME / MENU
// =========================
function pauseGame() {
  isPaused = true
  if (pauseOverlay) pauseOverlay.style.display = 'flex'
  if (_curTrack && !_curTrack.paused) _curTrack.pause()
  // hide countdown while paused — tick() already waits for isPaused=false
  if (countdownActive && countdownOverlay) countdownOverlay.style.display = 'none'
}

function resumeGame() {
  if (pauseOverlay) pauseOverlay.style.display = 'none'
  isPaused = false  // gameStep still blocked while countdownActive=true

  if (countdownActive && _countdownOnDone) {
    // paused during initial wave countdown — restart from 3
    startCountdown(_countdownOnDone)
    return
  }

  if (gameActive) {
    // paused mid-game — show 3-2-1 before handing control back to player
    startCountdown(() => {
      if (musicOn && _curTrack && _curTrack.paused) _curTrack.play().catch(() => {})
    })
    return
  }

  // not in active game (e.g. game over flow) — resume directly
  if (musicOn && _curTrack && _curTrack.paused) _curTrack.play().catch(() => {})
}

function returnToMainMenu() {
  gameActive = false
  // Cancel any running countdown before it can call onDone()
  _countdownGen++
  countdownActive  = false
  _countdownOnDone = null
  if (countdownOverlay) countdownOverlay.style.display = 'none'
  // Clear paused state without restarting game music
  isPaused = false
  if (pauseOverlay) pauseOverlay.style.display = 'none'
  cleanupGameState()
  if (bossWarningEl)  bossWarningEl.classList.remove('active')
  if (screenFlashEl)  screenFlashEl.style.opacity = '0'
  if (comboDisplayEl) comboDisplayEl.style.display = 'none'
  if (killStreakEl)   killStreakEl.style.display   = 'none'
  bossWarningActive = false
  if (pauseBtn)   pauseBtn.style.display   = 'none'
  if (hud)        hud.style.display        = 'none'
  if (gameCanvas) gameCanvas.style.display = 'none'
  if (menu)       menu.style.display       = 'flex'
  showMenuBg()
  ensureMenuMusic()    // ← switch back to menu soundtrack
}

if (pauseBtn)    pauseBtn.addEventListener('click',    pauseGame)
if (continueBtn) continueBtn.addEventListener('click', resumeGame)
if (mainMenuBtn) mainMenuBtn.addEventListener('click', returnToMainMenu)
if (sfxBtn) sfxBtn.addEventListener('click', () => {
  sfxOn = !sfxOn
  sfxBtn.textContent = (sfxOn ? '🔊' : '🔇') + ' SFX'
})
if (musicBtn) musicBtn.addEventListener('click', () => {
  musicOn = !musicOn
  musicBtn.textContent = (musicOn ? '🔊' : '🔇') + ' MUSIC'
  _applyMusicOn()      // ← mute/unmute immediately
})

// =========================
// MENU
// =========================
const menuBg      = document.getElementById('menuBg')
const menuOverlay = document.getElementById('menuOverlay')
function hideMenuBg() { if (menuBg) menuBg.style.display = 'none'; if (menuOverlay) menuOverlay.style.display = 'none' }
function showMenuBg() { if (menuBg) menuBg.style.display = 'block'; if (menuOverlay) menuOverlay.style.display = 'block' }

let menuScene, menuCamera, menuRenderer, menuModel

function resizeMenuBg() {
  if (!menuRenderer || !menuCamera) return
  menuCamera.aspect = window.innerWidth / window.innerHeight
  menuCamera.updateProjectionMatrix()
  menuRenderer.setSize(window.innerWidth, window.innerHeight, false)
}

// =============================================================
// SATELLITE — procedural Three.js model (same style as terra.js)
// =============================================================
function createMenuSatellite(scene, R) {
  const S = 220
  const group = new THREE.Group()

  const matOuro      = new THREE.MeshStandardMaterial({ color: 0xc8841a, metalness: 0.55, roughness: 0.32 })
  const matBanda     = new THREE.MeshStandardMaterial({ color: 0x18140a, metalness: 0.75, roughness: 0.42 })
  const matEstrutura = new THREE.MeshStandardMaterial({ color: 0x22201a, metalness: 0.85, roughness: 0.22 })
  const matAntena    = new THREE.MeshStandardMaterial({ color: 0xe0e4f0, metalness: 0.92, roughness: 0.10 })
  const matPainel    = new THREE.MeshStandardMaterial({ color: 0x162060, metalness: 0.28, roughness: 0.22, emissive: new THREE.Color(0x0a1030), emissiveIntensity: 0.35 })
  const matGrade     = new THREE.MeshStandardMaterial({ color: 0x0a1030, metalness: 0.55, roughness: 0.35 })
  const matPrato     = new THREE.MeshStandardMaterial({ color: 0xd8e4ff, metalness: 0.65, roughness: 0.20, side: THREE.DoubleSide })
  const matThruster  = new THREE.MeshStandardMaterial({ color: 0x3d4455, metalness: 0.90, roughness: 0.18 })
  const matLente     = new THREE.MeshStandardMaterial({ color: 0x040410, metalness: 0.15, roughness: 0.05, emissive: new THREE.Color(0x001144), emissiveIntensity: 1.8 })
  const matTank      = new THREE.MeshStandardMaterial({ color: 0x9a9aaa, metalness: 0.88, roughness: 0.18 })
  const matInst      = new THREE.MeshStandardMaterial({ color: 0x3a3848, metalness: 0.80, roughness: 0.26 })
  const matRadBr     = new THREE.MeshStandardMaterial({ color: 0xeeeef5, metalness: 0.40, roughness: 0.55 })
  const matRadEsc    = new THREE.MeshStandardMaterial({ color: 0x111118, metalness: 0.65, roughness: 0.40 })
  const matLed       = new THREE.MeshStandardMaterial({ color: 0x00ff44, emissive: new THREE.Color(0x00ff44), emissiveIntensity: 5.0 })

  function b(w, h, d, mat, x=0, y=0, z=0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z); group.add(m); return m
  }

  // ── Body: octogonal cylinder (matches drawing) ────────────
  const rCorpo = 0.92
  const corpoOct = new THREE.Mesh(new THREE.CylinderGeometry(rCorpo*S, rCorpo*S, 2.0*S, 8), matOuro)
  corpoOct.castShadow = true; corpoOct.receiveShadow = true; group.add(corpoOct)
  // Dark horizontal bands (4)
  ;[-0.65, -0.22, 0.22, 0.65].forEach(y => {
    const bnd = new THREE.Mesh(new THREE.CylinderGeometry((rCorpo+0.002)*S, (rCorpo+0.002)*S, 0.095*S, 8), matBanda)
    bnd.position.y = y*S; group.add(bnd)
  })
  // Octogonal top/bottom caps
  const capSup = new THREE.Mesh(new THREE.CylinderGeometry((rCorpo-0.02)*S, (rCorpo-0.02)*S, 0.08*S, 8), matEstrutura)
  capSup.position.y =  1.04*S; group.add(capSup)
  const capInf = new THREE.Mesh(new THREE.CylinderGeometry((rCorpo-0.02)*S, (rCorpo-0.02)*S, 0.08*S, 8), matEstrutura)
  capInf.position.y = -1.04*S; group.add(capInf)
  // 8 vertical edge cylinders
  for (let oc = 0; oc < 8; oc++) {
    const angOc = (oc/8)*Math.PI*2 + Math.PI/8
    const edg = new THREE.Mesh(new THREE.CylinderGeometry(0.028*S, 0.028*S, 2.08*S, 6), matEstrutura)
    edg.position.set(Math.cos(angOc)*rCorpo*S, 0, Math.sin(angOc)*rCorpo*S); group.add(edg)
  }
  // 3 structural torus rings
  ;[-0.88, 0.0, 0.88].forEach(y => {
    const ar = new THREE.Mesh(new THREE.TorusGeometry((rCorpo+0.015)*S, 0.018*S, 6, 8), matEstrutura)
    ar.rotation.x = Math.PI/2; ar.position.y = y*S; group.add(ar)
  })

  // ── Instrument panel (+Z face) ────────────────────────────
  b(1.20*S, 0.62*S, 0.055*S, matInst, 0, 0.12*S, 0.855*S)
  const barril = new THREE.Mesh(new THREE.CylinderGeometry(0.12*S, 0.14*S, 0.18*S, 18), matInst)
  barril.rotation.x = Math.PI/2; barril.position.set(0, 0.12*S, 0.96*S); group.add(barril)
  const lentePrinc = new THREE.Mesh(new THREE.CircleGeometry(0.10*S, 28), matLente)
  lentePrinc.position.set(0, 0.12*S, 1.06*S); group.add(lentePrinc)
  b(0.16*S, 0.13*S, 0.08*S, matInst, 0.40*S, -0.26*S, 0.90*S)
  const sirLente = new THREE.Mesh(new THREE.CircleGeometry(0.044*S, 10), matLente)
  sirLente.position.set(0.40*S, -0.26*S, 0.95*S); group.add(sirLente)

  // ── Thermal radiator (+X face) ────────────────────────────
  for (let rl = 0; rl < 6; rl++) {
    b(0.065*S, 0.31*S, 1.58*S, rl%2===0 ? matRadBr : matRadEsc, 0.852*S, (-0.83+rl*0.333+0.166)*S, 0)
  }

  // ── Propulsion module ─────────────────────────────────────
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.33*S, 0.33*S, 0.44*S, 18), matTank)
  tank.position.y = -1.35*S; group.add(tank)
  const domo = new THREE.Mesh(new THREE.SphereGeometry(0.33*S, 18, 10, 0, Math.PI*2, 0, Math.PI/2), matTank)
  domo.rotation.x = Math.PI; domo.position.y = -1.57*S; group.add(domo)
  const aroTk = new THREE.Mesh(new THREE.TorusGeometry(0.33*S, 0.015*S, 8, 28), matAntena)
  aroTk.rotation.x = Math.PI/2; aroTk.position.y = -1.13*S; group.add(aroTk)

  // ── Solar panels ──────────────────────────────────────────
  const grupoPainelEsq = new THREE.Group()
  const grupoPainelDir = new THREE.Group()
  group.add(grupoPainelEsq); group.add(grupoPainelDir)

  ;[[grupoPainelEsq, -1.21*S],[grupoPainelDir, 1.21*S]].forEach(([grp, xc]) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045*S, 0.045*S, 0.82*S, 8), matAntena)
    arm.rotation.z = Math.PI/2; arm.position.set(xc, 0, 0); grp.add(arm)
  })

  function addPainel(grp, cx) {
    const mp = new THREE.Mesh(new THREE.BoxGeometry(2.80*S, 1.48*S, 0.042*S), matPainel)
    mp.position.x = cx; grp.add(mp)
    const molduras = [
      [2.86*S, 0.055*S, 0.055*S,  cx,                            0.760*S, 0],
      [2.86*S, 0.055*S, 0.055*S,  cx,                           -0.760*S, 0],
      [0.055*S, 1.52*S, 0.055*S,  cx + Math.sign(cx)*1.40*S,    0,        0],
      [0.055*S, 1.52*S, 0.055*S,  cx - Math.sign(cx)*1.40*S,    0,        0],
    ]
    molduras.forEach(([w,h,d,px,py,pz]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), matAntena)
      m.position.set(px,py,pz); grp.add(m)
    })
    for (let col = 1; col < 4; col++) {
      const xDiv = cx + Math.sign(cx)*(-1.40*S + col*0.70*S)
      const dv = new THREE.Mesh(new THREE.BoxGeometry(0.016*S, 1.46*S, 0.055*S), matGrade)
      dv.position.set(xDiv, 0, 0); grp.add(dv)
    }
    const dh = new THREE.Mesh(new THREE.BoxGeometry(2.78*S, 0.016*S, 0.055*S), matGrade)
    dh.position.set(cx, 0, 0); grp.add(dh)
  }
  addPainel(grupoPainelEsq, -2.22*S)
  addPainel(grupoPainelDir,  2.22*S)

  // ── Dish antenna ─────────────────────────────────────────
  const bracoAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.035*S, 0.035*S, 1.10*S, 8), matAntena)
  bracoAnt.position.y = 1.615*S; group.add(bracoAnt)
  const art = new THREE.Mesh(new THREE.SphereGeometry(0.072*S, 12, 12), matEstrutura)
  art.position.y = 2.17*S; group.add(art)
  for (let fs = 0; fs < 4; fs++) {
    const a = (fs/4)*Math.PI*2
    const sup = new THREE.Mesh(new THREE.CylinderGeometry(0.009*S, 0.009*S, 0.85*S, 4), matAntena)
    sup.rotation.z = Math.PI/2.6; sup.rotation.y = a
    sup.position.set(Math.sin(a)*0.18*S, 2.50*S, Math.cos(a)*0.18*S); group.add(sup)
  }
  const prato = new THREE.Mesh(new THREE.SphereGeometry(0.86*S, 48, 24, 0, Math.PI*2, 0, Math.PI/2), matPrato)
  prato.scale.y = 0.28; prato.rotation.x = Math.PI; prato.position.y = 2.78*S; group.add(prato)
  const aroPrato = new THREE.Mesh(new THREE.TorusGeometry(0.86*S, 0.024*S, 8, 60), matAntena)
  aroPrato.rotation.x = Math.PI/2; aroPrato.position.y = 2.78*S; group.add(aroPrato)
  const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.028*S, 0.052*S, 0.14*S, 10), matInst)
  feed.position.y = 2.78*S; group.add(feed)

  // ── Omni antenna ─────────────────────────────────────────
  const matHaste = new THREE.MeshStandardMaterial({ color: 0xf5f5f8, metalness: 0.88, roughness: 0.12 })
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.010*S, 0.018*S, 0.72*S, 6), matHaste)
  haste.position.set(0.28*S, 1.48*S, 0.28*S); group.add(haste)
  const pontaH = new THREE.Mesh(new THREE.SphereGeometry(0.020*S, 6, 6), matHaste)
  pontaH.position.set(0.28*S, 1.86*S, 0.28*S); group.add(pontaH)

  // ── Thrusters + flames ────────────────────────────────────
  const flamasMeshes = []
  ;[[0.60,0.60],[-0.60,0.60],[0.60,-0.60],[-0.60,-0.60]].forEach(([tx,tz]) => {
    b(0.050*S*2, 0.17*S, 0.050*S*2, matThruster, tx*S, -1.17*S, tz*S)
    const matFlama = new THREE.MeshStandardMaterial({
      color: 0xff7700, emissive: new THREE.Color(0xff4400), emissiveIntensity: 5.0,
      transparent: true, opacity: 0.88,
    })
    const flama = new THREE.Mesh(new THREE.ConeGeometry(0.052*S, 0.33*S, 10, 1, true), matFlama)
    flama.position.set(tx*S, -1.47*S, tz*S); flama.rotation.x = Math.PI
    group.add(flama); flamasMeshes.push(flama)
  })

  // ── Status LED ────────────────────────────────────────────
  const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.022*S, 8, 8), matLed)
  ledMesh.position.set(0.46*S, 1.10*S, 0.85*S); group.add(ledMesh)

  // Store animation handles on group
  group._matLed    = matLed
  group._matPainel = matPainel
  group._flames    = flamasMeshes
  group._panelL    = grupoPainelEsq
  group._panelR    = grupoPainelDir

  group.position.set(-R * 0.22, R * 1.40, R * 0.42)
  group.rotation.y = Math.PI * 0.5
  group.rotation.z = Math.PI * 0.05
  group.rotation.x = Math.PI * 0.08

  scene.add(group)
  return group
}

// =============================================================
// ROCKET — procedural foguetao for menu fly-by
// =============================================================
function createMenuRocket(scene, R) {
  const SR = 350
  const group = new THREE.Group()

  const matBranco  = new THREE.MeshStandardMaterial({ color: 0xf0f2f5, metalness: 0.18, roughness: 0.28 })
  const matLaranja = new THREE.MeshStandardMaterial({ color: 0xff4400, metalness: 0.28, roughness: 0.45 })
  const matPrata   = new THREE.MeshStandardMaterial({ color: 0xb0bcc8, metalness: 0.92, roughness: 0.14 })
  const matPreto   = new THREE.MeshStandardMaterial({ color: 0x0c0d10, metalness: 0.60, roughness: 0.30 })
  const matVermelho= new THREE.MeshStandardMaterial({ color: 0xcc1100, metalness: 0.40, roughness: 0.48 })
  const matBocal   = new THREE.MeshStandardMaterial({ color: 0x7a3a00, metalness: 0.80, roughness: 0.25 })
  const matBocalHot= new THREE.MeshStandardMaterial({ color: 0x8a4200, emissive: new THREE.Color(0x550e00), emissiveIntensity: 0.8, metalness: 0.82, roughness: 0.22 })

  function add(geo, mat, x=0, y=0, z=0, rx=0, ry=0, rz=0) {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x*SR, y*SR, z*SR); m.rotation.set(rx, ry, rz); group.add(m)
  }

  // Hull texture — applied to main body + boosters
  const _bTex = new THREE.TextureLoader().load('./desenhos/textures/textura_foguete.png')
  _bTex.wrapS = _bTex.wrapT = THREE.RepeatWrapping
  _bTex.repeat.set(1, 1)
  const matBooster = new THREE.MeshStandardMaterial({ map: _bTex, metalness: 0.30, roughness: 0.52 })

  // Nose texture
  const _pTex = new THREE.TextureLoader().load('./desenhos/textures/textura_ponta.png')
  _pTex.wrapS = _pTex.wrapT = THREE.RepeatWrapping
  _pTex.repeat.set(1, 1)
  const matPonta = new THREE.MeshStandardMaterial({ map: _pTex, metalness: 0.20, roughness: 0.60 })

  // Main body
  add(new THREE.CylinderGeometry(0.72*SR, 0.76*SR, 4.60*SR, 32), matBooster)
  // Black chine stripe
  add(new THREE.CylinderGeometry(0.725*SR, 0.725*SR, 0.75*SR, 32), matPreto, 0, -0.20, 0)
  // Silver segment rings
  const arosY = [-2.10, -1.40, -0.60, 0.20, 1.00, 1.80]
  arosY.forEach(y => add(new THREE.CylinderGeometry(0.778*SR, 0.778*SR, 0.065*SR, 32), matPrata, 0, y, 0))
  // Interstage (1st/2nd stage separator)
  add(new THREE.CylinderGeometry(0.740*SR, 0.740*SR, 0.20*SR, 32), matPreto, 0, 2.31, 0)
  add(new THREE.CylinderGeometry(0.755*SR, 0.755*SR, 0.050*SR, 32), matPrata, 0, 2.42, 0)
  add(new THREE.CylinderGeometry(0.755*SR, 0.755*SR, 0.050*SR, 32), matPrata, 0, 2.20, 0)
  // Base band
  add(new THREE.CylinderGeometry(0.758*SR, 0.762*SR, 0.22*SR, 32), matPreto, 0, -2.31, 0)

  // Nose cone (textured)
  add(new THREE.CylinderGeometry(0.72*SR, 0.72*SR, 0.55*SR, 32), matPonta, 0, 3.00, 0)
  add(new THREE.ConeGeometry(0.72*SR, 2.40*SR, 32), matPonta, 0, 3.95, 0)
  add(new THREE.CylinderGeometry(0.726*SR, 0.726*SR, 0.028*SR, 32), matPreto, 0, 2.72, 0)
  add(new THREE.ConeGeometry(0.050*SR, 0.30*SR, 16),
    new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.98, roughness: 0.04 }), 0, 5.30, 0)

  // Skirt + 3 main engines
  add(new THREE.CylinderGeometry(0.92*SR, 1.02*SR, 0.28*SR, 32), matPreto, 0, -2.65, 0)
  for (let m = 0; m < 3; m++) {
    const a = (m/3)*Math.PI*2
    const ox = Math.cos(a)*0.36, oz = Math.sin(a)*0.36
    add(new THREE.CylinderGeometry(0.118*SR, 0.098*SR, 0.13*SR, 20), matPreto, ox, -2.59, oz)
    add(new THREE.CylinderGeometry(0.098*SR, 0.195*SR, 0.22*SR, 20), matBocal, ox, -2.82, oz)
    add(new THREE.CylinderGeometry(0.195*SR, 0.355*SR, 0.30*SR, 20), matBocalHot, ox, -3.14, oz)
    const matAnelSaida = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: new THREE.Color(0xff4400), emissiveIntensity: 2.5 })
    const aroSaida = new THREE.Mesh(new THREE.TorusGeometry(0.355*SR, 0.022*SR, 8, 28), matAnelSaida)
    aroSaida.rotation.x = Math.PI/2; aroSaida.position.set(ox*SR, -3.30*SR, oz*SR); group.add(aroSaida)
    // Engine flames
    const matFlamaE = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
    const flaE = new THREE.Mesh(new THREE.ConeGeometry(0.37*SR, 2.50*SR, 18, 1, true), matFlamaE)
    flaE.rotation.x = Math.PI; flaE.position.set(ox*SR, -4.35*SR, oz*SR); group.add(flaE)
    const matFlamaM = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    const flaM = new THREE.Mesh(new THREE.ConeGeometry(0.23*SR, 1.90*SR, 14, 1, true), matFlamaM)
    flaM.rotation.x = Math.PI; flaM.position.set(ox*SR, -4.18*SR, oz*SR); group.add(flaM)
    const matFlamaI = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.90, side: THREE.DoubleSide })
    const flaI = new THREE.Mesh(new THREE.ConeGeometry(0.12*SR, 1.35*SR, 10, 1, true), matFlamaI)
    flaI.rotation.x = Math.PI; flaI.position.set(ox*SR, -4.02*SR, oz*SR); group.add(flaI)
  }

  // Side boosters (2)
  for (let b = 0; b < 2; b++) {
    const lx = b === 0 ? -1.58 : 1.58
    const sx  = b === 0 ? -1 : 1
    add(new THREE.CylinderGeometry(0.252*SR, 0.282*SR, 2.65*SR, 24), matBooster, lx, 0.22, 0)
    add(new THREE.CylinderGeometry(0.258*SR, 0.258*SR, 0.52*SR, 24), matPreto,  lx, 0.10, 0)
    add(new THREE.CylinderGeometry(0.291*SR, 0.291*SR, 0.11*SR, 24), matVermelho, lx,  0.85, 0)
    add(new THREE.CylinderGeometry(0.291*SR, 0.291*SR, 0.11*SR, 24), matVermelho, lx, -0.18, 0)
    // Booster nose (orange)
    add(new THREE.ConeGeometry(0.252*SR, 1.02*SR, 24), matLaranja, lx, 2.04, 0)
    add(new THREE.CylinderGeometry(0.258*SR, 0.258*SR, 0.09*SR, 24), matPreto, lx, 1.58, 0)
    // Booster taper + nozzle
    add(new THREE.CylinderGeometry(0.17*SR, 0.282*SR, 0.38*SR, 24), matBranco, lx, -1.52, 0)
    add(new THREE.CylinderGeometry(0.098*SR, 0.170*SR, 0.28*SR, 16), matBocal, lx, -1.92, 0)
    const matAbst = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: new THREE.Color(0xff3300), emissiveIntensity: 1.5 })
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.170*SR, 0.016*SR, 8, 24), matAbst)
    aro.rotation.x = Math.PI/2; aro.position.set(lx*SR, -2.06*SR, 0); group.add(aro)
    // Booster flames
    const matFBE = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
    const fbE = new THREE.Mesh(new THREE.ConeGeometry(0.170*SR, 0.95*SR, 12, 1, true), matFBE)
    fbE.rotation.x = Math.PI; fbE.position.set(lx*SR, -2.53*SR, 0); group.add(fbE)
    const matFBI = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    const fbI = new THREE.Mesh(new THREE.ConeGeometry(0.090*SR, 0.65*SR, 10, 1, true), matFBI)
    fbI.rotation.x = Math.PI; fbI.position.set(lx*SR, -2.38*SR, 0); group.add(fbI)
    // Strut
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.034*SR, 0.034*SR, 0.58*SR, 8), matPrata)
    strut.rotation.z = Math.PI/2; strut.position.set(sx*1.04*SR, 0.50*SR, 0); group.add(strut)
  }

  // Delta fins (4, red)
  for (let f = 0; f < 4; f++) {
    const a = (f/4)*Math.PI*2
    const cf = Math.cos(a), sf = Math.sin(a)
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.055*SR, 1.67*SR, 0.90*SR), matVermelho)
    fin.position.set(cf*0.88*SR, -2.50*SR, sf*0.88*SR)
    fin.rotation.y = a; group.add(fin)
  }

  group.visible = false
  scene.add(group)
  return group
}

function initMenuBg() {
  if (!menuBg) return

  menuScene = new THREE.Scene()
  menuCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 10, 2000000)

  menuRenderer = new THREE.WebGLRenderer({ canvas: menuBg, antialias: true })
  menuRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  menuRenderer.outputColorSpace = THREE.SRGBColorSpace
  menuRenderer.toneMapping = THREE.ACESFilmicToneMapping
  menuRenderer.toneMappingExposure = 1.1
  menuRenderer.setClearColor(0x000308)
  resizeMenuBg()

  const R = 20000

  // ── Nebula background sphere ──────────────────────────────────────────────
  const nebCanvas = document.createElement('canvas')
  nebCanvas.width = 1024; nebCanvas.height = 512
  const nc = nebCanvas.getContext('2d')
  nc.fillStyle = '#000308'
  nc.fillRect(0, 0, 1024, 512)
  ;[
    { x: 180, y: 110, r: 220, h: 200, s: 65, a: 0.13 },
    { x: 620, y: 80,  r: 280, h: 220, s: 55, a: 0.10 },
    { x: 850, y: 220, r: 160, h: 250, s: 50, a: 0.09 },
    { x: 90,  y: 320, r: 200, h: 210, s: 60, a: 0.08 },
    { x: 480, y: 370, r: 180, h: 195, s: 70, a: 0.11 },
    { x: 950, y: 400, r: 140, h: 230, s: 45, a: 0.08 },
  ].forEach(c => {
    const g = nc.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r)
    g.addColorStop(0, `hsla(${c.h},${c.s}%,22%,${c.a})`)
    g.addColorStop(1, 'transparent')
    nc.fillStyle = g; nc.fillRect(0, 0, 1024, 512)
  })
  menuScene.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 38, 32, 32),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(nebCanvas), side: THREE.BackSide, depthWrite: false })
  ))

  // ── City lights (dark side glow) ──────────────────────────────────────────
  const cityCanvas = document.createElement('canvas')
  cityCanvas.width = 1024; cityCanvas.height = 512
  const cc = cityCanvas.getContext('2d')
  cc.fillStyle = '#000'; cc.fillRect(0, 0, 1024, 512)
  for (let i = 0; i < 70; i++) {
    const cx = Math.random() * 1024, cy = 60 + Math.random() * 390
    const count = 8 + Math.floor(Math.random() * 35)
    for (let j = 0; j < count; j++) {
      const x = cx + (Math.random() - 0.5) * 55, y = cy + (Math.random() - 0.5) * 28
      const warm = Math.random() > 0.3
      cc.fillStyle = warm
        ? `rgba(255,${140+Math.random()*80|0},${40+Math.random()*40|0},${0.5+Math.random()*0.5})`
        : `rgba(180,210,255,${0.4+Math.random()*0.4})`
      cc.beginPath(); cc.arc(x, y, 0.4 + Math.random() * 1.6, 0, Math.PI * 2); cc.fill()
    }
  }
  menuScene.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.001, 64, 32),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(cityCanvas),
      blending: THREE.AdditiveBlending, transparent: true, opacity: 0.75, depthWrite: false,
    })
  ))

  // ── Fresnel atmosphere ────────────────────────────────────────────────────
  const fresnelVert = `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vec4 mvp = modelViewMatrix * vec4(position, 1.0);
      vNormal  = normalize(normalMatrix * normal);
      vViewDir = normalize(-mvp.xyz);
      gl_Position = projectionMatrix * mvp;
    }
  `
  const fresnelFrag = `
    uniform vec3  glowColor;
    uniform float power;
    uniform float strength;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      float rim = pow(max(1.0 - dot(vNormal, vViewDir), 0.0), power);
      gl_FragColor = vec4(glowColor * rim * strength, rim);
    }
  `
  function makeAtmo(radius, r, g, b, power, strength) {
    menuScene.add(new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 32),
      new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(r, g, b) },
          power:     { value: power },
          strength:  { value: strength },
        },
        vertexShader:   fresnelVert,
        fragmentShader: fresnelFrag,
        side:           THREE.FrontSide,
        blending:       THREE.AdditiveBlending,
        transparent:    true,
        depthWrite:     false,
      })
    ))
  }

  makeAtmo(R * 1.003, 0.82, 0.96, 1.0,  13.0, 1.0)  // white-blue limb edge
  makeAtmo(R * 1.009, 0.0,  1.0,  0.82,  9.5, 2.4)  // bright teal rim
  makeAtmo(R * 1.038, 0.0,  0.72, 1.0,   6.0, 0.85) // cyan inner
  makeAtmo(R * 1.13,  0.0,  0.42, 0.85,  3.8, 0.32) // soft blue outer
  makeAtmo(R * 1.55,  0.0,  0.15, 0.52,  2.0, 0.07) // faint corona

  // ── Lighting ──────────────────────────────────────────────────────────────
  menuScene.add(new THREE.AmbientLight(0x0B1F3A, 1.1))
  const sun = new THREE.DirectionalLight(0xD0E8FF, 3.8)
  sun.position.set(R * 0.6, R * 0.8, R * 1.8)
  menuScene.add(sun)
  const rimLight = new THREE.DirectionalLight(0x003366, 0.6)
  rimLight.position.set(-R * 1.5, R * 0.3, -R)
  menuScene.add(rimLight)

  // ── Twinkling starfield ────────────────────────────────────────────────────
  const starGroups = []
  for (let g = 0; g < 20; g++) {
    const n = 300
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      const r  = R * 26 + Math.random() * R * 14
      pos[i*3]   = r * Math.sin(ph) * Math.cos(th)
      pos[i*3+1] = r * Math.sin(ph) * Math.sin(th)
      pos[i*3+2] = r * Math.cos(ph)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: R * 0.05 + Math.random() * R * 0.09,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5 + Math.random() * 0.5,
      depthWrite: false,
    })
    menuScene.add(new THREE.Points(geo, mat))
    starGroups.push({ mat, phase: Math.random() * Math.PI * 2, freq: 0.15 + Math.random() * 0.5 })
  }

  // ── Shooting star ─────────────────────────────────────────────────────────
  let shooting = null
  let nextShoot = 3 + Math.random() * 7

  function spawnShootingStar() {
    if (shooting) menuScene.remove(shooting.line)
    const start = new THREE.Vector3(
      R * 0.5 + Math.random() * R * 3.5,
      R * 3   + Math.random() * R * 5,
      -R * 3
    )
    const dir = new THREE.Vector3(-1 - Math.random() * 0.5, -0.35 - Math.random() * 0.25, 0).normalize()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
    shooting = { line: new THREE.Line(geo, mat), start, dir, speed: R * 4.5, tailLen: R * 0.55, t: 0, duration: 1.2 }
    menuScene.add(shooting.line)
  }

  // ── Load earth_pagina_inicial.glb (menu background only) ─────────────────
  new GLTFLoader().load('./public/textures/earth_pagina_inicial.glb', gltf => {
    menuModel = gltf.scene
    const box  = new THREE.Box3().setFromObject(menuModel)
    const size = box.getSize(new THREE.Vector3())
    const ctr  = box.getCenter(new THREE.Vector3())
    const maxS = Math.max(size.x, size.y, size.z) || 1
    const sc   = (R * 2) / maxS
    menuModel.scale.setScalar(sc)
    menuModel.position.copy(ctr.multiplyScalar(-sc))
    const aniso = menuRenderer.capabilities.getMaxAnisotropy()
    menuModel.traverse(child => {
      if (!child.isMesh) return
      ;(Array.isArray(child.material) ? child.material : [child.material]).forEach(m => {
        if ('envMapIntensity' in m) m.envMapIntensity = 0
        if ('metalness'      in m) m.metalness = 0.0
        if ('roughness'      in m) m.roughness = 0.8
        ;['map','emissiveMap','normalMap','aoMap','alphaMap'].forEach(k => {
          if (m[k]) { m[k].minFilter = THREE.LinearMipmapLinearFilter; m[k].anisotropy = aniso; m[k].needsUpdate = true }
        })
        m.needsUpdate = true
      })
    })
    menuScene.add(menuModel)
  }, undefined, err => console.error('[MenuBG] Earth load error:', err))

  // ── Satellite ─────────────────────────────────────────────────────────────
  const satellite = createMenuSatellite(menuScene, R)

  // ── Rocket fly-by — multi-route bezier system ─────────────────────────────
  const menuRocket    = createMenuRocket(menuScene, R)
  const RKT_Y_BASE    = R * 1.19
  const RKT_Z         = R * 0.14
  const RKT_X_EDGE    = R * 1.05   // large enough to be fully off-screen
  const RKT_PAUSE_SEC = 4.5

  function rktEase(t) { t = Math.max(0, Math.min(1, t)); return t * t * t * (t * (t * 6 - 15) + 10) }

  // Quadratic bezier position
  function rktBez(p0, p1, p2, t) {
    const m = 1 - t
    return { x: m*m*p0.x+2*m*t*p1.x+t*t*p2.x, y: m*m*p0.y+2*m*t*p1.y+t*t*p2.y, z: m*m*p0.z+2*m*t*p1.z+t*t*p2.z }
  }

  const E = RKT_X_EDGE, Y = RKT_Y_BASE, Z = RKT_Z
  const rktRoutes = [
    // 0: L→R classic arc
    { dur:9.5,  p0:{x:-E,y:Y,z:Z},           p1:{x:0,y:Y+R*0.07,z:Z*0.7},         p2:{x:E,y:Y,z:Z},            ry:0 },
    // 1: R→L classic arc
    { dur:9.5,  p0:{x:E,y:Y,z:Z},            p1:{x:0,y:Y+R*0.07,z:Z*0.7},         p2:{x:-E,y:Y,z:Z},           ry:Math.PI },
    // 2: Depth approach — emerges from far back-left, swings right
    { dur:14.0, p0:{x:-E*0.45,y:Y*0.91,z:Z*6.5}, p1:{x:E*0.2,y:Y*1.10,z:Z*0.45}, p2:{x:E,y:Y,z:Z*2.5},        ry:0.4 },
    // 3: Diagonal ascent L→R (rising arc)
    { dur:8.5,  p0:{x:-E,y:Y*0.84,z:Z*2},    p1:{x:0,y:Y*1.30,z:Z*0.65},          p2:{x:E,y:Y*1.52,z:Z*1.4},   ry:-0.12 },
    // 4: High sweep R→L (descending arc)
    { dur:10.5, p0:{x:E,y:Y*1.38,z:Z*1.6},   p1:{x:0,y:Y*0.70,z:Z*0.55},          p2:{x:-E,y:Y*1.12,z:Z*1.3},  ry:Math.PI+0.12 },
    // 5: Wide depth-retreat — starts close center, exits far-left
    { dur:13.0, p0:{x:E*0.25,y:Y*1.08,z:Z*0.28}, p1:{x:-E*0.35,y:Y*1.18,z:Z*2.2}, p2:{x:-E,y:Y*0.9,z:Z*5.5},  ry:Math.PI-0.18 },
  ]
  let rktRouteIdx   = -1
  let rktTimer      = 0
  let rktPausing    = false
  let rktPauseTimer = 0

  function startNextRktRoute() {
    rktRouteIdx = (rktRouteIdx + 1) % rktRoutes.length
    const rt = rktRoutes[rktRouteIdx]
    menuRocket.position.set(rt.p0.x, rt.p0.y, rt.p0.z)
    menuRocket.rotation.set(0.06, rt.ry, -Math.PI / 2)
    menuRocket.visible = true
    rktTimer = 0
  }
  startNextRktRoute()

  // Camera: horizontal look from orbit — only top of planet visible at bottom
  menuCamera.position.set(0, R * 1.25, R * 1.0)
  menuCamera.lookAt(0, R * 1.25, 0)
  window.addEventListener('resize', resizeMenuBg)

  // ── Animation loop (capped ~30fps, skipped when hidden) ──────────────────
  let last = performance.now()
  let menuLastFrame = 0
  const MENU_FRAME_MS = 1000 / 30  // 30fps cap

  function animateMenuBg() {
    requestAnimationFrame(animateMenuBg)
    // Skip entirely when the canvas is hidden (world select / gameplay)
    if (menuBg && menuBg.style.display === 'none') return
    const now = performance.now()
    if (now - menuLastFrame < MENU_FRAME_MS) return
    menuLastFrame = now
    const dt  = Math.min((now - last) / 1000, 0.05)
    last = now
    const t = now * 0.001

    starGroups.forEach(sg => {
      sg.mat.opacity = 0.2 + 0.65 * (0.5 + 0.5 * Math.sin(t * sg.freq + sg.phase))
    })

    nextShoot -= dt
    if (nextShoot <= 0 && !shooting) {
      spawnShootingStar()
      nextShoot = 12 + Math.random() * 18
    }
    if (shooting) {
      shooting.t += dt
      const prog = shooting.t / shooting.duration
      if (prog >= 1) {
        menuScene.remove(shooting.line)
        shooting = null
      } else {
        const head = shooting.start.clone().addScaledVector(shooting.dir, shooting.speed * prog)
        const tail = head.clone().addScaledVector(shooting.dir, -shooting.tailLen)
        const pa   = shooting.line.geometry.attributes.position
        pa.setXYZ(0, head.x, head.y, head.z)
        pa.setXYZ(1, tail.x, tail.y, tail.z)
        pa.needsUpdate = true
        shooting.line.material.opacity = Math.sin(prog * Math.PI) * 0.9
      }
    }

    if (menuModel) menuModel.rotation.y += 0.00004

    // Rocket fly-by — bezier multi-route system
    rktTimer += dt
    if (!rktPausing) {
      const rt   = rktRoutes[rktRouteIdx]
      const prog = Math.min(rktTimer / rt.dur, 1)
      const ease = rktEase(prog)
      const bp   = rktBez(rt.p0, rt.p1, rt.p2, ease)
      menuRocket.position.x = bp.x
      menuRocket.position.y = bp.y + Math.sin(rktTimer * 1.1) * R * 0.003
      menuRocket.position.z = bp.z
      menuRocket.rotation.z = -Math.PI / 2 + Math.sin(rktTimer * 0.72) * 0.05
      if (prog >= 1) { menuRocket.visible = false; rktPausing = true; rktPauseTimer = 0 }
    } else {
      rktPauseTimer += dt
      if (rktPauseTimer >= RKT_PAUSE_SEC) { rktPausing = false; startNextRktRoute() }
    }

    // Satellite: very slow tumble + gentle bob
    satellite.rotation.y += 0.00035
    satellite.rotation.x  = Math.PI * 0.04 + Math.sin(t * 0.18) * 0.015
    satellite.position.y  = R * 1.31 + Math.sin(t * 0.22) * R * 0.005
    if (satellite._matLed)    satellite._matLed.emissiveIntensity = 1.0 + Math.sin(t * 4.0) * 4.5
    if (satellite._matPainel) satellite._matPainel.emissiveIntensity = 0.12 + Math.abs(Math.sin(t * 0.40)) * 0.22
    if (satellite._panelL)    satellite._panelL.rotation.x = Math.sin(t * 0.30) * 0.06
    if (satellite._panelR)    satellite._panelR.rotation.x = Math.sin(t * 0.30) * 0.06
    if (satellite._flames)    satellite._flames.forEach((f, i) => {
      const esc = 0.88 + Math.sin(t * 14.0 + i * 1.4) * 0.18
      f.scale.set(esc, 0.80 + Math.random() * 0.35, esc)
      f.material.opacity = 0.65 + Math.sin(t * 10.0 + i) * 0.22
    })

    menuRenderer.render(menuScene, menuCamera)
  }
  animateMenuBg()
}

initMenuBg()

if (startBtn) startBtn.addEventListener('click', () => {
  menu.style.display = 'none'
  hideMenuBg()
  startWorldSelect(startGameScene, preloadGameAssets, () => {
    menu.style.display = 'flex'
    showMenuBg()
  })
})
if (rulesBtn)    rulesBtn.addEventListener('click',    () => { menu.style.display = 'none'; rulesScreen.style.display = 'block' })
if (backBtn)     backBtn.addEventListener('click',     () => { rulesScreen.style.display = 'none'; menu.style.display = 'flex'; showMenuBg() })
if (shipBtn)     shipBtn.addEventListener('click',     () => { menu.style.display = 'none'; hideMenuBg(); shipScreen.style.display = 'flex'; setTimeout(resizePreviewCanvas, 40); updateStats(); startTelemetry() })
if (backShipBtn) backShipBtn.addEventListener('click', () => { shipScreen.style.display = 'none'; menu.style.display = 'flex'; showMenuBg() })

// Telemetry typewriter
const _telemLines = ['SYS READY', 'HULL CHECK OK', 'SHIELDS NOMINAL', 'ENGINE ONLINE', 'NAV CALIBRATED', 'WEAPONS ARMED', 'ALL SYSTEMS GO']
let _telemTimer = null, _telemIdx = 0
function _typewriteTelem(text, el, cb) {
  let i = 0
  el.textContent = ''
  const t = setInterval(() => {
    el.textContent += text[i++]
    if (i >= text.length) { clearInterval(t); cb && setTimeout(cb, 1800) }
  }, 45)
}
function startTelemetry() {
  const el = document.getElementById('telemetryText')
  if (!el) return
  _telemIdx = 0
  function cycle() {
    _typewriteTelem(_telemLines[_telemIdx % _telemLines.length], el, () => {
      _telemIdx++
      if (shipScreen && shipScreen.style.display === 'flex') cycle()
    })
  }
  cycle()
}

// ── Achievements screen ───────────────────────────────────
const conquestBtn        = document.getElementById('conquestBtn')
const achievementsScreen = document.getElementById('achievementsScreen')
const backAchBtn         = document.getElementById('backAchBtn')
const achievementsListEl = document.getElementById('achievementsList')
const achCountEl         = document.getElementById('achCount')

function openAchievementsScreen() {
  if (!achievementsScreen) return
  menu.style.display = 'none'
  if (achievementsListEl) {
    achievementsListEl.innerHTML = ''
    ACHIEVEMENTS.forEach((ach, i) => {
      const unlocked = unlockedAchievements.has(ach.id)
      const div = document.createElement('div')
      div.className = 'ach-item ' + (unlocked ? 'unlocked' : 'locked')
      div.style.animationDelay = (i * 0.04) + 's'
      div.innerHTML = `
        <span class="ach-icon">${unlocked ? ach.icon : '🔒'}</span>
        <div class="ach-name">${ach.name}</div>
        <div class="ach-desc">${unlocked ? ach.desc : '???'}</div>`
      achievementsListEl.appendChild(div)
    })
  }
  const total = ACHIEVEMENTS.length
  const count = unlockedAchievements.size
  if (achCountEl) achCountEl.textContent = count + ' / ' + total + ' UNLOCKED'
  const fill = document.getElementById('achProgressFill')
  achievementsScreen.style.display = 'flex'
  if (fill) requestAnimationFrame(() => { fill.style.width = (count / total * 100) + '%' })
}

if (conquestBtn) conquestBtn.addEventListener('click', openAchievementsScreen)
if (backAchBtn)  backAchBtn.addEventListener('click', () => {
  if (achievementsScreen) achievementsScreen.style.display = 'none'
  menu.style.display = 'flex'
})

const leftBtn  = document.getElementById('leftBtn')
const rightBtn = document.getElementById('rightBtn')
function switchShip(dir) {
  currentShip = (currentShip + dir + ships.length) % ships.length
  updateSelection()
  loadPreviewShip()
  const viewer = document.getElementById('mainViewer')
  if (viewer) { viewer.classList.remove('ship-switch'); void viewer.offsetWidth; viewer.classList.add('ship-switch') }
}
if (leftBtn)  leftBtn.addEventListener('click',  () => switchShip(-1))
if (rightBtn) rightBtn.addEventListener('click', () => switchShip(1))

// =========================
// NAVES
// =========================
const ships = [
  { path: './public/models/nave_1.glb', scale: 0.5,    y: 2,    rx: 0, ry:  Math.PI * 0.65,   rz: 0, cam1Y:  0.8, cam1Z: -1.5, name: 'VIPER MK2',   shipClass: 'INTERCEPTOR', speed: 80, firepower: 65, shield: 55, agility: 90, unlockLevel:  1, role: 'ASSAULT',       desc: 'Balanced all-rounder.\nReliable and battle-proven.' },
  { path: './public/models/nave_2.glb', scale: 0.0049, y: -0.6, rx: 0, ry: 0,                 rz: 0, cam1Y:  0.5, cam1Z: -2.0, name: 'PHANTOM X',   shipClass: 'STEALTH',     speed: 70, firepower: 80, shield: 70, agility: 75, unlockLevel:  5, role: 'STEALTH / ASSAULT', desc: 'Built for shadows.\nFast, silent, and deadly.' },
  { path: './public/models/nave_3.glb', scale: 0.12,   y: 1.3,  rx: 0, ry: Math.PI,           rz: 0, cam1Y:  0.1, cam1Z: -0.5, name: 'STORM BLADE', shipClass: 'FIGHTER',     speed: 85, firepower: 75, shield: 60, agility: 80, unlockLevel: 10, role: 'DOGFIGHT',      desc: 'Born in the heat of battle.\nHigh speed, high damage.' },
  { path: './public/models/nave_4.glb', scale: 1.5,    y: 1.3,  rx: 0, ry: Math.PI / 2,       rz: 0, cam1Y:  2.0, cam1Z: -3.5, name: 'TITAN CLASS', shipClass: 'DESTROYER',   speed: 55, firepower: 95, shield: 90, agility: 40, unlockLevel: 20, role: 'HEAVY / SIEGE', desc: 'Armored for the long war.\nUnstoppable force, heavy hull.' },
  { path: './public/models/nave_5.glb', scale: 0.006,  y: 1,    rx: 0, ry: Math.PI,           rz: 0, cam1Y:  0.8, cam1Z: -3.0, name: 'NOVA SWIFT',  shipClass: 'SCOUT',       speed: 95, firepower: 50, shield: 45, agility: 95, unlockLevel: 35, role: 'RECON / SPEED', desc: 'Fastest ship in the fleet.\nEludes enemies with ease.' },
]
let currentShip  = 0
let selectedShip = null

// Preloaded asset cache – populated by worldSelect preload, reused on restart
const shipGltfCache = new Map()   // ship path → GLTF object
let   cachedAssets  = null        // { mapGltf, shipGltfs[] }

// =========================
// PREVIEW
// =========================
const previewContainer = document.getElementById('shipPreview')
if (previewContainer) {
  ships.forEach((ship, i) => {
    const wrapper = document.createElement('div')
    wrapper.classList.add('previewItem')
    wrapper.style.position = 'relative'
    wrapper.addEventListener('click', () => { currentShip = i; updateSelection(); loadPreviewShip(); const v=document.getElementById('mainViewer'); if(v){v.classList.remove('ship-switch');void v.offsetWidth;v.classList.add('ship-switch')} })

    const canvas = document.createElement('canvas')
    canvas.width = 80
    canvas.height = 80
    wrapper.appendChild(canvas)

    // Lock overlay — shown when ship is not yet unlocked
    const lockDiv = document.createElement('div')
    lockDiv.className = 'preview-lock-overlay'
    lockDiv.innerHTML = '🔒<span>LVL ' + ship.unlockLevel + '</span>'
    lockDiv.style.display = playerLevel < ship.unlockLevel ? 'flex' : 'none'
    ship._lockDiv = lockDiv
    wrapper.appendChild(lockDiv)

    // Ship name + class label below canvas
    const labelDiv = document.createElement('div')
    labelDiv.className = 'previewLabel'
    labelDiv.innerHTML = '<span class="previewLabelName">' + ship.name + '</span>' +
                         '<span class="previewLabelClass">' + ship.shipClass + '</span>'
    wrapper.appendChild(labelDiv)

    previewContainer.appendChild(wrapper)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.z = 12
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setSize(80, 80)
    renderer.setPixelRatio(1)
    scene.add(new THREE.AmbientLight(0xffffff, 2))
    const dl = new THREE.DirectionalLight(0xffffff, 1.5)
    dl.position.set(5, 5, 5)
    scene.add(dl)

    let thumbModel = null
    const loader = new GLTFLoader()
    loader.load(ship.path, (gltf) => {
      thumbModel = gltf.scene
      thumbModel.position.set(0, ship.y, 0)
      thumbModel.scale.setScalar(ship.scale)
      thumbModel.rotation.set(ship.rx, ship.ry, ship.rz)
      scene.add(thumbModel)
      // Auto-fit thumbnail camera to ship size
      const box = new THREE.Box3().setFromObject(thumbModel)
      const sphere = box.getBoundingSphere(new THREE.Sphere())
      camera.position.z = sphere.radius / Math.tan(camera.fov * Math.PI / 360) * 1.6
      camera.near = sphere.radius * 0.01
      camera.far  = sphere.radius * 100
      camera.updateProjectionMatrix()
    }, undefined, console.error)

    ;(function thumbLoop() {
      requestAnimationFrame(thumbLoop)
      if (shipScreen && shipScreen.style.display === 'flex') {
        if (thumbModel) thumbModel.rotation.y += 0.012
        renderer.render(scene, camera)
      }
    })()
  })
}

const previewCanvas = document.getElementById('shipCanvas')
let prevScene, prevCamera, prevRenderer, prevLoader, prevModel = null
let _prevDust = null, _prevEngineLight = null, _prevEngineLight2 = null
let _camBaseX = 0, _camBaseY = 0, _camBaseZ = 12
let _camTarget = new THREE.Vector3()
let _prevSparks = []
let _nextSparkIn = 80

if (previewCanvas) {
  prevScene    = new THREE.Scene()
  prevCamera   = new THREE.PerspectiveCamera(60, 1.2, 0.1, 1000)
  prevCamera.position.z = 12
  prevRenderer = new THREE.WebGLRenderer({ canvas: previewCanvas, alpha: true, antialias: true })
  prevRenderer.setSize(600, 500)
  prevRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  prevRenderer.toneMapping = THREE.ACESFilmicToneMapping
  prevRenderer.toneMappingExposure = 1.55

  // Cinematic AAA lighting rig
  prevScene.add(new THREE.AmbientLight(0x060d1a, 0.6))                                             // near-black ambient
  const _keyL = new THREE.DirectionalLight(0xc8e0ff, 6.0);  _keyL.position.set(4, 20, 10);  prevScene.add(_keyL)   // hard top spotlight
  const _rimL = new THREE.DirectionalLight(0x0044ff, 4.5);  _rimL.position.set(-14, 3, -12); prevScene.add(_rimL)  // cold blue rim
  const _accL = new THREE.DirectionalLight(0x8800dd, 2.8);  _accL.position.set(16, 1,  5);  prevScene.add(_accL)   // purple accent
  const _botL = new THREE.DirectionalLight(0x112244, 1.2);  _botL.position.set(0, -10,  4); prevScene.add(_botL)   // floor bounce

  // Engine glow lights (repositioned per ship in loadPreviewShip)
  _prevEngineLight  = new THREE.PointLight(0x44aaff, 10.0, 22); prevScene.add(_prevEngineLight)
  _prevEngineLight2 = new THREE.PointLight(0xff6600,  5.5, 14); prevScene.add(_prevEngineLight2)

  // Floating dust particles — blue-purple tinted
  const _dCount = 320
  const _dPos = new Float32Array(_dCount * 3)
  for (let i = 0; i < _dCount; i++) {
    _dPos[i * 3]     = (Math.random() - 0.5) * 30
    _dPos[i * 3 + 1] = (Math.random() - 0.5) * 18
    _dPos[i * 3 + 2] = (Math.random() - 0.5) * 18
  }
  const _dGeo = new THREE.BufferGeometry()
  _dGeo.setAttribute('position', new THREE.BufferAttribute(_dPos, 3))
  _prevDust = new THREE.Points(_dGeo, new THREE.PointsMaterial({
    color: 0x6688bb, size: 0.045, transparent: true, opacity: 0.22, depthWrite: false
  }))
  prevScene.add(_prevDust)

  prevLoader = new GLTFLoader()
  previewLoop()
  loadPreviewShip()
}

function resizePreviewCanvas() {
  const area = document.getElementById('shipDisplayArea')
  if (!prevRenderer || !area) return
  const w = area.clientWidth, h = area.clientHeight
  if (w > 0 && h > 0) {
    prevRenderer.setSize(w, h)
    prevCamera.aspect = w / h
    prevCamera.updateProjectionMatrix()
  }
}

function loadPreviewShip() {
  if (!prevLoader) return
  if (prevModel) { prevScene.remove(prevModel); prevModel = null }
  prevLoader.load(ships[currentShip].path, (gltf) => {
    const ship = ships[currentShip]
    prevModel = gltf.scene
    prevModel.position.set(0, ship.y, 0)
    prevModel.userData.baseY = ship.y
    prevModel.scale.setScalar(ship.scale)
    prevModel.rotation.set(ship.rx, ship.ry, ship.rz)
    prevScene.add(prevModel)

    const box    = new THREE.Box3().setFromObject(prevModel)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const dist   = sphere.radius / Math.tan(prevCamera.fov * Math.PI / 360) * 1.3
    _camBaseX = sphere.center.x
    _camBaseY = sphere.center.y + sphere.radius * 0.22
    _camBaseZ = sphere.center.z + dist
    _camTarget.set(sphere.center.x, sphere.center.y + sphere.radius * 0.28, sphere.center.z)

    prevCamera.position.set(_camBaseX, _camBaseY, _camBaseZ)
    prevCamera.lookAt(_camTarget)
    prevCamera.near = sphere.radius * 0.01
    prevCamera.far  = sphere.radius * 100
    prevCamera.updateProjectionMatrix()

    // Engine lights positioned at rear of ship
    const rear = sphere.center.clone()
    rear.z += sphere.radius * 0.8
    if (_prevEngineLight)  _prevEngineLight.position.copy(rear)
    if (_prevEngineLight2) { _prevEngineLight2.position.copy(rear); _prevEngineLight2.position.y -= sphere.radius * 0.1 }
  }, undefined, console.error)
}

let _prevT = 0

function _spawnHangarSpark() {
  if (!prevScene) return
  const mat  = new THREE.MeshBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), mat)
  const rx = (Math.random() - 0.5) * 18
  const ry = (Math.random() - 0.5) * 6
  const rz = (Math.random() - 0.5) * 10
  mesh.position.set(rx, ry, rz)
  prevScene.add(mesh)
  _prevSparks.push({ mesh, mat, vx: (Math.random() - 0.5) * 0.06, vy: 0.04 + Math.random() * 0.05, vz: (Math.random() - 0.5) * 0.04, life: 40 + Math.floor(Math.random() * 30) })
}

function previewLoop() {
  requestAnimationFrame(previewLoop)
  if (!shipScreen || shipScreen.style.display !== 'flex') return
  _prevT += 0.014

  // Cinematic camera — slow breathing + float
  const swayX = Math.sin(_prevT * 0.16) * 0.55 + Math.sin(_prevT * 0.07) * 0.20
  const swayY = Math.sin(_prevT * 0.11) * 0.22 + Math.cos(_prevT * 0.19) * 0.08
  const swayZ = Math.cos(_prevT * 0.09) * 0.28
  prevCamera.position.x += ((_camBaseX + swayX) - prevCamera.position.x) * 0.025
  prevCamera.position.y += ((_camBaseY + swayY) - prevCamera.position.y) * 0.025
  prevCamera.position.z += ((_camBaseZ + swayZ) - prevCamera.position.z) * 0.020
  prevCamera.lookAt(_camTarget)

  // Ship hover + very slow rotation
  if (prevModel) {
    prevModel.rotation.y += 0.0035
    prevModel.rotation.z  = Math.sin(_prevT * 0.38) * 0.016
    const baseY = prevModel.userData.baseY ?? 0
    prevModel.position.y  = baseY + Math.sin(_prevT * 0.55) * 0.14
  }

  // Engine glow pulse — more dramatic
  if (_prevEngineLight)  _prevEngineLight.intensity  = 9.0  + Math.sin(_prevT * 8.0) * 3.5
  if (_prevEngineLight2) _prevEngineLight2.intensity = 4.5  + Math.sin(_prevT * 6.5 + 1.4) * 2.0

  // Dust drift
  if (_prevDust) { _prevDust.rotation.y += 0.0007; _prevDust.rotation.x += 0.0003 }

  // Sparks
  _nextSparkIn--
  if (_nextSparkIn <= 0) { _spawnHangarSpark(); _nextSparkIn = 30 + Math.floor(Math.random() * 70) }
  for (let i = _prevSparks.length - 1; i >= 0; i--) {
    const s = _prevSparks[i]
    s.mesh.position.x += s.vx; s.mesh.position.y += s.vy; s.mesh.position.z += s.vz
    s.vy *= 0.97; s.life--
    s.mat.opacity = s.life / 60
    if (s.life <= 0) { prevScene.remove(s.mesh); s.mesh.geometry.dispose(); s.mat.dispose(); _prevSparks.splice(i, 1) }
  }

  prevRenderer.render(prevScene, prevCamera)
}

if (selectBtn) {
  selectBtn.addEventListener('click', () => {
    const ship = ships[currentShip]
    if (playerLevel < ship.unlockLevel) {
      const prev = selectBtn.textContent
      selectBtn.textContent = '🔒 LVL ' + ship.unlockLevel
      setTimeout(() => { selectBtn.textContent = prev }, 2200)
      return
    }
    selectedShip = ship
    selectBtn.textContent = 'SELECTED ✓'
  })
}

function updateSelection() {
  document.querySelectorAll('.previewItem').forEach((el, i) => el.classList.toggle('active', i === currentShip))
  // Refresh lock overlays based on current playerLevel
  ships.forEach(s => {
    if (s._lockDiv) s._lockDiv.style.display = playerLevel < s.unlockLevel ? 'flex' : 'none'
  })
  updateStats()
}

const _classColors = {
  INTERCEPTOR: { h: 'linear-gradient(90deg,rgba(0,60,140,0.95),rgba(10,100,200,0.85))', bar: 'linear-gradient(90deg,#0066cc,#00aaff,#44ddff)', glow: 'rgba(0,170,255,0.50)' },
  STEALTH:     { h: 'linear-gradient(90deg,rgba(60,0,120,0.95),rgba(100,20,180,0.85))', bar: 'linear-gradient(90deg,#6600cc,#aa44ff,#dd88ff)', glow: 'rgba(170,80,255,0.50)' },
  FIGHTER:     { h: 'linear-gradient(90deg,rgba(120,60,0,0.95),rgba(190,100,10,0.85))', bar: 'linear-gradient(90deg,#cc5500,#ff8800,#ffcc44)', glow: 'rgba(255,140,0,0.50)'  },
  DESTROYER:   { h: 'linear-gradient(90deg,rgba(130,0,0,0.95),rgba(200,20,20,0.85))',  bar: 'linear-gradient(90deg,#aa0000,#ee2222,#ff6666)', glow: 'rgba(255,60,60,0.50)'  },
  SCOUT:       { h: 'linear-gradient(90deg,rgba(0,100,80,0.95),rgba(0,160,110,0.85))', bar: 'linear-gradient(90deg,#008855,#00cc88,#44ffbb)', glow: 'rgba(0,220,150,0.50)'  },
}

function updateStats() {
  const s      = ships[currentShip]
  const locked = playerLevel < s.unlockLevel
  const nameEl  = document.getElementById('shipFullName')
  const classEl = document.getElementById('shipClassName')
  const hdrEl   = document.getElementById('statsHeader')
  const descEl  = document.getElementById('shipDesc')
  if (nameEl)  nameEl.textContent  = locked ? '— LOCKED —' : s.name
  if (classEl) classEl.textContent = locked ? 'LVL ' + s.unlockLevel + ' REQUIRED' : s.shipClass
  if (descEl)  descEl.innerHTML    = locked ? '' : (s.desc || '').replace(/\n/g, '<br>')

  const theme = _classColors[s.shipClass] || _classColors.INTERCEPTOR
  if (hdrEl && !locked) {
    hdrEl.style.background = theme.h
    const dot = document.getElementById('shipClassDot')
    if (dot) dot.style.color = theme.glow.replace('rgba', 'rgb').replace(/,[\s\d.]+\)/, ')')
  }

  ;['speed', 'firepower', 'shield', 'agility'].forEach(stat => {
    const bar = document.getElementById('stat-' + stat)
    const val = document.getElementById('val-' + stat)
    const v   = locked ? 0 : s[stat]
    if (bar) {
      bar.style.width      = v + '%'
      bar.style.background = locked ? 'rgba(255,255,255,0.05)' : theme.bar
      bar.style.boxShadow  = locked ? 'none' : '0 0 8px ' + theme.glow
    }
    if (val) val.textContent = locked ? '--' : v
  })

  // Right panel specs
  const specClass  = document.getElementById('spec-class')
  const specUnlock = document.getElementById('spec-unlock')
  const specRole   = document.getElementById('spec-role')
  if (specClass)  specClass.textContent  = locked ? '???' : s.shipClass
  if (specUnlock) specUnlock.textContent = 'LVL ' + s.unlockLevel
  if (specRole)   specRole.textContent   = locked ? '???' : (s.role || s.shipClass)
}

// =========================
// JOGO
// =========================
let gScene, gCamera, gRenderer
let playerMesh     = null
let gameActive     = false
let countdownActive = false
let _countdownGen    = 0
let _countdownOnDone = null   // saved so resume can restart from 3
let mapObject    = null
let mapTopY      = 0
let mapRotationY = 0   // planet self-rotation speed (orbital maps)
let displayVelocity = 0  // animated velocity shown on HUD (m/s)
let starPoints   = null
let overheadHeight  = 60
let overheadTargetX = 0
let overheadTargetZ = 11

const pos = { x: 0, z: 0 }
let velX = 0, velZ = 0
const ACCEL    = 0.014   // acceleration per frame
const DRAG     = 0.86    // friction when no key held
const DRAG_KEY = 0.97    // lighter drag while key is held

const SHIP_HEIGHT   = 0.15
const CAM_OFFSET_Y  = 1.8
const CAM_OFFSET_Z  = 7.5
const SPEED       = 0.12
const TURN_SPEED  = 0.035
const BOUNDS_MARGIN = 0.62
let playerAngle = 0  // heading in radians; 0 = facing north (-Z)

let BOUNDS = { xMin: -20, xMax: 20, zMin: -20, zMax: 20 }

let activeCam = 1
let currentMapSkyColor = 0xe8f4f8

const keys = {}
window.addEventListener('keydown', e => {
  keys[e.code] = true
  if (e.code === 'Escape' && gameCanvas && gameCanvas.style.display !== 'none') {
    e.preventDefault()
    if (isPaused) resumeGame(); else pauseGame()
  }
  if (e.code === 'Space') { e.preventDefault(); fireBullet() }
  if (shipScreen && shipScreen.style.display !== 'none') {
    if (e.code === 'ArrowLeft')  { e.preventDefault(); currentShip = (currentShip - 1 + ships.length) % ships.length; updateSelection(); loadPreviewShip() }
    if (e.code === 'ArrowRight') { e.preventDefault(); currentShip = (currentShip + 1) % ships.length; updateSelection(); loadPreviewShip() }
  }
  if (e.code === 'Digit1') {
    activeCam = 1; gCamera.up.set(0, 1, 0)
    if (gScene) { gScene.background = new THREE.Color(0x06001a) }
    if (starPoints) starPoints.visible = true
  }
  if (e.code === 'Digit2') {
    activeCam = 2; gCamera.up.set(0, 1, 0)
    if (gScene) { gScene.background = new THREE.Color(0x06001a) }
    if (starPoints) starPoints.visible = true
  }
  if (e.code === 'Digit3') {
    activeCam = 3; gCamera.up.set(0, 0, -1)
    if (gScene) { gScene.background = new THREE.Color(currentMapSkyColor) }
    if (starPoints) starPoints.visible = false
  }
})
window.addEventListener('keyup', e => { keys[e.code] = false })

let tx = null, tz = null

// =========================
// BULLETS
// =========================
const bullets      = []
const BULLET_SPEED = 0.55
const BULLET_LIFE  = 200
let   shotCooldown = 0

function fireBullet() {
  if (!playerMesh || !gScene || shotCooldown > 0 || countdownActive) return

  const damage  = activePowerups.powerShot ? 2 : 1
  const color   = activePowerups.powerShot ? 0xff4400 : 0xdd00ff
  const offsets = activePowerups.doubleShot ? [-0.3, 0.3] : [0]

  for (const ox of offsets) {
    const geo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6)
    geo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
    const mat  = new THREE.MeshBasicMaterial({ color })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(playerMesh.position.x + ox, playerMesh.position.y, playerMesh.position.z - 0.5)
    gScene.add(mesh)
    bullets.push({ mesh, life: BULLET_LIFE, dirX: 0, dirZ: -1, damage })
  }
  shotCooldown = activePowerups.rapidFire ? 3 : 10
  playSfx('shoot')
}

// =========================
// ENEMIES + WAVE SYSTEM
// =========================
const enemies      = []
const enemyBullets = []

// Movement patterns — each uses e.speed stored on the enemy object
const PATTERNS = [
  (e) => { e.mesh.position.z += e.speed },
  (e) => { e.mesh.position.z += e.speed;       e.mesh.position.x += Math.sin(e.time * 0.06) * 0.10 },
  (e) => { e.mesh.position.z += e.speed * 0.8; e.mesh.position.x += Math.cos(e.time * 0.03) * 0.14 },
  (e) => { e.mesh.position.z += e.speed * 1.1; e.mesh.position.x += Math.sin(e.time * 0.09) * 0.18 },
  (e) => { e.mesh.position.z += e.speed;        e.mesh.position.x += Math.sin(e.time * 0.04) * Math.cos(e.time * 0.07) * 0.22 },
]

// Wave state
let currentWave        = 0
let waveEnemiesSpawned = 0
let waveSpawnTimer     = 0
let betweenWaves       = false
let betweenWavesTimer  = 0

// Boss state
let bossActive  = false
let bossData    = null   // { mesh, hp, maxHp, t, attackTimer, attackInterval, attackPhase, ringLights, hpBarEl, hpFillEl }
const bossLasers = []   // { mesh, meshOut, life, targetX, damage, hasHit }
const bossBombs  = []   // { mesh, warnMesh, startPos, endPos, t, duration, arcHeight, damage }

const ENEMY_DESCENT_Y   = 18
const ENEMY_DESCENT_SPD = 0.04

// Returns wave parameters that scale with wave number
function getWaveConfig(waveNum) {
  const n       = waveNum - Math.floor((waveNum - 1) / 5)  // non-boss wave index
  const speed   = Math.min(0.13, 0.028 + (n - 1) * 0.010)
  const bSpeed  = Math.min(0.60, 0.20  + (n - 1) * 0.026)
  const shootInt = Math.max(35,  260   - (n - 1) * 18)
  const spawnInt = Math.max(180, 640   - (n - 1) * 24)
  const hp       = Math.min(6,   1 + Math.floor((n - 1) / 2))
  const maxEn    = Math.min(16,  3 + n)
  const pats     = [0, ...(n > 1 ? [1] : []), ...(n > 2 ? [2] : []), ...(n > 3 ? [3] : []), ...(n > 5 ? [4] : [])]
  return { speed, bSpeed, shootInt, spawnInt, hp, maxEnemies: maxEn, patterns: pats }
}

function showWaveAnnouncement(waveNum) {
  const el = document.createElement('div')
  el.textContent = waveNum % 5 === 0 ? '⚠ BOSS WAVE!' : `WAVE ${waveNum}`
  el.style.cssText = [
    'position:fixed', 'top:50%', 'left:50%', 'transform:translate(-50%,-50%)',
    'color:#00e6cc', "font-family:'Courier New',monospace", 'font-size:44px',
    'font-weight:bold', 'letter-spacing:6px', 'pointer-events:none', 'z-index:100',
    'text-shadow:0 0 30px rgba(0,230,204,0.9)', 'animation:countdownPulse 0.9s ease-out',
  ].join(';')
  if (waveNum % 5 === 0) el.style.color = '#ff4422'
  document.body.appendChild(el)
  setTimeout(() => { if (el.parentNode) el.remove() }, 2200)
}

function startWave(waveNum) {
  currentWave        = waveNum
  waveEnemiesSpawned = 0
  waveSpawnTimer     = 0
  showWaveAnnouncement(waveNum)
  // Wave 1: start music now (all other transitions are handled by betweenWaves code)
  if (waveNum === 1) playMusic('wave1')
  // Track completed waves (waveNum-1 was just finished)
  if (waveNum > 1) {
    totalWaves++
    localStorage.setItem('spacewarsTotalWaves', totalWaves)
    checkAchievements()
  }
  if (waveNum % 5 === 0) {
    bossActive = true
    spawnBoss(waveNum)
  } else {
    bossActive = false
  }
}

// ── UFO Boss builder ──────────────────────────────────────
function createBossUFO() {
  const group          = new THREE.Group()
  const matDisco       = new THREE.MeshPhongMaterial({ color: 0x4a7038, shininess: 60 })
  const matDiscoEscuro = new THREE.MeshPhongMaterial({ color: 0x2d4a22, shininess: 72 })
  const matCupula      = new THREE.MeshPhongMaterial({ color: 0x1a4a3a, shininess: 45 })
  const matMetal       = new THREE.MeshPhongMaterial({ color: 0x889988, shininess: 80 })
  const matRanhura     = new THREE.MeshPhongMaterial({ color: 0x182a12, shininess: 30 })

  // Main disc body
  group.add(new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.9, 0.26, 64), matDisco))

  // Top convex cap
  const calota = new THREE.Mesh(new THREE.SphereGeometry(2.7, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), matDisco)
  calota.scale.y = 0.20; calota.position.y = 0.13; group.add(calota)

  // Groove rings
  for (const rd of [{ r: 0.80, y: 0.64 }, { r: 1.35, y: 0.60 }, { r: 1.85, y: 0.52 }, { r: 2.35, y: 0.40 }]) {
    const ran = new THREE.Mesh(new THREE.TorusGeometry(rd.r, 0.020, 6, 72), matRanhura)
    ran.rotation.x = Math.PI / 2; ran.position.y = rd.y; group.add(ran)
  }

  // Outer armor ring
  const anel = new THREE.Mesh(new THREE.TorusGeometry(2.82, 0.17, 16, 80), matDiscoEscuro)
  anel.rotation.x = Math.PI / 2; group.add(anel)

  // Inner separation ring
  const anelInt = new THREE.Mesh(new THREE.TorusGeometry(2.50, 0.040, 8, 64), matRanhura)
  anelInt.rotation.x = Math.PI / 2; anelInt.position.y = 0.02; group.add(anelInt)

  // Dome base band
  const banda = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.085, 12, 60), matDiscoEscuro)
  banda.rotation.x = Math.PI / 2; banda.position.y = 0.58; group.add(banda)

  // Main dome
  const cupula = new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), matCupula)
  cupula.position.y = 0.54; group.add(cupula)

  // Dome ring
  const anelCup = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.032, 8, 48), matMetal)
  anelCup.rotation.x = Math.PI / 2; anelCup.position.y = 0.90; group.add(anelCup)

  // Glowing nucleus
  const matNucleo = new THREE.MeshPhongMaterial({ color: 0x00ff88, emissive: new THREE.Color(0x00ff88), emissiveIntensity: 3.5 })
  const nucleo = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), matNucleo)
  nucleo.position.y = 0.95; group.add(nucleo)

  // 8 blue windows
  const matJanela   = new THREE.MeshPhongMaterial({ color: 0x2255dd, emissive: new THREE.Color(0x1133bb), emissiveIntensity: 2.8 })
  const matAroJan   = new THREE.MeshPhongMaterial({ color: 0x335533, shininess: 80 })
  for (let j = 0; j < 8; j++) {
    const ang = (j / 8) * Math.PI * 2
    const cx = Math.cos(ang) * 0.91, cz = Math.sin(ang) * 0.91
    const jan = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.07), matJanela)
    jan.position.set(cx, 0.60, cz); jan.rotation.y = -ang; group.add(jan)
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.026, 8, 22), matAroJan)
    aro.scale.x = 1.45; aro.position.set(cx, 0.60, cz); aro.rotation.y = -ang; group.add(aro)
  }

  // Antenna
  const baseAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.090, 0.130, 0.20, 12), matCupula)
  baseAnt.position.y = 1.58; group.add(baseAnt)
  const hasteAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.70, 8), matMetal)
  hasteAnt.position.y = 2.03; group.add(hasteAnt)
  const anelAnt = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.018, 6, 16), matMetal)
  anelAnt.rotation.x = Math.PI / 2; anelAnt.position.y = 2.03; group.add(anelAnt)
  const matBolha = new THREE.MeshPhongMaterial({ color: 0xff2200, emissive: new THREE.Color(0xff2200), emissiveIntensity: 4.0 })
  const bolha = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), matBolha)
  bolha.position.y = 2.40; group.add(bolha)

  // Bottom dome
  const calotaInf = new THREE.Mesh(
    new THREE.SphereGeometry(0.80, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.MeshPhongMaterial({ color: 0x2d4a22 })
  )
  calotaInf.scale.y = 0.40; calotaInf.position.y = -0.15; group.add(calotaInf)

  // Bottom groove rings
  for (const r of [0.55, 1.10, 1.75]) {
    const ran = new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 6, 60), matRanhura)
    ran.rotation.x = Math.PI / 2; ran.position.y = -0.14; group.add(ran)
  }

  // 6 green emitters on underside
  const matEmissor = new THREE.MeshPhongMaterial({ color: 0x00cc44, emissive: new THREE.Color(0x00cc44), emissiveIntensity: 3.0 })
  for (let e = 0; e < 6; e++) {
    const ang = (e / 6) * Math.PI * 2
    const em = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.120, 0.10, 16), matEmissor)
    em.position.set(Math.cos(ang) * 1.52, -0.16, Math.sin(ang) * 1.52); group.add(em)
  }

  // 12 ring light spheres (chase-wave animation)
  const ringLights = []
  for (let p = 0; p < 12; p++) {
    const ang = (p / 12) * Math.PI * 2
    const matP = new THREE.MeshPhongMaterial({ color: 0x00ff66, emissive: new THREE.Color(0x00ff66), emissiveIntensity: 2.5 })
    const meshP = new THREE.Mesh(new THREE.SphereGeometry(0.072, 8, 8), matP)
    meshP.position.set(Math.cos(ang) * 2.84, 0.005, Math.sin(ang) * 2.84)
    group.add(meshP)
    ringLights.push({ mat: matP, fase: (p / 12) * Math.PI * 2 })
  }

  // Tractor beam (3-layer cone)
  const matFeixe = new THREE.MeshBasicMaterial({ color: 0x00ff44, transparent: true, opacity: 0.09, side: THREE.DoubleSide })
  const feixe = new THREE.Mesh(new THREE.ConeGeometry(1.55, 4.0, 32, 1, true), matFeixe)
  feixe.rotation.x = Math.PI; feixe.position.y = -2.2; group.add(feixe)
  const matFeixeMed = new THREE.MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0.13, side: THREE.DoubleSide })
  const feixeMed = new THREE.Mesh(new THREE.ConeGeometry(0.70, 4.0, 20, 1, true), matFeixeMed)
  feixeMed.rotation.x = Math.PI; feixeMed.position.y = -2.2; group.add(feixeMed)

  group._ringLights = ringLights
  group._matNucleo  = matNucleo
  group._matBolha   = matBolha
  group._matFeixe   = matFeixe
  group._matFeixeMed = matFeixeMed
  return group
}

function createBossHPBar() {
  const div = document.createElement('div')
  div.id = 'bossHPBar'
  div.style.cssText = [
    'position:fixed', 'top:12px', 'left:50%', 'transform:translateX(-50%)',
    'width:320px', 'z-index:20', 'display:flex', 'flex-direction:column', 'align-items:center',
  ].join(';')
  div.innerHTML = `
    <div style="color:#ff4422;font-family:'Courier New',monospace;font-size:13px;letter-spacing:3px;margin-bottom:4px;text-shadow:0 0 10px rgba(255,68,34,0.8)">▶ UFO BOSS ◀</div>
    <div style="width:100%;height:13px;background:rgba(0,0,0,0.7);border:1px solid #ff4422;border-radius:3px;overflow:hidden">
      <div id="bossHPFill" style="width:100%;height:100%;background:linear-gradient(90deg,#ff2200,#ff6600);border-radius:2px;transition:width 0.15s"></div>
    </div>`
  document.body.appendChild(div)
  return div
}

function spawnBoss(waveNum) {
  if (!gScene) return
  showBossWarning(() => {
    if (!gScene || !gameActive) return
    const bossRound = Math.floor(waveNum / 5)
    const maxHp     = 25 + (bossRound - 1) * 15
    const mesh      = createBossUFO()
    mesh.scale.setScalar(1.8)
    const centerX = (BOUNDS.xMin + BOUNDS.xMax) / 2
    mesh.position.set(centerX, mapTopY + 10, BOUNDS.zMin - 5)
    gScene.add(mesh)
    const hpBarEl  = createBossHPBar()
    const hpFillEl = document.getElementById('bossHPFill')
    bossData = {
      mesh, hp: maxHp, maxHp, t: 0,
      attackTimer: 80, attackInterval: Math.max(140, 320 - bossRound * 10),
      attackPhase: 0,
      ringLights: mesh._ringLights,
      hpBarEl, hpFillEl,
      moveState: 'MOVE',
      stateTimer: 0,
      stateMaxTime: 360 + Math.floor(Math.random() * 180),
      pausedX: centerX,
      yOffset: 0,
      baseY: mapTopY + 10,
    }
    triggerShake(0.4)
  })
}

function fireBossLaser() {
  if (!gScene || !playerMesh || !bossData) return
  const spread  = (BOUNDS.xMax - BOUNDS.xMin) * 0.55
  const targetX = playerMesh.position.x + (Math.random() - 0.5) * spread
  const bossPos = bossData.mesh.position
  const boltLen = 4
  const geoInner = new THREE.CylinderGeometry(0.14, 0.14, boltLen, 8)
  geoInner.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
  const matInner = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.95 })
  const meshInner = new THREE.Mesh(geoInner, matInner)
  meshInner.position.set(targetX, mapTopY + 0.5, bossPos.z)
  gScene.add(meshInner)
  const geoOuter = new THREE.CylinderGeometry(0.42, 0.42, boltLen, 8)
  geoOuter.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
  const matOuter = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false })
  const meshOuter = new THREE.Mesh(geoOuter, matOuter)
  meshOuter.position.copy(meshInner.position)
  gScene.add(meshOuter)
  bossLasers.push({ mesh: meshInner, meshOut: meshOuter, targetX, damage: 1, hasHit: false, speed: 0.35 })
}

function fireBossBomb() {
  if (!gScene || !bossData || !playerMesh) return
  const bossPos = bossData.mesh.position
  const tx = playerMesh.position.x
  const tz = playerMesh.position.z
  const endPos = new THREE.Vector3(tx, mapTopY + 0.08, tz)
  const geo  = new THREE.SphereGeometry(0.32, 12, 8)
  const mat  = new THREE.MeshBasicMaterial({ color: 0xff8800 })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.copy(bossPos)
  gScene.add(mesh)
  // Warning ring on ground
  const warnGeo = new THREE.RingGeometry(1.0, 1.9, 36)
  warnGeo.rotateX(-Math.PI / 2)
  const warnMat  = new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
  const warnMesh = new THREE.Mesh(warnGeo, warnMat)
  warnMesh.position.set(tx, mapTopY + 0.06, tz)
  gScene.add(warnMesh)
  bossBombs.push({ mesh, warnMesh, startPos: bossPos.clone(), endPos, t: 0, duration: 185, arcHeight: 9, damage: 1 })
}

function updateBossBombs() {
  for (let i = bossBombs.length - 1; i >= 0; i--) {
    const bomb = bossBombs[i]
    bomb.t += 1 / bomb.duration
    if (bomb.t >= 1) {
      // Landing — check player
      if (playerMesh) {
        const dx = playerMesh.position.x - bomb.endPos.x
        const dz = playerMesh.position.z - bomb.endPos.z
        if (dx * dx + dz * dz < 1.21 && applyDamage(bomb.damage)) return
      }
      gScene.remove(bomb.mesh); bomb.mesh.geometry.dispose(); bomb.mesh.material.dispose()
      gScene.remove(bomb.warnMesh); bomb.warnMesh.geometry.dispose(); bomb.warnMesh.material.dispose()
      bossBombs.splice(i, 1)
      continue
    }
    // Track player during first 65% of flight
    if (bomb.t < 0.30 && playerMesh) {
      bomb.endPos.x += (playerMesh.position.x - bomb.endPos.x) * 0.04
      bomb.endPos.z += (playerMesh.position.z - bomb.endPos.z) * 0.08
      bomb.warnMesh.position.x = bomb.endPos.x
      bomb.warnMesh.position.z = bomb.endPos.z
    }
    const t = bomb.t
    const x = bomb.startPos.x + (bomb.endPos.x - bomb.startPos.x) * t
    const z = bomb.startPos.z + (bomb.endPos.z - bomb.startPos.z) * t
    const y = bomb.startPos.y + (bomb.endPos.y - bomb.startPos.y) * t + bomb.arcHeight * 4 * t * (1 - t)
    bomb.mesh.position.set(x, y, z)
    // Pulse warning ring
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.012)
    bomb.warnMesh.material.opacity = 0.45 + pulse * 0.45
    bomb.warnMesh.scale.setScalar(0.85 + pulse * 0.30)
  }
}

function updateBoss() {
  if (!bossData || !gScene) return
  bossData.t++
  const t = bossData.t

  // Move / pause state machine
  bossData.stateTimer++
  if (bossData.stateTimer >= bossData.stateMaxTime) {
    bossData.stateTimer = 0
    if (bossData.moveState === 'MOVE') {
      bossData.moveState    = 'PAUSE'
      bossData.stateMaxTime = 180 + Math.floor(Math.random() * 150)  // 3–5.5 s pause
      bossData.pausedX      = bossData.mesh.position.x
    } else {
      bossData.moveState    = 'MOVE'
      bossData.stateMaxTime = 360 + Math.floor(Math.random() * 240)  // 6–10 s move
    }
  }

  const centerX    = (BOUNDS.xMin + BOUNDS.xMax) / 2
  const centerZ    = BOUNDS.zMin + (BOUNDS.zMax - BOUNDS.zMin) * 0.12
  const halfRangeX = (BOUNDS.xMax - BOUNDS.xMin) * 0.32
  const halfRangeZ = (BOUNDS.zMax - BOUNDS.zMin) * 0.10

  if (bossData.moveState === 'MOVE') {
    // Slow sinusoidal drift on X and Z, gentle Y float
    bossData.mesh.position.x = centerX + Math.sin(t * 0.008) * halfRangeX
    bossData.mesh.position.z = centerZ + Math.sin(t * 0.005 + 1.2) * halfRangeZ
    const floatY = Math.sin(t * 0.006) * 1.2
    bossData.yOffset += (floatY - bossData.yOffset) * 0.016
  } else {
    // Pause: glide to locked position and descend
    bossData.mesh.position.x += (bossData.pausedX - bossData.mesh.position.x) * 0.03
    bossData.mesh.position.z += (centerZ          - bossData.mesh.position.z) * 0.02
    bossData.yOffset += (-4.5 - bossData.yOffset) * 0.016
  }
  bossData.mesh.position.y = bossData.baseY + bossData.yOffset
  bossData.mesh.rotation.y += 0.010

  // Animate ring lights (chase wave)
  for (const rl of bossData.ringLights)
    rl.mat.emissiveIntensity = 2.0 + Math.sin(t * 0.08 + rl.fase) * 2.0

  // Attack cycle: alternate laser / bomb
  bossData.attackTimer++
  if (bossData.attackTimer >= bossData.attackInterval) {
    bossData.attackTimer = 0
    if (bossData.attackPhase === 0) { fireBossLaser(); bossData.attackPhase = 1 }
    else                             { fireBossBomb();  bossData.attackPhase = 0 }
  }

  // Update lasers — traveling bolts from boss toward player
  for (let i = bossLasers.length - 1; i >= 0; i--) {
    const laser = bossLasers[i]
    laser.mesh.position.z    += laser.speed
    laser.meshOut.position.z += laser.speed
    if (!laser.hasHit && playerMesh) {
      const lz = laser.mesh.position.z
      const pz = playerMesh.position.z
      if (lz >= pz - laser.speed * 2 && lz <= pz + 2) {
        const dx = Math.abs(playerMesh.position.x - laser.targetX)
        if (dx < 1.2) {
          laser.hasHit = true
          if (applyDamage(laser.damage)) return
        }
      }
    }
    if (laser.mesh.position.z > BOUNDS.zMax + 8) {
      gScene.remove(laser.mesh);   laser.mesh.geometry.dispose();   laser.mesh.material.dispose()
      gScene.remove(laser.meshOut); laser.meshOut.geometry.dispose(); laser.meshOut.material.dispose()
      bossLasers.splice(i, 1)
    }
  }

  updateBossBombs()
  if (!gameActive) return

  // Player bullets hit boss
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b  = bullets[bi]
    const dx = b.mesh.position.x - bossData.mesh.position.x
    const dz = b.mesh.position.z - bossData.mesh.position.z
    if (dx * dx + dz * dz < 14) {
      gScene.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose()
      bullets.splice(bi, 1)
      bossData.hp -= b.damage
      if (bossData.hpFillEl)
        bossData.hpFillEl.style.width = Math.max(0, bossData.hp / bossData.maxHp * 100) + '%'
      spawnExplosion(b.mesh.position.x, b.mesh.position.y, b.mesh.position.z, 6, 0xffaa00)
      triggerShake(0.08)
      playSfx('hit')
      if (bossData.hp <= 0) {
        score += 150; updateHUD()
        totalBossKills++
        localStorage.setItem('spacewarsTotalBossKills', totalBossKills)
        const bossPos = bossData.mesh.position.clone()
        spawnExplosion(bossPos.x, bossPos.y, bossPos.z, 45, 0xff4400)
        spawnExplosion(bossPos.x + 1.5, bossPos.y + 0.5, bossPos.z, 20, 0xffcc00)
        spawnExplosion(bossPos.x - 1.5, bossPos.y - 0.5, bossPos.z, 20, 0xff2200)
        triggerShake(0.65)
        triggerFlash('rgba(255,240,180,0.65)', 22)
        playSfx('bossExplosion')
        spawnDamageNumber(bossPos.x, bossPos.y + 1, bossPos.z, 150, true)
        addKill(150)
        checkAchievements()
        gScene.remove(bossData.mesh)
        if (bossData.hpBarEl && bossData.hpBarEl.parentNode) bossData.hpBarEl.remove()
        bossLasers.forEach(l => { gScene.remove(l.mesh); gScene.remove(l.meshOut) })
        bossLasers.length = 0
        bossBombs.forEach(bb => { gScene.remove(bb.mesh); gScene.remove(bb.warnMesh) })
        bossBombs.length = 0
        bossData   = null
        bossActive = false
        betweenWaves      = true
        betweenWavesTimer = 210
        playMusic(getMusicForWave(currentWave + 1))  // transition to next wave's music immediately
        return
      }
      break
    }
  }

  // Player touches boss — heavy damage
  if (playerMesh) {
    const dx = playerMesh.position.x - bossData.mesh.position.x
    const dz = playerMesh.position.z - bossData.mesh.position.z
    if (dx * dx + dz * dz < 12) {
      if (applyDamage(2)) return
      bossData.mesh.position.z -= 3
    }
  }
}

function getEnemyShipData() {
  const playerPath = (selectedShip || ships[0]).path
  const pool = ships.filter(s => s.path !== playerPath)
  return pool[Math.floor(Math.random() * pool.length)]
}

function spawnEnemy() {
  if (!gScene || currentWave === 0) return
  const cfg     = getWaveConfig(currentWave)
  const sd      = getEnemyShipData()
  const spawnX  = BOUNDS.xMin + Math.random() * (BOUNDS.xMax - BOUNDS.xMin)
  const patIdx  = Math.floor(Math.random() * cfg.patterns.length)
  const pattern = cfg.patterns[patIdx]
  const targetY = mapTopY + 0.5

  function spawnWithMesh(gltfScene) {
    gltfScene.scale.setScalar(sd.scale * 0.3)
    gltfScene.rotation.set(sd.rx, sd.ry + Math.PI, sd.rz)

    // Wrap in unscaled group so glow effects stay in world units
    const wrapper = new THREE.Group()
    wrapper.position.set(spawnX, targetY + ENEMY_DESCENT_Y, BOUNDS.zMin - 2)
    wrapper.add(gltfScene)

    // Point light glow — illuminates the ship from within
    const glowLight = new THREE.PointLight(0x6699ff, 12.0, 10)
    wrapper.add(glowLight)

    // Engine exhaust cone (enemies travel in +Z, engine = back at -Z)
    const flameMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.30, 1.1, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    )
    flameMesh.rotation.x = -Math.PI / 2  // tip points in -Z (trailing)
    flameMesh.position.set(0, 0, -1.5)
    wrapper.add(flameMesh)

    gScene.add(wrapper)
    enemies.push({
      mesh: wrapper, time: 0, descending: true, targetY, pattern,
      hp: cfg.hp, speed: cfg.speed, bulletSpeed: cfg.bSpeed,
      shootInt: cfg.shootInt, shootTimer: Math.floor(Math.random() * cfg.shootInt),
    })
  }

  if (shipGltfCache.has(sd.path)) {
    spawnWithMesh(shipGltfCache.get(sd.path).scene.clone())
  } else {
    new GLTFLoader().load(sd.path, gltf => {
      shipGltfCache.set(sd.path, gltf)
      spawnWithMesh(gltf.scene.clone())
    }, undefined, console.error)
  }
}

function fireEnemyBullet(enemy) {
  if (!gScene) return
  const geo  = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6)
  geo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2))
  const mat  = new THREE.MeshBasicMaterial({ color: 0xff4400 })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.copy(enemy.mesh.position)
  gScene.add(mesh)
  enemyBullets.push({ mesh, dirX: 0, dirZ: 1, life: 220, speed: enemy.bulletSpeed })
}

// =========================
// POWERUPS
// =========================
const powerups = []
const POWERUP_DROP_CHANCE = 0.35   // 35% chance on enemy kill

const POWERUP_DEFS = {
  doubleShot: { icon: '🔫', color: 0xff66ff, duration: 600 },
  rapidFire:  { icon: '⚡', color: 0xffee00, duration: 480 },
  shield:     { icon: '🛡️', color: 0x44aaff, duration: -1  },
  powerShot:  { icon: '💥', color: 0xff6600, duration: 600 },
}

const activePowerups = { doubleShot: 0, rapidFire: 0, shield: 0, powerShot: 0 }
let shieldMesh = null

function removeShieldMesh() {
  if (shieldMesh) {
    if (playerMesh) playerMesh.remove(shieldMesh)
    shieldMesh.geometry.dispose()
    shieldMesh.material.dispose()
    shieldMesh = null
  }
}

function createShieldMesh() {
  removeShieldMesh()
  const geo = new THREE.SphereGeometry(1.3, 16, 12)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x44aaff, transparent: true, opacity: 0.22,
    side: THREE.DoubleSide, depthWrite: false,
  })
  shieldMesh = new THREE.Mesh(geo, mat)
  if (playerMesh) playerMesh.add(shieldMesh)
}

function updatePowerupHUD() {
  if (!powerupHudEl) return
  powerupHudEl.innerHTML = ''
  for (const [type, val] of Object.entries(activePowerups)) {
    if (!val) continue
    const def = POWERUP_DEFS[type]
    const div = document.createElement('div')
    div.className = 'powerup-slot'
    const secs = val > 0 ? Math.ceil(val / 60) + 's' : ''
    div.innerHTML = `<span class="pu-icon">${def.icon}</span>${secs ? `<span class="pu-timer">${secs}</span>` : ''}`
    powerupHudEl.appendChild(div)
  }
  const shldPct = activePowerups.shield ? 100 : 0
  if (shieldBarEl) shieldBarEl.style.width = shldPct + '%'
  if (shieldPctEl) shieldPctEl.textContent = shldPct + '%'
}

function activatePowerup(type) {
  const def = POWERUP_DEFS[type]
  if (type === 'shield') {
    activePowerups.shield = 1
    createShieldMesh()
  } else {
    activePowerups[type] = def.duration
  }
  totalPowerups++
  localStorage.setItem('spacewarsTotalPowerups', totalPowerups)
  playSfx('powerup')
  triggerFlash('rgba(80,200,255,0.25)', 8)
  updatePowerupHUD()
  checkAchievements()
}

function spawnPowerup(x, y, z) {
  if (!gScene) return
  const types = Object.keys(POWERUP_DEFS)
  const type  = types[Math.floor(Math.random() * types.length)]
  const def   = POWERUP_DEFS[type]

  const group = new THREE.Group()

  // Bright white core (additive glow)
  const coreGeo = new THREE.SphereGeometry(0.28, 14, 10)
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
  group.add(new THREE.Mesh(coreGeo, coreMat))

  // Coloured mid sphere
  const midGeo = new THREE.SphereGeometry(0.42, 14, 10)
  const midMat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
  group.add(new THREE.Mesh(midGeo, midMat))

  // Soft outer halo (back-face so it surrounds)
  const haloGeo = new THREE.SphereGeometry(0.78, 14, 10)
  const haloMat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.13, side: THREE.BackSide, depthWrite: false })
  const haloMesh = new THREE.Mesh(haloGeo, haloMat)
  group.add(haloMesh)

  // Spinning equatorial ring
  const ringGeo = new THREE.TorusGeometry(0.62, 0.055, 6, 28)
  const ringMat = new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.80, blending: THREE.AdditiveBlending, depthWrite: false })
  const ring1 = new THREE.Mesh(ringGeo, ringMat)
  ring1.rotation.x = Math.PI / 2
  group.add(ring1)

  // Second ring tilted 60°
  const ring2 = new THREE.Mesh(ringGeo.clone(), ringMat.clone())
  ring2.rotation.x = Math.PI / 3
  ring2.rotation.z = Math.PI / 5
  group.add(ring2)

  group.position.set(x, y, z)
  gScene.add(group)
  powerups.push({ mesh: group, haloMesh, type, bobTime: 0, life: 540 })
}

function updatePowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i]
    p.bobTime++
    p.life--

    p.mesh.position.y = mapTopY + 0.5 + Math.sin(p.bobTime * 0.08) * 0.22
    p.mesh.rotation.y += 0.05

    // Pulse outer halo opacity
    p.haloMesh.material.opacity = 0.10 + Math.sin(p.bobTime * 0.14) * 0.07

    // Fade out last 60 frames
    if (p.life < 60) {
      const fade = p.life / 60
      p.mesh.children.forEach(c => { if (c.material) c.material.opacity *= fade })
    }

    if (playerMesh) {
      const dx = p.mesh.position.x - playerMesh.position.x
      const dz = p.mesh.position.z - playerMesh.position.z
      if (dx*dx + dz*dz < 2.56) {
        activatePowerup(p.type)
        gScene.remove(p.mesh)
        powerups.splice(i, 1)
        continue
      }
    }
    if (p.life <= 0) {
      gScene.remove(p.mesh)
      powerups.splice(i, 1)
    }
  }

  // Tick active powerup timers
  let changed = false
  for (const type of Object.keys(activePowerups)) {
    if (type === 'shield') continue
    if (activePowerups[type] > 0) {
      activePowerups[type]--
      if (activePowerups[type] <= 0) { activePowerups[type] = 0; changed = true }
    }
  }
  if (changed) updatePowerupHUD()
}

// =========================
// HEIGHT FOG
// =========================
const fogUniforms = []

function applyHeightFog(object) {
  object.traverse(child => {
    if (!child.isMesh) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach(mat => {
      const fu = {
        hFogColor:       { value: new THREE.Color(0xe8f4f8) },
        hFogNear:        { value: 15.0 },
        hFogFar:         { value: 48.0 },
        hFogGroundLevel: { value: 0.0 },
        hFogFalloff:     { value: 0.25 },
      }
      fogUniforms.push(fu)
      mat.onBeforeCompile = shader => {
        Object.assign(shader.uniforms, fu)
        shader.vertexShader = shader.vertexShader
          .replace('#include <fog_pars_vertex>',
            '#include <fog_pars_vertex>\nvarying vec3 vHFogWorldPos;')
          .replace('#include <fog_vertex>',
            '#include <fog_vertex>\nvHFogWorldPos = (modelMatrix * vec4(position,1.0)).xyz;')
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <fog_pars_fragment>',
            `#include <fog_pars_fragment>
varying vec3  vHFogWorldPos;
uniform vec3  hFogColor;
uniform float hFogNear;
uniform float hFogFar;
uniform float hFogGroundLevel;
uniform float hFogFalloff;`)
          .replace('#include <fog_fragment>',
            `#include <fog_fragment>
{
  float _h = exp(-max(vHFogWorldPos.y - hFogGroundLevel, 0.0) * hFogFalloff);
  float _d = length(vHFogWorldPos - cameraPosition);
  float _f = smoothstep(hFogNear, hFogFar, _d) * _h;
  gl_FragColor.rgb = mix(gl_FragColor.rgb, hFogColor, clamp(_f, 0.0, 1.0));
}`)
      }
      mat.needsUpdate = true
    })
  })
}

// =========================
// ENGINE TRAIL
// =========================
const trailParticles = []
let trailTexture = null

function initTrailTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 32
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  g.addColorStop(0,   'rgba(255,255,255,1)')
  g.addColorStop(0.3, 'rgba(140,200,255,0.85)')
  g.addColorStop(0.7, 'rgba(40,100,255,0.4)')
  g.addColorStop(1,   'rgba(0,40,200,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  trailTexture = new THREE.CanvasTexture(c)
}

function spawnTrailParticles() {
  if (!playerMesh || !gScene || !trailTexture) return
  for (let k = 0; k < 3; k++) {
    const mat = new THREE.SpriteMaterial({
      map: trailTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(mat)
    const s = 0.18 + Math.random() * 0.18
    sprite.scale.set(s, s, 1)
    sprite.position.set(
      playerMesh.position.x + (Math.random() - 0.5) * 0.22,
      playerMesh.position.y - 0.08 + (Math.random() - 0.5) * 0.08,
      playerMesh.position.z + 0.55 + Math.random() * 0.25
    )
    gScene.add(sprite)
    trailParticles.push({ sprite, life: 30, maxLife: 30 })
  }
}

function updateTrail() {
  if (playerMesh) spawnTrailParticles()
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    const p = trailParticles[i]
    p.life--
    const t = p.life / p.maxLife
    p.sprite.material.opacity = t * 0.75
    const sc = 0.1 + t * 0.22
    p.sprite.scale.set(sc, sc, 1)
    p.sprite.position.z += 0.018
    p.sprite.position.y -= 0.004
    if (p.life <= 0) {
      gScene.remove(p.sprite)
      p.sprite.material.dispose()
      trailParticles.splice(i, 1)
    }
  }
}

function startCountdown(onDone) {
  _countdownOnDone = onDone
  countdownActive = true
  const myGen = ++_countdownGen
  if (countdownOverlay) countdownOverlay.style.display = 'flex'
  const steps = ['3', '2', '1', 'GO!']
  let i = 0
  function tick() {
    if (myGen !== _countdownGen) return   // cancelled (menu exit or restart)
    if (isPaused) { setTimeout(tick, 100); return }
    if (i >= steps.length) {
      countdownActive = false
      if (countdownOverlay) countdownOverlay.style.display = 'none'
      onDone()
      return
    }
    if (countdownText) {
      countdownText.textContent = steps[i]
      countdownText.style.animation = 'none'
      void countdownText.offsetWidth
      countdownText.style.animation = 'countdownPulse 0.9s ease-out'
    }
    i++
    setTimeout(tick, i === steps.length ? 700 : 1000)
  }
  tick()
}

let currentMapName = 'neptuno'

// ── Preload all game assets in parallel ───────────────────
// Returns Promise<{ mapGltf, shipGltfs[] }>
const MAP_PATHS = {
  terra:   './public/textures/earth2.glb',
  lua:     './public/textures/moon.glb',
  marte:   './public/textures/marte.glb',
  jupiter: './public/textures/jupiter.glb',
  neptuno: './public/textures/neptune.glb',
}
const MAP_SKY_COLORS = { terra:0x000308, lua:0x000005, marte:0x060100, jupiter:0x040201, neptuno:0x000010 }
const MAP_ROTATION   = { terra:0.00018,  lua:0.00008,  marte:0.00022,  jupiter:0.00030,  neptuno:0.00020  }

// Orbital maps: large planet sphere as background, no terrain GLB
const _ORBITAL_MAPS = new Set(['terra', 'lua', 'marte', 'jupiter', 'neptuno'])
function isOrbitalMap(n) { return _ORBITAL_MAPS.has(n) }

async function preloadGameAssets(mapName, onProgress) {
  const total = 1 + ships.length   // 1 map slot + 5 ships = 6 items
  let loaded = 0

  const track = p => p.then(r => { onProgress(++loaded, total); return r })

  const mapPath = MAP_PATHS[mapName]
  const mapPromise = mapPath
    ? track(loadGLTFPromise(mapPath))
    : Promise.resolve(null).then(() => { onProgress(++loaded, total); return null })

  const [mapGltf, ...shipGltfs] = await Promise.all([
    mapPromise,
    ...ships.map(s => track(loadGLTFPromise(s.path))),
  ])
  return { mapGltf, shipGltfs }
}

// ── Map setup (sync once GLTF is available) ───────────────
function setupMap(gltf) {
  fogUniforms.length = 0
  currentMapSkyColor = MAP_SKY_COLORS[currentMapName] ?? 0x0a1832

  mapObject = gltf.scene
  const box    = new THREE.Box3().setFromObject(mapObject)
  const size   = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  // ── All orbital maps: Lua, Terra, Marte, Jupiter, Neptuno ─
  if (isOrbitalMap(currentMapName)) {
    const planetR = 200
    const maxDim  = Math.max(size.x, size.y, size.z)
    const scale   = (planetR * 2) / maxDim
    const yOffset = (size.y / 2) * scale
    const yBoost  = currentMapName === 'lua'     ? 40
                  : currentMapName === 'neptuno' ? 30
                  : currentMapName === 'terra'   ? -10
                  : 0
    mapObject.scale.setScalar(scale)
    mapObject.position.set(0, -center.y * scale - yOffset + yBoost, -45)
    // earth2.glb: start over equatorial landmass (Europe/Africa band)
    if (currentMapName === 'terra') { mapObject.rotation.x = 1.1; mapObject.rotation.y = 2.2 }
    if (currentMapName === 'marte') mapObject.rotation.x = Math.PI / 2

    mapObject.traverse(c => {
      if (!c.isMesh) return
      c.frustumCulled = false
      const mats = Array.isArray(c.material) ? c.material : [c.material]
      mats.forEach(m => {
        if (!m) return
        if ('envMapIntensity' in m) m.envMapIntensity = 0  // remove dark env-map reflections
        if (currentMapName !== 'terra') {
          if ('metalness' in m) m.metalness = 0
          if ('roughness' in m) m.roughness = 0.7
          if ('emissiveIntensity' in m) m.emissiveIntensity = 0
          m.transparent = false
          m.opacity = 1
        }
        // terra: keep all original material properties, only envMap removed
        m.needsUpdate = true
      })
    })

    if (gCamera) { gCamera.far = 2000; gCamera.updateProjectionMatrix() }

    mapTopY      = 3
    mapRotationY = MAP_ROTATION[currentMapName] ?? 0.00018
    BOUNDS = { xMin: -30, xMax: 30, zMin: -20, zMax: 30 }

    pos.z           = BOUNDS.zMax * 0.85
    overheadTargetX = 0
    overheadTargetZ = 0
    overheadHeight  = Math.max(BOUNDS.xMax - BOUNDS.xMin, BOUNDS.zMax - BOUNDS.zMin) / Math.tan((35 * Math.PI) / 180) * 0.60

    gScene.background = new THREE.Color(currentMapSkyColor)
    gScene.add(mapObject)
    return
  }

  // ── Neptuno (terrain GLB fallback) ───────────────────────
  const targetWidth = 50
  const scale = targetWidth / Math.max(size.x, size.z)
  mapObject.scale.setScalar(scale)
  mapObject.position.x = -center.x * scale
  mapObject.position.z = -center.z * scale
  const topY = box.max.y * scale
  mapObject.position.y = -topY

  const halfXFull = (size.x * scale) / 2
  const halfZFull = (size.z * scale) / 2

  mapObject.rotation.y = -0.22

  mapTopY = -size.y * scale * 0.4 - 1
  mapObject.position.x += halfXFull * 0.10
  BOUNDS = {
    xMin: -halfXFull * 0.25,
    xMax:  halfXFull * 0.55,
    zMin: -halfZFull * 0.10,
    zMax:  halfZFull * 0.54,
  }
  applyHeightFog(mapObject)
  fogUniforms.forEach(u => { u.hFogGroundLevel.value = mapTopY })

  pos.z           = BOUNDS.zMax * 0.85
  overheadTargetX = (BOUNDS.xMin + BOUNDS.xMax) / 2
  overheadTargetZ = (BOUNDS.zMin + BOUNDS.zMax) / 2
  overheadHeight  = Math.max(BOUNDS.xMax - BOUNDS.xMin, BOUNDS.zMax - BOUNDS.zMin) / Math.tan((35 * Math.PI) / 180) * 0.65

  const groundGeo = new THREE.PlaneGeometry(600, 600)
  groundGeo.rotateX(-Math.PI / 2)
  const groundMat = new THREE.MeshPhongMaterial({ color: 0xb8ccd8, shininess: 3 })
  const groundMesh = new THREE.Mesh(groundGeo, groundMat)
  groundMesh.position.set(mapObject.position.x, mapTopY - 5, mapObject.position.z)
  gScene.add(groundMesh)

  gScene.add(mapObject)
}

// ── Orbital planet background (no GLB — procedural sphere) ────
function setupOrbitalBackground(mapName) {
  const cfgMap = {
    terra:   { color: 0x0044bb, atmo: 0x2266cc, atmoOp: 0.15 },
    lua:     { color: 0x888888, atmo: null },
    marte:   { color: 0xb03a00, atmo: 0xff6622, atmoOp: 0.07 },
    jupiter: { color: 0xbb7744, atmo: 0xddaa66, atmoOp: 0.06 },
    neptuno: { color: 0x1a3a8c, atmo: 0x2255cc, atmoOp: 0.20 },
  }
  const cfg     = cfgMap[mapName] || { color: 0x446688 }
  const planetR = 200

  currentMapSkyColor = MAP_SKY_COLORS[mapName] ?? 0x010008

  // Planet center at the same depth as Terra so the camera (at mapTopY≈3)
  // stays outside the sphere radius 200 and the planet is fully visible.
  const pPos = new THREE.Vector3(0, -200, -45)

  // Main planet sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(planetR, 64, 32),
    new THREE.MeshPhongMaterial({ color: cfg.color, shininess: 15 })
  )
  sphere.frustumCulled = false
  sphere.position.copy(pPos)
  gScene.add(sphere)
  mapObject = sphere

  // Atmosphere glow
  if (cfg.atmo) {
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(planetR * 1.048, 32, 16),
      new THREE.MeshPhongMaterial({
        color: cfg.atmo, transparent: true, opacity: cfg.atmoOp,
        side: THREE.FrontSide, depthWrite: false,
      })
    )
    atmo.frustumCulled = false
    atmo.position.copy(pPos)
    gScene.add(atmo)
  }

  if (gCamera) { gCamera.far = 2000; gCamera.updateProjectionMatrix() }
  mapTopY      = 3
  mapRotationY = MAP_ROTATION[mapName] ?? 0.00018
  BOUNDS = { xMin: -30, xMax: 30, zMin: -20, zMax: 30 }
  pos.z           = BOUNDS.zMax * 0.85
  overheadTargetX = 0
  overheadTargetZ = 0
  overheadHeight  = Math.max(BOUNDS.xMax - BOUNDS.xMin, BOUNDS.zMax - BOUNDS.zMin) /
                    Math.tan((35 * Math.PI) / 180) * 0.60
  gScene.background = new THREE.Color(currentMapSkyColor)
}

function makeStarField(count, rMin, rRange, matOpts) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const phi   = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * Math.PI * 2
    const r     = rMin + Math.random() * rRange
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
    pos[i*3+2] = r * Math.cos(phi)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial(matOpts))
}

// ── Player ship setup (sync once GLTF is available) ───────
function setupPlayerMesh(gltf) {
  const shipData  = selectedShip || ships[0]
  const shipScale = shipData.scale * (isOrbitalMap(currentMapName) ? 0.20 : 0.24)
  playerMesh = gltf.scene
  playerMesh.scale.setScalar(shipScale)
  playerMesh.position.set(pos.x, mapTopY + 0.5, pos.z)
  playerMesh.rotation.set(shipData.rx, shipData.ry, shipData.rz)
  gScene.add(playerMesh)
}

// ─────────────────────────────────────────────────────────
// startGameScene(mapName, assets, skipCountdown)
//   assets       — preloaded bundle from preloadGameAssets (or null → async fallback)
//   skipCountdown — true when called from worldSelect (countdown already shown there)
// ─────────────────────────────────────────────────────────
function startGameScene(mapName, assets) {
  currentMapName = mapName
  if (assets) cachedAssets = assets
  const use = cachedAssets   // use cache for restarts too

  stopMusic()  // fade out any menu/previous music before game starts

  if (gameCanvas)  gameCanvas.style.display  = 'block'
  if (pauseBtn)    pauseBtn.style.display     = 'flex'
  if (prevRenderer) prevRenderer.setAnimationLoop(null)

  pos.x = 0; pos.z = 18; velX = 0; velZ = 0
  gameActive      = false
  countdownActive = false
  playerHP = playerMaxHP; score = 0; updateHUD()

  // Set altitude per planet
  const altMap = {
    terra: '408 KM', lua: '100 KM', marte: '300 KM',
    jupiter: '50.000 KM', neptuno: '4.700 KM'
  }
  const altEl = document.getElementById('hudAltitude')
  if (altEl) altEl.textContent = altMap[mapName] || '420 KM'
  // Reset game-feel state for new session (level/XP persist across games)
  shakeIntensity = 0; flashTimer = 0
  comboCount = 0; comboTimer = 0; killStreak = 0; killStreakTimer = 0
  updateXPDisplay()
  if (comboDisplayEl) comboDisplayEl.style.display = 'none'
  if (killStreakEl)   killStreakEl.style.display   = 'none'
  if (screenFlashEl)  screenFlashEl.style.opacity  = '0'
  if (bossWarningEl)  bossWarningEl.classList.remove('active')
  bossWarningActive = false
  for (const p of explosionParticles) { if (gScene) { gScene.remove(p.mesh); p.mesh.geometry.dispose(); p.mat.dispose() } }
  explosionParticles.length = 0
  if (hud) hud.style.display = 'flex'
  const hudNavEl = document.getElementById('hudNav')
  if (hudNavEl) hudNavEl.style.display = isOrbitalMap(mapName) ? 'flex' : 'none'

  // Reset entity arrays for fresh start
  enemies.length      = 0
  enemyBullets.length = 0
  bullets.length      = 0
  playerMesh   = null
  mapObject       = null
  mapTopY         = 0
  mapRotationY    = 0
  displayVelocity = 0

  // Reset wave state
  currentWave       = 0
  waveEnemiesSpawned = 0
  betweenWaves      = false
  betweenWavesTimer = 0
  bossActive        = false
  if (bossData) {
    if (bossData.hpBarEl && bossData.hpBarEl.parentNode) bossData.hpBarEl.remove()
    bossData = null
  }
  bossLasers.forEach(l => { if (gScene) { gScene.remove(l.mesh); gScene.remove(l.meshOut) } })
  bossLasers.length = 0
  bossBombs.forEach(b => { if (gScene) { gScene.remove(b.mesh); gScene.remove(b.warnMesh) } })
  bossBombs.length = 0

  // Reset trail
  for (const p of trailParticles) p.sprite.material.dispose()
  trailParticles.length = 0

  // Reset powerups
  for (const p of powerups) gScene && gScene.remove(p.mesh)
  powerups.length    = 0
  shieldMesh = null
  Object.keys(activePowerups).forEach(k => { activePowerups[k] = 0 })
  updatePowerupHUD()

  gScene = new THREE.Scene()
  gScene.background = new THREE.Color(0x06001a)
  initTrailTexture()

  gCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 500)
  gCamera.position.set(0, CAM_OFFSET_Y, CAM_OFFSET_Z)
  gCamera.lookAt(0, 0, -5)

  gRenderer = new THREE.WebGLRenderer({ canvas: gameCanvas, antialias: false })
  gRenderer.setSize(window.innerWidth, window.innerHeight)
  gRenderer.setPixelRatio(1)

  gScene.add(new THREE.AmbientLight(0xffffff, 1.8))
  const sun = new THREE.DirectionalLight(0xfff5e8, 3.5)
  sun.position.set(10, 20, 10)
  gScene.add(sun)
  // Second sun from the opposite side to illuminate the planet background
  const sunBack = new THREE.DirectionalLight(0xc8d8ff, 1.8)
  sunBack.position.set(-20, 10, -80)
  gScene.add(sunBack)

  starPoints = makeStarField(2200, 300, 80, { color: 0xffffff, size: 0.9 })
  gScene.add(starPoints)
  const starPoints2 = makeStarField(600, 180, 50, { color: 0xaaccff, size: 1.6, transparent: true, opacity: 0.7 })
  gScene.add(starPoints2)
  starPoints._layer2 = starPoints2

  if (use) {
    // ── Preloaded path: everything is synchronous, no stutter ──
    ships.forEach((s, i) => {
      if (use.shipGltfs[i]) shipGltfCache.set(s.path, use.shipGltfs[i])
    })
    if (use.mapGltf) {
      setupMap({ scene: use.mapGltf.scene.clone() })
    } else if (isOrbitalMap(currentMapName)) {
      setupOrbitalBackground(currentMapName)
    }
    const shipData   = selectedShip || ships[0]
    const shipIdx    = ships.indexOf(shipData)
    const playerGltf = use.shipGltfs[shipIdx]
    if (playerGltf) setupPlayerMesh({ scene: playerGltf.scene.clone() })

    if (playerMesh) {
      const sd = selectedShip || ships[0]
      gCamera.position.set(pos.x, playerMesh.position.y + sd.cam1Y, pos.z + sd.cam1Z)
      gCamera.lookAt(pos.x, playerMesh.position.y + sd.cam1Y, pos.z - 20)
    }
  } else {
    // ── Fallback: async loading (first run without preload) ────
    const mapPath = MAP_PATHS[currentMapName]
    if (mapPath) {
      new GLTFLoader().load(mapPath, setupMap, undefined,
        e => console.warn('Mapa não carregado:', e))
    } else if (isOrbitalMap(currentMapName)) {
      setupOrbitalBackground(currentMapName)
    }
    const shipData = selectedShip || ships[0]
    new GLTFLoader().load(shipData.path, setupPlayerMesh, undefined, console.error)
  }

  gameCanvas.addEventListener('touchstart', e => {
    tx = e.touches[0].clientX
    tz = e.touches[0].clientY
  }, { passive: true })

  gameCanvas.addEventListener('touchmove', e => {
    if (tx === null) return
    const dx = (e.touches[0].clientX - tx) / window.innerWidth  * 20
    const dz = (e.touches[0].clientY - tz) / window.innerHeight * 20
    pos.x = Math.max(BOUNDS.xMin, Math.min(BOUNDS.xMax, pos.x + dx * 0.4))
    pos.z = Math.max(BOUNDS.zMin, Math.min(BOUNDS.zMax, pos.z + dz * 0.4))
    tx = e.touches[0].clientX
    tz = e.touches[0].clientY
    e.preventDefault()
  }, { passive: false })

  window.addEventListener('resize', () => {
    gCamera.aspect = window.innerWidth / window.innerHeight
    gCamera.updateProjectionMatrix()
    gRenderer.setSize(window.innerWidth, window.innerHeight)
  })

  startCountdown(() => { gameActive = true; startWave(1) })
  startGameLoop()
}

// =========================
// GAME LOOP
// =========================
let currentLoopId = 0

function startGameLoop() {
  const id = ++currentLoopId
  function loop() {
    if (currentLoopId !== id) return  // stop stale loops from previous sessions
    requestAnimationFrame(loop)
    gameStep()
  }
  loop()
}

function gameStep() {

  if (isPaused || countdownActive) { gRenderer.render(gScene, gCamera); return }

  updateTrail()
  updatePowerups()
  updatePowerupHUD()
  updateExplosions()
  updateFlash()
  updateComboAndStreak()

  const leftHeld  = keys['ArrowLeft']  || keys['KeyA']
  const rightHeld = keys['ArrowRight'] || keys['KeyD']
  const upHeld    = keys['ArrowUp']    || keys['KeyW']
  const downHeld  = keys['ArrowDown']  || keys['KeyS']
  const movingNow = leftHeld || rightHeld || upHeld || downHeld

  const maxV = SPEED * 1.6
  if (leftHeld)  velX = Math.max(velX - ACCEL, -maxV)
  else if (rightHeld) velX = Math.min(velX + ACCEL,  maxV)
  else velX *= DRAG

  if (upHeld)   velZ = Math.max(velZ - ACCEL, -maxV)
  else if (downHeld) velZ = Math.min(velZ + ACCEL,  maxV)
  else velZ *= DRAG

  // snap to zero to avoid eternal micro-drift
  if (Math.abs(velX) < 0.0005) velX = 0
  if (Math.abs(velZ) < 0.0005) velZ = 0

  pos.x += velX; pos.z += velZ

  if (pos.x <= BOUNDS.xMin || pos.x >= BOUNDS.xMax) {
    pos.x = Math.max(BOUNDS.xMin, Math.min(BOUNDS.xMax, pos.x)); velX = 0
  }
  if (pos.z <= BOUNDS.zMin || pos.z >= BOUNDS.zMax) {
    pos.z = Math.max(BOUNDS.zMin, Math.min(BOUNDS.zMax, pos.z)); velZ = 0
  }

  // HUD velocity — driven by actual ship speed
  if (isOrbitalMap(currentMapName)) {
    const actualSpeed = Math.sqrt(velX * velX + velZ * velZ)
    displayVelocity = (actualSpeed / maxV) * 28000
    const velEl = document.getElementById('hudVelocity')
    if (velEl) velEl.textContent = Math.round(displayVelocity).toLocaleString('pt-PT') + ' km/h'
  }

  // ── Wave management ──────────────────────────────────────
  if (gameActive && !betweenWaves) {
    if (bossActive) {
      updateBoss()
    } else if (currentWave > 0) {
      const cfg = getWaveConfig(currentWave)
      waveSpawnTimer++
      if (waveSpawnTimer >= cfg.spawnInt && waveEnemiesSpawned < cfg.maxEnemies) {
        waveSpawnTimer = 0
        spawnEnemy()
        waveEnemiesSpawned++
      }
      if (waveEnemiesSpawned >= cfg.maxEnemies && enemies.length === 0) {
        betweenWaves      = true
        betweenWavesTimer = 180
        playMusic(getMusicForWave(currentWave + 1))  // transition immediately, no silence
      }
    }
  }
  if (betweenWaves) {
    betweenWavesTimer--
    if (betweenWavesTimer <= 0) { betweenWaves = false; startWave(currentWave + 1) }
  }

  // ── Update enemies ────────────────────────────────────────
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i]
    if (enemy.descending) {
      enemy.mesh.position.y += (enemy.targetY - enemy.mesh.position.y) * ENEMY_DESCENT_SPD
      if (Math.abs(enemy.mesh.position.y - enemy.targetY) < 0.05) {
        enemy.mesh.position.y = enemy.targetY
        enemy.descending = false
      }
      continue
    }
    enemy.time++
    PATTERNS[enemy.pattern](enemy)
    enemy.mesh.position.x = Math.max(BOUNDS.xMin, Math.min(BOUNDS.xMax, enemy.mesh.position.x))
    enemy.mesh.position.y = enemy.targetY
    enemy.shootTimer++
    if (enemy.shootTimer >= enemy.shootInt) {
      enemy.shootTimer = 0
      fireEnemyBullet(enemy)
    }
    if (enemy.mesh.position.z > BOUNDS.zMax + 15) {
      gScene.remove(enemy.mesh)
      enemies.splice(i, 1)
      if (gameActive && playerMesh && applyDamage(Math.ceil(playerMaxHP * 0.1))) return
    }
  }

  // ── Update enemy bullets ──────────────────────────────────
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i]
    b.mesh.position.x += b.dirX * b.speed
    b.mesh.position.z += b.dirZ * b.speed
    b.life--
    const pastLine = b.mesh.position.z > BOUNDS.zMax + 2
    if (b.life <= 0 || pastLine) {
      // Enemy bullets that miss deal no damage — only the enemy ship itself does on crossing
      gScene.remove(b.mesh)
      b.mesh.geometry.dispose()
      b.mesh.material.dispose()
      enemyBullets.splice(i, 1)
    }
  }

  // Atualizar balas
  if (shotCooldown > 0) shotCooldown--
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i]
    b.mesh.position.x += b.dirX * BULLET_SPEED
    b.mesh.position.z += b.dirZ * BULLET_SPEED
    b.life--
    if (b.life <= 0 || b.mesh.position.z < BOUNDS.zMin - 20) {
      gScene.remove(b.mesh)
      b.mesh.geometry.dispose()
      b.mesh.material.dispose()
      bullets.splice(i, 1)
    }
  }

  // Colisões
  if (!gameActive) { gRenderer.render(gScene, gCamera); return }

  outer: for (let bi = bullets.length - 1; bi >= 0; bi--) {
    const b = bullets[bi]
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const en = enemies[ei]
      if (en.descending) continue
      const dx = b.mesh.position.x - en.mesh.position.x
      const dz = b.mesh.position.z - en.mesh.position.z
      if (dx*dx + dz*dz < 3.24) {
        gScene.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose()
        bullets.splice(bi, 1)
        en.hp -= b.damage
        if (en.hp <= 0) {
          const dp = en.mesh.position.clone()
          gScene.remove(en.mesh)
          enemies.splice(ei, 1)
          score += 10; updateHUD()
          spawnExplosion(dp.x, dp.y, dp.z, 14, 0xff6600)
          spawnDamageNumber(dp.x, dp.y, dp.z, 10, false)
          triggerShake(0.18)
          triggerFlash('rgba(255,140,0,0.18)', 6)
          playSfx('explosion')
          addKill(10)
          if (Math.random() < POWERUP_DROP_CHANCE) spawnPowerup(dp.x, mapTopY + 0.5, dp.z)
        } else {
          spawnExplosion(b.mesh.position.x, b.mesh.position.y, b.mesh.position.z, 4, 0xffaa44)
          playSfx('hit')
        }
        continue outer
      }
    }
  }

  // Colisões: balas inimigas vs jogador
  if (playerMesh) {
    for (let bi = enemyBullets.length - 1; bi >= 0; bi--) {
      const b = enemyBullets[bi]
      const dx = b.mesh.position.x - playerMesh.position.x
      const dz = b.mesh.position.z - playerMesh.position.z
      if (dx*dx + dz*dz < 1.44) {
        gScene.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose()
        enemyBullets.splice(bi, 1)
        if (applyDamage(1)) return
      }
    }
  }

  if (playerMesh) {
    playerMesh.position.x += (pos.x - playerMesh.position.x) * 0.14
    playerMesh.position.z += (pos.z - playerMesh.position.z) * 0.14
    playerMesh.position.y  = mapTopY + 0.5

    const sd = selectedShip || ships[0]
    const rollTarget = (keys['ArrowLeft']||keys['KeyA']) ? 0.35 : (keys['ArrowRight']||keys['KeyD']) ? -0.35 : 0
    playerMesh.rotation.z += (rollTarget - playerMesh.rotation.z) * 0.1

    if (activeCam === 1) {
      const _cy = sd.cam1Y
      const _cz = sd.cam1Z
      gCamera.position.x = playerMesh.position.x
      gCamera.position.y = playerMesh.position.y + _cy
      gCamera.position.z = playerMesh.position.z + _cz
      gCamera.lookAt(playerMesh.position.x, playerMesh.position.y + _cy, playerMesh.position.z - 20)

    } else if (activeCam === 2) {
      const tx2 = playerMesh.position.x
      const tz2 = playerMesh.position.z + CAM_OFFSET_Z
      const ty2 = mapTopY + 0.5 + CAM_OFFSET_Y
      gCamera.position.x += (tx2 - gCamera.position.x) * 0.12
      gCamera.position.y += (ty2 - gCamera.position.y) * 0.12
      gCamera.position.z += (tz2 - gCamera.position.z) * 0.12
      gCamera.lookAt(playerMesh.position.x, isOrbitalMap(currentMapName) ? mapTopY - 5 : mapTopY + 0.5, playerMesh.position.z - 8)

    } else if (activeCam === 3) {
      gCamera.position.set(overheadTargetX, mapTopY + overheadHeight, overheadTargetZ)
      gCamera.lookAt(overheadTargetX, mapTopY, overheadTargetZ)
    }
  }

  // Planet self-rotation — rotates on X axis so surface moves backward as player flies forward
  if (mapObject && isOrbitalMap(currentMapName)) {
    mapObject.rotation.x += mapRotationY
  }

  // Stars follow camera — layer 1 locks, layer 2 parallax (slightly slower)
  if (starPoints) {
    starPoints.position.copy(gCamera.position)
    if (starPoints._layer2) {
      starPoints._layer2.position.x += (gCamera.position.x * 0.6 - starPoints._layer2.position.x) * 0.06
      starPoints._layer2.position.y += (gCamera.position.y * 0.6 - starPoints._layer2.position.y) * 0.06
      starPoints._layer2.position.z = gCamera.position.z
    }
  }

  // Apply screen shake (offset after all camera positioning)
  if (shakeIntensity > 0.005) {
    gCamera.position.x += (Math.random() - 0.5) * shakeIntensity
    gCamera.position.y += (Math.random() - 0.5) * shakeIntensity * 0.5
    shakeIntensity *= 0.86
    if (shakeIntensity < 0.005) shakeIntensity = 0
  }

  gRenderer.render(gScene, gCamera)
}
