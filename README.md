# Avodah Timer

A beautiful, shareable countdown timer for the web. Set a timer, share the URL, and anyone can use it.

## Features

- **Shareable URLs** — Timer state is stored in the URL, making it easy to share specific countdowns
- **Customizable display** — Choose from multiple colors and sizes
- **Audio alerts** — Alarm sound plays on completion
- **Keyboard shortcuts** — Press `Space` to start/pause

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for development and bundling
- **Tailwind CSS v4** for styling
- **Biome** for linting and formatting
- **Bun** as the package manager

## Getting Started

```bash
# Install dependencies
bun install

# Start the dev server
bun dev

# Build for production
bun run build

# Preview production build
bun preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun run build` | Build for production |
| `bun preview` | Preview production build |
| `bun run lint` | Run linter |
| `bun run lint:fix` | Fix linting issues |
| `bun run format` | Format code |
