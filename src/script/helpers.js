import { Ship } from "./ship.js";

export const SHIP_SPECS = [
  { name: "Carrier", length: 5 },
  { name: "Battleship", length: 4 },
  { name: "Cruiser", length: 3 },
  { name: "Submarine", length: 3 },
  { name: "Destroyer", length: 2 },
];

export function randomInt(max) {
  return Math.floor(Math.random() * max);
}

export function placeRandomShips(board) {
  for (const spec of SHIP_SPECS) {
    let placed = false;

    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const row = randomInt(board.size);
      const col = randomInt(board.size);
      
      if (board.canPlaceShip(spec.length, row, col, horizontal)) {
        const ship = new Ship(spec.length, spec.name);
        board.placeShip(ship, row, col, horizontal);
        placed = true;
      }
    }
  }
}