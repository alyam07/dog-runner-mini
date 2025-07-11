const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- Спрайт собаки ---
const dogSprite = new Image();
dogSprite.src = "assets/dog-sprite.png"; // замените на свой спрайт-лист

const frameWidth = 40;    // ширина одного кадра
const frameHeight = 40;   // высота кадра
const totalFrames = 6;    // количество кадров
let currentFrame = 0;
let frameCounter = 0;

// --- Картинка косточки ---
const boneImg = new Image();
boneImg.src = "assets/bone.png";

// --- Игровые переменные ---
const player = { lane: 1, y: 400, width: 40, height: 40 };
const lanes = [30, 130, 230];
let bones = [];
let score = 0;
let speed = 2;
let gameInterval;
let boneInterval;

const scoreDisplay = document.getElementById("score");

// --- Игрок (анимированный через спрайт) ---
function drawPlayer() {
  ctx.drawImage(
    dogSprite,
    currentFrame * frameWidth,  // x-координата кадра в спрайте
    0,                          // y-координата (если в одну строку)
    frameWidth,
    frameHeight,
    lanes[player.lane],
    player.y,
    player.width,
    player.height
  );

  // Анимация: меняем кадр каждые 5 тиков
  frameCounter++;
  if (frameCounter % 5 === 0) {
    currentFrame = (currentFrame + 1) % totalFrames;
  }
}

// --- Отрисовка косточек ---
function drawBones() {
  bones.forEach(b => {
    ctx.drawImage(boneImg, lanes[b.lane], b.y, 30, 30);
  });
}

// --- Обновление косточек и счёта ---
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

// --- Спавн косточки ---
function spawnBone() {
  bones.push({ lane: Math.floor(Math.random() * 3), y: -30 });
}

// --- Основной цикл игры ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBones();
  updateBones();
}

// --- Старт игры ---
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

// --- Управление игроком ---
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && player.lane > 0) player.lane--;
  if (e.key === "ArrowRight" && player.lane < 2) player.lane++;
});

startGame();
