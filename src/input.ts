import { ParticleType } from './particles/base.js';
import * as readline from 'readline';

export interface InputState {
  selectedType: ParticleType;
  brushSize: number;
  spawning: boolean;
  spawnX: number;
  spawnY: number;
  shouldQuit: boolean;
  shouldClear: boolean;
}

const PARTICLE_KEYS: Record<string, ParticleType> = {
  '1': ParticleType.Sand,
  '2': ParticleType.Water,
  '3': ParticleType.Stone,
  '4': ParticleType.Fire,
  '5': ParticleType.Smoke,
  '6': ParticleType.Wood,
  '7': ParticleType.Plant,
  '8': ParticleType.Empty, // Eraser
};

export class Input {
  private state: InputState = {
    selectedType: ParticleType.Sand,
    brushSize: 3,
    spawning: false,
    spawnX: 0,
    spawnY: 0,
    shouldQuit: false,
    shouldClear: false,
  };

  private worldWidth: number;
  private worldHeight: number;
  private cursorX: number;
  private cursorY: number;

  constructor(worldWidth: number, worldHeight: number) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.cursorX = Math.floor(worldWidth / 2);
    this.cursorY = Math.floor(worldHeight / 2);
  }

  init(): void {
    // Set up raw mode for immediate key detection
    if (process.stdin.isTTY) {
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.resume();

      process.stdin.on('keypress', (str, key) => {
        this.handleKey(str, key);
      });
    }
  }

  private handleKey(str: string | undefined, key: readline.Key): void {
    if (!key) return;

    // Quit
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      this.state.shouldQuit = true;
      return;
    }

    // Clear
    if (key.name === 'c') {
      this.state.shouldClear = true;
      return;
    }

    // Particle selection
    if (str && PARTICLE_KEYS[str] !== undefined) {
      this.state.selectedType = PARTICLE_KEYS[str];
      return;
    }

    // Brush size
    if (str === '+' || str === '=') {
      this.state.brushSize = Math.min(10, this.state.brushSize + 1);
      return;
    }
    if (str === '-' || str === '_') {
      this.state.brushSize = Math.max(1, this.state.brushSize - 1);
      return;
    }

    // Cursor movement
    if (key.name === 'up' || key.name === 'w') {
      this.cursorY = Math.max(0, this.cursorY - 2);
    }
    if (key.name === 'down' || key.name === 's') {
      this.cursorY = Math.min(this.worldHeight - 1, this.cursorY + 2);
    }
    if (key.name === 'left' || key.name === 'a') {
      this.cursorX = Math.max(0, this.cursorX - 2);
    }
    if (key.name === 'right' || key.name === 'd') {
      this.cursorX = Math.min(this.worldWidth - 1, this.cursorX + 2);
    }

    // Spawn
    if (key.name === 'space') {
      this.state.spawning = true;
      this.state.spawnX = this.cursorX;
      this.state.spawnY = this.cursorY;
    }
  }

  getState(): InputState {
    const state = { ...this.state };
    // Reset one-shot flags
    this.state.spawning = false;
    this.state.shouldClear = false;
    return state;
  }

  getCursor(): { x: number; y: number } {
    return { x: this.cursorX, y: this.cursorY };
  }

  cleanup(): void {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
  }
}
