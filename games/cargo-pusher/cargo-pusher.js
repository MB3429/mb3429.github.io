const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
const width = canvas.width;
const height = canvas.height;
let curScreen = 'start';
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
const clickableRegions = []
let clickX = -100;
let clickY = -100;
let transition = undefined;
let transitionIn = undefined;

canvas.onload = load();

function load() {
  document.getElementById('game-title').classList.add('hidden')
  interval = setInterval(tickGame, 100);
  localStorage.setItem('cargo-pusher', JSON.stringify(savedData));
}

function tickGame() {
  clickableRegions.length = 0;
  context.clearRect(0, 0, width, height)

  switch (curScreen) {
    case 'start': {
      handleStartScreen();
      break;
    }

    case 'levels': {
      break;
    }

    case 'inLevel': {
      break;
    }
    
    case 'info': {
      break;
    }
  }

  handleSettingsIcon();
  if (settingsOpen) {
    handleSettingsScreen();
  }

  if (transitionIn !== undefined) {
    if (transitionIn.frame > 0) {
      context.fillStyle = `rgba(0,0,0,${transitionIn.frame/10})`;
      context.fillRect(0,0,width,height);
      transitionIn.frame--;
    } else {
      transitionIn = undefined;
    }
  }
  
  if (transition !== undefined) {
    canvas.style.cursor = 'default';
    if (transition.frame > 0) {
      transition.frame--;
    } else {
      curScreen = transition.endScreen;
      transition = undefined;
      transitionIn = { frame: 10 };
    }
  }

  clickX = -100;
  clickY = -100;
}

function handleStartScreen() {
  if (clickX > width/2-150 &&
    clickX < width/2+150 &&
    clickY > height/2+50 &&
    clickY < height/2+110
  ) {
    transition = {
      frame: 20,
      endScreen: 'levels'
    };
  }

  context.lineWidth = 4;
  context.strokeRect(width/2-150, height/2+50, 300, 60);
  clickableRegions.push([width/2-150, height/2+50, 300, 60]);

  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.font = '40px "Press Start 2P"';
  context.fillText('Play', width/2, height/2+103);
  context.fillText('Cargo Pusher', width/2, height/2-50);

  context.drawImage(spriteList[4],width/2,height/2-32,64,64);
  context.drawImage(spriteList[6],width/2+64,height/2-32,64,64);

  if (transition === undefined) {
    context.drawImage(spriteList[0],0,0,32,32,width/2-128,height/2-32,64,64);
    context.drawImage(spriteList[2],width/2-64,height/2-32,64,64);

  } else if (transition.frame > 10) {
    context.drawImage(spriteList[0],0,0,32,32,width/2-128+6.4*(20-transition.frame),height/2-32,64,64);
    context.drawImage(spriteList[2],width/2-64+6.4*(20-transition.frame),height/2-32,64,64);

  } else {
    context.drawImage(spriteList[0],0,0,32,32,width/2-64,height/2-32,64,64);
    context.drawImage(spriteList[2],width/2,height/2-32,64,64);

    context.fillStyle = `rgba(0,0,0,${1-transition.frame/10})`;
    context.fillRect(0,0,width,height);
  }
}

function handleSettingsIcon() {
  clickableRegions.push([width-15-52,15,52,52]);
  if (clickX > width-67 &&
    clickX < width-15 &&
    clickY > 15 &&
    clickY < 67
  ) settingsOpen = !settingsOpen;
  if (!settingsOpen) context.drawImage(iconList[0],0,0,13,13,width-15-52,15,52,52)
}

function handleSettingsScreen() {
  context.lineWidth = 4;
  const settingsWidth = 190;
  const settingsHeight = 125;
  context.clearRect(630-settingsWidth,10,settingsWidth,settingsHeight);
  context.strokeRect(630-settingsWidth,10,settingsWidth,settingsHeight);
  context.drawImage(iconList[0],13,0,13,13,width-15-52,15,52,52);
  handleVolumeIcon(settingsWidth);
  handleMobileButton(settingsWidth);
}

function handleVolumeIcon(settingsWidth) {
  let temp = 640-settingsWidth
  clickableRegions.push([temp,15,52,52]);
  if (clickX > temp &&
    clickX < temp+52 &&
    clickY > 15 &&
    clickY < 67
  ) {
    savedData.volume = (savedData.volume + 1) % 3;
    localStorage.setItem('cargo-pusher', JSON.stringify(savedData));
  }
  context.drawImage(iconList[1],savedData.volume * 13,0,13,13,temp,15,52,52);
}

function handleMobileButton(settingsWidth) {
  let temp = settingsWidth/12;
  context.strokeRect(630-11*temp,80,10*temp,40);
  clickableRegions.push([630-11*temp,80,10*temp,40])
  if (clickX > 630-11*temp &&
    clickX < 630-temp &&
    clickY > 80 &&
    clickY < 120
  ) {
    savedData.mobileMode = !savedData.mobileMode;
    localStorage.setItem('cargo-pusher', JSON.stringify(savedData));
  }
  context.fillStyle = 'black';
  context.font = '24px "Press Start 2P"';
  context.fillText(savedData.mobileMode ? 'Mobile' : 'PC',630-settingsWidth/2,114);
}

canvas.addEventListener('mousemove', Event => {
  if (transition === undefined && transitionIn === undefined) {
    mouseX = (Event.clientX - canvas.offsetLeft)/canvas.offsetWidth*640;
    mouseY = (Event.clientY - canvas.offsetTop)/canvas.offsetHeight*480;
    canvas.style.cursor = 'default';
    clickableRegions.forEach(region => {
      if (mouseX > region[0] &&
      mouseX < region[0] + region[2] &&
      mouseY > region[1] &&
      mouseY < region[1] + region[3]
      ) canvas.style.cursor = 'pointer';
    })
  }
})

canvas.addEventListener('click', () => {
  if (transition === undefined && transitionIn === undefined) {
    clickX = mouseX;
    clickY = mouseY;
  }
})