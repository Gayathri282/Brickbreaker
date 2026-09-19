/**
 * Child-Friendly Brick Breaker Game Engine
 * Features:
 * - Subtle sound effect on losing a life
 * - Tab/Screen close visibility pausing
 * - Sound effects on leveling up, gaining points, game over
 * - Continuous engaging background melody
 * - Clean UI with no sound toggle icons
 * - Raised paddle position & pastel candy aesthetics
 */

// DOM Elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const highScoreEl = document.getElementById('high-score');
const startScreen = document.getElementById('start-screen');
const overScreen = document.getElementById('over-screen');
const endTitle = document.getElementById('end-title');
const finalScoreEl = document.getElementById('final-score');
const finalLevelEl = document.getElementById('final-level');
const playBtn = document.getElementById('play-btn');
const againBtn = document.getElementById('again-btn');
const levelBanner = document.getElementById('level-banner');

// Web Audio Sound Generator
class SoundController {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, startVol = 0.25, endVol = 0) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endVol), this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // Sound effect for gaining points / hitting bricks
  hitBrick() {
    this.init();
    if (!this.ctx) return;
    const freqs = [523.25, 659.25, 783.99, 880.00, 1046.50];
    const f = freqs[Math.floor(Math.random() * freqs.length)];
    this.playTone(f, 'sine', 0.12, 0.22, 0.01);
  }

  // Bouncy tone on paddle bounce
  hitPaddle() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // Subtle, soft sound effect when losing a life
  loseLife() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240.00, this.ctx.currentTime); // Soft low C4
      osc.frequency.exponentialRampToValueAtTime(160.00, this.ctx.currentTime + 0.14); // Gentle drop to E3
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime); // Subtle volume
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch (e) {}
  }

  // Powerup collection chime
  powerup() {
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.15, 0.22, 0.01);
      }, idx * 55);
    });
  }

  // Festive chime on Level Up!
  levelUp() {
    this.init();
    if (!this.ctx) return;
    const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    fanfare.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.22, 0.28, 0.01);
      }, idx * 80);
    });
  }

  // Sad gentle melody on Game Over
  gameOver() {
    this.init();
    if (!this.ctx) return;
    const sadNotes = [440, 392, 349.23, 293.66];
    sadNotes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.28, 0.18, 0.01);
      }, idx * 110);
    });
  }
}

// Engaging Background Music Sequencer (Web Audio API)
class BGMController {
  constructor(soundCtrl) {
    this.sound = soundCtrl;
    this.isPlaying = false;
    this.timer = null;
    this.step = 0;
    this.melody = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 392.00,
      293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66, 440.00,
      329.63, 392.00, 493.88, 659.25, 493.88, 392.00, 329.63, 523.25,
      349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 392.00, 329.63
    ];
  }

  start() {
    if (this.isPlaying) return;
    this.sound.init();
    this.isPlaying = true;
    this.step = 0;
    this.timer = setInterval(() => {
      if (!this.isPlaying || !this.sound.ctx) return;
      const freq = this.melody[this.step % this.melody.length];
      const isAccent = (this.step % 4 === 0);
      this.sound.playTone(freq, 'sine', 0.14, isAccent ? 0.07 : 0.035, 0.002);

      if (this.step % 8 === 0) {
        this.sound.playTone(130.81, 'triangle', 0.22, 0.05, 0.005);
      }
      this.step++;
    }, 185);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

const sounds = new SoundController();
const bgm = new BGMController(sounds);

// Game State Variables
let W = 0, H = 0, dpr = 1;
let score = 0, level = 1, lives = 3;
let highScore = parseInt(localStorage.getItem('brick_breaker_highscore') || '0', 10);
let running = false, paused = false;
let lastTime = 0, animationFrameId = 0;

let paddle = null;
let balls = [];
let bricks = [];
let powerups = [];
let particles = [];

// Soft Pastel Palette
const CANDY_PALETTE = [
  { main: '#ffb7b2', top: '#ffd3b6' }, // Pastel Soft Pink
  { main: '#ffdac1', top: '#fff1e6' }, // Pastel Apricot / Peach
  { main: '#e2f0cb', top: '#f0f7da' }, // Pastel Soft Yellow-Green
  { main: '#b5ead7', top: '#d8f3e5' }, // Pastel Mint Green
  { main: '#c7ceea', top: '#e2e7f8' }, // Pastel Baby Blue
  { main: '#e0c3fc', top: '#f3e8ff' }  // Pastel Lilac / Soft Purple
];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (paddle) {
    paddle.w = Math.min(140, Math.max(100, W * 0.28));
    paddle.y = H - 95;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
  }
}
window.addEventListener('resize', resize);
resize();

// Automatic Pause on Screen Closing / Tab Switching
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    paused = true;
    bgm.stop();
  } else if (running && !paused) {
    bgm.start();
  }
});

window.addEventListener('blur', () => {
  paused = true;
  bgm.stop();
});

function updateHUD() {
  scoreEl.textContent = '⭐ ' + score;
  levelEl.textContent = '🚀 Level ' + level;
  livesEl.textContent = '💖'.repeat(lives) + '🖤'.repeat(Math.max(0, 3 - lives));
  if (highScoreEl) highScoreEl.textContent = '🏆 ' + highScore;
}

function makeBricks() {
  bricks = [];
  const padding = 12;
  const cols = Math.min(8, Math.max(5, Math.floor((W - 20) / 70)));
  const rows = Math.min(6, 3 + Math.floor(level / 2));
  const gap = 8;
  const totalGapWidth = gap * (cols - 1);
  const bw = (W - (padding * 2) - totalGapWidth) / cols;
  const bh = 26;
  const startY = 85;

  for (let r = 0; r < rows; r++) {
    const colorScheme = CANDY_PALETTE[r % CANDY_PALETTE.length];
    for (let c = 0; c < cols; c++) {
      const isHard = (level >= 3 && r === 0);
      bricks.push({
        x: padding + c * (bw + gap),
        y: startY + r * (bh + gap),
        w: bw,
        h: bh,
        maxHp: isHard ? 2 : 1,
        hp: isHard ? 2 : 1,
        color: colorScheme,
        alive: true
      });
    }
  }
}

function createBall(x, y, vx, vy) {
  const speedScale = 1 + (level - 1) * 0.06;
  return {
    x: x !== undefined ? x : W / 2,
    y: y !== undefined ? y : H - 145,
    r: 9,
    vx: vx !== undefined ? vx : (Math.random() < 0.5 ? -1 : 1) * 210 * speedScale,
    vy: vy !== undefined ? vy : -350 * speedScale,
    trail: []
  };
}

function resetGame() {
  score = 0;
  level = 1;
  lives = 3;
  powerups = [];
  particles = [];
  
  const pw = Math.min(140, Math.max(100, W * 0.28));
  paddle = {
    w: pw,
    h: 16,
    x: (W - pw) / 2,
    y: H - 95,
    hasGlow: false
  };

  balls = [createBall()];
  makeBricks();
  updateHUD();
}

function startGame() {
  sounds.init();
  bgm.start();
  cancelAnimationFrame(animationFrameId);
  resetGame();
  running = true;
  paused = false;
  startScreen.classList.add('hidden');
  overScreen.classList.add('hidden');
  lastTime = performance.now();
  animationFrameId = requestAnimationFrame(loop);
}

function finishGame(title = 'GREAT JOB!') {
  running = false;
  bgm.stop();
  sounds.gameOver();
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('brick_breaker_highscore', highScore.toString());
    updateHUD();
  }
  endTitle.textContent = title;
  finalScoreEl.textContent = score.toString();
  finalLevelEl.textContent = level.toString();
  overScreen.classList.remove('hidden');
}

function showLevelBanner() {
  sounds.levelUp();
  levelBanner.textContent = `🌟 Level ${level}! 🌟`;
  levelBanner.classList.add('show');
  setTimeout(() => {
    levelBanner.classList.remove('show');
  }, 1600);
}

// Particle Bursts
function spawnBurst(x, y, color = '#fff5ba', count = 12) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 180;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 5 + 3,
      color,
      life: 0.6,
      maxLife: 0.6
    });
  }
}

// Paddle Movement
function movePaddle(clientX) {
  if (!paddle) return;
  paddle.x = Math.max(0, Math.min(W - paddle.w, clientX - paddle.w / 2));
}

// Controls
canvas.addEventListener('pointermove', e => { if (running) movePaddle(e.clientX); });
canvas.addEventListener('pointerdown', e => { if (running) movePaddle(e.clientX); });

window.addEventListener('keydown', e => {
  if (!paddle || !running) return;
  if (e.key === 'ArrowLeft') movePaddle(paddle.x + paddle.w / 2 - 50);
  if (e.key === 'ArrowRight') movePaddle(paddle.x + paddle.w / 2 + 50);
  if (e.key === ' ') {
    paused = !paused;
    if (paused) bgm.stop();
    else bgm.start();
  }
});

playBtn.addEventListener('click', startGame);
againBtn.addEventListener('click', startGame);

// Collision helper
function rectHitCircle(rect, circle) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const distX = circle.x - closestX;
  const distY = circle.y - closestY;
  return (distX * distX + distY * distY) < (circle.r * circle.r);
}

// Update Loop
function update(dt) {
  if (paused) return;

  // Update Balls
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Trail particles
    ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.7 });
    if (ball.trail.length > 8) ball.trail.shift();

    // Wall bouncing
    if (ball.x - ball.r < 0) {
      ball.x = ball.r;
      ball.vx = Math.abs(ball.vx);
      sounds.hitPaddle();
    }
    if (ball.x + ball.r > W) {
      ball.x = W - ball.r;
      ball.vx = -Math.abs(ball.vx);
      sounds.hitPaddle();
    }
    if (ball.y - ball.r < 65) {
      ball.y = 65 + ball.r;
      ball.vy = Math.abs(ball.vy);
      sounds.hitPaddle();
    }

    // Paddle Hit
    if (rectHitCircle(paddle, ball) && ball.vy > 0) {
      ball.y = paddle.y - ball.r;
      sounds.hitPaddle();
      const hitRatio = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      const angle = hitRatio * (Math.PI / 3);
      ball.vx = speed * Math.sin(angle);
      ball.vy = -Math.abs(speed * Math.cos(angle));
      spawnBurst(ball.x, paddle.y, '#b5ead7', 6);
    }

    // Brick Hits
    for (const b of bricks) {
      if (!b.alive || !rectHitCircle(b, ball)) continue;

      const cx = ball.x, cy = ball.y;
      const left = Math.abs(cx - b.x);
      const right = Math.abs(cx - (b.x + b.w));
      const top = Math.abs(cy - b.y);
      const bottom = Math.abs(cy - (b.y + b.h));

      if (Math.min(left, right) < Math.min(top, bottom)) {
        ball.vx *= -1;
      } else {
        ball.vy *= -1;
      }

      b.hp--;
      sounds.hitBrick();

      if (b.hp <= 0) {
        b.alive = false;
        score += 10;
        spawnBurst(b.x + b.w / 2, b.y + b.h / 2, b.color.main, 14);

        if (Math.random() < 0.16) {
          const types = ['wide', 'life', 'slow', 'multiball'];
          const type = types[Math.floor(Math.random() * types.length)];
          powerups.push({
            x: b.x + b.w / 2 - 14,
            y: b.y + b.h / 2,
            w: 28,
            h: 28,
            vy: 110,
            type
          });
        }
      } else {
        score += 5;
        spawnBurst(cx, cy, '#ffffff', 5);
      }

      if (score > highScore) {
        highScore = score;
        localStorage.setItem('brick_breaker_highscore', highScore.toString());
      }
      updateHUD();
      break;
    }

    // Bottom loss
    if (ball.y - ball.r > H) {
      balls.splice(i, 1);
    }
  }

  // If all balls lost
  if (balls.length === 0) {
    lives--;
    sounds.loseLife(); // Play subtle life loss sound
    updateHUD();
    if (lives <= 0) {
      finishGame();
    } else {
      balls.push(createBall());
    }
  }

  // Update Power-ups
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += p.vy * dt;

    if (p.y > H) {
      powerups.splice(i, 1);
    } else if (
      p.y + p.h > paddle.y &&
      p.x + p.w > paddle.x &&
      p.x < paddle.x + paddle.w
    ) {
      sounds.powerup();
      spawnBurst(p.x + p.w / 2, p.y, '#fff5ba', 16);

      if (p.type === 'wide') {
        paddle.w = Math.min(200, paddle.w + 40);
        paddle.hasGlow = true;
        setTimeout(() => {
          if (paddle) {
            paddle.w = Math.min(140, Math.max(100, W * 0.28));
            paddle.hasGlow = false;
          }
        }, 6000);
      } else if (p.type === 'life') {
        lives = Math.min(3, lives + 1);
      } else if (p.type === 'slow') {
        balls.forEach(b => {
          b.vx *= 0.75;
          b.vy *= 0.75;
        });
      } else if (p.type === 'multiball') {
        if (balls.length > 0) {
          const mainBall = balls[0];
          balls.push(createBall(mainBall.x, mainBall.y, -mainBall.vx, mainBall.vy));
          balls.push(createBall(mainBall.x, mainBall.y, mainBall.vx * 0.8, -mainBall.vy));
        }
      }
      powerups.splice(i, 1);
      updateHUD();
    }
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Check Level Clear
  if (bricks.every(b => !b.alive)) {
    level++;
    makeBricks();
    balls = [createBall()];
    powerups = [];
    showLevelBanner();
    updateHUD();
  }
}

// Render Function
function draw() {
  ctx.clearRect(0, 0, W, H);

  // 1. Draw Bricks
  bricks.forEach(b => {
    if (!b.alive) return;
    ctx.save();
    ctx.shadowColor = 'rgba(150, 150, 180, 0.2)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = b.hp > 1 ? '#d8b4fe' : b.color.main;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 8);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.roundRect(b.x + 3, b.y + 3, b.w - 6, b.h * 0.4, [6, 6, 2, 2]);
    ctx.fill();

    if (b.hp > 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⭐', b.x + b.w / 2, b.y + b.h / 2 + 4);
    }
    ctx.restore();
  });

  // 2. Draw Power-ups
  powerups.forEach(p => {
    ctx.save();
    ctx.fillStyle = p.type === 'wide' ? '#c7ceea' : p.type === 'life' ? '#ffb7b2' : p.type === 'slow' ? '#b5ead7' : '#ffdac1';
    ctx.shadowColor = 'rgba(150, 150, 180, 0.25)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = '16px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icon = p.type === 'wide' ? '⭐' : p.type === 'life' ? '💖' : p.type === 'slow' ? '❄️' : '🍬';
    ctx.fillText(icon, p.x + p.w / 2, p.y + p.h / 2);
    ctx.restore();
  });

  // 3. Draw Paddle
  if (paddle) {
    ctx.save();
    ctx.shadowColor = paddle.hasGlow ? '#b5ead7' : 'rgba(150, 150, 180, 0.25)';
    ctx.shadowBlur = paddle.hasGlow ? 16 : 8;
    ctx.shadowOffsetY = 3;

    const grad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.h);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f3f4f6');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 10);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = paddle.hasGlow ? '#85d7bf' : '#ffb7b2';
    ctx.beginPath();
    ctx.roundRect(paddle.x + 12, paddle.y + 4, paddle.w - 24, paddle.h - 8, 4);
    ctx.fill();
    ctx.restore();
  }

  // 4. Draw Balls
  balls.forEach(ball => {
    ctx.save();
    ball.trail.forEach(t => {
      ctx.fillStyle = `rgba(255, 255, 255, ${t.alpha * 0.45})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, ball.r * 0.75, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;

    const bGrad = ctx.createRadialGradient(
      ball.x - ball.r * 0.3, ball.y - ball.r * 0.3, 1,
      ball.x, ball.y, ball.r
    );
    bGrad.addColorStop(0, '#ffffff');
    bGrad.addColorStop(0.7, '#fff5ba');
    bGrad.addColorStop(1, '#ffdac1');

    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 5. Draw Particles
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// Game Loop
function loop(now) {
  if (!running) return;
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  animationFrameId = requestAnimationFrame(loop);
}

// Initialize HUD on load
updateHUD();
