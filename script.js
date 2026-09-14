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

// ===============================
// ESTADO DO JOGO
// ===============================

let score = 0;
let shots = 0;
let timeLeft = 60;
let gameRunning = true;

let keys = {};

const player = {
    x: 180,
    y: 480,
    width: 45,
    height: 90,
    speed: 5,
    color: "#246BCE"
};

const ball = {
    x: player.x + 25,
    y: player.y - 25,
    radius: 11,

    vx: 0,
    vy: 0,

    gravity: 0.32,
    active: false,

    scored: false
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

let power = 11;
let aimAngle = -0.75;

let particles