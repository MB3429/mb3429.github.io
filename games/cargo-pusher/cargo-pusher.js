const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
let currentMenu = 'home'
let inputCooldown = 0;

let levelFloor = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
let levelItems = [[0, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0]]
let levelWidth = levelFloor[0].length;
let levelHeight = levelFloor.length;
let tileSize = 32;
let playerPos = [0, 1]
let playerDir = 0;
const spriteList = [];
{
  const temp = new Image();
  temp.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADzUExURWJziWNzimR1i2V1i2V1jGV2i2V2jGV2jWZ2jGZ3jGZ3jWZ3jmd2jWd3jWd4jWd4jmh4jmh4j2h5j2l5kHKCmnOCm3ODm3SDm3SEnHWDnHWEnHWEnXWFnHWFnXaEnXaFnHaFnXaFnnaGnXaGn3eFnHeFnXeFnneGnXeGnneGn3eHnneHn3iGnXiGn3iHnniHn3iHoHiIoHiIoXmHn3mHoHmIoHmIoXmJoXqJonuLo4inwomowomow4mpw4mpxIqow4qoxIqpw4qpxYqqxIqqxYqqxoupw4upxIuqxIuqxYuqxourxoyrxoyrx4ysx42sxo6tyNP2UTgAAAK4SURBVBgZHcGLYttEEAXQJYEQt6aobWKvpJV3dM2OrmXFo20UHiUlLWlUKObx/19D0nPc8d39/ee3D799uJ2ffHp/O//39/H49nj85/bXP/76073atdi0PxoqYDRFiXICAYUabXznXtquoRhQBfU7lELslVMNwHbt7oM7k71fKaCgBdPLnmPDfVuBsCvzH903Vo0b2CSWA8ksyL6vJVNUTXa/u+InA1YNpSeplJpe0VMEhvLK7l2hil2joxJUbIEWIlDI3vasrmZ3Ypia/Z5lLgUAPZBRo/Yq2xUwu8IU0LLJffZIBON1BCBSX5oCD66wCUIq4cGUUmRKwXvNudaManbLiVo10iPf+HVI3RC6AxMgPvRtabNbVjJJSU9LKVFkJQMTEJFpovrgTqW1PhOIPh44pCGJSPA3GRe1L3nnlgIVEkC8HrpHMnQxEjkjoNejc6ZrEPgFSQ7dsO66TjrhEAFKH+7c11WlfQawigeR7klaSyI8chD55JaYeg0goqRu6L64DonJo9bAO7ekqAqQcgrSPfqhO6RBEiKQGe7cV6K7kQA8o3RfCJgIeBVtZreAcUTIMSBJlC6lgV0iwL6cuJ/dUpvtJHgUIanrJA0hkUDpL8pyO7vC9gIRgDjElMKaXUT0gFLrUM7u1Cpqk0W2uBki0xqMKSMjU9ni6AoDtFQP+kgQTBEV4ClSc7WdXQEYxAgR3EQPbvEooy7JssTsXgBc7de48ToSj4gnJSdcjqhu3UutUNbVWtd6QaIGfDXJKGQlZnbrCt1soBUhoWdmJupeCIxqVqP97F5vRFmVIFnlSzRjPbYCKXUCTDb/ulfj9urKYG8wCRnqhvrGVAADqn374L5f7Xa1qWH6GQRYgY3qBFS0DXYf3bfPz56dnb8oisXpYlkU56+Xp8vzxWJ5elJ8t3h28vx/o4OSjDD2Gj8AAAAASUVORK5CYII=';
  spriteList.push(temp);
  const temp2 = new Image()
  temp2.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAASUExURQAAAAEAAE1JRpE2B8ZiAP+nAZ7M4QEAAAABdFJOUwBA5thmAAAARElEQVQoz2NgIAcIIgEQnzEUCQiABEJUXKDAyQUi4IIAYAFjJCCAw1DR0EAoATVD1MURSgx1AWNjYWNDKCFAtzAlGQAA2vlHhxm10OcAAAAASUVORK5CYII=';
  spriteList.push(temp2);
}


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
      drawSprite(startX, startY, column, row, levelFloor[row][column]);
      if (levelItems[row][column]) {
        drawSprite(startX, startY, column, row, levelItems[row][column]);
      }
    }
  }
  drawSprite(startX, startY, playerPos[0], playerPos[1], 1);
}

function drawSprite(startX, startY, tileX, tileY, sprite) {
  context.drawImage(spriteList[sprite],
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
  levelItems[nextPos[1]][nextPos[0]] = levelItems[pos[1]][pos[0]];
  levelItems[pos[1]][pos[0]] = 0;
}