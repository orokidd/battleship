import { Ship } from "./ship.js";
import { randomInt, placeRandomShips } from "./helpers.js";

export class Board {
  constructor(size = 10) {
    this.size = size;
    this.grid = [];
    this.ships = [];
    this.initGrid();
  }

  initGrid() {
    for (let row = 0; row < this.size; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.size; col++) {
        this.grid[row][col] = { ship: null, shot: false };
      }
    }
  }

  inBounds(row, col) {
    return row >= 0 && col >= 0 && row < this.size && col < this.size;
  }

  canPlaceShip(length, row, col, horizontal) {
    for (let i = 0; i < length; i++) {
      const r = row + (horizontal ? 0 : i);
      const c = col + (horizontal ? i : 0);
      if (!this.inBounds(r, c)) return false;
      if (this.grid[r][c].ship) return false;
    }
    return true;
  }

  placeShip(ship, row, col, horizontal) {
    // const position = [];
    for (let i = 0; i < ship.length; i++) {
      const r = row + (horizontal ? 0 : i);
      const c = col + (horizontal ? i : 0);
      this.grid[r][c].ship = ship;
    //   position.push({ r, c });
    }
    // ship.place(position);
    this.ships.push(ship);
  }

  receiveShot(row, col) {
    const cell = this.grid[row][col];
    
    if (cell.shot) return { already: true };

    cell.shot = true;
    
    if (cell.ship) {
      cell.ship.hit();
      const sunk = cell.ship.isSunk();

      return { hit: true, ship: cell.ship, sunk };
    } else {
      return { hit: false };
    }
  }

  allShipsSunk() {
    for (const ship of this.ships) {
      if (!ship.isSunk()) {
        return false;
      }
    }
    return true;
  }
}