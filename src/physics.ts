import { World } from './world.js';
import { ParticleType, createParticle } from './particles/base.js';

export class Physics {
  update(world: World): void {
    world.resetUpdated();

    // Process bottom-to-top so falling works correctly
    // Randomize left-right direction each frame for natural flow
    const leftToRight = Math.random() > 0.5;

    for (let y = world.height - 1; y >= 0; y--) {
      const startX = leftToRight ? 0 : world.width - 1;
      const endX = leftToRight ? world.width : -1;
      const stepX = leftToRight ? 1 : -1;

      for (let x = startX; x !== endX; x += stepX) {
        const particle = world.get(x, y);
        if (!particle || particle.updated) continue;

        particle.updated = true;

        switch (particle.type) {
          case ParticleType.Sand:
            this.updateSand(world, x, y);
            break;
          case ParticleType.Water:
            this.updateWater(world, x, y);
            break;
          case ParticleType.Fire:
            this.updateFire(world, x, y, particle);
            break;
          case ParticleType.Smoke:
            this.updateSmoke(world, x, y, particle);
            break;
          case ParticleType.Plant:
            this.updatePlant(world, x, y);
            break;
        }
      }
    }
  }

  private updateSand(world: World, x: number, y: number): void {
    // Try to fall straight down
    if (this.canFallThrough(world, x, y + 1)) {
      this.swapOrFall(world, x, y, x, y + 1);
      return;
    }

    // Try to slide diagonally
    const dir = Math.random() > 0.5 ? 1 : -1;
    if (this.canFallThrough(world, x + dir, y + 1)) {
      this.swapOrFall(world, x, y, x + dir, y + 1);
      return;
    }
    if (this.canFallThrough(world, x - dir, y + 1)) {
      this.swapOrFall(world, x, y, x - dir, y + 1);
    }
  }

  private updateWater(world: World, x: number, y: number): void {
    // Fall straight down
    if (this.canWaterOccupy(world, x, y + 1)) {
      world.swap(x, y, x, y + 1);
      return;
    }

    // Fall diagonally
    const dir = Math.random() > 0.5 ? 1 : -1;
    if (this.canWaterOccupy(world, x + dir, y + 1)) {
      world.swap(x, y, x + dir, y + 1);
      return;
    }
    if (this.canWaterOccupy(world, x - dir, y + 1)) {
      world.swap(x, y, x - dir, y + 1);
      return;
    }

    // Flow horizontally
    const flowDist = 1 + Math.floor(Math.random() * 2);
    for (let d = 1; d <= flowDist; d++) {
      if (this.canWaterOccupy(world, x + dir * d, y)) {
        world.swap(x, y, x + dir * d, y);
        return;
      }
    }
    for (let d = 1; d <= flowDist; d++) {
      if (this.canWaterOccupy(world, x - dir * d, y)) {
        world.swap(x, y, x - dir * d, y);
        return;
      }
    }
  }

  private updateFire(world: World, x: number, y: number, particle: { lifetime?: number }): void {
    // Decrease lifetime
    if (particle.lifetime !== undefined) {
      particle.lifetime--;
      if (particle.lifetime <= 0) {
        // Turn to smoke or disappear
        if (Math.random() > 0.5) {
          world.set(x, y, createParticle(ParticleType.Smoke));
        } else {
          world.set(x, y, null);
        }
        return;
      }
    }

    // Spread fire to adjacent wood
    const neighbors = [
      [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
      [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (world.isType(nx, ny, ParticleType.Wood)) {
        if (Math.random() > 0.95) {
          world.set(nx, ny, createParticle(ParticleType.Fire));
        }
      }
      // Evaporate water
      if (world.isType(nx, ny, ParticleType.Water)) {
        if (Math.random() > 0.7) {
          world.set(nx, ny, createParticle(ParticleType.Smoke));
          world.set(x, y, null);
          return;
        }
      }
    }

    // Fire rises slightly
    if (Math.random() > 0.7 && world.isEmpty(x, y - 1)) {
      world.swap(x, y, x, y - 1);
    }
  }

  private updateSmoke(world: World, x: number, y: number, particle: { lifetime?: number }): void {
    // Decrease lifetime
    if (particle.lifetime !== undefined) {
      particle.lifetime--;
      if (particle.lifetime <= 0) {
        world.set(x, y, null);
        return;
      }
    }

    // Rise up
    const dir = Math.random() > 0.5 ? 1 : -1;

    if (world.isEmpty(x, y - 1)) {
      world.swap(x, y, x, y - 1);
    } else if (world.isEmpty(x + dir, y - 1)) {
      world.swap(x, y, x + dir, y - 1);
    } else if (world.isEmpty(x - dir, y - 1)) {
      world.swap(x, y, x - dir, y - 1);
    } else if (world.isEmpty(x + dir, y)) {
      world.swap(x, y, x + dir, y);
    }
  }

  private updatePlant(world: World, x: number, y: number): void {
    // Check for adjacent water
    const hasWater =
      world.isType(x - 1, y, ParticleType.Water) ||
      world.isType(x + 1, y, ParticleType.Water) ||
      world.isType(x, y - 1, ParticleType.Water) ||
      world.isType(x, y + 1, ParticleType.Water);

    if (hasWater && Math.random() > 0.98) {
      // Grow upward
      if (world.isEmpty(x, y - 1)) {
        world.spawn(x, y - 1, ParticleType.Plant);
      }
      // Or grow sideways
      const dir = Math.random() > 0.5 ? 1 : -1;
      if (Math.random() > 0.7 && world.isEmpty(x + dir, y - 1)) {
        world.spawn(x + dir, y - 1, ParticleType.Plant);
      }
    }
  }

  private canFallThrough(world: World, x: number, y: number): boolean {
    if (!world.inBounds(x, y)) return false;
    const p = world.get(x, y);
    return p === null || p.type === ParticleType.Water;
  }

  private canWaterOccupy(world: World, x: number, y: number): boolean {
    return world.isEmpty(x, y);
  }

  private swapOrFall(world: World, x1: number, y1: number, x2: number, y2: number): void {
    const target = world.get(x2, y2);
    if (target === null) {
      world.swap(x1, y1, x2, y2);
    } else if (target.type === ParticleType.Water) {
      // Sand displaces water
      world.swap(x1, y1, x2, y2);
    }
  }
}
