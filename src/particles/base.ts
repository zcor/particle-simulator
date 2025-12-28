export enum ParticleType {
  Empty = 0,
  Sand = 1,
  Water = 2,
  Stone = 3,
  Fire = 4,
  Smoke = 5,
  Wood = 6,
  Plant = 7,
}

export interface Particle {
  type: ParticleType;
  updated: boolean; // Prevent double-updates in a single frame
  lifetime?: number; // For particles that expire (fire, smoke)
}

export function createParticle(type: ParticleType): Particle {
  const particle: Particle = {
    type,
    updated: false,
  };

  if (type === ParticleType.Fire) {
    particle.lifetime = 20 + Math.floor(Math.random() * 30);
  } else if (type === ParticleType.Smoke) {
    particle.lifetime = 40 + Math.floor(Math.random() * 40);
  }

  return particle;
}

export const PARTICLE_COLORS: Record<ParticleType, string> = {
  [ParticleType.Empty]: '\x1b[0m',      // Reset
  [ParticleType.Sand]: '\x1b[93m',      // Bright yellow
  [ParticleType.Water]: '\x1b[94m',     // Bright blue
  [ParticleType.Stone]: '\x1b[90m',     // Dark gray
  [ParticleType.Fire]: '\x1b[91m',      // Bright red
  [ParticleType.Smoke]: '\x1b[37m',     // White/gray
  [ParticleType.Wood]: '\x1b[33m',      // Yellow/brown
  [ParticleType.Plant]: '\x1b[92m',     // Bright green
};

export const PARTICLE_CHARS: Record<ParticleType, string> = {
  [ParticleType.Empty]: ' ',
  [ParticleType.Sand]: '░',
  [ParticleType.Water]: '▒',
  [ParticleType.Stone]: '█',
  [ParticleType.Fire]: '▓',
  [ParticleType.Smoke]: '░',
  [ParticleType.Wood]: '▓',
  [ParticleType.Plant]: '♣',
};

export const PARTICLE_NAMES: Record<ParticleType, string> = {
  [ParticleType.Empty]: 'Eraser',
  [ParticleType.Sand]: 'Sand',
  [ParticleType.Water]: 'Water',
  [ParticleType.Stone]: 'Stone',
  [ParticleType.Fire]: 'Fire',
  [ParticleType.Smoke]: 'Smoke',
  [ParticleType.Wood]: 'Wood',
  [ParticleType.Plant]: 'Plant',
};
