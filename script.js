const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* --------- изображения --------- */
const dogSprite = new Image();
dogSprite.src = "assets/dog-sprite4.png";

const boneImg = new Image();
boneImg.src = "assets/bone1.png";

const bombImg = new Image();
bombImg.src = "assets/bomb.png";

const crowSprite = new Image();
crowSprite.src = "assets/crow-sprite.png";

/* --------- UI --------- */
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

/* --------- настройки спрайтов --------- */
let frameIndex = 0, frameDelayCounter = 0;
const frameCount = 9, frameDelay = 5;
const spriteCols = 3, spriteRows = 3;
const frameWidth = 1024 / spriteCols;
const frameHeight = 1024 / spriteRows;

let crowFrameIndex = 0, crowDelayCounter = 0;

/* --------- состояние --------- */
let player = { lane: 1, y: 350, width: 120, height: 120 };
const lanes = [15, 105, 205];
let bones = [], bombs = [], score = 0, speed = 2;
let isGameOver = false, isBossMode = false;
let gameInterval, boneInterval, bombInterval;

/* --------- враг (ворона) --------- */
let crow = { x: canvas.width / 2 - 60, y: -150, width: 120, height: 120 };
let crowSpriteReady = false;

crowSprite.onload = () => { crowSpriteReady = true; };

function drawCrow() {
  if (!crowSpriteReady) return;
  const col = crowFrameIndex % spriteCols;
  const row = Math.floor(crowFrameIndex / spriteCols);

  ctx.drawImage(
    crowSprite,
    col * frameWidth, row * frameHeight,
    frameWidth, frameHeight,
    crow.x, crow.y,
    crow.width, crow.height
  );

  if (++crowDelayCounter >= frameDelay) {
    crowFrameIndex = (crowFrameIndex + 1) % frameCount;
    crowDelayCounter = 0;
  }
}

/* --------- отрисовка --------- */
function drawPlayer() {
  const col = frameIndex % spriteCols;
  const row = Math.floor(frameIndex / spriteCols);
  ctx.drawImage(
    dogSprite,
    col * frameWidth, row * frameHeight,
    frameWidth, frameHeight,
    isBossMode ? player.x : lanes[player.lane] + (35 - player.width / 2),
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

/* --------- обновление --------- */
function updateBones() {
  bones.forEach(b => b.y += speed);
  bones = bones.filter(b => b.y < canvas.height);
  bones.forEach(b => {
    if (!isBossMode && b.lane === player.lane &&
        b.y + 60 >= player.y && b.y <= player.y + player.height) {
      score++;
      bones = bones.filter(x => x !== b);
    }
  });
  scoreDisplay.textContent = "Очки: " + score;
}

function updateBombs() {
  bombs.forEach(b => b.y += speed);
  bombs = bombs.filter(b => b.y < canvas.height);
  bombs.forEach(b => {
    const top = b.y + 60, bottom = b.y + 100;
    const intersect = bottom >= player.y && top <= player.y + player.height;
    const sameLane = !isBossMode && b.lane === player.lane;
    if (sameLane && intersect) endGame();
  });
}

function updateCrow() {
  crow.y += 0.5;
  if (crow.y + crow.height >= player.y) endGame();
}

function maybeEnterBossMode() {
  if (!isBossMode && (score >= 30 && (score - 30) % 50 === 0)) {
    isBossMode = true;
    bones = []; bombs = [];
    player.lane = 1;
    player.x = canvas.width / 2 - 60;
    player.y = 400;
    crow.y = -150;
  }
}

/* --------- цикл --------- */
function draw() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isBossMode) {
    drawCrow();
    updateCrow();
  }

  drawPlayer();
  if (!isBossMode) {
    drawBones();
    drawBombs();
    updateBones();
    updateBombs();
  }

  maybeEnterBossMode();
}

/* --------- спавн --------- */
function spawnBone() {
  if (!isBossMode) bones.push({ lane: Math.floor(Math.random() * 3), y: -60 });
}

function spawnBomb() {
  if (!isBossMode) {
    const laneOptions = [0, 1, 2].filter(l =>
      !bones.some(b => b.lane === l && b.y < 100)
    );
    if (laneOptions.length > 0) {
      const lane = laneOptions[Math.floor(Math.random() * laneOptions.length)];
      bombs.push({ lane, y: -80 });
    }
  }
}

/* --------- конец игры --------- */
function endGame() {
  isGameOver = true;
  clearInterval(gameInterval);
  clearInterval(boneInterval);
  clearInterval(bombInterval);
  restartBtn.style.display = "block";
  alert(`💥 Игра окончена! Очки: ${score}`);
}

/* --------- запуск --------- */
function startGame() {
  bones = []; bombs = [];
  score = 0; speed = 2;
  frameIndex = 0; frameDelayCounter = 0;
  crow.y = -150;
  isGameOver = false;
  isBossMode = false;

  player = { lane: 1, y: 350, width: 120, height: 120 };

  scoreDisplay.textContent = "Очки: 0";
  restartBtn.style.display = "none";

  clearInterval(gameInterval);
  clearInterval(boneInterval);
  clearInterval(bombInterval);

  gameInterval = setInterval(draw, 20);
  boneInterval = setInterval(spawnBone, 1000);
  bombInterval = setInterval(spawnBomb, 3000);
}

/* --------- управление --------- */
document.addEventListener("keydown", e => {
  if (!isBossMode) {
    if (e.key === "ArrowLeft" && player.lane > 0) player.lane--;
    if (e.key === "ArrowRight" && player.lane < 2) player.lane++;
  } else {
    if (e.key === "ArrowUp" && player.y > 0) player.y -= 10;
    if (e.key === "ArrowDown" && player.y < canvas.height - player.height) player.y += 10;
    if (e.key === "ArrowLeft") player.x -= 10;
    if (e.key === "ArrowRight") player.x += 10;
  }
});

/* --------- запуск --------- */
startGame();
