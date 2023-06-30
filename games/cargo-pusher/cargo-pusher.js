const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
let currentMenu = 'home'
let inputCooldown = 0;

let levelFloor = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
let levelItems = [[0, 'red', 0, 0], [0, 0, 0, 0], [0, 0, 0, 'yellow'], [0, 0, 0, 0], [0, 0, 0, 0]]
let levelWidth = levelFloor[0].length;
let levelHeight = levelFloor.length;
let tileSize = 40;
let playerPos = [0, 1]
let playerDir = 0;

setInterval(tickGame, 100);

function tickGame() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawFloor();
  if (inputCooldown) inputCooldown--;
}

function drawFloor() {
  const startX = canvas.width / 2 - levelWidth * tileSize / 2;
  const startY = canvas.height / 2 - levelHeight * tileSize / 2;
  for (let row = 0; row < levelHeight; row++) {
    for (let column = 0; column < levelWidth; column++) {
      context.fillStyle = 'orange';
      drawSprite(startX, startY, column, row, levelFloor[row][column]);
      if (levelItems[row][column]) {
        drawSprite(startX, startY, column, row, levelItems[row][column]);
      }
    }
  }
  drawSprite(startX, startY, playerPos[0], playerPos[1], 'green');
}

function drawSprite(startX, startY, tileX, tileY, sprite) {
  context.fillStyle = sprite;
  context.fillRect(
    startX + tileX * tileSize,
    startY + tileY * tileSize,
    tileSize,
    tileSize
  );
}

canvas.addEventListener('keydown', handlePress);

function handlePress(Event) {
  if (inputCooldown !== 0) return;
  switch (Event.key) {
    case 'ArrowLeft':
    case 'a': {
      playerDir = 2;
      if (checkPlayerCollision()) break;
      playerPos[0]--;
      inputCooldown = 1;
      break;
    }
    case 'ArrowRight':
    case 'd': {
      playerDir = 0;
      if (checkPlayerCollision()) break;
      playerPos[0]++;
      inputCooldown = 1;
      break;
    }
    case 'ArrowUp':
    case 'w': {
      playerDir = 3;
      if (checkPlayerCollision()) break;
      playerPos[1]--;
      inputCooldown = 1;
      break;
    }
    case 'ArrowDown':
    case 's': {
      playerDir = 1;
      if (checkPlayerCollision()) break;
      playerPos[1]++;
      inputCooldown = 1;
      break;
    }
  }
}

function checkPlayerCollision(dir = playerDir, pos = playerPos) {
  const deltaX = Math.round(Math.cos(dir*Math.PI/2));
  const deltaY = Math.round(Math.sin(dir*Math.PI/2));
  const nextPos = [
    pos[0]+deltaX,
    pos[1]+deltaY
  ]
  const collidedItem = levelItems[nextPos[1]][nextPos[0]];
  let collided = collidedItem !== 0;
  if (collided) {
    const collision2 = checkPlayerCollision(playerDir, nextPos)
    if (!collision2) {
      moveTile(dir, nextPos);
      collided = false;
    }
  }
  return collided;
}

function moveTile(dir, pos) {
  const deltaX = Math.round(Math.cos(dir*Math.PI/2));
  const deltaY = Math.round(Math.sin(dir*Math.PI/2));
  const nextPos = [
    pos[0]+deltaX,
    pos[1]+deltaY
  ]
  console.log(nextPos)
  levelItems[nextPos[1]][nextPos[0]] = levelItems[pos[1]][pos[0]];
  levelItems[pos[1]][pos[0]] = 0;
}