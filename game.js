// ─── Tile color map ───────────────────────────────────────────────────────────
const TILE_COLORS = {
  2:    { bg: '#eee4da', color: '#776e65', size: '2.4em' },
  4:    { bg: '#ede0c8', color: '#776e65', size: '2.4em' },
  8:    { bg: '#f2b179', color: '#f9f6f2', size: '2.4em' },
  16:   { bg: '#f59563', color: '#f9f6f2', size: '2.2em' },
  32:   { bg: '#f67c5f', color: '#f9f6f2', size: '2.2em' },
  64:   { bg: '#f65e3b', color: '#f9f6f2', size: '2.2em' },
  128:  { bg: '#edcf72', color: '#f9f6f2', size: '1.9em' },
  256:  { bg: '#edcc61', color: '#f9f6f2', size: '1.9em' },
  512:  { bg: '#edc850', color: '#f9f6f2', size: '1.9em' },
  1024: { bg: '#edc53f', color: '#f9f6f2', size: '1.6em' },
  2048: { bg: '#edc22e', color: '#f9f6f2', size: '1.6em' },
};

function getTileStyle(value) {
  return TILE_COLORS[value] || { bg: '#3c3a32', color: '#f9f6f2', size: '1.4em' };
}

// ─── Game state ───────────────────────────────────────────────────────────────
let board, score, bestScore, prevBoard, prevScore, won, over;

// ─── Initialise ───────────────────────────────────────────────────────────────
function init() {
  bestScore = parseInt(localStorage.getItem('2048best') || '0');
  document.getElementById('best').textContent = bestScore;
  buildGridCells();
  newGame();
}

function buildGridCells() {
  const grid = document.getElementById('gridBg');
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    grid.appendChild(cell);
  }
}

// ─── New game / keep going ────────────────────────────────────────────────────
function newGame() {
  board     = Array.from({ length: 4 }, () => Array(4).fill(0));
  score     = 0;
  won       = false;
  over      = false;
  prevBoard = null;
  prevScore = null;
  addTile();
  addTile();
  hideOverlays();
  render();
  updateUI();
}

function keepGoing() {
  won = true; // prevent win overlay from re-triggering
  document.getElementById('winOverlay').classList.remove('show');
}

// ─── Spawn a tile ─────────────────────────────────────────────────────────────
function addTile() {
  const empty = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (!board[r][c]) empty.push([r, c]);

  if (!empty.length) return null;

  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return [r, c];
}

// ─── Move & merge logic ───────────────────────────────────────────────────────
function slideRow(row) {
  const arr = row.filter(x => x);
  const merged = [];
  let gained = 0;

  for (let i = 0; i < arr.length; i++) {
    if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
      const v = arr[i] * 2;
      merged.push(v);
      gained += v;
      i++;
    } else {
      merged.push(arr[i]);
    }
  }

  while (merged.length < 4) merged.push(0);
  return { row: merged, gained };
}

// Rotate 90° clockwise
function rotateBoard(b) {
  return b[0].map((_, c) => b.map(row => row[c]).reverse());
}

function move(dir) {
  if (over) return;

  // Save undo snapshot
  prevBoard = board.map(r => [...r]);
  prevScore = score;

  // Map direction to number of CW rotations before sliding left
  const rotations = { left: 0, up: 1, right: 2, down: 3 }[dir];

  let b = board.map(r => [...r]);
  for (let i = 0; i < rotations; i++) b = rotateBoard(b);

  let changed = false;
  let totalGained = 0;

  let newB = b.map(row => {
    const res = slideRow(row);
    if (res.row.join() !== row.join()) changed = true;
    totalGained += res.gained;
    return res.row;
  });

  // Rotate back
  for (let i = 0; i < rotations; i++) newB = rotateBoard(rotateBoard(rotateBoard(newB)));

  if (!changed) {
    prevBoard = null;
    prevScore = null;
    return;
  }

  board  = newB;
  score += totalGained;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('2048best', bestScore);
  }

  const newCell = addTile();
  render(newCell);
  updateUI();
  checkWin();
  checkOver();
}

// ─── Win / lose checks ────────────────────────────────────────────────────────
function checkWin() {
  if (won) return;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (board[r][c] === 2048) {
        won = true;
        document.getElementById('winOverlay').classList.add('show');
        return;
      }
}

function checkOver() {
  // If win overlay is visible, don't also show game over
  if (document.getElementById('winOverlay').classList.contains('show')) return;

  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (!board[r][c]) return;
      if (r < 3 && board[r][c] === board[r + 1][c]) return;
      if (c < 3 && board[r][c] === board[r][c + 1]) return;
    }

  over = true;
  setTimeout(() => document.getElementById('gameOverOverlay').classList.add('show'), 400);
}

// ─── Undo ─────────────────────────────────────────────────────────────────────
function undo() {
  if (!prevBoard) return;
  board     = prevBoard.map(r => [...r]);
  score     = prevScore;
  prevBoard = null;
  prevScore = null;
  over      = false;
  hideOverlays();
  render();
  updateUI();
}

function hideOverlays() {
  document.getElementById('gameOverOverlay').classList.remove('show');
  document.getElementById('winOverlay').classList.remove('show');
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render(newCell) {
  const layer   = document.getElementById('tileLayer');
  const grid    = document.getElementById('gridBg');
  const gridRect = grid.getBoundingClientRect();

  const padding  = 12;
  const gap      = 12;
  const cellSize = (gridRect.width - padding * 2 - gap * 3) / 4;

  layer.innerHTML = '';

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = board[r][c];
      if (!v) continue;

      const x = padding + c * (cellSize + gap);
      const y = padding + r * (cellSize + gap);
      const s = getTileStyle(v);

      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.style.cssText = `
        width:${cellSize}px; height:${cellSize}px;
        left:${x}px; top:${y}px;
        background:${s.bg}; color:${s.color};
        font-size:${s.size}; font-weight:700;
        border-radius:4px;
      `;
      tile.textContent = v;

      if (newCell && r === newCell[0] && c === newCell[1]) {
        tile.classList.add('new-tile');
      }

      layer.appendChild(tile);
    }
  }
}

function updateUI() {
  const scoreEl = document.getElementById('score');
  const bestEl  = document.getElementById('best');

  scoreEl.textContent = score;
  bestEl.textContent  = bestScore;

  // Score bump animation
  scoreEl.classList.remove('bump');
  void scoreEl.offsetWidth; // reflow
  scoreEl.classList.add('bump');

  document.getElementById('undoBtn').disabled = !prevBoard;
}

// ─── Keyboard input ───────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const map = {
    ArrowLeft:  'left',
    ArrowRight: 'right',
    ArrowUp:    'up',
    ArrowDown:  'down',
  };
  if (map[e.key]) {
    e.preventDefault();
    move(map[e.key]);
  }
});

// ─── Touch / swipe input ──────────────────────────────────────────────────────
let touchStartX, touchStartY;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (Math.max(absDx, absDy) < 20) return; // too small — ignore

  if (absDx > absDy) move(dx > 0 ? 'right' : 'left');
  else               move(dy > 0 ? 'down'  : 'up');
}, { passive: true });

// ─── Button bindings ──────────────────────────────────────────────────────────
document.getElementById('newBtn').addEventListener('click', newGame);
document.getElementById('undoBtn').addEventListener('click', undo);

// Re-render on window resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(render, 100);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
window.addEventListener('load', init);
