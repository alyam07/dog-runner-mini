const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dogSprite = new Image();
dogSprite.src = "assets/dog-sprite4.png";

const boneImg = new Image();
boneImg.src = "assets/bone1.png";

let scoreDisplay = document.getElementById("score");

let frameIndex = 0;
let frameCount = 9;
let frameDelay = 5;
let frameDelayCounter = 0;

const spriteCols = 3;
const spriteRows = 3;

// Размеры изображения спрайта
const spriteSheetWidth = 1024;
const spriteSheetHeight = 1024;

// Размер одного кадра
const frameWidth = 341;
const frameHeight = 341;

let player = {
  lane: 1,
  y: 350,
  width: 120,   // Отображаемый размер на canvas
  height: 120,
};

let lanes = [15, 105, 205];
let bones = [];
let score = 0;
let speed = 2;
let gameInterval;
let boneInterval;

function drawPlayer() {
  let col = frameIndex % spriteCols;
  let row = Math.floor(frameIndex / spriteCols);

  ctx.drawImage(
    dogSprite,
    col * frameWidth, row * frameHeight,
    frameWidth, frameHeight,
    lanes[player.lane] + (18 - player.width / 2), player.y,
    player.width, player.height
  );

  frameDelayCounter++;
  if (frameDelayCounter >= frameDelay) {
    frameIndex = (frameIndex + 1) % frameCount;
    frameDelayCounter = 0;
  }
}

function drawBones() {
  bones.forEach(b => {
    ctx.drawImage(boneImg, lanes[b.lane], b.y, 80, 80);
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
  frameIndex = 0;
  frameDelayCounter = 0;
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
