# Particle Sandbox

A mesmerizing particle simulation inspired by "falling sand" games. Watch sand pile up, water flow, fire spread, and plants grow!

**[Play in your browser](https://zcor.github.io/particle-simulator/)** — no install required!

![Particle Sandbox Demo](demo.gif)

## Web Version

Play instantly at **https://zcor.github.io/particle-simulator/**

- Works on desktop and mobile
- Click/tap and drag to spawn particles
- Select particle types from the toolbar

## Terminal Version

### Installation

```bash
npm install
npm run build
```

### Usage

**Interactive mode** — play with particles yourself:
```bash
npm start
```

**Demo mode** — automated showcase (great for recording):
```bash
npm run demo
```

## Controls

| Key | Action |
|-----|--------|
| `1` | Sand |
| `2` | Water |
| `3` | Stone |
| `4` | Fire |
| `5` | Smoke |
| `6` | Wood |
| `7` | Plant |
| `8` | Eraser |
| `Arrow keys` / `WASD` | Move cursor |
| `Space` | Spawn particles |
| `+` / `-` | Brush size |
| `C` | Clear world |
| `Q` | Quit |

## Particle Behaviors

| Particle | Behavior |
|----------|----------|
| **Sand** | Falls, piles up, slides off slopes, sinks through water |
| **Water** | Falls, flows sideways, fills containers |
| **Stone** | Static, immovable — build containers and structures |
| **Fire** | Burns, spreads to wood, creates smoke, evaporates water |
| **Smoke** | Rises and slowly dissipates |
| **Wood** | Static but flammable — watch it burn |
| **Plant** | Grows upward when touching water |

## Recording

Record your own videos using [VHS](https://github.com/charmbracelet/vhs):

```bash
vhs demo.tape
```

## License

MIT
