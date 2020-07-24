const checkbox = document.getElementById('checkbox');

checkbox.addEventListener('change', () => {
  document.body.classList.toggle('dark');
});
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 400;

function initCanvas() {
  let player;
  let gravity;
  let obstacles = [];
  let gameSpeed = 2;
  let score;
  let scoreText;
  let highScore;
  let highScoreText;
  let keys = {};

  const gradient = ctx.createLinearGradient(0, 0, 0, 70);
  gradient.addColorStop('0.55', ' #4040ff');

  // key events
  document.addEventListener('keydown', function (e) {
    keys[e.code] = true;
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      initCanvas();
    }
  });

  document.addEventListener('keyup', function (e) {
    keys[e.code] = false;
  });

  // ========================================================

  const background = new Image();
  background.src = 'bg.png';

  const BG = {
    x1: 0,
    x2: canvas.width,
    y: 0,
    width: canvas.width,
    height: canvas.height,
  };

  function handleBackground() {
    if (BG.x1 <= -BG.width + gameSpeed * 2) BG.x1 = BG.width;
    else BG.x1 -= gameSpeed;
    if (BG.x2 <= -BG.width + gameSpeed * 2) BG.x2 = BG.width;
    else BG.x2 -= gameSpeed;

    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
    ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
  }

  class Player {
    constructor(x, y, height, width, dinoImg) {
      this.x = x;
      this.y = y;
      this.height = height;
      this.width = width;
      this.dinoImg = dinoImg;

      this.directionY = 0;
      this.jumpForce = 12;
      this.originalHeight = height;
      this.grounded = false;
      this.jumpTimer = 0;

      this.dinoImg = new Image();
      this.dinoImg.src = 'dino.png';
    }

    Animate() {
      // jump
      if (keys['Space'] || keys['ArrowUp']) {
        this.Jump();
      } else {
        this.jumpTimer = 0;
      }

      if (keys['ArrowDown']) {
        this.height = this.originalHeight / 1.2;
        this.dinoImg.src = 'dino-forward.png';
      } else {
        this.height = this.originalHeight;
        this.dinoImg.src = 'dino.png';
      }

      this.y += this.directionY;
      if (this.y + this.height < canvas.height) {
        this.directionY += gravity;
        this.grounded = false;
      } else {
        this.directionY = 0;
        this.grounded = true;
        this.y = canvas.height - this.height;
      }

      this.Draw();
    }

    Jump() {
      if (this.grounded && this.jumpTimer == 0) {
        this.jumpTimer = 1;
        this.directionY = -this.jumpForce;
      } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
        this.jumpTimer++;
        this.directionY = -this.jumpForce - this.jumpTimer / 50;
      }
    }

    Draw() {
      ctx.beginPath();
      ctx.drawImage(this.dinoImg, this.x - this.width, this.y);
      ctx.fillStyle = this.canvas;
      ctx.closePath();
    }
  }

  class Obstacle {
    constructor(x, y, width, height, poroImg) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.poroImg = poroImg;

      this.poroImg = new Image();
      this.poroImg.src = 'pterosaurs.png';

      this.directionX = -gameSpeed;
    }

    Update() {
      this.x += this.directionX;
      this.directionX = -gameSpeed;
      this.Draw();
    }

    Draw() {
      ctx.beginPath();
      ctx.drawImage(this.poroImg, this.x, this.y, this.width, this.height);
      ctx.fillStyle = this.canvas;
      ctx.closePath();
    }
  }

  class Text {
    constructor(text, x, y, alignment, textColor, textSize) {
      this.text = text;
      this.x = x;
      this.y = y;
      this.alignment = alignment;
      this.textColor = textColor;
      this.textSize = textSize;
    }

    Draw() {
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.font = '25px Georgia';
      ctx.textAlign = this.alignment;
      ctx.strokeText(this.text, this.x, this.y);
      ctx.fillText(this.text, this.x, this.y);
      ctx.closePath();
    }
  }

  // ============================================================================

  function spawnObstacles() {
    let size = randomRange(50, 80);

    let type = randomRange(0, 1);
    let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size * 2, size);

    if (type === 1) {
      obstacle.y -= player.originalHeight / 1.2;
    }
    obstacles.push(obstacle);
  }

  function randomRange(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  function Start() {
    gameSpeed = 2;
    gravity = 1;

    score = 0;
    highScore = 0;

    if (localStorage.getItem('highscore')) {
      highScore = localStorage.getItem('highscore');
    }

    player = new Player(200, canvas.height, 140, 40);

    scoreText = new Text('Score: ' + score, 25, 25, 'left', gradient, '25');
    highScoreText = new Text(
      'Highscore: ' + highScore,
      canvas.width - 30,
      25,
      'right',
      gradient,
      '25'
    );

    requestAnimationFrame(Update);
  }

  function collision() {
    for (let i = 0; i < obstacles.length; i++) {
      let obst = obstacles[i];

      if (obst.x + obst.width < 0) {
        obstacles.splice(i, 1);
      }

      if (
        player.x < obst.x + obst.width &&
        player.x + player.width > obst.x &&
        player.y < obst.y + obst.height &&
        player.y + player.height > obst.y
      ) {
        gameSpeed = 3;
        ctx.font = '30px Georgia';
        ctx.fillStyle = gradient;
        ctx.strokeText('Press Enter to restart', canvas.width / 1.6, canvas.height / 2.2);
        ctx.strokeText(
          'Game Over!  Score: ' + score + ',' + ' Highscore: ' + highScore,
          canvas.width / 1.3,
          canvas.height / 3
        );
        ctx.font = '30px Georgia';

        window.localStorage.setItem('highscore', highScore);

        return true;
      }

      obst.Update();
    }
  }

  let initialSpawnTimer = 80;
  let spawnTimer = initialSpawnTimer;

  function Update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBackground();

    spawnTimer--;
    if (spawnTimer <= 10) {
      spawnObstacles();

      spawnTimer = initialSpawnTimer + gameSpeed * 5;

      if (spawnTimer < 40) {
        spawnTimer = 40;
      }
    }
    player.Animate();
    collision();
    if (collision()) return;

    score++;

    scoreText.text = 'Score ' + score;
    scoreText.Draw();

    if (score > highScore) {
      highScore = score;
      highScoreText.text = 'Highscore: ' + highScore;
    }
    highScoreText.Draw();

    // getting faster
    gameSpeed += 0.003;
    requestAnimationFrame(Update);
  }

  Start();
}
initCanvas(event);
console.log('//////////////////// a 🌟 would make my day 😊 ////////////////////////////////////');
