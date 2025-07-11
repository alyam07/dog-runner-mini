const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let dogImg = new Image();
let boneImg = new Image();
dogImg.src = "assets/dog.png";
boneImg.src = "assets/bone.png";

let scoreDisplay = document.getElementById("score");

let player = { lane: 1, y: 400, width: 40, height: 40 };
let lanes = [30, 130, 230];
let bones = [];
let score = 0;
let speed = 2;
let gameInterval;
let boneInterval;

function drawPlayer() {
  ctx.drawImage(dogImg, lanes[player.lane], player.y, player.width, player.height);
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
