# Cosmic Courier

A single-player 3D browser game built with Three.js and vanilla JavaScript.
Collect five glowing energy crystals, then return to the spaceship. Move with
WASD or arrow keys; press R to restart. Obstacles and walls block movement.
Click Start to begin the 90-second mission. Avoid the patrolling drone: touching
it or running out of time causes defeat. The spaceship unlocks at five crystals.
Everything is made from basic geometry; no external images or models are used.

## Controls

| Control | Action |
| --- | --- |
| WASD or arrow keys | Move the courier |
| Start mission | Start the countdown |
| R or Restart | Reset and return to the Start screen |
| Mute sound / Unmute sound | Toggle generated audio |

## Run

Use Node.js 20.19+ or 22.12+ (Node 24 is supported).

```sh
npm ci
npm run dev
```

Open the address Vite prints in your browser (default port 5173). For a remote
development machine, forward port 5173 using your editor or host's port controls.
The game requires a keyboard and a WebGL-capable browser.

```sh
npm run build
npm run preview
```

The production build is written to `dist/`; preview uses port 4173 by default.
Open the `/GAME1/` path on the address printed by Vite for development or preview.

## Static hosting and GitHub Pages

The connected GitHub repository is
[`neranjani17092007-create/GAME1`](https://github.com/neranjani17092007-create/GAME1).
`vite.config.js` sets the asset base to `/GAME1/` so production JavaScript and
CSS load under the repository subpath. There is no backend or client-side router.
Publish the contents of `dist/`, rather than source files or `node_modules/`.
For a host serving at its domain root, build with:

```sh
STATIC_BASE_PATH=/ npm run build
```

For a different subpath, set `STATIC_BASE_PATH=/your-path/` when building.

The prepared `.github/workflows/pages.yml` builds on pushes to `main` or manual
dispatch, uploads `dist/`, and deploys through the official Pages actions.
To publish:

1. Commit and push these hosting changes to `main` in the connected repository.
2. In GitHub Settings → Pages, select **GitHub Actions** as the build source.
3. In Actions, run **Deploy Cosmic Courier to GitHub Pages** if it has not started
   automatically. Complete any required environment approval.
4. Confirm both build and deploy jobs succeed. Open the URL reported by the
   deployment and verify assets, Start, movement, and sound/mute in a browser.

Deployment has not been performed or verified during this preparation.

## Acknowledgment

Developed with assistance from OpenAI Codex for implementation, interface design,
testing, and static-hosting configuration. Graphics use original simple shapes;
sounds are synthesized with the Web Audio API.

## Files

- `index.html`: page shell, mission HUD, and victory screen.
- `src/main.js`: scene, camera, lights, input, crystal collection, and render loop.
- `src/arena.js`: floor, walls, obstacles, crystals, and spaceship geometry.
- `src/player.js`: courier model, movement, and collision checks.
- `src/camera.js`: smooth third-person camera following the courier.
- `src/style.css`: HUD and responsive layout.
- `package.json`: npm scripts and dependencies.

## Movement

Keydown and keyup maintain a set of held keys. Each frame converts those keys
into an X/Z direction, normalizes it to keep diagonal speed equal to straight
speed, then multiplies by 5 units/second and elapsed seconds. Movement uses
small substeps and checks the player's radius against obstacle rectangles and
arena boundaries. X and Z are checked separately to allow sliding along walls.
The camera follows at a fixed elevated offset with exponential smoothing based
on elapsed time. Its compass direction stays fixed when the character turns.
Switching tabs clears input and discards paused time.

## Playtest checklist

- Try every WASD and arrow key; release each and confirm movement stops.
- Hold opposite keys; confirm they cancel. Compare diagonal and straight speed.
- Walk into all four boundaries and every obstacle, including their corners.
- Move diagonally along a wall; confirm sliding without crossing it.
- Compare movement at 30, 60, and 120 FPS, and try a slow frame near an obstacle.
- Turn and move across the arena; confirm the camera follows smoothly.
- Switch tabs while moving; return and check for stuck input or teleporting.
- Resize the browser; confirm the camera aspect and visible controls adjust.
- Collect all five crystals, reach the spaceship, and restart with R or Fly again.

## Crystal state

`src/collection.js` stores collected crystal indices in a private Set. Its size
drives the counter and spaceship unlock state. Touching a crystal removes it
from the scene; revisiting its position cannot increment the count again.
Restart clears the Set and restores all five crystals. The landing ring is red
while locked and green once all five have been collected.

## Mission states and patrol

- `ready`: player, drone, and timer are idle; click Start to begin.
- `playing`: a 90-second deadline runs while movement, patrol, and collection are active.
- `won`: collect all five crystals and reach the spaceship before the deadline.
- `lost`: touch the drone or reach the deadline. Defeat takes precedence over escape in the same update.

`src/game-state.js` owns the state, remaining time, deadline, and defeat reason.
`src/drone.js` creates the shape-based drone and moves it clockwise around a
fixed rectangular route. Contact checks run in small simulation steps.
Both terminal states freeze gameplay. Restart (button or R) restores the player,
all crystals, the drone's starting position/route progress, and the 90-second
timer, then returns to ready. Click Start for the next attempt. The countdown
uses elapsed real time and continues while the browser tab is hidden; switching
tabs clears held input. Hidden-tab timeout is displayed when the tab resumes.

Additional playtests: verify the timer stays at 90 before Start, try touching
the drone, let the timer expire, confirm all gameplay freezes after either
result, and verify Restart fully restores the mission after winning or losing.

## Interface, effects, and audio

The Start screen explains the objective, controls, time limit, and drone risk.
The HUD shows crystals, countdown, ship status, and Restart; the last 15 seconds
use a warning color. Result screens distinguish victory, drone defeat, and timeout.
Layouts adapt to narrow screens, with scrollable mission cards on short screens.
Keyboard focus outlines and keyboard-activated buttons are supported.

`src/effects.js` creates a 0.45-second geometric pickup burst and cleans it up.
`src/audio.js` synthesizes start, pickup, victory, and defeat tones using Web Audio.
Audio initializes only after Start or mute-button interaction. Mute stops active
and scheduled tones, and remains selected across restarts. Unsupported audio does
not block gameplay. Crystal rotation and bobbing remain active during gameplay.

Check in a browser: Start with mouse, Enter, and Space; collect a crystal and
confirm one burst/chime; mute/unmute and restart; try both defeat causes and
victory; inspect at narrow portrait and short landscape sizes. Confirm text,
buttons, and scrollable instructions remain usable. Visual/audio checks require
a browser; build and logic checks alone do not verify rendering or audible output.

## Review validation

Headless Chromium with software WebGL ran the game and reported no console
errors or uncaught page errors. Checks covered keyboard movement, all four
walls, all four faces of every obstacle, navigable paths to every crystal,
actual touch collection and HUD updates, duplicate pickup prevention, drone
contact defeat, locked exits at 0/5 and 4/5, victory requiring 5/5 plus ship
proximity, terminal-state freezing, and 12 consecutive restart/start cycles.
Timer expiry was tested with an accelerated start timestamp, not a real
90-second wait. Start and mute visibility were checked at 1280x800, 375x667,
and 667x375. Screenshots of the ready screen and active game were inspected.

Rendering now skips stationary ready/result screens, avoids unchanged HUD
writes and animation of removed crystals, and uses 1024px shadows. Held R
no longer repeatedly resets the game. Production compilation passed.

These checks use scripted positions for deterministic collision and outcome
checks; they do not replace a complete human playthrough. Audio output was
not listened to, and other browsers/mobile GPU performance were not tested.
The game requires a keyboard. On very slow frames, simulation advances at
most 0.25 seconds while the timer continues in real time. Collision uses
simple conservative bounds rather than exact mesh intersections.
