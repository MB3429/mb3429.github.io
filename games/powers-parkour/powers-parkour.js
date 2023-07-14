const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
let cameraOffsetX = 0;
let cameraOffsetY = 0;

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
    context.fillRect(this.x-cameraOffsetX,this.y-cameraOffsetY,this.width,this.height)
  }

}

setInterval(tick, 25)

function tick() {
  context.clearRect(0, 0, canvasWidth, canvasHeight)
  let rect = new Rectangle(10,300,50,200)
  rect.render()
}