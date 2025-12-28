import { Particle, ParticleType, createParticle } from './particles/base.js';

export class World {
  width: number;
  height: number;
  grid: (Particle | null)[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = [];

    for (let y = 0; y < height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < width; x++) {
        this.grid[y][x] = null;
      }
    }
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  get(x: number, y: number): Particle | null {
    if (!this.inBounds(x, y)) return null;
    return this.grid[y][x];
  }

  set(x: number, y: number, particle: Particle | null): void {
    if (!this.inBounds(x, y)) return;
    this.grid[y][x] = particle;
  }

  isEmpty(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) return false;
    return this.grid[y][x] === null;
  }

  isType(x: number, y: number, type: ParticleType): boolean {
    const p = this.get(x, y);
    return p !== null && p.type === type;
  }

  spawn(x: number, y: number, type: ParticleType): void {
    if (!this.inBounds(x, y)) return;
    if (type === ParticleType.Empty) {
      this.grid[y][x] = null;
    } else {
      this.grid[y][x] = createParticle(type);
    }
  }

  swap(x1: number, y1: number, x2: number, y2: number): void {
    if (!this.inBounds(x1, y1) || !this.inBounds(x2, y2)) return;
    const temp = this.grid[y1][x1];
    this.grid[y1][x1] = this.grid[y2][x2];
    this.grid[y2][x2] = temp;
  }

  resetUpdated(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const p = this.grid[y][x];
        if (p) p.updated = false;
      }
    }
  }

  clear(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = null;
      }
    }
  }
}
