import { World } from './world.js';
import { Renderer } from './renderer.js';
import { Physics } from './physics.js';
import { Input } from './input.js';
import { ParticleType } from './particles/base.js';

const TARGET_FPS = 30;
const FRAME_TIME = 1000 / TARGET_FPS;

// Get terminal size, with fallbacks
const WORLD_WIDTH = Math.min(process.stdout.columns || 80, 120);
const WORLD_HEIGHT = Math.min((process.stdout.rows || 24) - 3, 40);

class Game {
  private world: World;
  private renderer: Renderer;
  private physics: Physics;
  private input: Input;
  private running: boolean = true;
  private lastTime: number = Date.now();
  private frameCount: number = 0;
  private fps: number = 0;
  private fpsTimer: number = Date.now();

  constructor() {
    this.world = new World(WORLD_WIDTH, WORLD_HEIGHT);
    this.renderer = new Renderer();
    this.physics = new Physics();
    this.input = new Input(WORLD_WIDTH, WORLD_HEIGHT);
  }

  init(): void {
    this.renderer.init();
    this.input.init();

    // Handle process termination
    process.on('SIGINT', () => this.quit());
    process.on('SIGTERM', () => this.quit());

    // Add some initial particles for fun
    this.addInitialScene();
  }

  private addInitialScene(): void {
    // Create a small container with sand
    const midX = Math.floor(WORLD_WIDTH / 2);
    const midY = Math.floor(WORLD_HEIGHT / 2);

    // Stone floor
    for (let x = midX - 15; x <= midX + 15; x++) {
      this.world.spawn(x, midY + 10, ParticleType.Stone);
    }

    // Stone walls
    for (let y = midY; y <= midY + 10; y++) {
      this.world.spawn(midX - 15, y, ParticleType.Stone);
      this.world.spawn(midX + 15, y, ParticleType.Stone);
    }

    // Some initial sand
    for (let i = 0; i < 50; i++) {
      const x = midX - 10 + Math.floor(Math.random() * 20);
      const y = midY - 5 + Math.floor(Math.random() * 5);
      this.world.spawn(x, y, ParticleType.Sand);
    }

    // Some wood to burn
    for (let x = midX - 5; x <= midX + 5; x++) {
      this.world.spawn(x, midY + 9, ParticleType.Wood);
    }
  }

  run(): void {
    this.gameLoop();
  }

  private gameLoop(): void {
    if (!this.running) {
      this.quit();
      return;
    }

    const now = Date.now();
    const delta = now - this.lastTime;

    if (delta >= FRAME_TIME) {
      this.update();
      this.render();
      this.lastTime = now - (delta % FRAME_TIME);

      // FPS counter
      this.frameCount++;
      if (now - this.fpsTimer >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.fpsTimer = now;
      }
    }

    // Use setImmediate for responsive input handling
    setImmediate(() => this.gameLoop());
  }

  private update(): void {
    const inputState = this.input.getState();

    if (inputState.shouldQuit) {
      this.running = false;
      return;
    }

    if (inputState.shouldClear) {
      this.world.clear();
    }

    // Spawn particles
    if (inputState.spawning) {
      this.spawnBrush(inputState.spawnX, inputState.spawnY, inputState.selectedType, inputState.brushSize);
    }

    // Always spawn at cursor position while holding space (continuous spawn)
    const cursor = this.input.getCursor();

    // Update physics
    this.physics.update(this.world);
  }

  private spawnBrush(cx: number, cy: number, type: ParticleType, size: number): void {
    const half = Math.floor(size / 2);
    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        // Circular brush
        if (dx * dx + dy * dy <= half * half + half) {
          // Add some randomness for natural look
          if (Math.random() > 0.3) {
            this.world.spawn(cx + dx, cy + dy, type);
          }
        }
      }
    }
  }

  private render(): void {
    const inputState = this.input.getState();
    this.renderer.render(this.world, inputState.selectedType, inputState.brushSize, this.fps);
  }

  private quit(): void {
    this.running = false;
    this.input.cleanup();
    this.renderer.cleanup();
    console.log('Thanks for playing!');
    process.exit(0);
  }
}

// Start the game
const game = new Game();
game.init();
game.run();
