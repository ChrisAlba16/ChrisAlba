const pointEvent = new Event("point");
const newBestEvent = new Event("newBest");
const deadEvent = new Event("dead");

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let urls = ['img/android.png','img/aws.png','img/blenderlogo.png',
            'img/csharp.png','img/c.png','img/c++.png',
            'img/css.png','img/dinamo.png','img/ecmascript.png',
            'img/html.png','img/java.png','img/mongo.png',
            'img/mysql.png','img/python.png','img/react.png'];
let i = 1;
let index;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};

document.addEventListener('keydown', function (evt) {
  keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
  keys[evt.code] = false;
});


class Player {
  constructor (x, y, width, high, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.high = high;
    this.color = color;

    this.dy = 0;
    this.jumpForce = 10;
    this.originalHeight = high;
    this.grounded = false;
    this.jumpTimer = 0;
  }

  Animate () {
    if (keys['Space'] || keys['KeyW']) {
      this.Jump();
    } else {
      this.jumpTimer = 0;
    }

    if (keys['KeyS']) {
      this.high = this.originalHeight / 2;
    } else {
      this.high = this.originalHeight;
    }

    this.y += this.dy;

    if (this.y + this.high < canvas.height) {
      this.dy += gravity;
      this.grounded = false;
    } else {
      this.dy = 0;
      this.grounded = true;
      this.y = canvas.height - this.high;
    }

    this.Draw();
  }

  Jump () {
    if (this.grounded && this.jumpTimer == 0) {
      this.jumpTimer = 1;
      this.dy = -this.jumpForce;
    } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
      this.jumpTimer++;
      this.dy = -this.jumpForce - (this.jumpTimer / 50);
    }
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.high);
    ctx.closePath();
  }
}

class Obstacle {
  constructor (x, y, width, high, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.high = high;
    this.color = color;

    this.dx = -gameSpeed;
  }

  Update () {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.high);
    ctx.closePath();
  }
}


function SpawnObstacle () {
  let size = RandomIntInRange(20, 50);
  let type = RandomIntInRange(0, 1);
  let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, '#2484E4');

  if (type == 1) {
    obstacle.y -= player.originalHeight - 10;
  }

  obstacles.push(obstacle);
  i++;
  if(i==2){
    index = RandomIntInRange(0, 14);
    canvas.setAttribute("style", "background-image: url("+ urls[index] +");background-repeat: no-repeat;background-position: center;background-size: 20%");
    canvas.style.borderBottom = "thick solid white";
    i=0;
  }
}


function RandomIntInRange (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function Start () {
  canvas.width = window.innerWidth-125;
  canvas.height = 600;

  gameSpeed = 3;
  gravity = 1;

  player = new Player(100, 0, 50, 50, '#FF5858');

  requestAnimationFrame(Update);
}

let initialSpawnTimer = 200;
let spawnTimer = 50;
function Update () {
  requestAnimationFrame(Update);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  spawnTimer--;
  if (spawnTimer <= 0) {
    SpawnObstacle();
    spawnTimer = initialSpawnTimer - gameSpeed * 8;
    
    if (spawnTimer < 60) {
      spawnTimer = 60;
    }
  }

  for (let i = 0; i < obstacles.length; i++) {
    let obstacle = obstacles[i];

    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(i, 1);
    }

    if (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.high &&
      player.y + player.high > obstacle.y
    ) {
      obstacles = [];
      spawnTimer = initialSpawnTimer;
      gameSpeed = 3;

      document.dispatchEvent(deadEvent);
    }

    obstacle.Update();
  }

  player.Animate();

  document.dispatchEvent(pointEvent);

  if (parseInt(document.getElementById("scoreText").textContent, 10) > parseInt(document.getElementById("bestScore").textContent, 10)) {
    document.dispatchEvent(newBestEvent);
  }


  gameSpeed += 0.005;
}

Start();