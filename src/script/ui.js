import { SHIP_SPECS, placeRandomShips, randomInt } from "./helpers.js";
import { Board } from "./gameboard.js";
import { Ship } from "./ship.js";

const playerBoardElement = document.getElementById("playerBoard");
const enemyBoardElement = document.getElementById("enemyBoard");
const messageElement = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

let playerBoard;
let enemyBoard;
let gameOver = false;
let isPlayerTurn = true;

export function init() {
  playerBoard = new Board(10);
  enemyBoard = new Board(10);
  gameOver = false;
  isPlayerTurn = true;
  messageElement.textContent = "Your turn — click an enemy cell to fire.";

  placeRandomShips(playerBoard);
  placeRandomShips(enemyBoard);

  createBlankGrid(playerBoardElement, playerBoard, false);
  createBlankGrid(enemyBoardElement, enemyBoard, true);

  updateBoards(false);
  updateBoards(true);
}

function createBlankGrid(container, boardRef, isEnemy = false) {
  container.innerHTML = "";

  for (let r = 0; r < boardRef.size; r++) {
    for (let c = 0; c < boardRef.size; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (isEnemy) {
        cell.addEventListener("click", (e) => {
          enemyBoardClickHandler(e);
        });
      }

      container.appendChild(cell);
    }
  }
}

function enemyBoardClickHandler(e) {
  if (gameOver) return;
  if (!isPlayerTurn) return;
  const cell = e.currentTarget;
  const row = cell.dataset.row;
  const col = cell.dataset.col;
  handlePlayerShot(row, col);
}

function updateBoards(enemy) {
  let cells;

  if (!enemy) {
    cells = playerBoardElement.children;
  } else {
    cells = enemyBoardElement.children;
  }

  for (let i = 0; i < cells.length; i++) {
    const element = cells[i];
    const r = element.dataset.row;
    const c = element.dataset.col;
    let cell;

    if (!enemy) {
      cell = playerBoard.grid[r][c];
    } else {
      cell = enemyBoard.grid[r][c];
    }

    element.className = "cell";
    if (cell.ship && !enemy) element.classList.add("ship");
    if (cell.shot && cell.ship) element.classList.add("hit");
    if (cell.shot && !cell.ship) element.classList.add("miss");
    if (cell.shot) element.classList.add("disabled");
    element.textContent = "";
  }
}

function handlePlayerShot(row, col) {
  const result = enemyBoard.receiveShot(row, col);

  if (result.already) {
    messageElement.textContent = "You already fired there!";
    return;
  }

  if (result.hit) {
    messageElement.textContent = `Hit! ${ result.sunk ? result.ship.name + " sunk!" : "" }`;
  } else {
    messageElement.textContent = "Miss.";
  }

  updateBoards(false);
  updateBoards(true);

  if (enemyBoard.allShipsSunk()) {
    gameOver = true;
    messageElement.textContent = "You win! All enemy ships sunk 🎉";
    return;
  }

  isPlayerTurn = false;
  setTimeout(enemyTurn, 600);
}

function enemyTurn() {
  let row, col;

  // Keep selecting random cells until we find one that hasn't been shot yet (false)
  let shot = true;
  while (shot) {
    row = randomInt(enemyBoard.size);
    col = randomInt(enemyBoard.size);
    shot = playerBoard.grid[row][col].shot;
  }

  const result = playerBoard.receiveShot(row, col);

  if (result.hit) {
    messageElement.textContent = `Enemy hit your ${result.ship.name}! ${result.sunk ? "It sank." : "" }`;
  } else {
    messageElement.textContent = "Enemy missed.";
  }

  updateBoards(false);
  updateBoards(true);

  if (playerBoard.allShipsSunk()) {
    gameOver = true;
    messageElement.textContent = "You lost — all your ships are sunk 😞";
    return;
  }

  // back to player
  isPlayerTurn = true;
  if (!gameOver) {
    messageElement.textContent += " Your turn.";
  }
}

restartBtn.addEventListener("click", () => {
  init();
});