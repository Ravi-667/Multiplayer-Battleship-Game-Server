import { GAME_STATE } from '../../shared/constants.js';

export class Game {
  constructor(id) {
    this.id = id;
    this.players = []; // Array of Player objects
    this.state = GAME_STATE.WAITING;
    this.currentTurn = 0; // Index of player whose turn it is
    this.winner = null;
  }

  addPlayer(player) {
    if (this.players.length < 2) {
      this.players.push(player);
      return true;
    }
    return false;
  }

  startSetup() {
      if (this.players.length === 2) {
          this.state = GAME_STATE.PLACING_SHIPS;
          return true;
      }
      return false;
  }

  playerReady(playerId) {
      const player = this.players.find(p => p.id === playerId);
      if (player) {
          player.ready = true;
      }
      
      if (this.players.every(p => p.ready)) {
          this.state = GAME_STATE.PLAYING;
          return true; // Game can start
      }
      return false;
  }

  switchTurn() {
    this.currentTurn = this.currentTurn === 0 ? 1 : 0;
  }

  getCurrentPlayer() {
      return this.players[this.currentTurn];
  }

  getOpponent(playerId) {
      return this.players.find(p => p.id !== playerId);
  }
}
