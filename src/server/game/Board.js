import { BOARD_SIZE, CELL_STATE, ORIENTATION } from '../../shared/constants.js';

export class Board {
  constructor() {
    this.size = BOARD_SIZE;
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(CELL_STATE.EMPTY));
    this.ships = [];
  }

  placeShip(ship, x, y, orientation) {
    if (!this.isValidPlacement(ship, x, y, orientation)) {
      return false;
    }

    for (let i = 0; i < ship.size; i++) {
      let r = y;
      let c = x;

      if (orientation === ORIENTATION.HORIZONTAL) {
        c += i;
      } else {
        r += i;
      }

      this.grid[r][c] = CELL_STATE.SHIP;
    }

    this.ships.push({ ship, x, y, orientation });
    return true;
  }

  isValidPlacement(ship, x, y, orientation) {
    // Check bounds
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return false;
    
    let endX = x;
    let endY = y;

    if (orientation === ORIENTATION.HORIZONTAL) {
      endX = x + ship.size - 1;
    } else {
      endY = y + ship.size - 1;
    }

    if (endX >= this.size || endY >= this.size) return false;

    // Check overlap
    for (let i = 0; i < ship.size; i++) {
        let r = y;
        let c = x;
  
        if (orientation === ORIENTATION.HORIZONTAL) {
          c += i;
        } else {
          r += i;
        }

        if (this.grid[r][c] !== CELL_STATE.EMPTY) return false;
    }

    return true;
  }

  receiveAttack(x, y) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
        return { result: 'INVALID' };
    }

    const cell = this.grid[y][x];

    if (cell === CELL_STATE.HIT || cell === CELL_STATE.MISS) {
      return { result: 'ALREADY_HIT' };
    }

    if (cell === CELL_STATE.EMPTY) {
      this.grid[y][x] = CELL_STATE.MISS;
      return { result: 'MISS' };
    }

    if (cell === CELL_STATE.SHIP) {
      this.grid[y][x] = CELL_STATE.HIT;
      
      // Find which ship was hit
      const hitShipObj = this.findShipAt(x, y);
      if (hitShipObj) {
          hitShipObj.ship.hit();
          if (hitShipObj.ship.isSunk()) {
              return { result: 'SUNK', ship: hitShipObj.ship };
          }
      }

      return { result: 'HIT' };
    }
  }

  findShipAt(x, y) {
      // Simplistic reverse lookup
      // In a more optimal way we might store references in the grid, but this is fine for 10x10
      for (const shipObj of this.ships) {
          const { ship, x: sx, y: sy, orientation } = shipObj;
          for (let i = 0; i < ship.size; i++) {
              let cy = sy;
              let cx = sx;
              if (orientation === ORIENTATION.HORIZONTAL) cx += i;
              else cy += i;
              
              if (cx === x && cy === y) return shipObj;
          }
      }
      return null;
  }

  allShipsSunk() {
      return this.ships.length > 0 && this.ships.every(s => s.ship.isSunk());
  }

  getBoardState() {
      return this.grid;
  }
}
