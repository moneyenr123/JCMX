// JCMX – Hillclimb‑style dirt bike game
// moneyenr123 special edition

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// -----------------------------
// BIKE SPRITE
// -----------------------------
const baseBike = new Image();
baseBike.src = "bike.png"; // your KX85-style side view

const bikeColors = {
    xk: "#00ff4a", // Kawasaki green
    rc: "#ff6a00", // KTM orange
    ym: "#0074ff"  // Yamaha blue
};

let currentBike = "xk";
let currentStroke = 2;

// -----------------------------
// HUD ELEMENTS
// -----------------------------
const brandLabel = document.getElementById("brandLabel");
const strokeLabel = document.getElementById("strokeLabel");
const speedLabel = document.getElementById("speedLabel");
const flipLabel = document.getElementById("flipLabel");
const distanceLabel = document.getElementById("distanceLabel");

// -----------------------------
// INPUT
// -----------------------------
let keys = {};
document.addEventListener("keydown", e => {
    keys[e.code] = true;
    if (e.code === "Space") resetIfCrashed();
});
document.addEventListener("keyup", e => keys[e.code] = false);

// -----------------------------
// UI BUTTONS
// -----------------------------
document.querySelectorAll("#controls button[data-bike]").forEach(btn => {
    btn.onclick = () => {
        currentBike = btn.dataset.bike;
        updateLabels();
    };
});

document.querySelectorAll("#controls button[data-stroke]").forEach(btn => {
    btn.onclick = () => {
        currentStroke = Number(btn.dataset.stroke);
        updateLabels();
    };
});

function updateLabels() {
    const brandNames = {
        xk: "XK 85",
        rc: "RC 85",
        ym: "YM 85"
    };
    brandLabel.textContent = brandNames[currentBike] || "XK 85";
    strokeLabel.textContent = currentStroke === 2 ? "2‑Stroke" : "4‑Stroke";
}

// -----------------------------
// WORLD / TERRAIN
// -----------------------------
const world = {
    segments: [],
    length: 8000, // meters-ish
    baseY: 380,
    scaleX: 1.2,
    noiseScale: 0.008
};

function generateTerrain() {
    world.segments = [];
    let x = 0;
    let y = world.baseY;
    let seed = Math.random() * 10000;

    function noise(n) {
        // simple pseudo noise
        return Math.sin(n + seed) + 0.5 * Math.sin(2.3 * n + seed * 0.37);
    }

    for (let i = 0; i <= world.length; i += 8) {
        const n = noise(i * world.noiseScale);
        const height = n * 60; // hills
        const jump = Math.sin(i * 0.02) * 25; // some jumpy shapes
        y = world.baseY - height - jump;
        world.segments.push({ x: i, y });
    }
}

generateTerrain();

// -----------------------------
// BIKE PHYSICS
// -----------------------------
const bike = {
    x: 50,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    length: 70, // wheelbase
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

// -----------------------------
// CAMERA
// -----------------------------
const camera = {
    x: 0
};

function updateCamera() {
    const target = bike.x - canvas.width * 0.35;
    camera.x += (target - camera.x) * 0.08;
}

// -----------------------------
// TERRAIN HELPERS
// -----------------------------
function getGroundYAt(x) {
    if (x <= 0) return world.segments[0].y;
    if (x >= world.segments[world.segments.length - 1].x) {
        return world.segments[world.segments.length - 1].y;
    }

    // linear interpolation between segments
    for (let i = 0; i < world.segments.length - 1; i++) {
        const s1 = world.segments[i];
        const s2 = world.segments[i + 1];
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

// -----------------------------
// ENGINE SOUND (placeholder logs)
// -----------------------------
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

// -----------------------------
// GAME LOOP
// -----------------------------
let lastTime = performance.now();

function resetBike() {
    bike.x = 50;
    bike.y = getGroundYAt(50) - 20;
    bike.vx = 0;
    bike.vy = 0;
    bike.angle = 0;
    bike.angularVelocity = 0;
    bike.crashed = false;
    bike.flips = 0;
    bike.lastAngleForFlip = 0;
    bike.distance = 0;
}

resetBike();
updateLabels();

function resetIfCrashed() {
    if (bike.crashed) resetBike();
}

function update(dt) {
    if (bike.crashed) {
        // small slide after crash
        bike.vx *= 0.96;
        bike.vy += physics.gravity;
        bike.x += bike.vx;
        bike.y += bike.vy;
        return;
    }

    const throttle = keys["ArrowUp"] ? 1 : 0;
    const brake = keys["ArrowDown"] ? 1 : 0;

    // Engine force
    const enginePower = getEnginePower();
    bike.vx += throttle * enginePower;
    bike.vx -= brake * physics.brakeForce * Math.sign(bike.vx);

    // Clamp speed
    if (bike.vx > physics.maxSpeed) bike.vx = physics.maxSpeed;
    if (bike.vx < -physics.maxSpeed * 0.4) bike.vx = -physics.maxSpeed * 0.4;

    // Gravity
    bike.vy += physics.gravity;

    // Integrate position
    bike.x += bike.vx;
    bike.y += bike.vy;

    // Ground collision
    const groundY = getGroundYAt(bike.x);
    const groundAngle = getGroundAngleAt(bike.x);

    const wheelRadius = 18;
    const bikeBottomY = bike.y + wheelRadius;

    if (bikeBottomY > groundY) {
        // on ground
        bike.y = groundY - wheelRadius;
        bike.vy = 0;

        // align with ground
        const angleDiff = groundAngle - bike.angle;
        bike.angle += angleDiff * 0.3;
        bike.angularVelocity *= 0.5;

        // friction
        bike.vx *= (1 - physics.groundFriction);
    } else {
        // in air – tilt control
        if (keys["ArrowLeft"]) bike.angularVelocity -= physics.airTilt;
        if (keys["ArrowRight"]) bike.angularVelocity += physics.airTilt;
        bike.angle += bike.angularVelocity;
        bike.angularVelocity *= 0.995;
    }

    // Flip detection (full 360)
    const normalizedAngle = ((bike.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const prevNorm = ((bike.lastAngleForFlip % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    if (prevNorm < Math.PI && normalizedAngle >= Math.PI) {
        bike.flips++;
    } else if (prevNorm > Math.PI && normalizedAngle <= Math.PI) {
        bike.flips++;
    }
    bike.lastAngleForFlip = bike.angle;

    // Crash detection – if angle too far from ground when touching
    if (bikeBottomY >= groundY - 1) {
        const diff = Math.abs(normalizeAngle(bike.angle - groundAngle));
        if (diff > Math.PI / 2 + 0.4) {
            bike.crashed = true;
        }
    }

    // Distance
    bike.distance = Math.max(bike.distance, bike.x / 10);

    // Engine sound
    engineSound(dt);
}

function normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
}

// -----------------------------
// DRAW
// -----------------------------
function drawTerrain() {
    ctx.save();
    ctx.translate(-camera.x, 0);

    ctx.beginPath();
    ctx.moveTo(world.segments[0].x, canvas.height);
    for (let i = 0; i < world.segments.length; i++) {
        const s = world.segments[i];
        ctx.lineTo(s.x, s.y);
    }
    ctx.lineTo(world.segments[world.segments.length - 1].x, canvas.height);
    ctx.closePath();

    const grd = ctx.createLinearGradient(0, 250, 0, canvas.height);
    grd.addColorStop(0, "#2b2b2b");
    grd.addColorStop(1, "#050505");
    ctx.fillStyle = grd;
    ctx.fill();

    // simple sky
    const sky = ctx.createLinearGradient(0, 0, 0, 260);
    sky.addColorStop(0, "#0b0f1a");
    sky.addColorStop(1, "#111111");
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = sky;
    ctx.fillRect(camera.x, 0, canvas.width + camera.x + 2000, 260);
    ctx.globalCompositeOperation = "source-over";

    ctx.restore();
}

function drawBike() {
    ctx.save();
    const screenX = bike.x - camera.x;
    const screenY = bike.y;

    ctx.translate(screenX, screenY);
    ctx.rotate(bike.angle);

    // wheels
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

    // bike sprite tinted
    if (baseBike.complete && baseBike.naturalWidth > 0) {
        const tint = bikeColors[currentBike] || "#ffffff";

        // draw base
        ctx.drawImage(baseBike, -60, -50, 120, 80);

        // tint overlay
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = tint;
        ctx.fillRect(-60, -50, 120, 80);
        ctx.globalCompositeOperation = "source-over";
    } else {
        // fallback simple frame
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.lineTo(0, -20);
        ctx.lineTo(40, 0);
        ctx.stroke();
    }

    // rider silhouette
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.arc(-5, -40, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-10, -30, 20, 25);

    ctx.restore();
}

function drawHUD() {
    speedLabel.textContent = Math.abs(bike.vx * 8).toFixed(0) + " km/h";
    flipLabel.textContent = "Flips: " + bike.flips;
    distanceLabel.textContent = bike.distance.toFixed(1) + " m";
}

// -----------------------------
// MAIN LOOP
// -----------------------------
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

requestAnimationFrame(loop);
