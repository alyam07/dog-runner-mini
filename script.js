<canvas id="gameCanvas" width="320" height="480"></canvas>
<div id="score">Очки: 0</div>
<button id="restartBtn" style="display:none;" onclick="startGame()">Заново</button>

<script>
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === Изображения ===
const dogSprite = new Image(); dogSprite.src = "assets/dog-sprite4.png";
const boneImg = new Image();    boneImg.src = "assets/bone1.png";
const crowSprite = new Image(); crowSprite.src = "assets/crow-sprite1.png";
const rockImg = new Image();    rockImg.src = "assets/rock.png";

// === UI ===
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

// === Анимация собаки ===
let frameIndex = 0, frameDelayCounter = 0;
const frameCount = 9, frameDelay = 5;
const spriteCols = 3, spriteRows = 3;
const frameWidth = 1024 / spriteCols;
const frameHeight = 1024 / spriteRows;

// === Игровое состояние ===
const lanes = [15, 105, 205];
let player = { lane: 1, y: 350, width: 120, height: 120 };
let bones = [], rocks = [], score = 0;
let speed = 2, isGameOver = false, bossActive = false;

let gameInterval, boneInterval, rockInterval;

let crow = {
  frame: 0, frameDelay: 7, frameCounter: 0,
  x: lanes[1], y: canvas.height, targetLane: 1
};

// === Отрисовка ===
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
  bones.forEach(b => ctx.drawImage(boneImg, lanes[b.lane], b.y, 60, 60));
}

function drawRocks() {
  rocks.forEach(r => ctx.drawImage(rockImg, lanes[r.lane], r.y, 60, 60));
}

function drawCrow() {
  const col = crow.frame % 3;
  const row = Math.floor(crow.frame / 3);
  ctx.drawImage(crowSprite, col * 341, row * 341, 341, 341, crow.x, crow.y, 100, 100);
  if (++crow.frameCounter >= crow.frameDelay) {
    crow.frame = (crow.frame + 1) % 9;
    crow.frameCounter = 0;
  }
}

// === Обновления ===
function updateBones() {
  bones.forEach(b => b.y += speed);
  bones = bones.filter(b => b.y < canvas.height);
  bones.forEach(b => {
    if (b.lane === player.lane && b.y + 60 >= player.y && b.y <= player.y + player.height) {
      bones = bones.filter(x => x !== b);
      score++;
    }
  });
  scoreDisplay.textContent = "Очки: " + score;
}

function updateRocks() {
  rocks.forEach(r => r.y += speed);
  rocks = rocks.filter(r => r.y < canvas.height);
  rocks.forEach(r => {
    const top = r.y + 80;
    const bottom = r.y + 40;
    if (r.lane === player.lane && bottom >= player.y && top <= player.y + player.height) {
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

// === Спавн ===
function spawnBone() {
  bones.push({ lane: Math.floor(Math.random() * 3), y: -60 });
}

function spawnRock() {
  if (bossActive) {
    rocks.push({ lane: Math.floor(Math.random() * 3), y: -60 });
  }
}

// === Цикл ===
function draw() {
  if (isGameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBones(); updateBones();
  drawRocks(); updateRocks();
  if (bossActive) {
    drawCrow(); updateCrow();
  }
  if (!bossActive && score >= 30 && (score - 30) % 50 === 0) {
    activateBoss();
  }
}

// === Босс ===
function activateBoss() {
  bossActive = true;
  player.y = 200;
  crow = { frame: 0, frameDelay: 7, frameCounter: 0, x: lanes[player.lane] + 20, y: canvas.height + 100, targetLane: player.lane };
  rocks = [];
  clearInterval(rockInterval);
  rockInterval = setInterval(spawnRock, 1500);
}

// === Атака вороны ===
function crowAttack() {
  endGame("🐦 Ворона настигла вас после столкновения с камнем!");
}

// === Конец игры ===
function endGame(message = "Игра окончена.") {
  isGameOver = true;
  clearInterval(gameInterval);
  clearInterval(boneInterval);
  clearInterval(rockInterval);
  restartBtn.style.display = "block";
  alert(`${message}\nОчки: ${score}`);
}

// === Запуск игры ===
function startGame() {
  bones = [];
  rocks = [];
  score = 0;
  frameIndex = 0;
  frameDelayCounter = 0;
  isGameOver = false;
  bossActive = false;
  player = { lane: 1, y: 350, width: 120, height: 120 };

  scoreDisplay.textContent = "Очки: 0";
  restartBtn.style.display = "none";

  clearInterval(gameInterval);
  clearInterval(boneInterval);
  clearInterval(rockInterval);

  gameInterval = setInterval(draw, 20);
  boneInterval = setInterval(spawnBone, 1000);
  rockInterval = setInterval(spawnRock, 999999); // временно "заморожен" до bossActive
}

// === Управление ===
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && player.lane > 0) player.lane--;
  if (e.key === "ArrowRight" && player.lane < 2) player.lane++;
});

// === Старт ===
startGame();
</script>
