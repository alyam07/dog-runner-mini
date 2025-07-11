const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const sprite = new Image();
sprite.src = "assets/dog-sprite1.png"; // 768x768, 3x3 кадров

const boneImg = new Image();
boneImg.src = "assets/bone.png";

const scoreDisplay = document.getElementById("score");

const frameCols = 3;
const frameRows = 3;
const totalFrames = frameCols * frameRows;
const frameWidth = 768 / frameCols;
const frameHeight = 768 / frameRows;

let currentFrame = 0;
let frameCounter = 0;

let player = {
  lane: 1,
  y: 220,
  width: frameWidth,
  height: frameHeight,
};

const lanes = [30, 130, 230];
let bones = [];
let score = 0;
let speed = 2;
let gameInterval;
let boneInterval;

function drawPlayer() {
  const col = currentFrame % frameCols;
  const row = Math.floor(currentFrame / frameCols);

  ctx.drawImage(
    sprite,
    col * frameWidth,
    row * frameHeight,
    frameWidth,
    frameHeight,
    lanes[player.lane],
    player.y,
    player.width,
    player.height
  );

  frameCounter++;
  if (frameCounter % 5 === 0) {
    currentFrame = (currentFrame + 1) % totalFrames;
  }
}

function drawBones() {
  bones.forEach(b => {
    ctx.drawImage(boneImg, lanes[b.lane], b.y, 30, 30);
  });
}

function updateBones() {
  bones.forEach(b => b.y += speed);
  bones = bones.filter(b => b.y < canvas.height);

  for (let b of bones) {
    if (
      b.lane === player.lane &&
      b.y + 30 >= player.y &&
      b.y <= player.y + player.height
    ) {
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
