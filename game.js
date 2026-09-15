/**
 * PAC-MAN ARCADE (1980) - COMPLETE BROWSER RE-CREATION
 * Pure Vanilla HTML5 Canvas 2D & Web Audio API Sound Synthesizer
 * Zero External Dependencies & 100% Procedural Rendering
 */

(function() {
  'use strict';

  // ==========================================================================
  // CONFIGURATION & CONSTANTS
  // ==========================================================================
  const TILE_SIZE = 16;
  const COLS = 28;
  const ROWS = 36;
  const CANVAS_WIDTH = COLS * TILE_SIZE;  // 448
  const CANVAS_HEIGHT = ROWS * TILE_SIZE; // 576

  const DIRS = {
    NONE:  { x: 0,  y: 0,  name: 'none' },
    UP:    { x: 0,  y: -1, name: 'up' },
    LEFT:  { x: -1, y: 0,  name: 'left' },
    DOWN:  { x: 0,  y: 1,  name: 'down' },
    RIGHT: { x: 1,  y: 0,  name: 'right' }
  };

  const TILE = {
    EMPTY: 0,
    WALL: 1,
    PELLET: 2,
    ENERGIZER: 3,
    DOOR: 4,
    HOUSE: 5
  };

  // 28x36 Authentic Classic Maze Representation
  const INITIAL_MAZE = [
    // Rows 0-2: Blank (Scores and Marquee)
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // Row 3: Top Outer Wall
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    // Row 4
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    // Row 5
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    // Row 6: Energizers at ends
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    // Row 7
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    // Row 8
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    // Row 9
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    // Row 10
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    // Row 11
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    // Row 12: T-junction under top box
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    // Row 13
    [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
    // Row 14
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    // Row 15: Ghost Door (4)
    [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
    // Row 16: Ghost House (5)
    [1,1,1,1,1,1,2,1,1,0,1,5,5,5,5,5,5,1,0,1,1,2,1,1,1,1,1,1],
    // Row 17: Screen-Wrap Tunnel
    [0,0,0,0,0,0,2,0,0,0,1,5,5,5,5,5,5,1,0,0,0,2,0,0,0,0,0,0],
    // Row 18: Ghost House bottom
    [1,1,1,1,1,1,2,1,1,0,1,5,5,5,5,5,5,1,0,1,1,2,1,1,1,1,1,1],
    // Row 19
    [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
    // Row 20: Fruit spawn row at col 13.5
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    // Row 21
    [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
    // Row 22
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    // Row 23
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    // Row 24
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    // Row 25
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    // Row 26: Energizers & Pacman Start (col 13.5)
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    // Row 27
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    // Row 28
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    // Row 29
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    // Row 30
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    // Row 31
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    // Row 32: Bottom Corridor
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    // Row 33: Bottom Outer Wall
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    // Row 34-35: HUD Footer (Lives & Fruit)
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ];

  // ==========================================================================
  // WEB AUDIO API SYNTHESIZER
  // ==========================================================================
  class RetroSoundSystem {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.sirenOsc = null;
      this.sirenGain = null;
      this.frightenedOsc = null;
      this.isMuted = false;
      this.wakaStep = 0;
      this.unlocked = false;
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.unlocked = true;
    }

    unlock() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
      }
      return this.isMuted;
    }

    // Classic Waka-Waka (Pellet munch)
    playWaka() {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      if (this.wakaStep % 2 === 0) {
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(490, now + 0.07);
      } else {
        osc.frequency.setValueAtTime(490, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.07);
      }
      this.wakaStep++;

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    }

    // Classic Arcade Start Intro Melody
    playIntro() {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      
      const notes = [
        [493.88, 1], [987.77, 1], [739.99, 1], [622.25, 1],
        [987.77, 1], [739.99, 1], [622.25, 2],
        [523.25, 1], [1046.50, 1], [783.99, 1], [659.25, 1],
        [1046.50, 1], [783.99, 1], [659.25, 2],
        [493.88, 1], [987.77, 1], [739.99, 1], [622.25, 1],
        [987.77, 1], [739.99, 1], [622.25, 2],
        [622.25, 0.5], [659.25, 0.5], [698.46, 0.5],
        [698.46, 0.5], [739.99, 0.5], [783.99, 0.5],
        [830.61, 0.5], [880.00, 0.5], [987.77, 2]
      ];

      let time = now + 0.03;
      const beat = 0.06; // fast & crisp

      notes.forEach(([freq, dur]) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.setValueAtTime(0.18, time + dur * beat - 0.015);
        gain.gain.linearRampToValueAtTime(0.001, time + dur * beat);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + dur * beat);
        time += dur * beat;
      });
    }

    // Ghost Eaten Sound
    playEatGhost() {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.28);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    }

    // Fruit Eaten Fanfare
    playEatFruit() {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      [880, 1174.66, 1318.51, 1760].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.linearRampToValueAtTime(0.01, startTime + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.12);
      });
    }

    // Death Sound (Descending chromatic pitch sweeps)
    playDeath() {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const noteCount = 12;
      const stepTime = 0.08;

      for (let i = 0; i < noteCount; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + i * stepTime;
        const startFreq = 800 - i * 55;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(Math.max(60, startFreq - 150), startTime + stepTime - 0.01);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.linearRampToValueAtTime(0.01, startTime + stepTime);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startTime);
        osc.stop(startTime + stepTime);
      }
    }

    // Ambient Siren
    startSiren(isFrightened = false) {
      if (!this.ctx) return;
      this.stopSiren();
      if (this.isMuted) return;

      const now = this.ctx.currentTime;
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();

      if (isFrightened) {
        this.sirenOsc.type = 'sawtooth';
        this.sirenOsc.frequency.setValueAtTime(320, now);
        this.sirenGain.gain.setValueAtTime(0.06, now);

        this.frightenedOsc = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        this.frightenedOsc.frequency.value = 5;
        lfoGain.gain.value = 80;
        this.frightenedOsc.connect(lfoGain);
        lfoGain.connect(this.sirenOsc.frequency);
        this.frightenedOsc.start();
      } else {
        this.sirenOsc.type = 'triangle';
        this.sirenOsc.frequency.setValueAtTime(360, now);
        this.sirenGain.gain.setValueAtTime(0.04, now);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 1.4;
        lfoGain.gain.value = 60;
        lfo.connect(lfoGain);
        lfoGain.connect(this.sirenOsc.frequency);
        lfo.start();
      }

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.masterGain);
      this.sirenOsc.start();
    }

    stopSiren() {
      if (this.sirenOsc) {
        try { this.sirenOsc.stop(); } catch(e) {}
        this.sirenOsc.disconnect();
        this.sirenOsc = null;
      }
      if (this.frightenedOsc) {
        try { this.frightenedOsc.stop(); } catch(e) {}
        this.frightenedOsc.disconnect();
        this.frightenedOsc = null;
      }
    }
  }

  // ==========================================================================
  // MAZE CLASS
  // ==========================================================================
  class Maze {
    constructor() {
      this.grid = [];
      this.totalPellets = 0;
      this.remainingPellets = 0;
      this.reset();
    }

    reset() {
      this.grid = INITIAL_MAZE.map(row => [...row]);
      this.totalPellets = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (this.grid[r][c] === TILE.PELLET || this.grid[r][c] === TILE.ENERGIZER) {
            this.totalPellets++;
          }
        }
      }
      this.remainingPellets = this.totalPellets;
    }

    getTile(col, row) {
      if (row < 0 || row >= ROWS) return TILE.WALL;
      if (col < 0 || col >= COLS) {
        if (row === 17) return TILE.EMPTY; // Tunnel row wrap
        return TILE.WALL;
      }
      return this.grid[row][col];
    }

    setTile(col, row, val) {
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        this.grid[row][col] = val;
      }
    }

    // Passability check: Wall, Door, and Boundaries
    isPassable(col, row, isGhost = false, ghostState = 'CHASE') {
      // Screen wrap tunnel
      if (row === 17 && (col < 0 || col >= COLS)) return true;
      // Strict outer boundaries (cannot leave play area into header/footer)
      if (row < 3 || row > 33 || col < 0 || col >= COLS) return false;

      const tile = this.grid[row][col];
      if (tile === TILE.WALL) return false;

      // Ghost Door
      if (tile === TILE.DOOR) {
        if (!isGhost) return false;
        return ghostState === 'LEAVING_HOUSE' || ghostState === 'EATEN';
      }

      // Ghost House interior
      if (tile === TILE.HOUSE) {
        return isGhost;
      }

      return true;
    }

    draw(ctx, energizerBlink = true, flashWhite = false) {
      const wallColor = flashWhite ? '#ffffff' : '#2121ff';
      const wallInner = flashWhite ? '#dddddd' : '#000038';

      for (let r = 3; r <= 33; r++) {
        for (let c = 0; c < COLS; c++) {
          const tile = this.grid[r][c];
          const x = c * TILE_SIZE;
          const y = r * TILE_SIZE;

          if (tile === TILE.WALL) {
            ctx.fillStyle = wallColor;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = wallInner;
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          } else if (tile === TILE.DOOR) {
            ctx.fillStyle = '#ffb8ff';
            ctx.fillRect(x, y + 6, TILE_SIZE, 4);
          } else if (tile === TILE.PELLET) {
            ctx.fillStyle = '#ffb8ae';
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === TILE.ENERGIZER && energizerBlink) {
            ctx.fillStyle = '#ffb8ae';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
    }
  }

  // ==========================================================================
  // PAC-MAN CLASS
  // ==========================================================================
  class Pacman {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = 13.5 * TILE_SIZE;
      this.y = 26.5 * TILE_SIZE;
      this.dir = DIRS.LEFT;
      this.nextDir = DIRS.LEFT;
      this.speed = 105; // Smooth arcade speed
      this.radius = 7.5;
      this.mouthAngle = 0.2;
      this.mouthSpeed = 6.5;
      this.mouthOpen = true;
      this.alive = true;
      this.deathProgress = 0;
      this.isMoving = false;
    }

    setQueuedDirection(newDir) {
      this.nextDir = newDir;
    }

    update(dt, maze) {
      if (!this.alive) {
        this.deathProgress += dt * 0.9;
        return;
      }

      // Check if player wants to reverse immediately
      if (this.nextDir.x === -this.dir.x && this.nextDir.y === -this.dir.y && this.dir !== DIRS.NONE) {
        this.dir = this.nextDir;
      }

      const currentCol = Math.floor(this.x / TILE_SIZE);
      const currentRow = Math.floor(this.y / TILE_SIZE);
      const centerTileX = (currentCol + 0.5) * TILE_SIZE;
      const centerTileY = (currentRow + 0.5) * TILE_SIZE;

      const distCenterX = this.x - centerTileX;
      const distCenterY = this.y - centerTileY;

      // Input buffering & corner turning
      if (this.nextDir !== this.dir) {
        const targetCol = currentCol + this.nextDir.x;
        const targetRow = currentRow + this.nextDir.y;

        if (maze.isPassable(targetCol, targetRow, false)) {
          const canTurnHoriz = (this.nextDir.x !== 0 && Math.abs(distCenterY) <= 5);
          const canTurnVert  = (this.nextDir.y !== 0 && Math.abs(distCenterX) <= 5);

          if (canTurnHoriz || canTurnVert) {
            if (this.nextDir.x !== 0) this.y = centerTileY;
            if (this.nextDir.y !== 0) this.x = centerTileX;
            this.dir = this.nextDir;
          }
        }
      }

      // Continuous movement
      const step = this.speed * dt;
      let blocked = false;

      if (this.dir !== DIRS.NONE) {
        const nextCol = currentCol + this.dir.x;
        const nextRow = currentRow + this.dir.y;

        if (!maze.isPassable(nextCol, nextRow, false)) {
          if (this.dir.x > 0 && this.x + step >= centerTileX) {
            this.x = centerTileX;
            blocked = true;
          } else if (this.dir.x < 0 && this.x - step <= centerTileX) {
            this.x = centerTileX;
            blocked = true;
          } else if (this.dir.y > 0 && this.y + step >= centerTileY) {
            this.y = centerTileY;
            blocked = true;
          } else if (this.dir.y < 0 && this.y - step <= centerTileY) {
            this.y = centerTileY;
            blocked = true;
          }
        }

        if (!blocked) {
          this.x += this.dir.x * step;
          this.y += this.dir.y * step;
          this.isMoving = true;
        } else {
          this.isMoving = false;
        }
      } else {
        this.isMoving = false;
      }

      // Screen-Wrap Tunnel
      if (this.x < -TILE_SIZE / 2) {
        this.x = CANVAS_WIDTH + TILE_SIZE / 2;
      } else if (this.x > CANVAS_WIDTH + TILE_SIZE / 2) {
        this.x = -TILE_SIZE / 2;
      }

      // Mouth animation
      if (this.isMoving) {
        if (this.mouthOpen) {
          this.mouthAngle += dt * this.mouthSpeed;
          if (this.mouthAngle >= 0.8) this.mouthOpen = false;
        } else {
          this.mouthAngle -= dt * this.mouthSpeed;
          if (this.mouthAngle <= 0.05) this.mouthOpen = true;
        }
      } else {
        this.mouthAngle = 0.2;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      if (!this.alive) {
        const angle = Math.min(Math.PI, this.deathProgress * Math.PI);
        if (this.deathProgress < 1.1) {
          ctx.fillStyle = '#ffff00';
          ctx.beginPath();
          ctx.arc(0, 0, this.radius, -Math.PI / 2 + angle, -Math.PI / 2 - angle, false);
          ctx.lineTo(0, 0);
          ctx.fill();
        }
        ctx.restore();
        return;
      }

      let rotation = 0;
      if (this.dir === DIRS.RIGHT) rotation = 0;
      else if (this.dir === DIRS.DOWN) rotation = Math.PI / 2;
      else if (this.dir === DIRS.LEFT) rotation = Math.PI;
      else if (this.dir === DIRS.UP) rotation = -Math.PI / 2;

      ctx.rotate(rotation);

      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, this.mouthAngle, Math.PI * 2 - this.mouthAngle, false);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  // ==========================================================================
  // GHOST CLASS & ROBUST GRID NAVIGATION
  // ==========================================================================
  class Ghost {
    constructor(type, color, scatterTile, startTile, startDir, homeWaitTime) {
      this.type = type;
      this.color = color;
      this.scatterTile = scatterTile;
      this.startTile = startTile;
      this.startDir = startDir;
      this.homeWaitTime = homeWaitTime;

      this.x = 0;
      this.y = 0;
      this.dir = DIRS.NONE;
      this.targetTile = { col: 0, row: 0 };
      this.state = 'IN_HOUSE';
      this.speed = 95;
      this.baseSpeed = 95;
      this.frightenedTimer = 0;
      this.frightenedDuration = 8;
      this.timerInHouse = 0;
      this.bouncingUp = true;
      this.skirtFrame = 0;

      this.reset();
    }

    reset() {
      this.x = (this.startTile.col + 0.5) * TILE_SIZE;
      this.y = (this.startTile.row + 0.5) * TILE_SIZE;
      this.dir = this.startDir;
      this.timerInHouse = 0;
      this.frightenedTimer = 0;

      if (this.type === 'blinky') {
        this.state = 'CHASE'; // Start hunting immediately
      } else {
        this.state = 'IN_HOUSE';
      }
    }

    setFrightened(duration) {
      if (this.state === 'EATEN') return; // Eyes are unaffected
      this.frightenedTimer = duration;
      this.frightenedDuration = duration;

      if (this.state !== 'IN_HOUSE' && this.state !== 'LEAVING_HOUSE') {
        this.state = 'FRIGHTENED';
        // Immediate 180° turnaround
        this.dir = { x: -this.dir.x, y: -this.dir.y, name: this.getOppositeDirName(this.dir) };
      }
    }

    getOppositeDirName(dir) {
      if (dir === DIRS.UP) return 'down';
      if (dir === DIRS.DOWN) return 'up';
      if (dir === DIRS.LEFT) return 'right';
      if (dir === DIRS.RIGHT) return 'left';
      return 'none';
    }

    update(dt, maze, pacman, blinky, globalState, globalFrightenedTimer) {
      this.skirtFrame += dt * 10;

      // Handle Frightened Timer Countdown
      if (this.frightenedTimer > 0) {
        this.frightenedTimer -= dt;
      }

      // Sync state with global powerup
      if (globalFrightenedTimer > 0 && this.state !== 'EATEN' && this.state !== 'IN_HOUSE' && this.state !== 'LEAVING_HOUSE') {
        this.state = 'FRIGHTENED';
      } else if (globalFrightenedTimer <= 0 && this.state === 'FRIGHTENED') {
        this.state = globalState;
      }

      // House & Departure Management
      if (this.state === 'IN_HOUSE') {
        this.timerInHouse += dt;
        const topY = 16.5 * TILE_SIZE;
        const bottomY = 17.5 * TILE_SIZE;
        const bobSpeed = 30 * dt;

        if (this.bouncingUp) {
          this.y -= bobSpeed;
          if (this.y <= topY) this.bouncingUp = false;
        } else {
          this.y += bobSpeed;
          if (this.y >= bottomY) this.bouncingUp = true;
        }

        if (this.timerInHouse >= this.homeWaitTime) {
          this.state = 'LEAVING_HOUSE';
        }
        return;
      }

      if (this.state === 'LEAVING_HOUSE') {
        const doorX = 13.5 * TILE_SIZE;
        const doorY = 14.5 * TILE_SIZE;
        const moveSpeed = 55 * dt;

        if (Math.abs(this.x - doorX) > 1.5) {
          this.x += (this.x < doorX ? 1 : -1) * moveSpeed;
        } else {
          this.x = doorX;
          if (this.y > doorY) {
            this.y -= moveSpeed;
            this.dir = DIRS.UP;
          } else {
            this.y = doorY;
            this.dir = DIRS.LEFT;
            this.state = (globalFrightenedTimer > 0) ? 'FRIGHTENED' : globalState;
          }
        }
        return;
      }

      // Calculate Speeds
      if (this.state === 'EATEN') {
        this.speed = 185; // Eyes sprint back to home
      } else if (this.state === 'FRIGHTENED') {
        this.speed = 52;  // Slow, vulnerable target
      } else {
        const curRow = Math.floor(this.y / TILE_SIZE);
        const curCol = Math.floor(this.x / TILE_SIZE);
        if (curRow === 17 && (curCol <= 5 || curCol >= 22)) {
          this.speed = 45; // Tunnel slow down
        } else if (this.type === 'blinky' && maze.remainingPellets < 25) {
          this.speed = 105; // "Cruise Elroy" speed boost
        } else {
          this.speed = this.baseSpeed;
        }
      }

      // Determine Target Tile
      this.updateTargetTile(pacman, blinky, globalState);

      // Check if Eaten Eyes reached home
      if (this.state === 'EATEN') {
        const doorX = 13.5 * TILE_SIZE;
        const doorY = 14.5 * TILE_SIZE;
        if (Math.abs(this.x - doorX) < 6 && Math.abs(this.y - doorY) < 6) {
          this.x = doorX;
          this.y = doorY;
          this.state = 'LEAVING_HOUSE'; // Revive immediately and re-emerge
          return;
        }
      }

      // Robust Grid Navigation & Intersection Movement
      this.moveTowardsTarget(dt, maze);
    }

    updateTargetTile(pacman, blinky, globalState) {
      if (this.state === 'EATEN') {
        this.targetTile = { col: 13.5, row: 14.5 };
        return;
      }

      if (this.state === 'SCATTER') {
        this.targetTile = this.scatterTile;
        return;
      }

      if (this.state === 'FRIGHTENED') {
        return; // Pseudo-random turns
      }

      const pCol = Math.floor(pacman.x / TILE_SIZE);
      const pRow = Math.floor(pacman.y / TILE_SIZE);

      // BLINKY: Direct relentless chase
      if (this.type === 'blinky') {
        this.targetTile = { col: pCol, row: pRow };
      }

      // PINKY: Ambush 4 tiles ahead
      else if (this.type === 'pinky') {
        let tCol = pCol + pacman.dir.x * 4;
        let tRow = pRow + pacman.dir.y * 4;
        this.targetTile = {
          col: Math.max(1, Math.min(COLS - 2, tCol)),
          row: Math.max(4, Math.min(ROWS - 3, tRow))
        };
      }

      // INKY: Flanking maneuver relative to Blinky
      else if (this.type === 'inky') {
        const midCol = pCol + pacman.dir.x * 2;
        const midRow = pRow + pacman.dir.y * 2;
        const bCol = Math.floor(blinky.x / TILE_SIZE);
        const bRow = Math.floor(blinky.y / TILE_SIZE);
        let tCol = midCol + (midCol - bCol);
        let tRow = midRow + (midRow - bRow);
        this.targetTile = {
          col: Math.max(1, Math.min(COLS - 2, tCol)),
          row: Math.max(4, Math.min(ROWS - 3, tRow))
        };
      }

      // CLYDE: Direct chase when far, flanks/circles when close
      else if (this.type === 'clyde') {
        const cCol = Math.floor(this.x / TILE_SIZE);
        const cRow = Math.floor(this.y / TILE_SIZE);
        const distSq = (cCol - pCol) ** 2 + (cRow - pRow) ** 2;
        if (distSq >= 36) { // >= 6 tiles
          this.targetTile = { col: pCol, row: pRow };
        } else {
          this.targetTile = this.scatterTile;
        }
      }
    }

    /**
     * Bulletproof Tile-Center Movement:
     * Never overshoots, never walks into walls, and snaps accurately.
     */
    moveTowardsTarget(dt, maze) {
      let remStep = this.speed * dt;

      // Handle up to 2 sub-steps in case of high speed or delta spike
      for (let stepIter = 0; stepIter < 2; stepIter++) {
        if (remStep <= 0) break;

        const curCol = Math.floor(this.x / TILE_SIZE);
        const curRow = Math.floor(this.y / TILE_SIZE);
        const centerX = (curCol + 0.5) * TILE_SIZE;
        const centerY = (curRow + 0.5) * TILE_SIZE;

        let distToCenter = 0;

        // Lock orthogonal axis & calculate distance along movement axis
        if (this.dir.x !== 0) {
          this.y = centerY;
          distToCenter = (centerX - this.x) * this.dir.x;
        } else if (this.dir.y !== 0) {
          this.x = centerX;
          distToCenter = (centerY - this.y) * this.dir.y;
        }

        // Check if we are passing or hitting the tile center
        if (distToCenter > 0 && distToCenter <= remStep) {
          // Snap precisely onto center
          this.x = centerX;
          this.y = centerY;
          remStep -= distToCenter;

          // Pick the next direction at the intersection
          const possibleDirs = [DIRS.UP, DIRS.LEFT, DIRS.DOWN, DIRS.RIGHT];
          const validDirs = [];

          for (let d of possibleDirs) {
            // Normal movement forbids 180° reversal
            if (d.x === -this.dir.x && d.y === -this.dir.y) continue;

            const nCol = curCol + d.x;
            const nRow = curRow + d.y;

            if (maze.isPassable(nCol, nRow, true, this.state)) {
              validDirs.push(d);
            }
          }

          // If blocked by a dead-end, allow 180° reversal
          if (validDirs.length === 0) {
            const revDir = { x: -this.dir.x, y: -this.dir.y, name: this.getOppositeDirName(this.dir) };
            if (maze.isPassable(curCol + revDir.x, curRow + revDir.y, true, this.state)) {
              validDirs.push(revDir);
            }
          }

          if (validDirs.length > 0) {
            if (this.state === 'FRIGHTENED') {
              // Pseudo-random choice
              const randIdx = Math.floor(Math.random() * validDirs.length);
              this.dir = validDirs[randIdx];
            } else {
              // Choose direction minimizing Euclidean distance to target
              let bestDir = validDirs[0];
              let bestDist = Infinity;

              for (let d of validDirs) {
                const tc = curCol + d.x;
                const tr = curRow + d.y;
                const dist = (tc - this.targetTile.col) ** 2 + (tr - this.targetTile.row) ** 2;

                if (dist < bestDist) {
                  bestDist = dist;
                  bestDir = d;
                }
              }
              this.dir = bestDir;
            }
          }
        } else {
          // Verify ahead isn't blocked by a wall
          const nextCol = curCol + this.dir.x;
          const nextRow = curRow + this.dir.y;
          const distPastCenter = (this.dir.x !== 0) ? (this.x - centerX) * this.dir.x : (this.y - centerY) * this.dir.y;

          if (distPastCenter >= 0 && !maze.isPassable(nextCol, nextRow, true, this.state)) {
            // Stop at center, do not enter wall!
            this.x = centerX;
            this.y = centerY;
            remStep = 0;
            break;
          }

          // Move forward along valid corridor
          this.x += this.dir.x * remStep;
          this.y += this.dir.y * remStep;
          remStep = 0;
        }

        // Screen-wrap tunnel
        if (this.x < -TILE_SIZE / 2) {
          this.x = CANVAS_WIDTH + TILE_SIZE / 2;
        } else if (this.x > CANVAS_WIDTH + TILE_SIZE / 2) {
          this.x = -TILE_SIZE / 2;
        }
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      const radius = 7.5;
      const isFrightened = this.state === 'FRIGHTENED';
      const isEaten = this.state === 'EATEN';

      // 1. Draw Body
      if (!isEaten) {
        let bodyColor = this.color;
        if (isFrightened) {
          // Rapid flashing near end of frightened duration
          if (this.frightenedTimer < 2.5 && Math.floor(this.frightenedTimer * 6) % 2 === 0) {
            bodyColor = '#ffffff';
          } else {
            bodyColor = '#2121ff'; // Deep frightened blue
          }
        }

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(0, -1, radius, Math.PI, 0, false);
        ctx.lineTo(radius, radius);

        // Animated wavy skirt
        const wave = Math.sin(this.skirtFrame) * 1.5;
        const w = (radius * 2) / 3;
        ctx.quadraticCurveTo(radius - w / 2, radius - 3 + wave, radius - w, radius);
        ctx.quadraticCurveTo(radius - 1.5 * w, radius - 3 - wave, -radius + w, radius);
        ctx.quadraticCurveTo(-radius + w / 2, radius - 3 + wave, -radius, radius);

        ctx.lineTo(-radius, -1);
        ctx.closePath();
        ctx.fill();
      }

      // 2. Draw Face & Eyes
      if (isFrightened && !isEaten) {
        ctx.fillStyle = '#ffb8ae';
        ctx.fillRect(-4, -2, 2, 2);
        ctx.fillRect(2, -2, 2, 2);

        // Wavy mouth
        ctx.strokeStyle = '#ffb8ae';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(-5, 4);
        ctx.lineTo(-3, 2);
        ctx.lineTo(-1, 4);
        ctx.lineTo(1, 2);
        ctx.lineTo(3, 4);
        ctx.lineTo(5, 2);
        ctx.stroke();
      } else {
        const eyeOffset = 3.5;
        const pupilOffset = 1.6;

        let ox = 0;
        let oy = 0;
        if (this.dir === DIRS.LEFT) ox = -pupilOffset;
        else if (this.dir === DIRS.RIGHT) ox = pupilOffset;
        else if (this.dir === DIRS.UP) oy = -pupilOffset;
        else if (this.dir === DIRS.DOWN) oy = pupilOffset;

        // Eye whites
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-eyeOffset, -2, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(eyeOffset, -2, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupils
        ctx.fillStyle = '#2121ff';
        ctx.beginPath();
        ctx.arc(-eyeOffset + ox, -2 + oy, 1.8, 0, Math.PI * 2);
        ctx.arc(eyeOffset + ox, -2 + oy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ==========================================================================
  // BONUS FRUIT CLASS
  // ==========================================================================
  class BonusFruit {
    constructor() {
      this.active = false;
      this.timer = 0;
      this.x = 13.5 * TILE_SIZE;
      this.y = 20 * TILE_SIZE;
      this.type = 'cherry';
      this.points = 100;
    }

    spawn(level) {
      this.active = true;
      this.timer = 9.5;
      if (level === 1) {
        this.type = 'cherry';
        this.points = 100;
      } else if (level === 2) {
        this.type = 'strawberry';
        this.points = 300;
      } else {
        this.type = 'orange';
        this.points = 500;
      }
    }

    update(dt) {
      if (!this.active) return;
      this.timer -= dt;
      if (this.timer <= 0) {
        this.active = false;
      }
    }

    draw(ctx) {
      if (!this.active) return;
      ctx.save();
      ctx.translate(this.x, this.y);

      if (this.type === 'cherry') {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(-4, 3, 4, 0, Math.PI * 2);
        ctx.arc(4, 4, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5, 1, 1, 0, Math.PI * 2);
        ctx.arc(3, 2, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#a52a2a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.quadraticCurveTo(0, -6, 2, -7);
        ctx.moveTo(4, 1);
        ctx.quadraticCurveTo(2, -4, 2, -7);
        ctx.stroke();

        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.ellipse(3, -7, 3, 1.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ff2222';
        ctx.beginPath();
        ctx.moveTo(0, 7);
        ctx.lineTo(-6, -2);
        ctx.quadraticCurveTo(0, -6, 6, -2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffff88';
        ctx.fillRect(-2, 0, 1.5, 1.5);
        ctx.fillRect(2, 1, 1.5, 1.5);
        ctx.fillRect(0, 3, 1.5, 1.5);

        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(0, -4, 3, Math.PI, 0);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ==========================================================================
  // MAIN GAME ENGINE
  // ==========================================================================
  class PacmanGame {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.audio = new RetroSoundSystem();
      this.maze = new Maze();
      this.pacman = new Pacman();
      this.fruit = new BonusFruit();

      // 4 Distinct Ghosts with responsive launch timings
      this.blinky = new Ghost(
        'blinky', '#ff0000',
        { col: 25, row: 4 },    // Top-Right Scatter
        { col: 13.5, row: 14 }, // Starts outside
        DIRS.LEFT, 0
      );
      this.pinky = new Ghost(
        'pinky', '#ffb8ff',
        { col: 2, row: 4 },     // Top-Left Scatter
        { col: 13.5, row: 17 }, // Inside pen center
        DIRS.UP, 0.8            // Leaves quickly
      );
      this.inky = new Ghost(
        'inky', '#00ffff',
        { col: 25, row: 32 },   // Bottom-Right Scatter
        { col: 11.5, row: 17 }, // Inside pen left
        DIRS.UP, 2.5            // Leaves after 2.5s
      );
      this.clyde = new Ghost(
        'clyde', '#ffb852',
        { col: 2, row: 32 },    // Bottom-Left Scatter
        { col: 15.5, row: 17 }, // Inside pen right
        DIRS.UP, 5.0            // Leaves after 5s
      );

      this.ghosts = [this.blinky, this.pinky, this.inky, this.clyde];

      this.state = 'START';
      this.score = 0;
      this.highScore = parseInt(localStorage.getItem('pacman_highscore')) || 10000;
      this.lives = 3;
      this.level = 1;

      // Mode cycles (starts in direct CHASE for active hunting)
      this.globalMode = 'CHASE';
      this.waveTimer = 0;
      this.waveIndex = 0;
      this.scatterChaseSchedule = [
        { mode: 'CHASE',   dur: 20 },
        { mode: 'SCATTER', dur: 5 },
        { mode: 'CHASE',   dur: 25 },
        { mode: 'SCATTER', dur: 5 },
        { mode: 'CHASE',   dur: Infinity }
      ];

      // Global Frightened Power-Up State
      this.frightenedTimer = 0;
      this.ghostEatenMultiplier = 200;

      this.readyTimer = 0;
      this.clearTimer = 0;
      this.clearFlashes = 0;
      this.popups = [];

      this.fruitSpawned1 = false;
      this.fruitSpawned2 = false;

      this.energizerTimer = 0;
      this.energizerVisible = true;
      this.lastTime = performance.now();

      // Cache DOM Elements
      this.playerScoreEl = document.getElementById('playerScore');
      this.highScoreEl = document.getElementById('highScore');
      this.levelDisplayEl = document.getElementById('levelDisplay');
      this.startScreenEl = document.getElementById('startScreen');
      this.pauseScreenEl = document.getElementById('pauseScreen');
      this.gameOverScreenEl = document.getElementById('gameOverScreen');
      this.finalScoreEl = document.getElementById('finalScoreDisplay');
      this.soundBtn = document.getElementById('btnSound');
      this.soundIcon = document.getElementById('soundIcon');
      this.pauseBtn = document.getElementById('btnPause');
      this.crtBtn = document.getElementById('btnCrt');
      this.crtFilter = document.getElementById('crtFilter');

      this.bindEvents();
      this.updateHUD();

      requestAnimationFrame(time => this.loop(time));
    }

    bindEvents() {
      const unlockAudio = () => {
        this.audio.unlock();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);

      window.addEventListener('keydown', e => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
          e.preventDefault();
        }

        switch(e.code) {
          case 'ArrowUp':
          case 'KeyW':
            this.pacman.setQueuedDirection(DIRS.UP);
            break;
          case 'ArrowDown':
          case 'KeyS':
            this.pacman.setQueuedDirection(DIRS.DOWN);
            break;
          case 'ArrowLeft':
          case 'KeyA':
            this.pacman.setQueuedDirection(DIRS.LEFT);
            break;
          case 'ArrowRight':
          case 'KeyD':
            this.pacman.setQueuedDirection(DIRS.RIGHT);
            break;
          case 'KeyP':
            this.togglePause();
            break;
          case 'KeyM':
            this.toggleSound();
            break;
          case 'Space':
            if (this.state === 'START' || this.state === 'GAMEOVER') {
              this.startGame();
            }
            break;
        }
      });

      document.getElementById('btnStartGame').addEventListener('click', () => this.startGame());
      document.getElementById('btnResumeGame').addEventListener('click', () => this.togglePause());
      document.getElementById('btnRestartGame').addEventListener('click', () => this.startGame());

      this.soundBtn.addEventListener('click', () => this.toggleSound());
      this.pauseBtn.addEventListener('click', () => this.togglePause());
      this.crtBtn.addEventListener('click', () => {
        this.crtFilter.classList.toggle('hidden');
        this.crtBtn.classList.toggle('active');
      });

      // Virtual D-Pad
      const bindTouchBtn = (id, dir) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        const trigger = (e) => {
          e.preventDefault();
          this.audio.unlock();
          this.pacman.setQueuedDirection(dir);
        };
        btn.addEventListener('touchstart', trigger, { passive: false });
        btn.addEventListener('mousedown', trigger);
      };

      bindTouchBtn('dpadUp', DIRS.UP);
      bindTouchBtn('dpadDown', DIRS.DOWN);
      bindTouchBtn('dpadLeft', DIRS.LEFT);
      bindTouchBtn('dpadRight', DIRS.RIGHT);

      // Swipe Gestures
      let touchStartX = 0;
      let touchStartY = 0;
      this.canvas.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      this.canvas.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.hypot(dx, dy) < 20) return;

        if (Math.abs(dx) > Math.abs(dy)) {
          this.pacman.setQueuedDirection(dx > 0 ? DIRS.RIGHT : DIRS.LEFT);
        } else {
          this.pacman.setQueuedDirection(dy > 0 ? DIRS.DOWN : DIRS.UP);
        }
      }, { passive: true });
    }

    toggleSound() {
      const muted = this.audio.toggleMute();
      this.soundIcon.textContent = muted ? '🔇' : '🔊';
      this.soundBtn.classList.toggle('active', !muted);
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.pauseScreenEl.classList.remove('hidden');
        this.audio.stopSiren();
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.pauseScreenEl.classList.add('hidden');
        this.audio.startSiren(this.frightenedTimer > 0);
      }
    }

    startGame() {
      this.score = 0;
      this.lives = 3;
      this.level = 1;
      this.startScreenEl.classList.add('hidden');
      this.gameOverScreenEl.classList.add('hidden');
      this.pauseScreenEl.classList.add('hidden');

      this.maze.reset();
      this.fruitSpawned1 = false;
      this.fruitSpawned2 = false;
      this.fruit.active = false;

      this.startRound(true);
    }

    startRound(isNewLevel = false) {
      this.pacman.reset();
      this.ghosts.forEach(g => g.reset());

      this.waveIndex = 0;
      this.waveTimer = 0;
      this.globalMode = this.scatterChaseSchedule[0].mode;
      this.frightenedTimer = 0;

      this.state = 'READY';
      this.readyTimer = isNewLevel ? 1.6 : 1.2; // Crisp start delay
      this.popups = [];
      this.audio.stopSiren();

      if (isNewLevel) {
        this.audio.playIntro();
      }

      this.updateHUD();
    }

    handleGhostCollision(ghost) {
      // Eaten eyes cannot interact
      if (ghost.state === 'EATEN') return;

      // Power-up Active: Ghost is eaten!
      if (this.frightenedTimer > 0 || ghost.state === 'FRIGHTENED') {
        ghost.state = 'EATEN';
        ghost.frightenedTimer = 0;
        const pts = this.ghostEatenMultiplier;
        this.addScore(pts);
        this.audio.playEatGhost();

        this.popups.push({
          text: pts.toString(),
          x: ghost.x,
          y: ghost.y,
          timer: 1.0,
          color: '#00ffff'
        });

        this.ghostEatenMultiplier *= 2;
      } 
      // Normal state: Pac-Man Dies
      else if (ghost.state === 'CHASE' || ghost.state === 'SCATTER') {
        this.state = 'DYING';
        this.pacman.alive = false;
        this.audio.stopSiren();
        this.audio.playDeath();
      }
    }

    addScore(points) {
      const oldScore = this.score;
      this.score += points;

      if (oldScore < 10000 && this.score >= 10000) {
        this.lives++;
      }

      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('pacman_highscore', this.highScore);
      }
      this.updateHUD();
    }

    updateHUD() {
      this.playerScoreEl.textContent = this.score.toString().padStart(2, '0');
      this.highScoreEl.textContent = this.highScore.toString();
      this.levelDisplayEl.textContent = this.level.toString();
    }

    // ==========================================================================
    // MAIN UPDATE LOOP
    // ==========================================================================
    update(dt) {
      // 1. Energizer visual blinker
      this.energizerTimer += dt;
      if (this.energizerTimer >= 0.2) {
        this.energizerTimer = 0;
        this.energizerVisible = !this.energizerVisible;
      }

      // 2. Score Popups
      for (let i = this.popups.length - 1; i >= 0; i--) {
        this.popups[i].timer -= dt;
        this.popups[i].y -= 12 * dt;
        if (this.popups[i].timer <= 0) {
          this.popups.splice(i, 1);
        }
      }

      // 3. State Handling
      if (this.state === 'READY') {
        this.readyTimer -= dt;
        if (this.readyTimer <= 0) {
          this.state = 'PLAYING';
          this.audio.startSiren(false);
        }
        return;
      }

      if (this.state === 'DYING') {
        this.pacman.update(dt, this.maze);
        if (this.pacman.deathProgress >= 1.5) {
          this.lives--;
          if (this.lives > 0) {
            this.startRound(false);
          } else {
            this.state = 'GAMEOVER';
            this.finalScoreEl.textContent = `FINAL SCORE: ${this.score}`;
            this.gameOverScreenEl.classList.remove('hidden');
          }
        }
        return;
      }

      if (this.state === 'LEVEL_CLEAR') {
        this.clearTimer += dt;
        if (this.clearTimer >= 0.25) {
          this.clearTimer = 0;
          this.clearFlashes++;
        }
        if (this.clearFlashes >= 6) {
          this.level++;
          this.maze.reset();
          this.fruitSpawned1 = false;
          this.fruitSpawned2 = false;
          this.fruit.active = false;
          this.startRound(true);
        }
        return;
      }

      if (this.state !== 'PLAYING') return;

      // 4. Power-Up Countdown
      if (this.frightenedTimer > 0) {
        this.frightenedTimer -= dt;
        if (this.frightenedTimer <= 0) {
          this.frightenedTimer = 0;
          this.audio.startSiren(false);
        }
      }

      // 5. Scatter / Chase Wave Timing (runs only when not frightened)
      if (this.frightenedTimer <= 0 && this.waveIndex < this.scatterChaseSchedule.length) {
        this.waveTimer += dt;
        const currentWave = this.scatterChaseSchedule[this.waveIndex];
        if (this.waveTimer >= currentWave.dur) {
          this.waveTimer = 0;
          this.waveIndex++;
          if (this.waveIndex < this.scatterChaseSchedule.length) {
            this.globalMode = this.scatterChaseSchedule[this.waveIndex].mode;
            this.ghosts.forEach(g => {
              if (g.state === 'CHASE' || g.state === 'SCATTER') {
                g.state = this.globalMode;
                g.dir = { x: -g.dir.x, y: -g.dir.y, name: g.getOppositeDirName(g.dir) };
              }
            });
          }
        }
      }

      // 6. Update Pac-Man
      this.pacman.update(dt, this.maze);

      // Pellet & Energizer Consumption
      const pacCol = Math.floor(this.pacman.x / TILE_SIZE);
      const pacRow = Math.floor(this.pacman.y / TILE_SIZE);
      const tile = this.maze.getTile(pacCol, pacRow);

      if (tile === TILE.PELLET) {
        this.maze.setTile(pacCol, pacRow, TILE.EMPTY);
        this.maze.remainingPellets--;
        this.addScore(10);
        this.audio.playWaka();

        const eaten = this.maze.totalPellets - this.maze.remainingPellets;
        if (!this.fruitSpawned1 && eaten >= 70) {
          this.fruitSpawned1 = true;
          this.fruit.spawn(this.level);
        } else if (!this.fruitSpawned2 && eaten >= 170) {
          this.fruitSpawned2 = true;
          this.fruit.spawn(this.level);
        }

        if (this.maze.remainingPellets <= 0) {
          this.state = 'LEVEL_CLEAR';
          this.clearTimer = 0;
          this.clearFlashes = 0;
          this.audio.stopSiren();
          return;
        }
      } else if (tile === TILE.ENERGIZER) {
        this.maze.setTile(pacCol, pacRow, TILE.EMPTY);
        this.maze.remainingPellets--;
        this.addScore(50);
        this.audio.playWaka();
        this.ghostEatenMultiplier = 200;

        // Activate Power-up for 8 full seconds
        this.frightenedTimer = Math.max(5.0, 8.5 - this.level * 0.5);
        this.ghosts.forEach(g => g.setFrightened(this.frightenedTimer));
        this.audio.startSiren(true);

        if (this.maze.remainingPellets <= 0) {
          this.state = 'LEVEL_CLEAR';
          this.clearTimer = 0;
          this.clearFlashes = 0;
          this.audio.stopSiren();
          return;
        }
      }

      // 7. Bonus Fruit Collision
      this.fruit.update(dt);
      if (this.fruit.active) {
        const fruitDist = Math.hypot(this.pacman.x - this.fruit.x, this.pacman.y - this.fruit.y);
        if (fruitDist < 12) {
          this.fruit.active = false;
          this.addScore(this.fruit.points);
          this.audio.playEatFruit();
          this.popups.push({
            text: this.fruit.points.toString(),
            x: this.fruit.x,
            y: this.fruit.y,
            timer: 1.2,
            color: '#ffb8ff'
          });
        }
      }

      // 8. Update Ghosts & Collision Resolution
      this.ghosts.forEach(ghost => {
        ghost.update(dt, this.maze, this.pacman, this.blinky, this.globalMode, this.frightenedTimer);

        // Responsive collision window
        const dist = Math.hypot(this.pacman.x - ghost.x, this.pacman.y - ghost.y);
        if (dist < 11) {
          this.handleGhostCollision(ghost);
        }
      });
    }

    // ==========================================================================
    // RENDER PASS
    // ==========================================================================
    draw() {
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const isFlashingWhite = (this.state === 'LEVEL_CLEAR' && this.clearFlashes % 2 === 1);
      this.maze.draw(this.ctx, this.energizerVisible, isFlashingWhite);

      this.fruit.draw(this.ctx);
      this.pacman.draw(this.ctx);

      if (this.state !== 'LEVEL_CLEAR') {
        this.ghosts.forEach(g => g.draw(this.ctx));
      }

      // Score Popups
      this.ctx.font = '9px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.popups.forEach(p => {
        this.ctx.fillStyle = p.color;
        this.ctx.fillText(p.text, p.x, p.y);
      });

      // READY! banner
      if (this.state === 'READY') {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '12px "Press Start 2P", monospace';
        this.ctx.fillText('READY!', 14 * TILE_SIZE, 20 * TILE_SIZE);
      }

      // Visual Power-Up Active Bar & Indicator
      if (this.frightenedTimer > 0 && this.state === 'PLAYING') {
        const barWidth = 140;
        const barHeight = 6;
        const barX = (CANVAS_WIDTH - barWidth) / 2;
        const barY = 20 * TILE_SIZE - 6;
        const pct = this.frightenedTimer / 8.0;

        this.ctx.fillStyle = 'rgba(0, 0, 80, 0.7)';
        this.ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

        this.ctx.fillStyle = (this.frightenedTimer < 2.5 && Math.floor(this.frightenedTimer * 6) % 2 === 0) 
          ? '#ffffff' 
          : '#00ffff';
        this.ctx.fillRect(barX, barY, Math.max(0, barWidth * pct), barHeight);
      }

      this.drawFooterHUD();
    }

    drawFooterHUD() {
      const footerY = 34.5 * TILE_SIZE;

      // Draw remaining lives as mini Pac-Man icons
      for (let i = 0; i < this.lives - 1; i++) {
        const x = (2 + i * 2) * TILE_SIZE;
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(x, footerY, 6, 0.25 * Math.PI, 1.75 * Math.PI, false);
        this.ctx.lineTo(x, footerY);
        this.ctx.closePath();
        this.ctx.fill();
      }

      // Draw Level Indicator Fruit
      const fruitX = (COLS - 3) * TILE_SIZE;
      this.ctx.fillStyle = '#ff0000';
      this.ctx.beginPath();
      this.ctx.arc(fruitX - 3, footerY + 2, 3, 0, Math.PI * 2);
      this.ctx.arc(fruitX + 3, footerY + 3, 3, 0, Math.PI * 2);
      this.ctx.fill();
      ctx_stem: {
        this.ctx.strokeStyle = '#a52a2a';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(fruitX - 3, footerY);
        this.ctx.lineTo(fruitX, footerY - 5);
        this.ctx.moveTo(fruitX + 3, footerY);
        this.ctx.lineTo(fruitX, footerY - 5);
        this.ctx.stroke();
      }
    }

    // ==========================================================================
    // GAME LOOP (Fixed / Delta Timestep)
    // ==========================================================================
    loop(currentTime) {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05); // Capped at 50ms to prevent jumps
      this.lastTime = currentTime;

      this.update(dt);
      this.draw();

      requestAnimationFrame(time => this.loop(time));
    }
  }

  // Initialize game on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new PacmanGame();
  });

})();
