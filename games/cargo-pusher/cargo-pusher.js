const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
const width = canvas.width;
const height = canvas.height;

let curScreen = 'start';
let curLevel = undefined;
let settingsOpen = false;

const spriteList = document.getElementsByClassName('sprite');
const iconList = document.getElementsByClassName('icon');
let input = undefined;
let pushAmount = 0;
let pushable = [];

let savedData = JSON.parse(localStorage.getItem('cargo-pusher')) || {
  lastLevelUnlocked: 1,
  volume: 2,
  mobileMode: false
};
localStorage.setItem('cargo-pusher', JSON.stringify(savedData));

let mouseX = 0;
let mouseY = 0;
const clickableRegions = [];
let iconSize;
let clickX = -100;
let clickY = -100;
let settingsClickX = clickX;
let settingsClickY = clickY;

let transition = undefined;
let transitionIn = undefined;

const allLvlData = document.getElementById('level-data').children;
let curLvlData = undefined;

setInterval(tickGame, 50);

// Game function loop
function tickGame() {
  clickableRegions.length = 0;
  context.clearRect(0, 0, width, height)

  settingsClickX = clickX;
  settingsClickY = clickY;

  if (settingsOpen &&
    clickX > 440 &&
    clickX < 630 &&
    clickY > 10 &&
    clickY < 135
  ) {
    clickX = -100;
    clickY = -100;
  }

  switch (curScreen) {
    case 'start': {
      startScreen();
      break;
    }

    case 'levels': {
      levelsScreen();
      break;
    }

    case 'inLevel': {
      inLevelScreen();
      break;
    }
    
    case 'info': {
      break;
    }
  }
  
  // Handles transition fade-outs
  if (transition) {
    settingsOpen = false;
    if (transition.frame > 0) {
      transition.frame--;
      if (transition.frame < 10) {
        context.fillStyle = `rgba(0,0,0,${1-transition.frame/10})`;
        context.fillRect(0,0,width,height);
      }
    } else {
      curScreen = transition.endScreen;
      transition = undefined;
      transitionIn = { frame: 10 };
    }
  }

  if (transitionIn) {
    if (transitionIn.frame > 0) {
      context.fillStyle = `rgba(0,0,0,${transitionIn.frame/10})`;
      context.fillRect(0,0,width,height);
      transitionIn.frame--;
    } else {
      transitionIn = undefined;
    }
  }

  settingsScreen();

  clickX = -100;
  clickY = -100;
  input = undefined;
}

// Handles the settings button and settings screen
function settingsScreen() {
  iconSize = [width-67,15,52,52];
  if (regionContains(settingsClickX, settingsClickY, ...iconSize)) settingsOpen = !settingsOpen;

  if (settingsOpen) {
    context.lineWidth = 4;
    const settingsWidth = 190;
    const settingsHeight = 125;
    context.clearRect(630-settingsWidth,10,settingsWidth,settingsHeight);
    context.strokeRect(630-settingsWidth,10,settingsWidth,settingsHeight);
    context.drawImage(iconList[0],13,0,13,13,...iconSize);

    // Change volume button
    iconSize = [640-settingsWidth,15,52,52];
    if (regionContains(settingsClickX, settingsClickY, ...iconSize)) {
      savedData.volume = (savedData.volume + 1) % 3;
      localStorage.setItem('cargo-pusher', JSON.stringify(savedData));
    }
    context.drawImage(iconList[1],savedData.volume * 13,0,13,13,...iconSize);

    // Toggle Mobile/PC button
    iconSize = [630-11*settingsWidth/12,80,5*settingsWidth/6,40];
    context.strokeRect(...iconSize);
    if (regionContains(settingsClickX, settingsClickY, ...iconSize)) {
      savedData.mobileMode = !savedData.mobileMode;
      localStorage.setItem('cargo-pusher', JSON.stringify(savedData));
    }
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.font = '24px "Press Start 2P"';
    context.fillText(savedData.mobileMode ? 'Mobile' : 'PC',630-settingsWidth/2,114);

  } else {
    context.drawImage(iconList[0],0,0,13,13, ...iconSize)
  }
}

// Handles the start screen of the game
function startScreen() {
  iconSize = [width/2-150, height/2+50, 300, 60];
  if (regionContains(clickX, clickY, ...iconSize)) {
    transition = {
      frame: 25,
      endScreen: 'levels'
    };
  }

  context.lineWidth = 4;
  context.strokeRect(...iconSize);

  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.font = '40px "Press Start 2P"';
  context.fillText('Play', width/2, height/2+103);
  context.fillText('Cargo Pusher', width/2, height/2-50);

  context.drawImage(spriteList[6],0,0,32,32,width/2,height/2-32,64,64);
  context.drawImage(spriteList[1],width/2+64,height/2-32,64,64)
  context.drawImage(spriteList[8],0,0,32,32,width/2+64,height/2-32,64,64);

  let offset = 0;
  if (transition) offset = Math.min((25-transition.frame)*64/15,64);

  context.drawImage(spriteList[1],width/2-128,height/2-32,64,64)
  context.drawImage(spriteList[1],width/2-64,height/2-32,64,64)

  context.drawImage(spriteList[0],0,0,32,32,width/2-128+offset,height/2-32,64,64);
  context.drawImage(spriteList[2],width/2-64+offset,height/2-32,64,64);
}

// Handles the level select screen of the game
function levelsScreen() {
  context.font = '24px "Press Start 2P"';
  context.fillStyle = 'black';
  context.textAlign = 'center';
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
      iconSize = [38+100*i,90+100*j,64,64];
      context.drawImage(spriteList[1], ...iconSize);
      if (savedData.lastLevelUnlocked < j*6+i+1) {
        context.drawImage(iconList[3],46+100*i,98+100*j,48,48);
      } else {
        context.fillText(j*6+i+1,70+100*i,136+100*j,64,64);
        if (regionContains(clickX, clickY, ...iconSize)) {
          curLevel = j*6+i+1;
          curLvlData = JSON.parse(allLvlData[curLevel-1].textContent)
          transition = {
            frame: 10,
            endScreen: 'inLevel'
          };
        }
      }
    }
  }

  iconSize = [15,15,52,52]
  context.drawImage(iconList[2], ...iconSize);
  if (regionContains(clickX, clickY, ...iconSize)) {
    transition = {
      frame: 10,
      endScreen: 'start'
    };
  }
}

// Handles the screen when in a level
function inLevelScreen() {
  playerMove(input);

  const lvlWidth = curLvlData.floor[0].length;
  const lvlHeight = curLvlData.floor.length;
  printLayer(curLvlData.floor, lvlWidth, lvlHeight, 32);
  printLayer(curLvlData.items, lvlWidth, lvlHeight, 32);
  printPlayer(lvlWidth, lvlHeight, 32);
  if (savedData.mobileMode) printMovement(lvlWidth, lvlHeight, 32);

  context.font = '32px "Press Start 2P"';
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.fillText(curLevel, width/2, 50);

  // Reset level button
  iconSize = [15,15,52,52];
  context.drawImage(iconList[4], ...iconSize);
  if (regionContains(clickX, clickY, ...iconSize)) {
    curLvlData = JSON.parse(allLvlData[curLevel-1].textContent);
  }

  // Exit level button
  iconSize = [15,82,52,52];
  context.drawImage(iconList[5], ...iconSize);
  if (regionContains(clickX, clickY, ...iconSize)) {
    transition = {
      frame: 10,
      endScreen: 'levels'
    };
  }
}

// Draw a layer of the level
function printLayer(data, lvlWidth, lvlHeight, tileSize) {
  let startX = (width-tileSize*lvlWidth)/2;
  let startY = (height-tileSize*lvlHeight)/2 + 20;
  for (let i = 0; i < lvlWidth; i++) {
    for (let j = 0; j < lvlHeight; j++) {
      iconSize = [startX + i*tileSize, startY + j*tileSize, tileSize, tileSize];
      let tile = data[j][i];
      switch (tile[0]) {
        case 'f': {
          context.drawImage(spriteList[1], ...iconSize);
          break;
        }

        case 'c': {
          switch (tile[1]) {
            case 'l': {
              context.drawImage(spriteList[2], ...iconSize);
              break;
            }

            case 'h': {
              context.drawImage(spriteList[3], ...iconSize);
              break;
            }

            case 't': {
              context.drawImage(spriteList[4], 0, tile[2]*32, 32, 32, ...iconSize);
              break;
            }

            case 'w': {
              context.drawImage(spriteList[5], tile[2]*32, 0, 32, 32, ...iconSize);
              break;
            }
          }
          break;
        }

        case 't': {
          context.drawImage(spriteList[['b','m','f'].indexOf(tile[1])+6],32*tile[2],0,32,32, ...iconSize);
          break;
        }

        case 'w': {
          context.drawImage(spriteList[9], ...iconSize);
          break;
        }

        case 'r': {
          let right = ['c','r'].includes(data[j][i+1][0]);
          let up =    ['c','r'].includes(data[j-1][i][0]);
          let left =  ['c','r'].includes(data[j][i-1][0]);
          let down =  ['c','r'].includes(data[j+1][i][0]);
          if (true) {
            right |= (j === curLvlData.playerY && i+1 === curLvlData.playerX && curLvlData.playerDir === 2);
            up |=  (j-1 === curLvlData.playerY && i === curLvlData.playerX && curLvlData.playerDir === 3);
            left |= (j === curLvlData.playerY && i-1 === curLvlData.playerX && curLvlData.playerDir === 0);
            down |= (j+1 === curLvlData.playerY && i === curLvlData.playerX && curLvlData.playerDir === 1);
          }
          context.drawImage(spriteList[10],
            38*(right+2*up+4*left+8*down),
            0, 38, 38,
            iconSize[0]-3, iconSize[1]-3,
            38, 38);
          break;
        }

        default: {}
      }
    }
  }
}

// Draw player sprite onto canvas
function printPlayer(lvlWidth, lvlHeight, tileSize) {
  let startX = (width-tileSize*lvlWidth)/2;
  let startY = (height-tileSize*lvlHeight)/2 + 20;
  iconSize = [startX + curLvlData.playerX*tileSize, startY + curLvlData.playerY*tileSize, tileSize, tileSize];
  context.drawImage(spriteList[0], curLvlData.playerDir*32, 0, 32, 32, ...iconSize);
}

// Draw the mobile controls
function printMovement(lvlWidth, lvlHeight, tileSize) {
  const startX = (width-tileSize*lvlWidth)/2;
  const startY = (height-tileSize*lvlHeight)/2 + 20;
  let move = undefined;

  const emptyRow = [...curLvlData.items[0]].fill('');

  for (let i = 0; i < 4; i++) {
    const dx = (i === 0) - (i === 2);
    const dy = (i === 3) - (i === 1);

    pushable.length = 0;
    for (let i = 0; i < curLvlData.items.length; i++) {
      pushable.push([...emptyRow]);
    }
    pushAmount = 0;

    if (attemptPush(curLvlData.playerX + dx, curLvlData.playerY + dy, dx, dy) && pushAmount <= 3) {
      iconSize = [startX + (curLvlData.playerX + dx)*tileSize + 4, startY + (curLvlData.playerY + dy)*tileSize + 4, tileSize - 8, tileSize - 8];
      context.drawImage(iconList[6], i*12, 0, 12, 12, ...iconSize);
      if (regionContains(clickX, clickY, ...iconSize, false)) move = i;
    } 
  }

  if (move !== undefined) {
    playerMove(move);
  }
}

// Execute the player move
function playerMove(move) {
  if (move === undefined) return;
  
  const dx = (move === 0) - (move === 2);
  const dy = (move === 3) - (move === 1);
  curLvlData.playerDir = move;

  pushable.length = 0;
  const emptyRow = [...curLvlData.items[0]].fill('');
  for (let i = 0; i < curLvlData.items.length; i++) {
    pushable.push([...emptyRow]);
  }

  pushAmount = 0;

  if (attemptPush(curLvlData.playerX + dx, curLvlData.playerY + dy, dx, dy) && pushAmount <= 3) {
    completePush(move);
    curLvlData.playerY += dy;
    curLvlData.playerX += dx;
    if (detectWin()) {
      transition = {
        frame: 10,
        endScreen: 'levels'
      }
      if (savedData.lastLevelUnlocked === curLevel) {
        savedData.lastLevelUnlocked++;
        localStorage.setItem('cargo-pusher', JSON.stringify(savedData));
      }
    }
  }
}

// Detect if the game is over
function detectWin() {
  const floor = curLvlData.floor;
  const items = curLvlData.items;
  for (let i = 0; i < floor.length; i++) {
    for (let j = 0; j < floor[0].length; j++) {
      if (floor[i][j][0] === 't' && items[i][j][0] !== 'c') return false;
    }
  }
  return true;
}

// Check what items should be pushed
function attemptPush(posX, posY, dx, dy) {
  const item = curLvlData.items[posY][posX];
  if (pushable[posY][posX] === true || pushable[posY][posX] === false) return pushable[posY][posX];

  switch (item[0]) {
    case 't':
    case 'w': {
      pushable[posY][posX] = false;
      return false;
      break;
    }

    case 'c': {
      switch (item[1]) {
        case 'l': {
          if (attemptPush(posX + dx, posY + dy, dx, dy)) {
            pushAmount++;
            pushable[posY][posX] = true;
            return true;
          }
          break;
        }

        case 'h': {
          if (attemptPush(posX + dx, posY + dy, dx, dy)) {
            pushAmount += 2;
            pushable[posY][posX] = true;
            return true;
          }
          break;
        }
        
        case 't': {
          pushable[posY][posX] = '...';
          if (attemptPush(posX + dx, posY + dy, dx, dy)) {
            const bottomOrTop = item[2] === '0' ? 1 : -1;
            if (dy !== 0) {
              if (dy === -bottomOrTop) pushAmount += 2
              pushable[posY][posX] = true;
              pushable[posY + bottomOrTop][posX] = true;
              return true;
            }

            if (pushable[posY + bottomOrTop][posX] === '') {
              const connectedTile = attemptPush(posX, posY + bottomOrTop, dx, dy)
              if (connectedTile) pushAmount += 2;
              pushable[posY][posX] = connectedTile;
              pushable[posY + bottomOrTop][posX] = connectedTile;
              return connectedTile;

            } else {
              return attemptPush(posX + dx, posY + dy, dx ,dy);
            }
          }
          break;
        }
        
        case 'w': {
          pushable[posY][posX] = '...';
          if (attemptPush(posX + dx, posY + dy, dx, dy)) {
            const bottomOrTop = item[2] === '0' ? 1 : -1;
            if (dx !== 0) {
              if (dx === -bottomOrTop) pushAmount += 2
              pushable[posY][posX] = true;
              pushable[posY][posX + bottomOrTop] = true;
              return true;
            }

            if (pushable[posY][posX + bottomOrTop] === '') {
              const connectedTile = attemptPush(posX + bottomOrTop, posY, dx, dy)
              if (connectedTile) pushAmount += 2;
              pushable[posY][posX] = connectedTile;
              pushable[posY][posX + bottomOrTop] = connectedTile;
              return connectedTile;

            } else {
              return attemptPush(posX + dx, posY + dy, dx ,dy);
            }
          }
          break;
        }
      }
      break;
    }

    case 'r': {
      if (attemptPush(posX + dx, posY + dy, dx, dy)) {
        pushable[posY][posX] = '...';
        if (pushable[posY + dx][posX - dy] === '') {
          pushable[posY + dx][posX - dy] = '...';
          attemptPush(posX - dy, posY + dx, dx, dy);
        }
        if (pushable[posY - dx][posX + dy] === '') {
          pushable[posY - dx][posX + dy] = '...';
          attemptPush(posX + dy, posY - dx, dx, dy);
        }
        if (pushable[posY - dy][posX - dx] === '') {
          pushable[posY - dy][posX - dx] = '...';
          attemptPush(posX - dx, posY - dy, dx, dy);
        }

        pushable[posY][posX] = true;
        return true;
      }
      break;
    }

    case undefined: {
      return true;
    }
  }
  pushable[posY][posX] = false;
  return false;
}

// Actually pushes
function completePush(dir) {
  const width = curLvlData.items[0].length;
  const height = curLvlData.items.length;
  switch (dir) {
    case 0: {
      for (let i = width - 1; i >= 0; i--) {
        for (let j = 0; j < height; j++) {
          if (pushable[j][i] === true) {
            curLvlData.items[j][i + 1] = curLvlData.items[j][i];
            curLvlData.items[j][i] = '';
          }
        }
      }
      break;
    }

    case 1: {
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          if (pushable[j][i] === true) {
            curLvlData.items[j - 1][i] = curLvlData.items[j][i];
            curLvlData.items[j][i] = '';
          }
        }
      }
      break;
    }

    case 2: {
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          if (pushable[j][i] === true) {
            curLvlData.items[j][i - 1] = curLvlData.items[j][i];
            curLvlData.items[j][i] = '';
          }
        }
      }
      break;
    }

    case 3: {
      for (let i = 0; i < width; i++) {
        for (let j = height - 1; j >= 0; j--) {
          if (pushable[j][i] === true) {
            curLvlData.items[j + 1][i] = curLvlData.items[j][i];
            curLvlData.items[j][i] = '';
          }
        }
      }
      break;
    }
  
    default:
      break;
  }
}

// Detects mouse movement and handles hover effects
canvas.addEventListener('mousemove', Event => {
  const bounding = canvas.getBoundingClientRect();
  mouseX = (Event.clientX - bounding.x)/canvas.offsetWidth*640;
  mouseY = (Event.clientY - bounding.y)/canvas.offsetHeight*480;
  canvas.style.cursor = 'default';
  if (!savedData.mobileMode && !transition && !transitionIn &&
    clickableRegions.find(region => regionContains(mouseX,mouseY,...region, false))
  ) {
    canvas.style.cursor = 'pointer';
  }
})

// Detects clicks
canvas.addEventListener('click', () => {
  if (!transition && !transitionIn) {
    clickX = mouseX;
    clickY = mouseY;
  }
})

// Detects key presses and converts them to player moves
canvas.addEventListener('keydown', Event => {
  if (transition || transitionIn || savedData.mobileMode) return;
  switch(Event.key.toLowerCase()) {
    case 'w':
    case 'arrowup': {
      input = 1;
      break;
    }
    case 's':
    case 'arrowdown': {
      input = 3;
      break;
    }
    case 'd':
    case 'arrowright': {
      input = 0;
      break;
    }
    case 'a':
    case 'arrowleft': {
      input = 2;
      break;
    }
    case 'r': {
      if (curScreen === 'inLevel') {
        curLvlData = JSON.parse(allLvlData[curLevel-1].textContent);
      }
    }
  }
})

// Utility function for detecting if a region contains a point
function regionContains(targetX,targetY,x,y,width,height,push = true) {
  if (push) clickableRegions.push([x,y,width,height]);
  return targetX > x &&
    targetX < x + width &&
    targetY > y &&
    targetY < y + height;
}
