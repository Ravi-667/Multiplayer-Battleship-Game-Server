import { Board } from './Board.js';
import { Ship } from './Ship.js';
import { SHIP_TYPES } from '../../shared/constants.js';

export class Player {
  constructor(id, socket) {
    this.id = id;
    this.socket = socket;
    this.board = new Board();
    this.ships = this._createFleet();
    this.ready = false;
  }

  _createFleet() {
    const ships = [];
    for (const key in SHIP_TYPES) {
        const type = SHIP_TYPES[key];
        ships.push(new Ship(type.name, type.size));
    }
    return ships;
  }

  reset() {
      this.board = new Board();
      this.ships = this._createFleet();
      this.ready = false;
  }
}
