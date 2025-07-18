const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* === Изображения === */
const dogSprite = new Image();
dogSprite.src = "assets/dog-sprite4.png";

const boneImg = new Image();
boneImg.src = "assets/bone1.png";

const bombImg = new Image();
bombImg.src = "assets/bomb.png";

const crowSprite = new Image();
crowSprite.src = "assets/crow-sprite.png";

const rockImg = new Image();
rockImg.src = "assets/rock.png";

/* === UI элементы === */
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

/* === Анимация спрайта собаки === */
let frameIndex = 0;
const frameCount = 9;
const frameDelay = 5;
let frameDelayCounter = 0;

const spriteCols = 3;
const spriteRows = 3;
const spriteSheetWidth = 1024;
const spriteSheetHeight = 1024;
const frameWidth = spriteSheetWidth / spriteCols;
const frameHeight = spriteSheetHeight / spriteRows;

/* === Игровое состояние === */
let player = { lane: 1, y: 350, width: 120, height: 120 };
const lanes = [15, 105, 205];
let bones = [];
let bombs = [];
let rocks = [];

let score = 0;
let speed = 2;
let isGameOver = false;

let gameInterval;
let boneInterval;
let bombInterval;
let rockInterval;

let bossActive = false;
let crow = {
  frame: 0,
  frameDelay: 7,
  frameCounter: 0,
  x: lanes[1],
  y: canvas.height,
  targetLane: 1,
};

/* === Рисование === */
function drawPlayer() {
  const col = frameIndex % spriteCols;
  const row = Math.floor(frameIndex / spriteCols);
  ctx.drawImage(
    dogSprite,
    col * frameWidth, row * frameHeight,
    frameWidth, frameHeight,
    lanes[player.lane] + (35 - player.width / 2), player.y,
    player.width, player.height
  );
  if (++frameDelayCounter >= frameDelay) {
    frameIndex = (frameIndex + 1) % frameCount;
    frameDelayCounter = 0;
  }
}

function drawBones() {
  bones.forEach(b =>
    ctx.drawImage(boneImg, lanes[b.lane], b.y, 60, 60)
  );
}

function drawBombs() {
  bombs.forEach(b =>
    ctx.drawImage(bombImg, lanes[b.lane], b.y, 40, 40)
  );
}

function drawRocks() {
  rocks.forEach(r =>
    ctx.drawImage(rockImg, lanes[r.lane], r.y, 60, 60)
  );
}

function drawCrow() {
  const crowCol = crow.frame % 3;
  const crowRow = Math.floor(crow.frame / 3);
  ctx.drawImage(
    crowSprite,
    crowCol * 341, crowRow * 341,
    341, 341,
    crow.x, crow.y,
    100, 100
  );
  if (++crow.frameCounter >= crow.frameDelay) {
    crow.frame = (crow.frame + 1) % 9;
    crow.frameCounter = 0;
  }
}

/* === Обновление === */
function updateBones() {
  bones.forEach(b => (b.y += speed));
  bones = bones.filter(b => b.y < canvas.height);

  bones.forEach(b => {
    if (
      b.lane === player.lane &&
      b.y + 60 >= player.y &&
      b.y <= player.y + player.height
    ) {
      score++;
      bones = bones.filter(x => x !== b);
    }
  });

  scoreDisplay.textContent = "Очки: " + score;
}

function updateBombs() {
  bombs.forEach(b => (b.y += speed));
  bombs = bombs.filter(b => b.y < canvas.height);

  bombs.forEach(b => {
    const top = b.y + 100;
    const bottom = b.y + 60;
    const isInSameLane = b.lane === player.lane;
    const intersects = bottom >= player.y && top <= player.y + player.height;
    if (isInSameLane && intersects) endGame();
  });
}

function updateRocks() {
  rocks.forEach(r => (r.y += speed));
  rocks = rocks.filter(r => r.y < canvas.height);

  rocks.forEach(r => {
    const isInSameLane = r.lane === player.lane;
    const intersects = r.y + 60 >= player.y && r.y <= player.y + player.height;
    if (isInSameLane && intersects) {
      crowAttack();
    }
  });
}

function updateCrow() {
  if (crow.y > player.y + player.height + 10) {
    crow.y -= 2;
  } else {
    crow.y = player.y + player.height + 10;
  }

  if (crow.targetLane !== player.lane) {
    crow.targetLane = player.lane;
    setTimeout(() => {
      crow.x = lanes[player.lane] + 20;
    }, 1000);
  }
}

/* === Спавн === */
function spawnBone() {
  bones.push({ lane: Math.floor(Math.random() * 3), y: -60 });
}

function spawnBomb() {
  const laneOptions = [0, 1, 2].filter(l =>
    !bones.some(b => b.lane === l && b.y < 100)
  );
  if (laneOptions.length === 0) return;
  const lane = laneOptions[Math.floor(Math.random() * laneOptions.length)];
  bombs.push({ lane: lane, y: -80 });
}

function spawnRock() {
  if (!bossActive) return;
  rocks.push({ lane: Math.floor(Math.random() * 3), y: -60 });
}

/* === Игровой цикл === */
function draw() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBones();
  drawBombs();
  drawRocks();

  updateBones();
  updateBombs();
  updateRocks();

  if (bossActive) {
    drawCrow();
    updateCrow();
  }

  if (!bossActive && (score >= 30 && (score - 30) % 50 === 0)) {
    activateBoss();
  }
}

/* === Ворона активируется === */
function activateBoss() {
  bossActive = true;
  player.y = 200;
  crow = {
    frame: 0,
    frameDelay: 7,
    frameCounter: 0,
    x: lanes[player.lane] + 20,
    y: canvas.height + 100,
    targetLane: player.lane
  };
  rockInterval = setInterval(spawnRock, 1500);
}

/* === Ворона атакует === */
function crowAttack() {
  endGame("🐦 Ворона настигла вас после столкновения с камнем!");
}

/* === Конец игры === */
function endGame(message = "💥 Вы попали на бомбу!") {
  isGameOver = true;
  clearInterval(gameInterval);
  clearInterval(boneInterval);
  clearInterval(bombInterval);
  clearInterval(rockInterval);
  restartBtn.style.display = "block";
  alert(`${message}\nИгра окончена. Очки: ${score}`);
}

/* === Старт игры === */
function startGame() {
  bones = [];
  bombs = [];
  rocks = [];
  score = 0;
  frameIndex = 0;
  frameDelayCounter = 0;
  isGameOver = false;
  bossActive = false;

  player.lane = 1;
  player.y = 350;

  scoreDisplay.textContent = "Очки: 0";
  restartBtn.style.display = "none";

  clearInterval(gameInterval);
  clearInterval(boneInterval);
  clearInterval(bombInterval);
  clearInterval(rockInterval);

  gameInterval = setInterval(draw, 20);
  boneInterval = setInterval(spawnBone, 1000);
  bombInterval = setInterval(spawnBomb, 3000);
}

/* === Управление === */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && player.lane > 0) player.lane--;
  if (e.key === "ArrowRight" && player.lane < 2) player.lane++;
});

/* === Запуск === */
startGame();
