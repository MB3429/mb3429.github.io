const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
const width = canvas.width;
const height = canvas.height;
let curScreen = 'start';
let settingsOpen = true;
const spriteList = document.getElementsByClassName('sprite');
const iconList = document.getElementsByClassName('icon');
let inputTimeout = true;
let interval;
let savedData = JSON.parse(localStorage.getItem('cargo-pusher')) || {
  lastLevelUnlocked: 10,
  volume: 2,
  mobileMode: false,
  keyUp: 'ArrowUp',
  keyDown: 'ArrowDown',
  keyLeft: 'ArrowLeft',
  keyRight: 'ArrowRight'
};
let mouseX = 0;
let mouseY = 0;
const clickableRegions = []
let clickX = -100;
let clickY = -100;

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
  }
  handleSettingsIcon();
  if (settingsOpen) {
    handleSettingsScreen();
  }
  clickX = -100;
  clickY = -100;
}

function handleStartScreen() {
  context.fillStyle = 'red';
  context.fillRect(width/2-150, height/2+50, 300, 60);
  clickableRegions.push([width/2-150, height/2+50, 300, 60]);
  context.fillStyle = 'black';
  context.textAlign = 'center';
  context.font = '40px "Press Start 2P"';
  context.fillText('Play', width/2, height/2+103);
  context.fillText('Cargo Pusher', width/2, height/2-50);
  context.drawImage(spriteList[0],0,0,32,32,width/2-160,height/2-32,64,64);
  context.drawImage(spriteList[2],width/2-96,height/2-32,64,64);
  context.drawImage(spriteList[4],width/2-32,height/2-32,64,64);
  context.drawImage(spriteList[6],width/2+32,height/2-32,64,64);
}

function handleSettingsIcon() {
  clickableRegions.push([width-15-52,15,52,52]);
  if (clickX > width-67 &&
    clickX < width-15 &&
    clickY > 15 &&
    clickY < 67
  ) settingsOpen = !settingsOpen;
  context.drawImage(iconList[0],0,0,13,13,width-15-52,15,52,52)
}

function handleSettingsScreen() {
  context.lineWidth = 4;
  const settingsWidth = 200;
  const settingsHeight = 250;
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
  };
  context.drawImage(iconList[1],savedData.volume * 13,0,13,13,temp,15,52,52);
}

function handleMobileButton(settingsWidth) {
  let temp = settingsWidth/10
  context.strokeRect(630-9*temp,80,8*temp,40)
  clickableRegions.push([630-9*temp,80,8*temp,40])
  context.font = '24px "Press Start 2P"'
  context.fillText('Mobile',630-settingsWidth/2,114)
}

canvas.addEventListener('mousemove', Event => {
  mouseX = (Event.clientX - canvas.offsetLeft)/canvas.offsetWidth*640;
  mouseY = (Event.clientY - canvas.offsetTop)/canvas.offsetHeight*480;
  canvas.style.cursor = 'default';
  clickableRegions.forEach(region => {
    if (mouseX > region[0] &&
    mouseX < region[0] + region[2] &&
    mouseY > region[1] &&
    mouseY < region[1] + region[3]
    ) {
      canvas.style.cursor = 'pointer';
    }
  })
})

canvas.addEventListener('click', () => {
  clickX = mouseX;
  clickY =  mouseY
})