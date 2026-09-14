const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const shotsElement = document.getElementById("shots");
const gameOverElement = document.getElementById("gameOver");
const finalScoreElement = document.getElementById("finalScore");
const restartButton = document.getElementById("restartButton");

const WIDTH = 1000;
const HEIGHT = 600;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const GROUND_Y = HEIGHT - 60;

let score = 0;
let shots = 0;
let timeLeft = 60;
let gameRunning = true;
let timerInterval = null;

let keys = {};

const player = {
    x: 180,
    y: GROUND_Y - 90,
    width: 45,
    height: 90,
    speed: 5,
    color: "#246BCE",
    minX: 20,
    maxX: 650
};

const ball = {
    radius: 11,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    gravity: 0.32,
    active: false,
    scored: false,
    trail: []
};

const hoop = {
    x: 805,
    y: 205,
    width: 95,
    height: 10,
    rimRadius: 5,
    boardX: 900,
    boardY: 125,
    boardWidth: 15,
    boardHeight: 150
};

const MIN_POWER = 6;
const MAX_POWER = 20;
let power = 11;
let aimAngle = -0.75;

let particles = [];

function resetBallToPlayer() {
    ball.x = player.x + player.width + 8;
    ball.y = player.y + 15;
    ball.vx = 0;
    ball.vy = 0;
    ball.active = false;
    ball.scored = false;
    ball.trail = [];
}

resetBallToPlayer();

// ---------- Partículas (efeito ao acertar a cesta) ----------
function spawnParticles(x, y, color, count = 24) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 40 + Math.random() * 20,
            maxLife: 60,
            color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    particles.forEach((p) => {
        ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// ---------- Input ----------
window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
    }
    if (e.code === "Space") {
        shootBall();
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

restartButton.addEventListener("click", () => {
    startGame();
});

function shootBall() {
    if (!gameRunning || ball.active) return;
    shots++;
    shotsElement.textContent = shots;
    ball.active = true;
    ball.scored = false;
    ball.vx = power * Math.cos(aimAngle);
    ball.vy = power * Math.sin(aimAngle);
}

// ---------- Update ----------
function updatePlayer() {
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;
    player.x = Math.max(player.minX, Math.min(player.maxX, player.x));

    if (!ball.active) {
        if (keys["ArrowUp"]) power = Math.min(MAX_POWER, power + 0.25);
        if (keys["ArrowDown"]) power = Math.max(MIN_POWER, power - 0.25);
        resetBallToPlayer();
    }
}

function bounceOffRimEdge(rimX) {
    const dx = ball.x - rimX;
    const dy = ball.y - hoop.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
    const minDist = ball.radius + hoop.rimRadius;
    if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const overlap = minDist - dist;
        ball.x += Math.cos(angle) * overlap;
        ball.y += Math.sin(angle) * overlap;
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) * 0.6;
        ball.vx = Math.cos(angle) * speed;
        ball.vy = Math.sin(angle) * speed;
    }
}

function updateBall() {
    if (!ball.active) return;

    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 12) ball.trail.shift();

    ball.vy += ball.gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Colisão com a tabela
    if (
        ball.x + ball.radius > hoop.boardX &&
        ball.x - ball.radius < hoop.boardX + hoop.boardWidth &&
        ball.y > hoop.boardY &&
        ball.y < hoop.boardY + hoop.boardHeight &&
        ball.vx > 0
    ) {
        ball.x = hoop.boardX - ball.radius;
        ball.vx *= -0.5;
    }

    // Detecção de cesta (passando pelo aro, descendo)
    const rimLeft = hoop.x + 12;
    const rimRight = hoop.x + hoop.width - 12;
    if (
        !ball.scored &&
        ball.vy > 0 &&
        ball.y + ball.radius >= hoop.y &&
        ball.y + ball.radius <= hoop.y + 14 &&
        ball.x > rimLeft &&
        ball.x < rimRight
    ) {
        ball.scored = true;
        score += 2;
        scoreElement.textContent = score;
        spawnParticles(ball.x, ball.y, "#ff9f1c");
    }

    // Quique nas bordas do aro
    bounceOffRimEdge(hoop.x);
    bounceOffRimEdge(hoop.x + hoop.width);

    // Saiu da quadra / caiu no chão -> reseta
    if (ball.y - ball.radius > HEIGHT || ball.x < -50 || ball.x > WIDTH + 50) {
        resetBallToPlayer();
    }
}

function update() {
    if (!gameRunning) return;
    updatePlayer();
    updateBall();
    updateParticles();
}

// ---------- Draw ----------
function drawCourt() {
    ctx.fillStyle = "#dceeff";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "rgba(36,107,206,0.25)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(WIDTH, GROUND_Y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(120, GROUND_Y, 90, Math.PI, 0);
    ctx.stroke();
}

function drawHoop() {
    // tabela
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(hoop.boardX, hoop.boardY, hoop.boardWidth, hoop.boardHeight);
    ctx.strokeStyle = "#999";
    ctx.strokeRect(hoop.boardX, hoop.boardY, hoop.boardWidth, hoop.boardHeight);

    ctx.strokeStyle = "#e63946";
    ctx.lineWidth = 3;
    ctx.strokeRect(hoop.boardX + 3, hoop.boardY + 30, hoop.boardWidth - 6, 40);

    // haste
    ctx.fillStyle = "#555";
    ctx.fillRect(hoop.boardX + hoop.boardWidth, hoop.boardY + hoop.boardHeight / 2 - 4, 20, 8);

    // aro
    ctx.strokeStyle = "#ff4d4d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(hoop.x, hoop.y);
    ctx.lineTo(hoop.x + hoop.width, hoop.y);
    ctx.stroke();

    // rede
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 1.5;
    const netTop = hoop.y;
    const netBottom = hoop.y + 38;
    for (let i = 0; i <= 6; i++) {
        const tx = hoop.x + (hoop.width / 6) * i;
        const bx = hoop.x + hoop.width * 0.2 + ((hoop.width * 0.6) / 6) * i;
        ctx.beginPath();
        ctx.moveTo(tx, netTop);
        ctx.lineTo(bx, netBottom);
        ctx.stroke();
    }
    for (let i = 1; i < 3; i++) {
        const y = netTop + (netBottom - netTop) * (i / 3);
        ctx.beginPath();
        ctx.moveTo(hoop.x + hoop.width * 0.08 * i, y);
        ctx.lineTo(hoop.x + hoop.width - hoop.width * 0.08 * i, y);
        ctx.stroke();
    }
}

function drawPlayer() {
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, GROUND_Y + 6, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = player.color;
    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(player.x, player.y, player.width, player.height, 10);
        ctx.fill();
    } else {
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    ctx.fillStyle = "#ffd8a8";
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - 12, 14, 0, Math.PI * 2);
    ctx.fill();
}

function drawAimIndicator() {
    if (ball.active || !gameRunning) return;
    ctx.strokeStyle = "rgba(255,159,28,0.7)";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x + Math.cos(aimAngle) * power * 4, ball.y + Math.sin(aimAngle) * power * 4);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawBall() {
    ball.trail.forEach((t, i) => {
        ctx.globalAlpha = (i / ball.trail.length) * 0.4;
        ctx.fillStyle = "#e07b1a";
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#e67e22";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5c3512";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ball.x - ball.radius, ball.y);
    ctx.lineTo(ball.x + ball.radius, ball.y);
    ctx.moveTo(ball.x, ball.y - ball.radius);
    ctx.lineTo(ball.x, ball.y + ball.radius);
    ctx.stroke();
}

function drawPowerMeter() {
    const barX = 40, barY = HEIGHT - 40, barW = 160, barH = 14;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(barX, barY, barW, barH);
    const pct = (power - MIN_POWER) / (MAX_POWER - MIN_POWER);
    ctx.fillStyle = "#ff9f1c";
    ctx.fillRect(barX, barY, barW * pct, barH);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.fillText("FORÇA", barX, barY - 6);
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawCourt();
    drawHoop();
    drawAimIndicator();
    drawPlayer();
    drawBall();
    drawParticles();
    drawPowerMeter();
}

// ---------- Loop / Game state ----------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove("hidden");
}

function startGame() {
    score = 0;
    shots = 0;
    timeLeft = 60;
    power = 11;
    gameRunning = true;
    player.x = 180;
    particles = [];
    resetBallToPlayer();

    scoreElement.textContent = score;
    shotsElement.textContent = shots;
    timerElement.textContent = timeLeft;
    gameOverElement.classList.add("hidden");

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!gameRunning) return;
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            timeLeft = 0;
            timerElement.textContent = timeLeft;
            endGame();
        }
    }, 1000);
}

startGame();
requestAnimationFrame(loop);
