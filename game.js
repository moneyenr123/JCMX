// JCMX – Dirt Bike Hillclimb
// Hill Climb–style physics, flips, multiple levels

// CANVAS
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// BIKE SPRITE
const baseBike = new Image();
baseBike.src = "bike.png"; // optional; fallback drawing if missing

const bikeColors = {
    xk: "#00ff4a", // Kawasaki green
    rc: "#ff6a00", // KTM orange
    ym: "#0074ff"  // Yamaha blue
};

let currentBike = "xk";
let currentStroke = 2;

// HUD ELEMENTS
const brandLabel = document.getElementById("brandLabel");
const strokeLabel = document.getElementById("strokeLabel");
const speedLabel = document.getElementById("speedLabel");
const flipLabel = document.getElementById("flipLabel");
const distanceLabel = document.getElementById("distanceLabel");
const bestDistanceLabel = document.getElementById("bestDistanceLabel");
const levelLabel = document.getElementById("hud-level-label");
const statusLabel = document.getElementById("hud-status-label");
const levelSelect = document.getElementById("levelSelect");

// OVERLAY ELEMENTS
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");
const overlayLevelName = document.getElementById("overlay-level-name");
const overlayDistance = document.getElementById("overlay-distance");
const overlayFlips = document.getElementById("overlay-flips");
const overlayBestDistance = document.getElementById("overlay-best-distance");

// INPUT
let keys = {};
document.addEventListener("keydown", e => {
    keys[e.code] = true;

    if (e.code === "Space") {
        if (gameState === "crashed" || gameState === "finished") {
            resetBike();
            hideOverlay();
        }
    }
});

document.addEventListener("keyup", e => {
    keys[e.code] = false;
});

// BUTTONS
document.querySelectorAll(".hud-btn[data-bike]").forEach(btn => {
    btn.onclick = () => {
        currentBike = btn.dataset.bike;
        updateLabels();
    };
});

document.querySelectorAll(".hud-btn[data-stroke]").forEach(btn => {
    btn.onclick = () => {
        currentStroke = Number(btn.dataset.stroke);
        updateLabels();
    };
});

levelSelect.addEventListener("change", () => {
    const idx = Number(levelSelect.value);
    loadLevel(idx);
});

// GAME STATE
let gameState = "running"; // "running" | "crashed" | "finished"
let bestDistance = 0;

// LEVELS
const levels = [
    { name: "Hills 1", length: 4000, amp: 40, jumpAmp: 15, noiseScale: 0.008, seed: 123 },
    { name: "Hills 2", length: 5000, amp: 55, jumpAmp: 20, noiseScale: 0.009, seed: 456 },
    { name: "Big Jumps", length: 4500, amp: 25, jumpAmp: 45, noiseScale: 0.012, seed: 789 },
    { name: "Whoops", length: 3500, amp: 15, jumpAmp: 35, noiseScale: 0.02, seed: 321 },
    { name: "Steep Climb", length: 3000, amp: 70, jumpAmp: 10, noiseScale: 0.007, seed: 654 },
    { name: "MX Track", length: 4200, amp: 30, jumpAmp: 30, noiseScale: 0.011, seed: 987 },
    { name: "Sand Dunes", length: 4800, amp: 50, jumpAmp: 25, noiseScale: 0.009, seed: 135 },
    { name: "Night Ride", length: 3800, amp: 35, jumpAmp: 18, noiseScale: 0.01, seed: 246 },
    { name: "Rocky Climb", length: 3200, amp: 65, jumpAmp: 22, noiseScale: 0.013, seed: 579 },
    { name: "Mega Hill", length: 6000, amp: 80, jumpAmp: 35, noiseScale: 0.007, seed: 864 }
];

let currentLevelIndex = 0;

// WORLD / TERRAIN
const world = {
    segments: [],
    baseY: 380
};

function pseudoNoise(n, seed) {
    return Math.sin(n + seed) + 0.5 * Math.sin(2.3 * n + seed * 0.37);
}

function generateTerrainForLevel(levelIndex) {
    const level = levels[levelIndex];
    world.segments = [];

    for (let x = 0; x <= level.length; x += 8) {
        const n = pseudoNoise(x * level.noiseScale, level.seed);
        const height = n * level.amp;
        const jump = Math.sin(x * 0.02) * level.jumpAmp;
        const y = world.baseY - height - jump;
        world.segments.push({ x, y });
    }
}

function loadLevel(index) {
    currentLevelIndex = index;
    const level = levels[index];
    levelLabel.textContent = "Level: " + level.name;
    generateTerrainForLevel(index);
    resetBike();
}

// BIKE PHYSICS
const bike = {
    x: 50,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    crashed: false,
    flips: 0,
    lastAngleForFlip: 0,
    distance: 0
};

const physics = {
    gravity: 0.6,
    enginePower2T: 0.22,
    enginePower4T: 0.30,
    brakeForce: 0.18,
    maxSpeed: 12,
    airTilt: 0.015,
    groundFriction: 0.02
};

function getEnginePower() {
    return currentStroke === 2 ? physics.enginePower2T : physics.enginePower4T;
}

// CAMERA
const camera = { x: 0 };

function updateCamera() {
    const target = bike.x - canvas.width * 0.35;
    camera.x += (target - camera.x) * 0.08;
}

// TERRAIN HELPERS
function getGroundYAt(x) {
    const segs = world.segments;
    if (segs.length === 0) return world.baseY;

    if (x <= segs[0].x) return segs[0].y;
    if (x >= segs[segs.length - 1].x) return segs[segs.length - 1].y;

    for (let i = 0; i < segs.length - 1; i++) {
        const s1 = segs[i];
        const s2 = segs[i + 1];
        if (x >= s1.x && x <= s2.x) {
            const t = (x - s1.x) / (s2.x - s1.x);
            return s1.y + (s2.y - s1.y) * t;
        }
    }
    return world.baseY;
}

function getGroundAngleAt(x) {
    const delta = 5;
    const y1 = getGroundYAt(x - delta);
    const y2 = getGroundYAt(x + delta);
    return Math.atan2(y2 - y1, 2 * delta);
}

// ENGINE SOUND (placeholder)
let engineSoundTimer = 0;
function engineSound(dt) {
    engineSoundTimer += dt;
    if (engineSoundTimer > 300) {
        engineSoundTimer = 0;
        if (currentStroke === 2) {
            console.log("2‑stroke BRAAAP");
        } else {
            console.log("4‑stroke THUMP");
        }
    }
}

// GAME STATE HELPERS
function normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
}

function resetBike() {
    const startX = 50;
    bike.x = startX;
    bike.y = getGroundYAt(startX) - 20;
    bike.vx = 0;
    bike.vy = 0;
    bike.angle = 0;
    bike.angularVelocity = 0;
    bike.crashed = false;
    bike.flips = 0;
    bike.lastAngleForFlip = 0;
    bike.distance = 0;
    camera.x = 0;
    gameState = "running";
    statusLabel.textContent = "Status: Riding";
}

function crashGame() {
    if (gameState === "crashed") return;
    gameState = "crashed";
    statusLabel.textContent = "Status: Crashed";
    overlayTitle.textContent = "You Crashed";
    overlayMessage.innerHTML = "Press <strong>Space</strong> to restart this level.";
    updateOverlayStats();
    showOverlay();
}

function finishLevel() {
    if (gameState === "finished") return;
    gameState = "finished";
    statusLabel.textContent = "Status: Finished";
    overlayTitle.textContent = "Level Complete";
    overlayMessage.innerHTML = "Nice ride. Press <strong>Space</strong> to ride again.";
    updateOverlayStats();
    showOverlay();
}

function updateOverlayStats() {
    const level = levels[currentLevelIndex];
    overlayLevelName.textContent = level.name;
    overlayDistance.textContent = bike.distance.toFixed(1) + " m";
    overlayFlips.textContent = String(bike.flips);
    overlayBestDistance.textContent = bestDistance.toFixed(1) + " m";
}

function showOverlay() {
    overlay.classList.remove("hidden");
}

function hideOverlay() {
    overlay.classList.add("hidden");
}

// LABELS / HUD
function updateLabels() {
    const brandNames = {
        xk: "XK 85",
        rc: "RC 85",
        ym: "YM 85"
    };
    brandLabel.textContent = brandNames[currentBike] || "XK 85";
    strokeLabel.textContent = currentStroke === 2 ? "2‑Stroke" : "4‑Stroke";
}

// UPDATE LOOP
let lastTime = performance.now();

function update(dt) {
    if (gameState !== "running") return;

    const throttle = keys["ArrowUp"] ? 1 : 0;
    const brake = keys["ArrowDown"] ? 1 : 0;

    const enginePower = getEnginePower();
    bike.vx += throttle * enginePower;
    bike.vx -= brake * physics.brakeForce * Math.sign(bike.vx);

    if (bike.vx > physics.maxSpeed) bike.vx = physics.maxSpeed;
    if (bike.vx < -physics.maxSpeed * 0.4) bike.vx = -physics.maxSpeed * 0.4;

    bike.vy += physics.gravity;

    bike.x += bike.vx;
    bike.y += bike.vy;

    const groundY = getGroundYAt(bike.x);
    const groundAngle = getGroundAngleAt(bike.x);

    const wheelRadius = 18;
    const bikeBottomY = bike.y + wheelRadius;

    if (bikeBottomY > groundY) {
        bike.y = groundY - wheelRadius;
        bike.vy = 0;

        const angleDiff = groundAngle - bike.angle;
        bike.angle += angleDiff * 0.3;
        bike.angularVelocity *= 0.5;

        bike.vx *= (1 - physics.groundFriction);
    } else {
        if (keys["ArrowLeft"]) bike.angularVelocity -= physics.airTilt;
        if (keys["ArrowRight"]) bike.angularVelocity += physics.airTilt;
        bike.angle += bike.angularVelocity;
        bike.angularVelocity *= 0.995;
    }

    const normalizedAngle = ((bike.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const prevNorm = ((bike.lastAngleForFlip % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    if (prevNorm < Math.PI && normalizedAngle >= Math.PI) {
        bike.flips++;
    } else if (prevNorm > Math.PI && normalizedAngle <= Math.PI) {
        bike.flips++;
    }
    bike.lastAngleForFlip = bike.angle;

    if (bikeBottomY >= groundY - 1) {
        const diff = Math.abs(normalizeAngle(bike.angle - groundAngle));
        if (diff > Math.PI / 2 + 0.4) {
            bike.crashed = true;
            crashGame();
        }
    }

    bike.distance = Math.max(bike.distance, bike.x / 10);
    if (bike.distance > bestDistance) {
        bestDistance = bike.distance;
    }

    const level = levels[currentLevelIndex];
    if (bike.x >= level.length - 40) {
        finishLevel();
    }

    engineSound(dt);
}

// DRAW
function drawTerrain() {
    ctx.save();
    ctx.translate(-camera.x, 0);

    const segs = world.segments;
    if (segs.length > 0) {
        ctx.beginPath();
        ctx.moveTo(segs[0].x, canvas.height);
        for (let i = 0; i < segs.length; i++) {
            const s = segs[i];
            ctx.lineTo(s.x, s.y);
        }
        ctx.lineTo(segs[segs.length - 1].x, canvas.height);
        ctx.closePath();

        const grd = ctx.createLinearGradient(0, 250, 0, canvas.height);
        grd.addColorStop(0, "#2b2b2b");
        grd.addColorStop(1, "#050505");
        ctx.fillStyle = grd;
        ctx.fill();
    }

    const sky = ctx.createLinearGradient(0, 0, 0, 260);
    sky.addColorStop(0, "#0b0f1a");
    sky.addColorStop(1, "#111111");
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = sky;
    ctx.fillRect(camera.x - 2000, 0, canvas.width + 4000, 260);
    ctx.globalCompositeOperation = "source-over";

    ctx.restore();
}

function drawBike() {
    ctx.save();
    const screenX = bike.x - camera.x;
    const screenY = bike.y;

    ctx.translate(screenX, screenY);
    ctx.rotate(bike.angle);

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(-30, 18, 18, 0, Math.PI * 2);
    ctx.arc(30, 18, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-30, 18, 10, 0, Math.PI * 2);
    ctx.arc(30, 18, 10, 0, Math.PI * 2);
    ctx.stroke();

    if (baseBike.complete && baseBike.naturalWidth > 0) {
        const tint = bikeColors[currentBike] || "#ffffff";
        ctx.drawImage(baseBike, -60, -50, 120, 80);
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = tint;
        ctx.fillRect(-60, -50, 120, 80);
        ctx.globalCompositeOperation = "source-over";
    } else {
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.lineTo(0, -20);
        ctx.lineTo(40, 0);
        ctx.stroke();
    }

    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.arc(-5, -40, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-10, -30, 20, 25);

    ctx.restore();
}

function drawHUD() {
    speedLabel.textContent = Math.abs(bike.vx * 8).toFixed(0) + " km/h";
    flipLabel.textContent = String(bike.flips);
    distanceLabel.textContent = bike.distance.toFixed(1) + " m";
    bestDistanceLabel.textContent = bestDistance.toFixed(1) + " m";
}

// MAIN LOOP
function loop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);
    updateCamera();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTerrain();
    drawBike();
    drawHUD();

    requestAnimationFrame(loop);
}

// INIT
updateLabels();
loadLevel(0);
requestAnimationFrame(loop);
