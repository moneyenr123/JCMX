const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

let currentMode = "trials"; // "trials" or "motocross"
let currentBike = "green-2";
let currentLevelIndex = 0;

const levels = [];
createLevels(20); // change to 200 when you're ready

const bikes = {
  "green-2":  { color: "#00c853", stroke: "2", power: 0.12, weight: 1.0 },
  "red-4":    { color: "#ff1744", stroke: "4", power: 0.16, weight: 1.2 },
  "blue-2":   { color: "#2979ff", stroke: "2", power: 0.13, weight: 1.05 }
};

const player = {
  x: 100,
  y: 200,
  vx: 0,
  vy: 0,
  angle: 0,
  angVel: 0,
  onGround: false
};

const npcs = [];

function createLevels(count) {
  for (let i = 0; i < count; i++) {
    const segments = [];
    let x = 0;
    let y = 350;
    for (let s = 0; s < 40; s++) {
      x += 40;
      y += (Math.random() - 0.5) * 40;
      y = Math.max(200, Math.min(450, y));
      segments.push({ x, y });
    }
    levels.push({ segments, finishX: x });
  }
}

function setMode(mode) {
  currentMode = mode;
  resetRace();
}

function setBike(id) {
  currentBike = id;
  resetRace();
}

function setLevel(index) {
  currentLevelIndex = index;
  resetRace();
}

function resetRace() {
  const level = levels[currentLevelIndex];
  player.x = 80;
  player.y = 200;
  player.vx = 0;
  player.vy = 0;
  player.angle = 0;
  player.angVel = 0;

  npcs.length = 0;
  if (currentMode === "motocross") {
    for (let i = 0; i < 5; i++) {
      npcs.push({
        x: 60 - i * 20,
        y: 200,
        vx: 0,
        vy: 0,
        angle: 0,
        angVel: 0,
        aiSkill: 0.8 + Math.random() * 0.4
      });
    }
  }
}

function update(dt) {
  const bike = bikes[currentBike];
  const level = levels[currentLevelIndex];

  const gravity = 0.0018;
  const groundFriction = 0.0009;
  const airFriction = 0.0003;
  const torque = 0.0025;

  let throttle = 0;
  if (keys["ArrowUp"] || keys["KeyW"]) throttle = 1;
  if (keys["ArrowDown"] || keys["KeyS"]) throttle = -0.5;

  const ground = sampleGround(level, player.x);
  const onGround = player.y >= ground.y - 10;

  if (onGround) {
    player.onGround = true;
    player.y = ground.y - 10;
    player.vy = 0;

    const targetAngle = ground.angle;
    player.angle += (targetAngle - player.angle) * 0.2;

    player.vx += throttle * bike.power * dt * (1 / bike.weight);
    player.vx *= (1 - groundFriction * dt);
  } else {
    player.onGround = false;
    if (keys["ArrowLeft"] || keys["KeyA"]) player.angVel -= torque * dt;
    if (keys["ArrowRight"] || keys["KeyD"]) player.angVel += torque * dt;
    player.vy += gravity * dt;
    player.vx *= (1 - airFriction * dt);
  }

  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.angle += player.angVel * dt;

  if (currentMode === "motocross") {
    for (const npc of npcs) {
      const g = sampleGround(level, npc.x);
      const targetSpeed = 0.25 * npc.aiSkill;
      const accel = (targetSpeed - npc.vx) * 0.002;
      npc.vx += accel * dt;

      const npcOnGround = npc.y >= g.y - 10;
      if (npcOnGround) {
        npc.y = g.y - 10;
        npc.vy = 0;
        npc.angle += (g.angle - npc.angle) * 0.2;
      } else {
        npc.vy += gravity * dt;
      }

      npc.x += npc.vx * dt;
      npc.y += npc.vy * dt;
    }
  }

  if (player.x >= level.finishX + 40) {
    currentLevelIndex = (currentLevelIndex + 1) % levels.length;
    resetRace();
  }
}

function sampleGround(level, x) {
  const segs = level.segments;
  if (x <= segs[0].x) {
    return { y: segs[0].y, angle: 0 };
  }
  for (let i = 1; i < segs.length; i++) {
    const a = segs[i - 1];
    const b = segs[i];
    if (x >= a.x && x <= b.x) {
      const t = (x - a.x) / (b.x - a.x);
      const y = a.y + (b.y - a.y) * t;
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      return { y, angle };
    }
  }
  const last = segs[segs.length - 1];
  return { y: last.y, angle: 0 };
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const level = levels[currentLevelIndex];
  const bike = bikes[currentBike];

  const camX = player.x - canvas.width * 0.3;

  ctx.save();
  ctx.translate(-camX, 0);

  ctx.strokeStyle = "#3b3b3b";
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (let i = 0; i < level.segments.length; i++) {
    const s = level.segments[i];
    if (i === 0) ctx.moveTo(s.x, s.y);
    else ctx.lineTo(s.x, s.y);
  }
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.fillRect(level.finishX + 20, 200, 4, 120);
  ctx.fillStyle = "#000";
  ctx.fillRect(level.finishX + 24, 200, 20, 20);

  if (currentMode === "motocross") {
    for (const npc of npcs) {
      drawBike(npc.x, npc.y, npc.angle, "#ffea00");
    }
  }

  drawBike(player.x, player.y, player.angle, bike.color);

  ctx.restore();
}

function drawBike(x, y, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(-18, 10, 10, 0, Math.PI * 2);
  ctx.arc(18, 10, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(0, -12);
  ctx.lineTo(18, 0);
  ctx.stroke();

  ctx.fillStyle = "#eee";
  ctx.beginPath();
  ctx.arc(0, -22, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

let lastTime = performance.now();
function loop(now) {
  const dt = now - lastTime;
  lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

document.querySelectorAll("#mode-select button").forEach(btn => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

document.querySelectorAll("#bike-select button").forEach(btn => {
  btn.addEventListener("click", () => setBike(btn.dataset.bike));
});

const levelSelect = document.getElementById("level-select");
levels.forEach((_, i) => {
  const b = document.createElement("button");
  b.textContent = i + 1;
  b.addEventListener("click", () => setLevel(i));
  levelSelect.appendChild(b);
});

resetRace();
