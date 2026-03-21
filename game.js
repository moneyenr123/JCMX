const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

let gameState = 'menu';
let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// --- SCORING SYSTEM ---
let totalScore = 0;
let airTimeFrames = 0;
let inAir = false;
let rotationInAir = 0;

function showJumpAlert(text) {
    const alertDiv = document.getElementById('jumpAlert');
    alertDiv.innerHTML = text;
    alertDiv.classList.remove('show-alert');
    void alertDiv.offsetWidth; // Trigger reflow
    alertDiv.classList.add('show-alert');
}

// --- BIKE & 2-WHEEL PHYSICS ---
const bike = {
    x: 0, y: -100, vx: 0, vy: 0, angle: 0, spin: 0, speed: 0, rpm: 1500, type: '4-stroke', color: '#ff4444',
    wheelbase: 40, // Distance between wheels
    suspensionStiffness: 0.15,
    damping: 0.85
};
// Wheel positions relative to bike center
let rearWheelY = 0; 
let frontWheelY = 0;

// --- TERRAIN GENERATION (Different Levels/Features) ---
const terrain = [];
const segmentLength = 15;
function generateTerrain() {
    let y = 500;
    for (let i = 0; i < 4000; i++) {
        // Build actual motocross tracks:
        if (i % 200 < 20) {
            y -= 6; // Steep Jump Ramp
        } else if (i % 200 > 30 && i % 200 < 50) {
            y += 4; // Downhill landing
        } else if (i % 100 > 80) {
            y += Math.sin(i) * 15; // Whoops section
        } else {
            y += Math.sin(i * 0.05) * 2; // Flat bumpy dirt
        }
        terrain.push(y);
    }
}
generateTerrain();

function getTerrainY(worldX) {
    let index = Math.floor(worldX / segmentLength);
    if (index < 0) index = 0;
    if (index >= terrain.length - 1) index = terrain.length - 2;
    let t1 = terrain[index]; let t2 = terrain[index + 1];
    let percent = (worldX % segmentLength) / segmentLength;
    return t1 + (t2 - t1) * percent;
}

// --- AUDIO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillator, gainNode;
function initAudio(type) {
    if (oscillator) oscillator.stop();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    oscillator.type = (type === '2-stroke') ? 'sawtooth' : 'square';
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0.08;
    oscillator.start();
}
function updateAudio() {
    if (gameState !== 'playing') return;
    let baseFreq = (bike.type === '2-stroke') ? 65 : 30;
    oscillator.frequency.setTargetAtTime(baseFreq + (bike.rpm / 20), audioCtx.currentTime, 0.05);
    document.getElementById('rpmDisplay').innerText = Math.round(bike.rpm);
    document.getElementById('speedDisplay').innerText = Math.round(bike.vx * 2);
}

// --- DIRT PARTICLES ---
const particles = [];
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life -= 0.03;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

// --- MAIN LOOP ---
function update() {
    if (gameState !== 'playing') return;

    // Realistic Physics calculations
    bike.vy += 0.4; // Gravity
    
    // Find where the wheels are in the world
    let rwX = bike.x - Math.cos(bike.angle) * (bike.wheelbase/2);
    let rwY = bike.y - Math.sin(bike.angle) * (bike.wheelbase/2);
    let fwX = bike.x + Math.cos(bike.angle) * (bike.wheelbase/2);
    let fwY = bike.y + Math.sin(bike.angle) * (bike.wheelbase/2);

    let gRearY = getTerrainY(rwX);
    let gFrontY = getTerrainY(fwX);

    let rearTouches = (rwY + 15) >= gRearY;
    let frontTouches = (fwY + 15) >= gFrontY;

    // Jump Logic & Scoring
    if (!rearTouches && !frontTouches) {
        if (!inAir) inAir = true;
        airTimeFrames++;
        rotationInAir += bike.spin;
    } else {
        if (inAir && airTimeFrames > 30) { // Landed a jump!
            let airPoints = Math.floor(airTimeFrames * 5);
            let flips = Math.floor(Math.abs(rotationInAir) / (Math.PI * 2));
            let flipPoints = flips * 1000;
            let jumpTotal = airPoints + flipPoints;
            totalScore += jumpTotal;
            document.getElementById('scoreDisplay').innerText = totalScore;
            
            let message = flips > 0 ? `${flips}x FLIP! +${jumpTotal}` : `BIG AIR! +${jumpTotal}`;
            showJumpAlert(message);
        }
        inAir = false;
        airTimeFrames = 0;
        rotationInAir = 0;
    }

    // Suspension Physics
    rearWheelY = 15; frontWheelY = 15; // default extended
    if (rearTouches) {
        let pushUp = (gRearY - rwY) * bike.suspensionStiffness;
        bike.vy -= pushUp;
        bike.spin -= pushUp * 0.005; // Pushes tail up
        rearWheelY -= pushUp; // Visually compress
        
        // Acceleration only works if rear tire is on dirt
        if (keys['ArrowUp']) {
            bike.vx += Math.cos(bike.angle) * 0.4;
            bike.rpm = Math.min(11000, bike.rpm + 500);
            
            // Spawn roost (dirt spray)
            particles.push({ x: rwX, y: rwY+10, vx: -bike.vx - Math.random()*5, vy: -Math.random()*5, life: 1, size: Math.random()*5+2 });
        }
    }
    
    if (frontTouches) {
        let pushUp = (gFrontY - fwY) * bike.suspensionStiffness;
        bike.vy -= pushUp;
        bike.spin += pushUp * 0.005; // Pushes nose up
        frontWheelY -= pushUp; // Visually compress
    }

    // Air Control (Leaning)
    if (keys['ArrowLeft']) { bike.spin -= 0.003; }
    if (keys['ArrowRight']) { bike.spin += 0.003; }
    
    // Friction & RPM Decay
    bike.vx *= 0.98;
    bike.vy *= bike.damping;
    bike.spin *= 0.95;
    if (!keys['ArrowUp']) bike.rpm = Math.max(1500, bike.rpm - 200);

    bike.angle += bike.spin;
    bike.x += bike.vx;
    bike.y += bike.vy;

    updateParticles();
    updateAudio();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'playing') {
        ctx.save();
        ctx.translate(canvas.width / 3 - bike.x, canvas.height / 1.5 - bike.y);

        // --- DRAW MULTI-LAYER TERRAIN ---
        let startX = Math.floor((bike.x - canvas.width) / segmentLength);
        let endX = Math.floor((bike.x + canvas.width * 2) / segmentLength);
        
        // Layer 1: Deep Earth (Dark Brown)
        ctx.beginPath();
        ctx.moveTo((startX) * segmentLength, 3000);
        for (let i = Math.max(0, startX); i < endX; i++) {
            if (i < terrain.length) ctx.lineTo(i * segmentLength, terrain[i] + 40); // Offset down
        }
        ctx.lineTo(endX * segmentLength, 3000);
        ctx.fillStyle = '#26160f';
        ctx.fill();

        // Layer 2: Top Soil (Lighter Brown/Orange)
        ctx.beginPath();
        ctx.moveTo((startX) * segmentLength, 3000);
        for (let i = Math.max(0, startX); i < endX; i++) {
            if (i < terrain.length) ctx.lineTo(i * segmentLength, terrain[i]);
        }
        ctx.lineTo(endX * segmentLength, 3000);
        ctx.fillStyle = '#4a2e1b';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#6b442a'; // Crust
        ctx.stroke();

        // Draw Particles
        particles.forEach(p => {
            ctx.fillStyle = `rgba(107, 68, 42, ${p.life})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        });

        // --- DRAW BIKE (Realistic 2-Part Assembly) ---
        ctx.save();
        ctx.translate(bike.x, bike.y);
        ctx.rotate(bike.angle);

        // Draw Wheels (They move up/down independently based on terrain)
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(-bike.wheelbase/2, rearWheelY, 14, 0, Math.PI*2); ctx.fill(); // Rear
        ctx.beginPath(); ctx.arc(bike.wheelbase/2, frontWheelY, 14, 0, Math.PI*2); ctx.fill(); // Front
        
        // Draw Forks/Swingarm connecting chassis to wheels
        ctx.strokeStyle = '#aaa'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-bike.wheelbase/2, rearWheelY); ctx.stroke(); // Swingarm
        ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(bike.wheelbase/2, frontWheelY); ctx.stroke(); // Front Forks

        // Draw Frame
        ctx.fillStyle = bike.color;
        ctx.beginPath(); ctx.moveTo(-15, -5); ctx.lineTo(15, -12); ctx.lineTo(10, 5); ctx.lineTo(-10, 5); ctx.fill();
        
        // Exhaust
        ctx.fillStyle = '#555'; ctx.fillRect(-22, 0, 15, 4);
        
        // Rider
        ctx.fillStyle = '#fff';
        ctx.fillRect(-5, -30, 12, 25); // Body
        ctx.beginPath(); ctx.arc(5, -35, 8, 0, Math.PI*2); ctx.fill(); // Helmet

        ctx.restore(); // End Bike
        ctx.restore(); // End Camera
    }

    requestAnimationFrame(() => { update(); draw(); });
}

// Start Game Logic
document.querySelectorAll('.bike-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        bike.name = e.target.getAttribute('data-name');
        bike.type = e.target.getAttribute('data-type');
        bike.color = bike.type === '4-stroke' ? '#ff3333' : '#33aaff';
        
        document.getElementById('bikeNameDisplay').innerText = bike.name;
        document.getElementById('menu').style.display = 'none';
        document.getElementById('hud').style.display = 'block';
        
        bike.x = 0; bike.y = 0; bike.vx = 0; bike.vy = 0; bike.angle = 0; totalScore = 0;
        initAudio(bike.type);
        gameState = 'playing';
    });
});

draw();
