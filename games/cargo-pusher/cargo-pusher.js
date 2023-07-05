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
let inputTimeout = true;
let interval;
let savedData = JSON.parse(localStorage.getItem('cargo-pusher')) || {
  lastLevelUnlocked: 10,
  volume: 2,
  mobileMode: false
};
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

canvas.onload = load();

function load() {
  document.getElementById('game-title').classList.add('hidden')
  interval = setInterval(tickGame, 100);
  localStorage.setItem('cargo-pusher', JSON.stringify(savedData));
}

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
      frame: 20,
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

  context.drawImage(spriteList[4],width/2-4,height/2-32,64,64);
  context.drawImage(spriteList[6],width/2+60,height/2-32,64,64);

  let offset = 0;
  if (transition) offset = Math.min((20-transition.frame)*6.4,64);

  context.drawImage(spriteList[0],0,0,32,32,width/2-132+offset,height/2-32,64,64);
  context.drawImage(spriteList[2],width/2-68+offset,height/2-32,64,64);
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
  context.font = '32px "Press Start 2P"';
  context.fillStyle = 'black';
  context.textAlign = 'center'
  context.fillText(curLevel, width/2, 50)

  // Reset level button
  iconSize = [15,15,52,52];
  context.drawImage(iconList[4], ...iconSize);
  if (regionContains(clickX, clickY, ...iconSize)) {
    console.log('reset level');
  }

  // Exit level button
  iconSize = [15,82,52,52];
  context.drawImage(iconList[5], ...iconSize);
  if (regionContains(clickX, clickY, ...iconSize)) {
    transition = {
      frame: 10,
      endScreen: 'levels'
    }
  }
}

// Detects mouse movement and handles hover effects
canvas.addEventListener('mousemove', Event => {
  mouseX = (Event.clientX - canvas.offsetLeft)/canvas.offsetWidth*640;
  mouseY = (Event.clientY - canvas.offsetTop)/canvas.offsetHeight*480;
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

// Utility function for detecting if a region contains a point
function regionContains(targetX,targetY,x,y,width,height,push = true) {
  if (push) clickableRegions.push([x,y,width,height]);
  return targetX > x &&
    targetX < x + width &&
    targetY > y &&
    targetY < y + height;
}