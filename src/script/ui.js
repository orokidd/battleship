import { SHIP_SPECS, placeRandomShips, randomInt, placeSelectedShip } from "./helpers.js";
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

let placingShips = true;
let currentShipIndex = 0;
let shipOrientation = true; // true = horizontal, false = vertical

export function init() {
  playerBoard = new Board(10);
  enemyBoard = new Board(10);
  gameOver = false;
  isPlayerTurn = true;
  placingShips = true;
  currentShipIndex = 0;
  messageElement.textContent = "Place your Carrier (5 cells). Click to place, R to rotate.";


  // placeRandomShips(playerBoard);
  // placeSelectedShip(playerBoard, new Ship(5, "Carrier"), 3, 4, true);
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
      } else if (placingShips) {
        cell.addEventListener("click", (e) => {
          handlePlacementClick(e);
        });
        cell.addEventListener("mouseenter", (e) => {
          showShipPreview(Number(e.currentTarget.dataset.row), Number(e.currentTarget.dataset.col));
        });
        cell.addEventListener("mouseleave", (e) => {
          clearShipPreview();
        });
      }

      container.appendChild(cell);
    }
  }
}

function showShipPreview(startRow, startCol) {
  // Clear any existing preview
  clearShipPreview();
  
  // Check if we have more ships to place
  if (currentShipIndex >= SHIP_SPECS.length) {
    return;
  }
  
  const currentShip = SHIP_SPECS[currentShipIndex];
  const shipLength = currentShip.length;
  const isHorizontal = shipOrientation;
  
  // Calculate all positions this ship would occupy
  const shipPositions = calculateShipPositions(startRow, startCol, shipLength, isHorizontal);
  
  // Check if the ship placement is valid
  const isValidPlacement = validateShipPlacement(shipPositions);
  
  // Show preview for all valid positions
  showPreviewCells(shipPositions, isValidPlacement);
}

function calculateShipPositions(startRow, startCol, length, isHorizontal) {
  const positions = [];
  
  for (let i = 0; i < length; i++) {
    const row = startRow + (isHorizontal ? 0 : i);
    const col = startCol + (isHorizontal ? i : 0);
    positions.push({ row, col });
  }
  
  return positions;
}

function validateShipPlacement(positions) {
  return positions.every(pos => {
    // Check if position is within board bounds
    if (pos.row < 0 || pos.col < 0 || pos.row >= playerBoard.size || pos.col >= playerBoard.size) {
      return false;
    }
    
    // Check if position is already occupied by another ship
    if (playerBoard.grid[pos.row][pos.col].ship) {
      return false;
    }
    
    return true;
  });
}

function showPreviewCells(positions, isValid) {
  positions.forEach(pos => {
    // Skip positions that are outside the board
    if (pos.row < 0 || pos.col < 0 || pos.row >= playerBoard.size || pos.col >= playerBoard.size) {
      return;
    }
    
    // Calculate the DOM element index for this position
    const cellIndex = pos.row * playerBoard.size + pos.col;
    const cellElement = playerBoardElement.children[cellIndex];
    
    if (cellElement) {
      cellElement.classList.add("preview");
      
      if (!isValid) {
        cellElement.classList.add("invalid");
      }
    }
  });
}

function clearShipPreview() {
  for (const cell of playerBoardElement.children) {
    cell.classList.remove("preview", "invalid");
  }
}

function handlePlacementClick(e) {
  if (!placingShips) return;
  const row = Number(e.currentTarget.dataset.row);
  const col = Number(e.currentTarget.dataset.col);
  const spec = SHIP_SPECS[currentShipIndex];

  if (playerBoard.canPlaceShip(spec.length, row, col, shipOrientation)) {
    playerBoard.placeShip(new Ship(spec.length, spec.name), row, col, shipOrientation);
    currentShipIndex++;
    updateBoards(false);

    if (currentShipIndex < SHIP_SPECS.length) {
      const nextShip = SHIP_SPECS[currentShipIndex];
      messageElement.textContent = `Place your ${nextShip.name} (${nextShip.length} cells). Click to place, R to rotate.`;
    } else {
      placingShips = false;
      messageElement.textContent = "All ships placed! Your turn — click an enemy cell to fire.";
      // Now allow enemy board clicks
      updateBoards(true);
    }
  } else {
    messageElement.textContent = "Can't place ship there!";
  }
}

function enemyBoardClickHandler(e) {
  if (gameOver) return;
  if (!isPlayerTurn) return;
  if (placingShips) return;
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

document.addEventListener("keydown", (e) => {
  if (placingShips && (e.key === "r" || e.key === "R")) {
    shipOrientation = !shipOrientation;
    if (currentShipIndex < SHIP_SPECS.length) { // <-- fix
      messageElement.textContent = `Orientation: ${shipOrientation ? "Horizontal" : "Vertical"}. Place your ${SHIP_SPECS[currentShipIndex].name} (${SHIP_SPECS[currentShipIndex].length} cells).`;
    }
  }
});

restartBtn.addEventListener("click", () => {
  init();
});