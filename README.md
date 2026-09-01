# Poki Fullscreen for Every Game

A small Tampermonkey userscript that adds fullscreen mode to every game on [Poki](https://poki.com/), including games where Poki hides its own fullscreen button.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) or Violentmonkey.
2. Open [`poki-fullscreen.user.js`](./poki-fullscreen.user.js) on GitHub.
3. Click **Raw** and confirm the installation in your userscript manager.
4. Open any Poki game and click the **⛶** button in the top-right corner of the game.

Press `Esc` or click **×** to leave fullscreen mode.

## How it works

- Finds Poki's `#game-player` dynamically.
- Ensures the game iframe has fullscreen permission.
- Adds its own fullscreen button inside the game player.
- Keeps working when Poki loads or replaces the game dynamically.
- Forces the game and its iframe to fill the entire screen.

## Tested pages

- Car Circle, where Poki currently hides its fullscreen button
- Stickman Hook, where Poki already provides fullscreen

## License

[MIT](./LICENSE)
