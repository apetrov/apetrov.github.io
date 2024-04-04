class Point{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
}


class LeftSide {
  constructor(size){
    this.size  = size;
  }

  permit(point,size){
    return (point.x > 0) && (point.x < this.size/2 - size);
  }
}

class RightSide {
  constructor(size){
    this.size  = size;
  }

  permit(point, size){
    return (point.x > this.size/2) && (point.x < this.size - size);
  }
}

class Car {
  constructor(position, size, x_axis, y_axis, side, track) {
    this.position = position;
    this.size = size/20;
    this.color = 'green';
    this.x_axis = x_axis;
    this.y_axis = y_axis;
    this.canvasSize =size;
    this.side = side;
    this.track = track;
  }

  getSpeed(gamepad){
    const sensetivity = 3;
    return new Point(gamepad.axes[this.x_axis] * sensetivity,
      gamepad.axes[this.y_axis]* 0);
  }

  move(gamepad) {
    let speed = this.getSpeed(gamepad);
    let new_position = new Point(this.position.x + speed.x, this.position.y + speed.y);
    if(this.side.permit(new_position, this.size)){
      this.position = new_position;
    }
  }

  draw(ctx, t) {
    this.track.draw(ctx, t);
    ctx.fillStyle = 'orange';
    ctx.fillRect(this.position.x, this.position.y, this.size, this.size);
  }
}


class Track {
  constructor(midpoint, range, max_y, w, points){
    this.midpoint = midpoint;
    this.range = range;
    this.max_y = max_y;
    //let z = ;
    this.w = w;
    this.points = this.transformPoints(points);
  }


  transformPoints(points){
    let out = [];

    let x = 0;
    let y = 0;

    // loop over points
    

    var left = [];
    var right = [];
    var step = 200;

    // sigmoid function
    function sigmoid(x) {
      return 1 / (1 + Math.exp(-x));
    }
    

    for(let i =0; i < points.length; i++){
      let p = points[i];
      
      if(p == 0){
        var cp = {x: this.midpoint + x * 30, y: y};
        left.push({x: cp.x - this.w, y: cp.y});
        right.push({x: cp.x + this.w, y: cp.y});
      }else{
        for(var j = 0; j < 1;j+=0.1){
          var cp = {x: this.midpoint + (x + p*sigmoid(j*10-5)) * 30, y: y + j * step };
          left.push({x: cp.x - this.w, y: cp.y});
          right.push({x: cp.x + this.w, y: cp.y});
        }
      }
      x += p;
      y += step;
    };
    
    return left.concat(right.reverse());   
  }



  draw(ctx, t){
    //ctx.fillStyle = '#dddddd';
    //ctx.fillRect(this.midpoint - this.range/2, 0, this.range, this.max_y);
    
    const vertices = this.points;

    
    // Draw the polygon
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y - t * 3.0);
    }
    ctx.closePath();
    
    // Style the polygon
    ctx.fillStyle = '#bb4dff';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }
}

class Game {
  constructor(document) {
    this.document = document;
  }

  init(controllerIndex){
    this.canvas = this.document.getElementById("gameArea");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.controllerIndex = controllerIndex;

    let w = this.canvas.width/13;
    this.t = 0;
    this.leftCar = new Car(
      new Point(this.canvas.width/4,30), this.canvas.width, 0, 1, 
      new LeftSide(this.canvas.width),
      new Track(this.canvas.width/4, this.canvas.width/2 * 0.9, this.canvas.height, w, 
      [0, 0, 0, 0, 0, -3, 0, 2, -5, 4, -3, 0, 0, 1, 0, -2, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, -2, 0, 0, 0, 0, 0, 3, 3, -4, 3, 5, -1, 0, 2, -2, -2, 2, 0, 0, -1, -3, 0, 5, 1, 0, 0, -1, -2, -1, 0, -2, 2, -4, 0, 1, 2, -2, 2, 5, -4, -3, 0, -3, 1, 0, -2, 0, 2, 0, 0, 0, 1, 2, 0, 0, 4, -4, 0, 0, 0, 1, -1, 0, 0, 0, 0, 4, 0, 0, 1, 0, -4, 0, 0, 2, 0, 0, 0] 
      )
    );
    this.rightCar = new Car(
      new Point(this.canvas.width/4*3, 30),this.canvas.width, 2, 3, 
      new RightSide(this.canvas.width),
      new Track(3*this.canvas.width/4, this.canvas.width/2 * 0.8, this.canvas.height, w, 
      [0, 0, 0, 0, -4, 0, 4, 0, -1, 4, 1, 0, -5, 2, -1, 5, 1, 0, 0, -1, 0, 0, -2, 2, 1, -2, -1, 0, 0, 0, 0, -3, -4, 4, 0, 0, -1, 2, -4, -2, 3, 1, -3, 0, 2, 0, -1, -1, 4, -4, 2, -3, 0, -1, 4, -4, 0, 2, 2, 0, -3, 5, 3, -1, 0, 0, 0, 1, 1, -1, 0, 1, -4, 0, 3, 0, -5, -3, 0, 0, 0, 0, 0, 0, 2, -1, 0, -2, 0, 0, 0, 0, 0, 0, 2, -1, 1, 0, 1, 0, 0, 1, 0, 1]
      )
    );
  }

  getGamepad(){
    return navigator.getGamepads()[this.controllerIndex];
  }

  clearScreen(){
    this.ctx.fillStyle = "#333331";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawSplit(){
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(this.canvas.width / 2, 0, 2, this.canvas.height);
  }

  step(){
    this.t += 1;
    this.clearScreen();
    let gamepad = this.getGamepad();
    this.leftCar.move(gamepad);
    this.rightCar.move(gamepad);
    this.drawSplit();
    this.leftCar.draw(this.ctx, this.t);
    this.rightCar.draw(this.ctx, this.t);
  }
}

var game = new Game(document);

window.addEventListener("gamepadconnected", (event) => {
  console.log("connected");
  var controllerIndex = event.gamepad.index;
  game.init(controllerIndex);
  function gameLoop() {
    game.step();
    requestAnimationFrame(gameLoop);
  }
  gameLoop();
});
