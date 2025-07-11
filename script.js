const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- Загрузка спрайта и косточки ---
const dogSprite = new Image();
dogSprite.src = "assets/dog-sprite.png";

const boneImg = new Image();
boneImg.src = "assets/bone.png";

// --- Настройки спрайта ---
const spriteCols = 3;
const spriteRows = 3;
const totalFrames = 9;
const frameWidth = 256;  // исходя из твоего изображения: 768 / 3 = 256
const frameHeight = 256; // 768 / 3 = 256
let currentFrame = 0;
let frameCounter = 0;

// --- Игрок ---
const player = { lane: 1, y: 400, width: 40, height: 40 };
const lanes = [30, 130, 230];

// --- Игра ---
let bones = [];
let score = 0;
let speed = 2;
let gameInterval;
let boneInterval;
const scoreDisplay = document.getElementById("score");

// --- Отрисовка игрока со спрайтом ---
function drawPlayer() {
  const col = currentFrame % spriteCols;
  const row = Math.floor(currentFrame / spriteCols);

  ctx.drawImage(
    dogSprite,
    col * frameWidth,
    row * frameHeight,
    frameWidth,
    frameHeight,
    lanes[player.lane],
    player.y,
    player.height,
    player.height
  );

  frameCounter++;
  if (frameCounter % 5 === 0) {
    currentFrame = (currentFrame + 1) % totalFrames;
  }
}

// --- Косточки ---
function drawBones() {
  bones.forEach(b => {
    ctx.drawImage(boneImg, lanes[b.lane], b.y, 30, 30);
  });
}

function updateBones() {
  bones.forEach(b => b.y += speed);
  bones = bones.filter(b => b.y < canvas.height);

  for (let b of bones) {
    if (b.lane === player.lane && b.y + 30 >= player.y && b.y <= player.y + player.height) {
      score++;
      bones = bones.filter(x => x !== b);
    }
  }

  scoreDisplay.textContent = "Очки: " + score;
}

function spawnBone() {
  bones.push({ lane: Math.floor(Math.random() * 3), y: -30 });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBones();
  updateBones();
}

function startGame() {
  player.lane = 1;
  bones = [];
  score = 0;
  currentFrame = 0;
  frameCounter = 0;

  if (gameInterval) clearInterval(gameInterval);
  if (boneInterval) clearInterval(boneInterval);

  gameInterval = setInterval(draw, 20);
  boneInterval = setInterval(spawnBone, 1000);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && player.lane > 0) player.lane--;
  if (e.key === "ArrowRight" && player.lane < 2) player.lane++;
});

startGame();
