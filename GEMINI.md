# GEMINI.md

## Project Overview

This project is a 2D survival shooter game called "Lane Survivor," built with vanilla JavaScript (ES modules) and designed for static hosting. It's a "zero-build" application, meaning it can be run directly from the source files without a build process. The game is performance-tuned for low-power hardware like the Raspberry Pi 2B.

The application structure is modular, with a clear separation of concerns. The main entry point is `src/main.js`, which instantiates the `LaneSurvivorApp` class from `src/app.js`. The core game loop and logic are managed by the `GameEngine` in `src/game/engine.js`. The game features a responsive UI, touch controls, and a particle system for visual effects.

The project has a detailed restoration roadmap outlined in the `docs` directory, with the goal of re-implementing features from a previous, more feature-rich version of the game (`lane-shooter-enhanced.html`).

## Building and Running

This is a zero-build static application. No build process is required.

### Running Locally

To run the game locally, you can use a simple HTTP server.

1.  Navigate to the project's root directory.
2.  Run the following command:

    ```bash
    python3 -m http.server 8000
    ```

3.  Open your web browser and go to `http://localhost:8000`.

### Development Server (Optional)

The documentation also mentions using Vite for a more advanced development setup, but it's not required to run the project.

## Development Conventions

*   **Modularity:** The codebase is organized into ES modules located in the `src` directory. Each module has a specific responsibility (e.g., `player.js`, `enemy.js`, `renderer.js`).
*   **Configuration:** Game-wide constants and settings are stored in `src/config.js`.
*   **State Management:** The core game state is managed in `src/game/state.js`.
*   **Entry Point:** The application starts in `src/main.js`, which handles the initial setup and creates the main application instance.
*   **Documentation:** The `docs` directory contains important project information, including the project roadmap, quick start guide, and design notes. It's a good place to look for context on the project's history and future plans.
*   **Styling:** Styles are written in plain CSS and located in `styles/main.css`.
