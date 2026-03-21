const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- GAME STATE ---
let gameState = 'menu'; // 'menu' or 'playing'
let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// --- BIKE & PHYSICS ---
const bike = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    vAngle: 0,
    speed: 0,
    rpm: 1500,
    name: '',
    type: '4-stroke',
    color: '#ff4444'
};

const physics = {
    gravity: 0.25,
    friction: 0.98,
    acceleration: 0.3,
    maxSpeed: 15
};

// --- TERRAIN GENERATION ---
const terrain = [];
const segmentLength = 20;
function generateTerrain() {
    let y = 400;
    for (let i = 0; i < 2000; i++) {
        // Create rolling hills using sine waves
        y += Math.sin(i * 0.1) * 5 + Math.sin(i * 0.03) * 10;
        terrain.push(y);
    }
}
generateTerrain();

// --- DIRT PARTICLES ---
const particles = [];
function spawnDirt() {
    if (bike.speed > 1 && keys['ArrowUp']) {
        for(let i=0; i<3; i++){
            particles.push({
                x: bike.x - 20, 
                y: bike.y + 15,
                vx: -Math.random() * 5 - bike.speed * 0.5,
                vy: -Math.random() * 5,
                life: 1.0,
                size: Math.random() * 4 + 2
            });
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity on dirt
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

// --- AUDIO ENGINE ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillator, gainNode, filterNode;

function initAudio(type) {
    if (oscillator) oscillator.stop();
    
    oscillator = audioCtx.createOscillator();
    filterNode = audioCtx.createBiquadFilter();
    gainNode = audioCtx.createGain();
    
    // 2-stroke: buzzy sawtooth. 4-stroke: throaty square.
    oscillator.type = (type === '2-stroke') ? 'sawtooth' : 'square';
    
    // Filter to make it sound more like an engine and less like an arcade beep
    filterNode.type = 'lowpass';
    filterNode.frequency.value = (type === '2-stroke') ? 2000 : 1000;

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.value = 0.1;
    oscillator.start();
}

function updateAudio() {
    if (gameState !== 'playing') return;
    
    let baseFreq = (bike.type === '2-stroke') ? 60 : 35;
    let rpmPitch = baseFreq + (bike.rpm / 25);
    
    // Smooth pitch sliding
    oscillator.frequency.setTargetAtTime(rpmPitch, audioCtx.currentTime, 0.05);
    
    // Update HUD
    document.getElementById('rpmDisplay').innerText = Math.round(bike.rpm);
    document.getElementById('speedDisplay').innerText = Math.round(bike.speed * 2);
}

// --- MAIN LOOP ---
function update() {
    if (gameState !== 'playing') return;

    // Throttle & Braking
    if (keys['ArrowUp']) {
        bike.speed += physics.acceleration;
        bike.rpm = Math.min(12000, bike.rpm + 400);
        spawnDirt();
    } else if (keys['ArrowDown']) {
        bike.speed -= physics.acceleration * 1.5;
        bike.rpm = Math.max(1500, bike.rpm - 300);
    } else {
        bike.speed *= physics.friction;
        bike.rpm = Math.max(1500, bike.rpm - 150);
    }
    
    // Cap speed
    if (bike.speed > physics.maxSpeed) bike.speed = physics.maxSpeed;
    if (bike.speed < 0) bike.speed = 0;

    // X position updates based on speed
    bike.x += bike.speed;

    // Leaning
    if (keys['ArrowLeft']) bike.vAngle -= 0.01;
    if (keys['ArrowRight']) bike.vAngle += 0.01;
    bike.angle += bike.vAngle;
    bike.vAngle *= 0.9; // air resistance on rotation

    // Terrain Collision (Simple Raycast downward)
    let terrainIndex = Math.floor(bike.x / segmentLength);
    // Ensure we don't go out of bounds of our terrain array
    if (terrainIndex >= terrain.length - 1) terrainIndex = terrain.length - 2; 
    
    // Interpolate exact ground Y
    let t1 = terrain[terrainIndex];
    let t2 = terrain[terrainIndex + 1];
    let percent = (bike.x % segmentLength) / segmentLength;
    let groundY = t1 + (t2 - t1) * percent;

    // Gravity & Ground Interaction
    bike.vy += physics.gravity;
    bike.y += bike.vy;

    if (bike.y > groundY - 20) {
        bike.y = groundY - 20;
        bike.vy = 0;
        
        // Auto-align bike angle to slope slightly when on ground
        let targetAngle = Math.atan2(t2 - t1, segmentLength);
        bike.angle += (targetAngle - bike.angle) * 0.1;
    }

    updateParticles();
    updateAudio();
}

function draw() {
    // Clear & Sky
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'playing') {
        // Camera logic (Keep bike in lower-left third of screen)
        ctx.save();
        ctx.translate(canvas.width / 3 - bike.x, canvas.height / 1.5 - bike.y);

        // Draw Terrain
        ctx.beginPath();
        ctx.moveTo(bike.x - canvas.width, 2000); // Bottom left
        for (let i = Math.max(0, Math.floor((bike.x - canvas.width)/segmentLength)); i < Math.floor((bike.x + canvas.width*2)/segmentLength); i++) {
            if (i < terrain.length) {
                ctx.lineTo(i * segmentLength, terrain[i]);
            }
        }
        ctx.lineTo(bike.x + canvas.width * 2, 2000); // Bottom right
        ctx.fillStyle = '#3a2318'; // Dirt brown
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#5c3a21'; // Lighter dirt edge
        ctx.stroke();

        // Draw Particles
        particles.forEach(p => {
            ctx.fillStyle = `rgba(92, 58, 33, ${p.life})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Bike
        ctx.save();
        ctx.translate(bike.x, bike.y);
        ctx.rotate(bike.angle);
        
        // Bike Frame
        ctx.fillStyle = bike.color;
        ctx.beginPath();
        ctx.moveTo(-15, -5);
        ctx.lineTo(15, -10);
        ctx.lineTo(10, 5);
        ctx.lineTo(-10, 5);
        ctx.fill();
        
        // Wheels
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-20, 10, 12, 0, Math.PI*2); // Rear
        ctx.arc(20, 10, 12, 0, Math.PI*2);  // Front
        ctx.fill();
        
        // Rider (Simple)
        ctx.fillStyle = '#fff';
        ctx.fillRect(-5, -25, 10, 20); // Body
        ctx.beginPath();
        ctx.arc(0, -30, 6, 0, Math.PI*2); // Helmet
        ctx.fill();

        ctx.restore();
        ctx.restore(); // End Camera
    }

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

// --- INIT ---
document.querySelectorAll('.bike-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Must resume AudioContext after a user gesture
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        bike.name = e.target.getAttribute('data-name');
        bike.type = e.target.getAttribute('data-type');
        bike.color = bike.type === '4-stroke' ? '#ff4444' : '#44aaff';
        
        document.getElementById('bikeNameDisplay').innerText = bike.name;
        document.getElementById('menu').style.display = 'none';
        document.getElementById('hud').style.display = 'block';
        
        bike.x = 0;
        bike.y = 0;
        bike.speed = 0;
        
        initAudio(bike.type);
        gameState = 'playing';
    });
});

// Start loop
draw();
