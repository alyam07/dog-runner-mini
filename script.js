const canvas = document.getElementById("gameCanvas");
const ctx   = canvas.getContext("2d");

/* --------- изображения --------- */
const dogSprite = new Image();
dogSprite.src = "assets/dog-sprite4.png";

const boneImg  = new Image();
boneImg.src    = "assets/bone1.png";

const bombImg  = new Image();
bombImg.src    = "assets/bomb.png";

/* --------- элементы UI --------- */
const scoreDisplay = document.getElementById("score");
const restartBtn   = document.getElementById("restartBtn");

/* --------- анимация спрайта --------- */
let frameIndex         = 0;
const frameCount       = 9;
const frameDelay       = 5;
let frameDelayCounter  = 0;

const spriteCols = 3;
const spriteRows = 3;
const spriteSheetWidth  = 1024;
const spriteSheetHeight = 1024;
const frameWidth  = spriteSheetWidth  / spriteCols; // 341.33
const frameHeight = spriteSheetHeight / spriteRows; // 341.33

/* --------- игровое состояние --------- */
let player = { lane: 1, y: 350, width: 120, height: 120 };
const lanes = [15, 105, 205];

let bones = [];
let bombs = [];
let score = 0;
let speed = 2;

let gameInterval;
let boneInterval;
let bombInterval;
let isGameOver = false;

/* =========================== РИСОВАНИЕ =========================== */
function drawPlayer() {
  const col = frameIndex % spriteCols;
  const row = Math.floor(frameIndex / spriteCols);

  ctx.drawImage(
    dogSprite,
    col * frameWidth, row * frameHeight,
    frameWidth, frameHeight,
    lanes[player.lane] + (35 - player.width / 2),
    player.y,
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
    ctx.drawImage(bombImg, lanes[b.lane], b.y, 60, 80)
  );
}

/* =========================== ОБНОВЛЕНИЕ =========================== */
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
    const activeZoneTopY = b.y + 100;      // начало опасной зоны (нижние 20px)
    const activeZoneBottomY = b.y + 20;   // конец бомбы

    const isInSameLane = b.lane === player.lane;
    const intersects = activeZoneBottomY >= player.y && activeZoneTopY <= player.y + player.height;

    if (isInSameLane && intersects) {
      endGame();
    }
  });
}

/* =========================== СПАВН =========================== */
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

/* =========================== ЦИКЛ =========================== */
function draw() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBones();
  drawBombs();
  updateBones();
  updateBombs();
}

/* =========================== КОНЕЦ ИГРЫ =========================== */
function endGame() {
  isGameOver = true;
  clearInterval(gameInterval);
  clearInterval(boneInterval);
  clearInterval(bombInterval);
  restartBtn.style.display = "block";
  alert(`💥 Вы попали на бомбу!\nИгра окончена. Очки: ${score}`);
}

/* =========================== СТАРТ/РЕСТАРТ =========================== */
function startGame() {
  bones = [];
  bombs = [];
  score = 0;
  frameIndex = 0;
  frameDelayCounter = 0;
  isGameOver = false;

  player.lane = 1;
  scoreDisplay.textContent = "Очки: 0";
  restartBtn.style.display = "none";

  clearInterval(gameInterval);
  clearInterval(boneInterval);
  clearInterval(bombInterval);

  gameInterval = setInterval(draw, 20);
  boneInterval = setInterval(spawnBone, 1000);
  bombInterval = setInterval(spawnBomb, 3000);
}

/* =========================== УПРАВЛЕНИЕ =========================== */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft"  && player.lane > 0) player.lane--;
  if (e.key === "ArrowRight" && player.lane < 2) player.lane++;
});

/* =========================== ЗАПУСК =========================== */
startGame();
