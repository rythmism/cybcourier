// ============================================================================
// CYBER COURIER: RETRO PSEUDO-3D RUNNER CORE ENGINE LOGIC (engine.js)
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const width = 640;
const height = 480;
const horizon = height / 2;

let gameActive = false;
let currentScore = 0;
let distanceTraveled = 0;

let camZ = 0;
let camX = 0;
let playerX = 0;
let speed = 15;
let baseSpeed = 15;
const maxSpeed = 45;
const segmentLength = 200;
const totalSegments = 500;
let survivalTimeFrames = 0;
let backgroundScrollX = 0;
let paletteInterpolationTime = 0;

let segments = [];
let dynamicEntities = [];
let engineParticles = [];
let batteryItems = [];
const MAX_PARTICLES = 40;

let playerIdentityTag = "NEO";
const CRYPTO_SECRET_KEY = "CYBER_SECRET_KEY";

// 1. RETRO SOUND INTERFACE ENGINE (WEB AUDIO API)
class RetroAudioEngine {
    constructor() { this.ctx = null; }
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    playJumpSound() {
        this.init();
        let osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.15);
    }
    playSlideSound() {
        this.init();
        let bSize = this.ctx.sampleRate * 0.2, buffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate), data = buffer.getChannelData(0);
        for (let i = 0; i < bSize; i++) data[i] = Math.random() * 2 - 1;
        let noise = this.ctx.createBufferSource(); noise.buffer = buffer;
        let filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.2);
        let gain = this.ctx.createGain(); gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        noise.start();
    }
    playCrashSound() {
        this.init();
        let osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.5);
    }
}
const sfx = new RetroAudioEngine();

// 2. ASSET LOAD PIPELINE MANAGEMENT
class GameAssetPipeline {
    constructor() { this.sprites = {}; this.totalAssets = 0; this.loadedAssets = 0; }
    loadSprite(name, sourceUrl) {
        this.totalAssets++;
        const img = new Image(); img.src = sourceUrl;
        img.onload = () => { this.loadedAssets++; this.sprites[name] = img; this.verifyLoadingCompletion(); };
    }
    verifyLoadingCompletion() {
        if (this.loadedAssets === this.totalAssets) {
            console.log("All assets verified.");
            document.getElementById('bootButton').addEventListener('click', () => {
                const tagInput = document.getElementById('playerTag').value.trim().toUpperCase();
                if (tagInput.length === 3) playerIdentityTag = tagInput;
                sfx.init();
                document.getElementById('startMenu').style.display = 'none';
                gameActive = true;
                gameTick();
            });
        }
    }
}
const assets = new GameAssetPipeline();
assets.loadSprite('player_run', 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="32" height="64"><rect width="32" height="64" fill="%2300f0ff"/></svg>');
assets.loadSprite('road_barrier', 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="64" height="32"><rect width="64" height="32" fill="%23ff007f"/></svg>');

const batterySprite = new Image();
batterySprite.src = 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="32" height="32"><polygon points="16,0 32,16 24,16 24,32 8,32 8,16 0,16" fill="%2300f0ff"/></svg>';

// 3. HARDWARE INPUT MANAGERS (KEYBOARD, GAMEPAD, MOBILE TOUCH SCREEN)
const playerState = { laneX: 0, targetLaneX: 0, action: 'RUNNING', yOffset: 0, velocityY: 0 };
const playerBoundingBox = { width: 120, depth: 80 };

window.addEventListener('keydown', (e) => {
    if (!gameActive && (e.key === 'r' || e.key === 'R')) window.location.reload();
    switch(e.key) {
        case 'ArrowLeft': case 'a': case 'A': if (playerState.targetLaneX > -1) playerState.targetLaneX -= 1; break;
        case 'ArrowRight': case 'd': case 'D': if (playerState.targetLaneX < 1) playerState.targetLaneX += 1; break;
        case 'ArrowUp': case 'w': case 'W':
            if (playerState.action === 'RUNNING') { playerState.action = 'JUMPING'; playerState.velocityY = 25; sfx.playJumpSound(); } break;
        case 'ArrowDown': case 's': case 'S':
            if (playerState.action === 'RUNNING') { playerState.action = 'SLIDING'; sfx.playSlideSound(); } break;
    }
    if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', (e) => {
    if (['ArrowDown', 's', 'S'].includes(e.key) && playerState.action === 'SLIDING') playerState.action = 'RUNNING';
});

// Touch Zone Event Configurations
document.getElementById('zoneLeft').addEventListener('touchstart', (e) => { e.preventDefault(); if (playerState.targetLaneX > -1) playerState.targetLaneX -= 1; });
document.getElementById('zoneRight').addEventListener('touchstart', (e) => { e.preventDefault(); if (playerState.targetLaneX < 1) playerState.targetLaneX += 1; });
document.getElementById('zoneJump').addEventListener('touchstart', (e) => {
    e.preventDefault(); if (playerState.action === 'RUNNING') { playerState.action = 'JUMPING'; playerState.velocityY = 25; sfx.playJumpSound(); }
});
document.getElementById('zoneSlide').addEventListener('touchstart', (e) => { e.preventDefault(); if (playerState.action === 'RUNNING') { playerState.action = 'SLIDING'; sfx.playSlideSound(); } });
document.getElementById('zoneSlide').addEventListener('touchend', (e) => { e.preventDefault(); if (playerState.action === 'SLIDING') playerState.action = 'RUNNING'; });

let gamepadIndex = null;
let lastGamepadButtonState = { jump: false, slide: false, left: false, right: false };
window.addEventListener("gamepadconnected", (e) => { gamepadIndex = e.gamepad.index; });
window.addEventListener("gamepaddisconnected", (e) => { if (gamepadIndex === e.gamepad.index) gamepadIndex = null; });

function pollGamepadInputs() {
    if (gamepadIndex === null) return;
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (!gamepad) return;
    
    const axisLeftRight = gamepad.axes[0];
    const dpadLeft = gamepad.buttons[14]?.pressed;
    const dpadRight = gamepad.buttons[15]?.pressed;
    
    const inputLeft = axisLeftRight < -0.5 || dpadLeft;
    const inputRight = axisLeftRight > 0.5 || dpadRight;
    
    if (inputLeft && !lastGamepadButtonState.left && playerState.targetLaneX > -1) playerState.targetLaneX -= 1;
    if (inputRight && !lastGamepadButtonState.right && playerState.targetLaneX < 1) playerState.targetLaneX += 1;
    
    const jumpPressed = gamepad.buttons[0]?.pressed; // A/Cross Button
    const slidePressed = gamepad.buttons[1]?.pressed || gamepad.buttons[13]?.pressed; // B/Circle or D-pad Down
    
    if (jumpPressed && !lastGamepadButtonState.jump && playerState.action === 'RUNNING') { playerState.action = 'JUMPING'; playerState.velocityY = 25; sfx.playJumpSound(); }
    if (slidePressed && playerState.action === 'RUNNING') { playerState.action = 'SLIDING'; sfx.playSlideSound(); }
    else if (!slidePressed && playerState.action === 'SLIDING') playerState.action = 'RUNNING';
    
    lastGamepadButtonState = { left: inputLeft, right: inputRight, jump: jumpPressed, slide: slidePressed };
}

function updatePlayerPhysics() {
    playerState.laneX += (playerState.targetLaneX - playerState.laneX) * 0.2;
    playerX = playerState.laneX * 1200;
    if (playerState.action === 'JUMPING') {
        playerState.yOffset += playerState.velocityY; playerState.velocityY -= 1.5;
        if (playerState.yOffset <= 0) { playerState.yOffset = 0; playerState.velocityY = 0; playerState.action = 'RUNNING'; }
    }
}

// 4. ROAD ENGINE PARALLAX & DYNAMIC MATRICES
const STAGE_PALETTES = {
    TWILIGHT: { roadA: '#111111', roadB: '#222222', neonA: '#ff007f', neonB: '#00f0ff' },
    MIDNIGHT: { roadA: '#05050d', roadB: '#0d0d1a', neonA: '#7900ff', neonB: '#00ff66' }
};

for (let i = 0; i < totalSegments; i++) {
    segments.push({ index: i, z1: i * segmentLength, z2: (i + 1) * segmentLength, curve: 0, worldY: 0, color: '#111', lineColor: '#ff007f' });
}

function processDynamicPaletteShift() {
    paletteInterpolationTime += 0.001;
    let mixFactor = (Math.sin(paletteInterpolationTime) + 1) / 2;
    const mixColors = (color1, color2, weight) => {
        let c1 = parseInt(color1.substring(1), 16), c2 = parseInt(color2.substring(1), 16);
        let r = Math.round(((c1 >> 16) * (1 - weight)) + ((c2 >> 16) * weight));
        let g = Math.round((((c1 >> 8) & 0x00ff) * (1 - weight)) + (((c2 >> 8) & 0x00ff) * weight));
        let b = Math.round(((c1 & 0x0000ff) * (1 - weight)) + ((c2 & 0x0000ff) * weight));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };
    for (let i = 0; i < totalSegments; i++) {
        let isEven = Math.floor(i / 3) % 2 === 0;
        segments[i].color = mixColors(isEven ? STAGE_PALETTES.TWILIGHT.roadA : STAGE_PALETTES.TWILIGHT.roadB, isEven ? STAGE_PALETTES.MIDNIGHT.roadA : STAGE_PALETTES.MIDNIGHT.roadB, mixFactor);
        segments[i].lineColor = mixColors(isEven ? STAGE_PALETTES.TWILIGHT.neonA : STAGE_PALETTES.TWILIGHT.neonB, isEven ? STAGE_PALETTES.MIDNIGHT.neonA : STAGE_PALETTES.MIDNIGHT.neonB, mixFactor);
    }
}

function renderParallaxSkyline(currentCamZ) {
    ctx.fillStyle = '#140526'; ctx.fillRect(0, 0, width, horizon);
    let startSegment = Math.floor(currentCamZ / segmentLength);
    let activeSegment = segments[startSegment % totalSegments];
    if (activeSegment && activeSegment.curve !== 0) backgroundScrollX += activeSegment.curve * 1.5;
    ctx.fillStyle = '#2a085c';
    for (let i = -1; i < 3; i++) {
        let bgX = (i * 320) - (backgroundScrollX * 0.2) % 320;
        ctx.beginPath(); ctx.moveTo(bgX, horizon); ctx.lineTo(bgX + 30, horizon - 80); ctx.lineTo(bgX + 70, horizon - 80);
        ctx.lineTo(bgX + 110, horizon - 120); ctx.lineTo(bgX + 160, horizon - 40); ctx.lineTo(bgX + 220, horizon - 90);
        ctx.lineTo(bgX + 320, horizon); ctx.fill();
    }
}

function project(worldX, worldY, worldZ, cameraX, cameraY, cameraZ, fov) {
    const scale = fov / (worldZ - cameraZ);
    return {
        x: Math.round((width / 2) + (worldX - cameraX) * scale * (width / 2)),
        y: Math.round((height / 2) - (worldY - cameraY) * scale * (height / 2)),
        w: Math.round(scale * width)
    };
}

function drawPerspectiveTrack() {
    renderParallaxSkyline(camZ);
    let startSegment = Math.floor(camZ / segmentLength);
    let runningCurve = 0, curveAccumulator = 0;
    camX = playerX - runningCurve;

    for (let n = 100; n > 0; n--) {
        let segment = segments[(startSegment + n) % totalSegments];
        if (!segment) continue;
        curveAccumulator += runningCurve; runningCurve += segment.curve;
        let p1 = project(-curveAccumulator, segment.worldY, segment.z1, camX, 1500, camZ, 0.8);
        
        let nextSegment = segments[(startSegment + n + 1) % totalSegments];
        let nextWorldY = nextSegment ? nextSegment.worldY : 0;
        let p2 = project(-(curveAccumulator + runningCurve), nextWorldY, segment.z2, camX, 1500, camZ, 0.8);
        
        if (p1.y <= horizon || p2.y <= horizon || p2.y <= p1.y) continue;
        ctx.fillStyle = segment.color; ctx.beginPath(); ctx.moveTo(p1.x - p1.w, p1.y); ctx.lineTo(p2.x - p2.w, p2.y);
        ctx.lineTo(p2.x + p2.w, p2.y); ctx.lineTo(p1.x + p1.w, p1.y); ctx.fill();
        
        ctx.strokeStyle = segment.lineColor; ctx.lineWidth = Math.max(1, (p1.y - horizon) / 20);
        ctx.beginPath(); ctx.moveTo(p1.x - p1.w, p1.y); ctx.lineTo(p2.x - p2.w, p2.y);
        ctx.moveTo(p1.x + p1.w, p1.y); ctx.lineTo(p2.x + p2.w, p2.y); ctx.stroke();
    }
}

// 5. PROCEDURAL TRACK GENERATION
let trackGenerationIndex = totalSegments;
function spawnObstacle(segmentIndex, laneX) {
    dynamicEntities.push({ segmentIndex: segmentIndex, gridX: laneX, worldZ: segmentIndex * 200, width: 160, height: 120, depth: 50, type: Math.random() > 0.5 ? 'barrier' : 'low-sign' });
}
function spawnBatteryPack(segmentIndex, laneX) {
    batteryItems.push({ segmentIndex: segmentIndex, gridX: laneX, worldZ: segmentIndex * 200, width: 80, height: 80, collected: false });
}

function appendTrackChunk() {
    const types = ['STRAIGHT', 'LEFT_CURVE', 'RIGHT_CURVE', 'HILLY'], chosenType = types[Math.floor(Math.random() * types.length)];
    const chunkLength = 40 + Math.floor(Math.random() * 40);
    let curveIntensity = chosenType === 'LEFT_CURVE' ? -3 : (chosenType === 'RIGHT_CURVE' ? 3 : 0);
    for (let i = 0; i < chunkLength; i++) {
        let gIdx = trackGenerationIndex + i, tIdx = gIdx % totalSegments;
        let hIntensity = chosenType === 'HILLY' ? Math.sin((i / chunkLength) * Math.PI) * 800 : 0;
        segments[tIdx] = { index: gIdx, z1: gIdx * segmentLength, z2: (gIdx + 1) * segmentLength, curve: curveIntensity * Math.sin((i / chunkLength) * Math.PI), worldY: hIntensity, color: '#111', lineColor: '#ff007f' };
        if (i > 5 && i < chunkLength - 5 && Math.random() < 0.08) {
            let rLane = Math.floor(Math.random() * 3) - 1;
            if (Math.random() > 0.3) spawnObstacle(tIdx, rLane); else spawnBatteryPack(tIdx, rLane);
        }
    }
    trackGenerationIndex += chunkLength;
}
function processTrackBuffer(currentCamZ) { if (trackGenerationIndex - Math.floor(currentCamZ / segmentLength) < 150) appendTrackChunk(); }

// 6. COLLISION ENGINE METRICS & SPRITE SCALERS
function verifyEntityCollisions(currentCamZ, playerLaneShiftX, playerActionState) {
    let activeSegment = Math.floor(currentCamZ / 200) % totalSegments;
    for (let i = 0; i < dynamicEntities.length; i++) {
        let item = dynamicEntities[i]; if (item.worldZ < currentCamZ) continue;
        if (item.segmentIndex === activeSegment) {
            let xOverlap = Math.abs((playerLaneShiftX * 1000) - (item.gridX * 1000)) < (playerBoundingBox.width + item.width) / 2;
            let zOverlap = Math.abs(currentCamZ - item.worldZ) < (playerBoundingBox.depth + item.depth) / 2;
            if (xOverlap && zOverlap) {
                if (item.type === 'barrier' && playerActionState === 'JUMPING') continue;
                if (item.type === 'low-sign' && playerActionState === 'SLIDING') continue;
                return true;
            }
        }
    }
    return false;
}

function verifyItemPickups(currentCamZ, playerLaneShiftX) {
    let activeSegment = Math.floor(currentCamZ / 200) % totalSegments;
    for (let i = 0; i < batteryItems.length; i++) {
        let item = batteryItems[i]; if (item.collected || item.worldZ < currentCamZ) continue;
        if (item.segmentIndex === activeSegment) {
            let xOverlap = Math.abs((playerLaneShiftX * 1000) - (item.gridX * 1000)) < (playerBoundingBox.width + item.width) / 2;
            let zOverlap = Math.abs(currentCamZ - item.worldZ) < (playerBoundingBox.depth + 100) / 2;
            if (xOverlap && zOverlap && playerState.action !== 'SLIDING') {
                item.collected = true; currentScore += 5000; sfx.playJumpSound(); triggerScreenShake(100);
            }
        }
    }
}

function renderDynamicEntities(currentCamZ, cameraX, horizonLineY) {
    let startSegment = Math.floor(currentCamZ / segmentLength), totalCurveOffset = 0;
    for (let i = 0; i < 100; i++) {
        let segIndex = (startSegment + i) % totalSegments, segment = segments[segIndex];
        if (!segment) continue;
        totalCurveOffset += segment.curve;
        dynamicEntities.filter(e => e.segmentIndex === segIndex).forEach(entity => {
            let relZ = entity.worldZ - currentCamZ; if (relZ  horizonLineY && screenX - sW/2 + sW > 0 && screenX - sW/2 < width) {
                ctx.drawImage(assets.sprites['road_barrier'], screenX - sW / 2, screenY - sH, sW, sH);
            }
        });
    }
}

function renderBatteryItems(currentCamZ, cameraX) {
    let startSegment = Math.floor(currentCamZ / segmentLength), totalCurveOffset = 0;
    for (let i = 0; i < 100; i++) {
        let segIndex = (startSegment + i) % totalSegments, segment = segments[segIndex];
        if (!segment) continue;
        totalCurveOffset += segment.curve;
        batteryItems.filter(b => b.segmentIndex === segIndex && !b.collected).forEach(item => {
            let relZ = item.worldZ - currentCamZ; if (relZ <= 0) return;
            const fovScale = 0.8 / relZ, pScale = fovScale * (width / 2);
            let screenX = Math.round((width / 2) + ((item.gridX * 1200) - totalCurveOffset - cameraX) * pScale);
            let screenY = Math.round((height / 2) - (segment.worldY - 1500) * fovScale * (height / 2));
            let sW = Math.round(item.width * pScale * 2), sH = Math.round(item.height * pScale * 2);
            let dY = screenY - sH - (Math.sin(survivalTimeFrames * 0.1) * 10);
            if (screenY > horizon) ctx.drawImage(batterySprite, screenX - sW / 2, dY, sW, sH);
        });
    }
}

// 7. PARTICLE TRAIL ENGINES
function updateAndRenderParticles() {
    if (engineParticles.length < MAX_PARTICLES && Math.random() < 0.4) {
        engineParticles.push({ worldX: (Math.random() - 0.5) * 4000, worldY: Math.random() * 1000, worldZ: camZ + 3000, length: 50 + Math.random() * 100, color: Math.random() > 0.5 ? '#ff007f' : '#00f0ff' });
    }
    for (let i = engineParticles.length - 1; i >= 0; i--) {
        let p = engineParticles[i]; if (p.worldZ <= camZ) { engineParticles.splice(i, 1); continue; }
        let scale = 0.8 / (p.worldZ - camZ);
        let sX = Math.round((width / 2) + (p.worldX - camX) * scale * (width / 2)), sY = Math.round((height / 2) - (p.worldY - 1500) * scale * (height / 2));
        let sLen = p.length * scale * 5;
        if (sX >= 0 && sX <= width && sY >= horizon && sY <= height) {
            ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(1, scale * 8);
            ctx.beginPath(); ctx.moveTo(sX, sY); ctx.lineTo(sX, sY + sLen); ctx.stroke();
        }
    }
}
function generateSlideFrictionParticles() {
    if (playerState.action !== 'SLIDING' || Math.random() >= 0.6) return;
    engineParticles.push({ worldX: playerX + (Math.random() - 0.5) * 300, worldY: 5, worldZ: camZ + 80, length: 10 + Math.random() * 20, color: '#00f0ff' });
}
function triggerScreenShake(durationMs) {
    const sEl = document.getElementById('screen'); sEl.classList.add('screen-glitch-active');
    setTimeout(() => { sEl.classList.remove('screen-glitch-active'); }, durationMs);
}

// 8. METRICS DISPLAY & DEBUG PLOTS
function renderDebugHitboxes() {
    let pScreenX = (width / 2) + (playerX - camX) * (0.8 / 200) * (width / 2), pScreenY = height - 40 - playerState.yOffset;
    ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2;
    ctx.strokeRect(pScreenX - (playerBoundingBox.width / 2), pScreenY - 120, playerBoundingBox.width, playerState.action === 'SLIDING' ? 60 : 120);
    
    let startSegment = Math.floor(camZ / segmentLength), totalCurveOffset = 0;
    for (let i = 0; i < 100; i++) {
        let segIndex = (startSegment + i) % totalSegments, segment = segments[segIndex]; 
        if (!segment) continue;
        totalCurveOffset += segment.curve;
        dynamicEntities.filter(e => e.segmentIndex === segIndex).forEach(entity => {
            let relZ = entity.worldZ - camZ; if (relZ <= 0 || relZ > 4000) return;
            const fovScale = 0.8 / relZ;
            let sX = Math.round((width / 2) + ((entity.gridX * 1200) - totalCurveOffset - camX) * fovScale * (width / 2));
            let sY = Math.round((height / 2) - (segment.worldY - 1500) * fovScale * (height / 2));
            let bW = Math.round(entity.width * fovScale * (width / 2) * 2), bH = Math.round(entity.height * fovScale * (height / 2) * 2);
            ctx.strokeStyle = '#ff007f'; ctx.strokeRect(sX - (bW / 2), sY - bH, bW, bH);
        });
    }
}

function renderHeadsUpDisplay() {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.75)'; ctx.fillRect(0, 0, width, 50);
    ctx.strokeStyle = '#ff007f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(width, 50); ctx.stroke();
    ctx.fillStyle = '#ff007f'; ctx.font = '16px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${String(currentScore).padStart(6, '0')}`, 20, 30);
    ctx.fillText(`DIST: ${distanceTraveled}M`, 180, 30);
    ctx.textAlign = 'right'; ctx.fillStyle = '#00f0ff';
    ctx.fillText(`SPEED: ${Math.floor(speed * 8)} KPBS`, width - 180, 30);
    ctx.fillText(`STATE: ${playerState.action}`, width - 20, 30);
}

// 9. ASYNCHRONOUS HMAC CRYPTO ANTI-CHEAT PACKETS
async function generateSecurePayloadSignature(playerTag, finalScore, secretKey) {
    const message = `${playerTag}:${finalScore}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const msgData = encoder.encode(message);
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
    return Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Local non-blocking storage handling loops
function queueScoreOffline(playerTag, score) {
    let queuedScores = [];
    try {
        queuedScores = JSON.parse(localStorage.getItem('cyber_courier_offline_queue')) || [];
    } catch (e) {
        queuedScores = [];
    }
    
    queuedScores.push({
        name: playerTag,
        score: parseInt(score),
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('cyber_courier_offline_queue', JSON.stringify(queuedScores));
    console.warn("[OFFLINE CACHE] System data stream disconnected. Saved score locally to local queue.");
}

async function flushOfflineScoreQueue() {
    let queuedScores = [];
    try {
        queuedScores = JSON.parse(localStorage.getItem('cyber_courier_offline_queue')) || [];
    } catch (e) {
        return;
    }
    
    if (queuedScores.length === 0) return;
    console.log(`[SYNC ENGINE] Network restored. Pushing ${queuedScores.length} records...`);
    
    // Process local array buffers sequentially
    for (let i = queuedScores.length - 1; i >= 0; i--) {
        const item = queuedScores[i];
        try {
            const sig = await generateSecurePayloadSignature(item.name, item.score, CRYPTO_SECRET_KEY);
            const res = await fetch('/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Payload-Signature': sig },
                body: JSON.stringify({ name: item.name, score: item.score })
            });
            
            if (res.ok) {
                queuedScores.splice(i, 1); // Evict confirmed record item from buffer memory array
            }
        } catch (err) {
            console.error("[SYNC ENGINE] Transmission retry loop aborted. Connection still unstable:", err);
            break; // Stop execution loops until standard online signals reset network parameters
        }
    }
    
    localStorage.setItem('cyber_courier_offline_queue', JSON.stringify(queuedScores));
}

// Intercept standard application runtime connections to send payload blocks securely
async function saveScoreToDatabase(playerTag, score) {
    if (!navigator.onLine) {
        queueScoreOffline(playerTag, score);
        return;
    }

    try {
        const sig = await generateSecurePayloadSignature(playerTag, score, CRYPTO_SECRET_KEY);
        const res = await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Payload-Signature': sig },
            body: JSON.stringify({ name: playerTag, score: parseInt(score) })
        });
        
        if (!res.ok) {
            queueScoreOffline(playerTag, score);
        }
    } catch (err) {
        queueScoreOffline(playerTag, score);
    }
}

// Hardware network tracking event signals hooks
window.addEventListener('online', flushOfflineScoreQueue);


function processPersonalBestScores(finalScore) {
    let previousRecord = localStorage.getItem('cyber_courier_pb');
    let isNewRecord = !previousRecord || finalScore > parseInt(previousRecord);
    if (isNewRecord) localStorage.setItem('cyber_courier_pb', finalScore);
    let currentRecordValue = localStorage.getItem('cyber_courier_pb');

    ctx.fillStyle = 'rgba(5, 5, 16, 0.9)'; ctx.fillRect(50, 80, width - 100, height - 160);
    ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 3; ctx.strokeRect(50, 80, width - 100, height - 160);
    ctx.fillStyle = '#ff007f'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center'; ctx.fillText('CONNECTION TERMINATED', width / 2, 140);
    ctx.fillStyle = '#fff'; ctx.font = '18px monospace';
    ctx.fillText(`FINAL PERFORMANCE: ${String(finalScore).padStart(6, '0')}`, width / 2, 210);
    ctx.fillText(`SYSTEM TRACK RECOGNITION: ${playerIdentityTag}`, width / 2, 250);
    if (isNewRecord) { ctx.fillStyle = '#0

