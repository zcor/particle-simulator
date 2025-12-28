import { World } from './world.js';
import { ParticleType, PARTICLE_COLORS, PARTICLE_CHARS, PARTICLE_NAMES } from './particles/base.js';

const RESET = '\x1b[0m';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const CLEAR_SCREEN = '\x1b[2J';
const HOME = '\x1b[H';

export class Renderer {
  private lastFrame: string = '';

  render(world: World, selectedType: ParticleType, brushSize: number, fps: number): void {
    let frame = HOME;

    // Build frame
    for (let y = 0; y < world.height; y++) {
      let line = '';
      let lastColor = '';

      for (let x = 0; x < world.width; x++) {
        const particle = world.get(x, y);

        if (particle === null) {
          if (lastColor !== RESET) {
            line += RESET;
            lastColor = RESET;
          }
          line += ' ';
        } else {
          const color = this.getParticleColor(particle.type, x, y);
          if (color !== lastColor) {
            line += color;
            lastColor = color;
          }
          line += PARTICLE_CHARS[particle.type];
        }
      }
      line += RESET + '\n';
      frame += line;
    }

    // Status bar
    const statusColor = PARTICLE_COLORS[selectedType];
    const statusChar = PARTICLE_CHARS[selectedType];
    const name = PARTICLE_NAMES[selectedType];
    frame += `\n${statusColor}${statusChar}${RESET} ${name} | Brush: ${brushSize} | FPS: ${fps} | [1-8] Select | [+/-] Brush | [Space] Spawn | [C] Clear | [Q] Quit\n`;

    // Only update if frame changed (reduces flicker)
    if (frame !== this.lastFrame) {
      process.stdout.write(frame);
      this.lastFrame = frame;
    }
  }

  private getParticleColor(type: ParticleType, x: number, y: number): string {
    // Add some visual variation
    if (type === ParticleType.Fire) {
      // Flicker between red and orange
      return Math.random() > 0.5 ? '\x1b[91m' : '\x1b[93m';
    }
    if (type === ParticleType.Water) {
      // Slight variation in water
      return Math.random() > 0.9 ? '\x1b[96m' : '\x1b[94m';
    }
    return PARTICLE_COLORS[type];
  }

  init(): void {
    process.stdout.write(HIDE_CURSOR + CLEAR_SCREEN + HOME);
  }

  cleanup(): void {
    process.stdout.write(SHOW_CURSOR + RESET + '\n');
  }
}
