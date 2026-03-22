const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// -----------------------------
// BIKE SPRITE LOADING
// -----------------------------
const baseBike = new Image();
baseBike.src = "bike.png"; // ← YOU add your Kawasaki image as bike.png

// Color tints for each brand
const bikeColors = {
    xk: "#00ff00", // Kawasaki green
    rc: "#ff6600", // KTM orange
    ym: "#0066ff"  // Yamaha blue
};

// -----------------------------
// GAME STATE
// -----------------------------
let currentBike = "xk";
let currentStroke = 2;

let bike = {
    x: 100,
    y: 350,
    speedY: 0,
    rotation: 0,
    onGround: false
};

const gravity = 0.5;
const jumpForce = -10;

// -----------------------------
// INPUT
// -----------------------------
let keys = {};

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// -----------------------------
// UI BUTTONS
// -----------------------------
document.querySelectorAll("#bike-select button").forEach(btn => {
    btn.onclick = () => {
        currentBike = btn.dataset.bike;
    };
});

document.querySelectorAll("#stroke-select button").forEach(btn => {
    btn.onclick = () => {
        currentStroke = Number(btn.dataset.stroke);
    };
});

// -----------------------------
// ENGINE SOUND (placeholder)
// -----------------------------
function playEngineSound() {
    // You can replace this with real 2‑stroke/4‑stroke audio later
    if (currentStroke === 2) {
        // 2-stroke: higher pitch
        console.log("2‑stroke BRAAAP");
    } else {
        // 4-stroke: deeper
        console.log("4‑stroke THUMP");
    }
}

// -----------------------------
// PHYSICS + GAME LOOP
// -----------------------------
function update() {
    // Gravity
    bike.speedY += gravity;
    bike.y += bike.speedY;

    // Ground collision
    if (bike.y > 350) {
        bike.y = 350;
        bike.speedY = 0;
        bike.onGround = true;
    } else {
        bike.onGround = false;
    }

    // Jump
    if (keys["Space"] && bike.onGround) {
        bike.speedY = jumpForce;
        playEngineSound();
    }

    // Tilt in air
    if (!bike.onGround) {
        if (keys["ArrowLeft"]) bike.rotation -= 0.05;
        if (keys["ArrowRight"]) bike.rotation += 0.05;
    }

    draw();
    requestAnimationFrame(update);
}

// -----------------------------
// DRAW BIKE WITH COLOR TINT
// -----------------------------
function drawBike() {
    const tint = bikeColors[currentBike];

    // Draw tinted bike
    ctx.save();
    ctx.translate(bike.x, bike.y);
    ctx.rotate(bike.rotation);

    // Tint layer
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(baseBike, -60, -40, 120, 80);

    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = tint;
    ctx.fillRect(-60, -40, 120, 80);

    ctx.restore();
}

// -----------------------------
// DRAW EVERYTHING
// -----------------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 400, canvas.width, 100);

    drawBike();
}

// Start game
update();
