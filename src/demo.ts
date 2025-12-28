import { World } from './world.js';
import { Renderer } from './renderer.js';
import { Physics } from './physics.js';
import { ParticleType } from './particles/base.js';

const TARGET_FPS = 30;
const FRAME_TIME = 1000 / TARGET_FPS;

const WORLD_WIDTH = Math.min(process.stdout.columns || 80, 100);
const WORLD_HEIGHT = Math.min((process.stdout.rows || 24) - 3, 35);

interface DemoAction {
  frame: number;
  action: (world: World) => void;
  description?: string;
}

class Demo {
  private world: World;
  private renderer: Renderer;
  private physics: Physics;
  private frame: number = 0;
  private actions: DemoAction[] = [];
  private actionIndex: number = 0;
  private lastTime: number = Date.now();
  private running: boolean = true;

  constructor() {
    this.world = new World(WORLD_WIDTH, WORLD_HEIGHT);
    this.renderer = new Renderer();
    this.physics = new Physics();
    this.buildDemoScript();
  }

  private buildDemoScript(): void {
    const midX = Math.floor(WORLD_WIDTH / 2);
    const midY = Math.floor(WORLD_HEIGHT / 2);
    const bottom = WORLD_HEIGHT - 2;

    // Scene 1: Build the stage floor
    this.addAction(1, (w) => {
      for (let x = 5; x < WORLD_WIDTH - 5; x++) {
        w.spawn(x, bottom, ParticleType.Stone);
      }
    });

    // Scene 2: Build two containers
    this.addAction(30, (w) => {
      // Left container
      for (let y = bottom - 12; y < bottom; y++) {
        w.spawn(15, y, ParticleType.Stone);
        w.spawn(35, y, ParticleType.Stone);
      }
      for (let x = 15; x <= 35; x++) {
        w.spawn(x, bottom - 12, ParticleType.Stone);
      }
      // Right container
      for (let y = bottom - 12; y < bottom; y++) {
        w.spawn(WORLD_WIDTH - 35, y, ParticleType.Stone);
        w.spawn(WORLD_WIDTH - 15, y, ParticleType.Stone);
      }
      for (let x = WORLD_WIDTH - 35; x <= WORLD_WIDTH - 15; x++) {
        w.spawn(x, bottom - 12, ParticleType.Stone);
      }
    });

    // Scene 3: Rain sand into left container
    for (let t = 0; t < 80; t++) {
      this.addAction(60 + t * 2, (w) => {
        for (let i = 0; i < 3; i++) {
          const x = 20 + Math.floor(Math.random() * 10);
          w.spawn(x, 3, ParticleType.Sand);
        }
      });
    }

    // Scene 4: Rain water into right container
    for (let t = 0; t < 80; t++) {
      this.addAction(100 + t * 2, (w) => {
        for (let i = 0; i < 3; i++) {
          const x = WORLD_WIDTH - 30 + Math.floor(Math.random() * 10);
          w.spawn(x, 3, ParticleType.Water);
        }
      });
    }

    // Scene 5: Build a wood cabin in the center
    this.addAction(300, (w) => {
      const cx = midX;
      const cy = bottom - 1;
      // Floor
      for (let x = cx - 8; x <= cx + 8; x++) {
        w.spawn(x, cy, ParticleType.Wood);
      }
      // Walls
      for (let y = cy - 6; y < cy; y++) {
        w.spawn(cx - 8, y, ParticleType.Wood);
        w.spawn(cx + 8, y, ParticleType.Wood);
      }
      // Roof
      for (let i = 0; i <= 8; i++) {
        w.spawn(cx - 8 + i, cy - 6 - i, ParticleType.Wood);
        w.spawn(cx + 8 - i, cy - 6 - i, ParticleType.Wood);
      }
    });

    // Scene 6: Add plants near water
    this.addAction(350, (w) => {
      for (let x = WORLD_WIDTH - 33; x <= WORLD_WIDTH - 17; x += 2) {
        w.spawn(x, bottom - 1, ParticleType.Plant);
      }
    });

    // Scene 7: Let plants grow for a bit (water is nearby)
    // Just waiting...

    // Scene 8: FIRE! Light the cabin
    this.addAction(500, (w) => {
      w.spawn(midX, bottom - 8, ParticleType.Fire);
      w.spawn(midX - 2, bottom - 7, ParticleType.Fire);
      w.spawn(midX + 2, bottom - 7, ParticleType.Fire);
    });

    // Scene 9: More fire to ensure spread
    this.addAction(530, (w) => {
      w.spawn(midX - 6, bottom - 3, ParticleType.Fire);
      w.spawn(midX + 6, bottom - 3, ParticleType.Fire);
    });

    // Scene 10: Pour water from above to fight the fire
    for (let t = 0; t < 60; t++) {
      this.addAction(650 + t * 2, (w) => {
        for (let i = 0; i < 4; i++) {
          const x = midX - 5 + Math.floor(Math.random() * 10);
          w.spawn(x, 2, ParticleType.Water);
        }
      });
    }

    // Scene 11: Add more sand for visual interest
    for (let t = 0; t < 40; t++) {
      this.addAction(800 + t * 3, (w) => {
        const x = 10 + Math.floor(Math.random() * (WORLD_WIDTH - 20));
        w.spawn(x, 1, ParticleType.Sand);
      });
    }

    // Scene 12: Finale - particle rain
    for (let t = 0; t < 100; t++) {
      this.addAction(950 + t * 2, (w) => {
        const types = [ParticleType.Sand, ParticleType.Water, ParticleType.Sand];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = 6 + Math.floor(Math.random() * (WORLD_WIDTH - 12));
        w.spawn(x, 1, type);
      });
    }

    // Scene 13: Clear and restart
    this.addAction(1200, (w) => {
      w.clear();
      this.actionIndex = 0;
      this.frame = 0;
    });

    // Sort actions by frame
    this.actions.sort((a, b) => a.frame - b.frame);
  }

  private addAction(frame: number, action: (world: World) => void): void {
    this.actions.push({ frame, action });
  }

  init(): void {
    this.renderer.init();

    process.on('SIGINT', () => this.quit());
    process.on('SIGTERM', () => this.quit());

    // Also quit on any key press
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', () => this.quit());
    }

    console.log('\x1b[H\x1b[2J'); // Clear screen
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
      this.frame++;
    }

    setImmediate(() => this.gameLoop());
  }

  private update(): void {
    // Execute any actions scheduled for this frame
    while (this.actionIndex < this.actions.length &&
           this.actions[this.actionIndex].frame <= this.frame) {
      this.actions[this.actionIndex].action(this.world);
      this.actionIndex++;
    }

    this.physics.update(this.world);
  }

  private render(): void {
    this.renderer.render(this.world, ParticleType.Sand, 3, Math.round(1000 / FRAME_TIME));
  }

  private quit(): void {
    this.running = false;
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    this.renderer.cleanup();
    console.log('\n✨ Thanks for watching the demo!');
    process.exit(0);
  }
}

// Show intro
console.log('\x1b[H\x1b[2J');
console.log('\n  🏖️  PARTICLE SANDBOX DEMO\n');
console.log('  Watch as sand falls, water flows,');
console.log('  fire burns, and plants grow!\n');
console.log('  Press any key to exit.\n');
console.log('  Starting in 3 seconds...\n');

setTimeout(() => {
  const demo = new Demo();
  demo.init();
  demo.run();
}, 3000);
