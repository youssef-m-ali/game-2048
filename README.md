# 2048

A browser-based implementation of the classic 2048 sliding puzzle game. Built with pure vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

## 🎮 Play

Just open `index.html` in any modern browser. No build step or server required.

## 📁 Project Structure

```
game_2048/
├── index.html   # Game markup and layout
├── style.css    # Styling, animations, and theme
└── game.js      # All game logic
```

## ✨ Features

- **Classic beige/orange theme** — faithful to the original 2048 aesthetic
- **Undo** — revert your last move at any time
- **Tile animations** — smooth pop and merge animations on every move
- **Keyboard support** — use the arrow keys to play on desktop
- **Touch/swipe support** — swipe in any direction to play on mobile or tablet
- **Best score** — your highest score is saved locally and persists between sessions

## 🕹️ How to Play

- Use **arrow keys** (desktop) or **swipe** (mobile) to slide all tiles in a direction
- When two tiles with the **same number** collide, they **merge** into one
- Each merge adds to your score
- A new tile (`2` or `4`) appears after every move
- Reach the **2048 tile** to win — or keep going for a higher score!
- The game ends when there are **no valid moves** remaining

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Markup     | HTML5                               |
| Styling    | CSS3 (Grid, custom properties, keyframe animations) |
| Logic      | Vanilla JavaScript (ES6)            |
| Fonts      | Google Fonts (Abril Fatface, Clear Sans) |
| Persistence| localStorage (best score only)      |

## 📄 License

MIT — free to use, modify, and distribute.