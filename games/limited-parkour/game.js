const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let cameraOffsetX = 0;
let cameraOffsetY = 0;

const keysHeld = [];
const controls = {
  up: 'w',
  down: 's',
  left: 'a',
  right: 'd'
}

class Rectangle{

  constructor(x,y,width,height,color='black') {
    this.x=x;
    this.y=y;
    this.width=width;
    this.height=height;
    this.color=color;
  }

  x;
  y;
  width;
  height;
  color;

  render() {
    context.fillStyle = this.color;
    context.fillRect(this.x-cameraOffsetX,canvasHeight-this.y-cameraOffsetY-this.height,this.width,this.height)
  }

  contains(x,y) {
    return x > this.x &&
      x < this.x + this.width &&
      y > this.y &&
      y < this.y + this.height;
  }

}

class Level{

  constructor(boundX,boundY,pStartX,pStartY,pStartSize,rects) {
    this.boundX = boundX;
    this.boundY = boundY;
    this.pStartX = pStartX;
    this.pStartY = pStartY;
    this.pStartSize = pStartSize;
    rects.forEach(value => {
      this.rects.push(new Rectangle(...value))
    })
  }

  boundX;
  boundY;
  pStartX;
  pStartY;
  pStartSize;
  rects = [];

  render() {
    this.rects.forEach(rect => {rect.render()});
    renderPlayer();
  }

  contacted(x,y) {
    let contacted = false;
    this.rects.forEach(rect => {
      if (contacted) return;
      if (rect.contains(x,y)) contacted = true;
    })
    return contacted;
  }

}

let curScreen = 'inLevel';
let curLevel;
let curLvlData = new Level(2000, 1500, 1000, 750, 128, [
  [1000,300,50,300],[1100,300,1000,50]
]);

let playerVelX = 0;
let playerVelY = 0;
let playerAccelX = 0;
let playerX = curLvlData.pStartX;
let playerY = curLvlData.pStartY;

setInterval(tick, 25);

function tick() {
  context.clearRect(0, 0, canvasWidth, canvasHeight)

  handleMovement();

  curLvlData.render();
}

function renderPlayer() {
  context.fillStyle = 'red';
  context.fillRect(playerX-cameraOffsetX,canvasHeight-playerY-cameraOffsetY,50,50)
}

function handleMovement() {
  playerY += Math.round(playerVelY);

  let grounded = false;
  
  while(touchLevel(playerX, playerY-50)
    || touchLevel(playerX+25, playerY-50)
    || touchLevel(playerX+50, playerY-50)) {
    playerY++;
    grounded = true;
  }

  playerX += Math.round(playerVelX);

  const side = 25+Math.sign(playerVelX)*25;
  while (touchLevel(playerX+side, playerY)
  || touchLevel(playerX+side, playerY-25)
  || touchLevel(playerX+side, playerY-50)) {
    playerX-=Math.sign(playerVelX);
  }

  keysHeld.forEach(key => {
    switch (key) {
      case controls.up: {
        if (grounded) {
          playerVelY = 25;
        }
        break;
      }

      case controls.down: {
        break;
      }
      
      case controls.left: {
        if (grounded) {
          playerAccelX -= 3
        } else {
          playerAccelX -= 2;
        }
        break;
      }
      
      case controls.right: {
        if (grounded) {
          playerAccelX += 3
        } else {
          playerAccelX += 2;
        }
        break;
      }
    }
  })

  playerVelX = playerVelX * 0.9 + playerAccelX * 0.1;
  playerAccelX *= 0.9;

  if (!grounded) {
    playerVelY--;
  }

  cameraOffsetX = playerX - canvasWidth/2+25;
  cameraOffsetY = canvasHeight/2+25 - playerY;
}

function touchLevel(x,y) {
  return curLvlData.contacted(x,y);
}

canvas.addEventListener("keydown", Event => {
  if (!keysHeld.includes(Event.key)) keysHeld.push(Event.key);
})

canvas.addEventListener("keyup", Event => {
  keysHeld.splice(keysHeld.indexOf(Event.key), 1);
})