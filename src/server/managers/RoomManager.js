import { v4 as uuidv4 } from 'uuid';
import { Game } from '../game/Game.js';
import { Player } from '../game/Player.js';
import { EVENTS, GAME_STATE } from '../../shared/constants.js';

/**
 * Manages game rooms and player matchmaking.
 * Handles incoming socket events and routes them to the appropriate Game instance.
 */
export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // gameId -> Game (Active games)
    this.players = new Map(); // socketId -> Player (Connected players)
    this.waitingQueue = []; // Players waiting for a match
  }

  handleConnection(socket) {
    console.log(`New connection: ${socket.id}`);
    const player = new Player(socket.id, socket);
    this.players.set(socket.id, player);

    socket.on(EVENTS.JOIN_GAME, () => this.handleJoinGame(player));
    socket.on(EVENTS.PLACE_SHIP, (data) => this.handlePlaceShip(player, data));
    socket.on(EVENTS.FIRE_SHOT, (data) => this.handleFireShot(player, data));
    socket.on(EVENTS.DISCONNECT, () => this.handleDisconnect(player));
  }

  handleJoinGame(player) {
    if (this.waitingQueue.includes(player)) return;

    // Check if player is already in a game
    if (this.findGameByPlayer(player.id)) return;

    this.waitingQueue.push(player);
    player.socket.emit('status', 'Joined matchmaking queue...');

    if (this.waitingQueue.length >= 2) {
      this.createMatch();
    }
  }

  createMatch() {
    const player1 = this.waitingQueue.shift();
    const player2 = this.waitingQueue.shift();

    const gameId = uuidv4();
    const game = new Game(gameId);
    
    game.addPlayer(player1);
    game.addPlayer(player2);

    this.rooms.set(gameId, game);

    // Notify players
    player1.socket.join(gameId);
    player2.socket.join(gameId);

    game.startSetup();

    this.io.to(gameId).emit(EVENTS.GAME_START, { gameId, players: [player1.id, player2.id] });
    console.log(`Game created: ${gameId}`);
  }

  handlePlaceShip(player, { type, x, y, orientation }) {
    const game = this.findGameByPlayer(player.id);
    if (!game || game.state !== GAME_STATE.PLACING_SHIPS) return;

    const shipToPlace = player.ships.find(s => s.type === type);
    if (!shipToPlace) {
        player.socket.emit(EVENTS.ERROR, 'Invalid ship type');
        return;
    }

    // Check if ship already placed (simple check: if it's in board.ships)
    // Actually, board logic tracks placed ships.
    // We need to ensure we don't place the same ship instance twice or get confused.
    // For this simple version, we'll assume the client sends valid requests, 
    // but the Board.js validation handles overlap.
    
    // We need to differentiate ships clearly. 
    // The current Board.placeShip implementation takes a Ship object.
    
    const success = player.board.placeShip(shipToPlace, x, y, orientation);
    
    if (success) {
        player.socket.emit('ship_placed', { type, x, y, orientation });
        
        // Check if all ships placed
        if (player.board.ships.length === player.ships.length) {
             const allReady = game.playerReady(player.id);
             player.socket.emit(EVENTS.PLAYER_READY, { ready: true });
             
             if (allReady) {
                 this.io.to(game.id).emit(EVENTS.GAME_UPDATE, { 
                     state: GAME_STATE.PLAYING,
                     currentTurn: game.getCurrentPlayer().id
                 });
             }
        }
    } else {
        player.socket.emit(EVENTS.ERROR, 'Invalid placement');
    }
  }

  handleFireShot(player, { x, y }) {
      const game = this.findGameByPlayer(player.id);
      if (!game || game.state !== GAME_STATE.PLAYING) return;

      if (game.getCurrentPlayer().id !== player.id) {
          player.socket.emit(EVENTS.ERROR, 'Not your turn');
          return;
      }

      const opponent = game.getOpponent(player.id);
      const result = opponent.board.receiveAttack(x, y);

      if (result.result === 'INVALID' || result.result === 'ALREADY_HIT') {
          player.socket.emit(EVENTS.ERROR, 'Invalid shot');
          return;
      }

      // Notify both players of the shot result
      this.io.to(game.id).emit(EVENTS.SHOT_RESULT, {
          shooter: player.id,
          x, y,
          result: result.result,
          sunkShip: result.ship ? result.ship.type : null
      });

      if (result.result === 'SUNK') {
          if (opponent.board.allShipsSunk()) {
              game.state = GAME_STATE.FINISHED;
              game.winner = player.id;
              this.io.to(game.id).emit(EVENTS.GAME_OVER, { winner: player.id });
              this.cleanupGame(game.id);
              return;
          }
      }

      game.switchTurn();
      this.io.to(game.id).emit(EVENTS.GAME_UPDATE, { 
          state: GAME_STATE.PLAYING,
          currentTurn: game.getCurrentPlayer().id
      });
  }

  handleDisconnect(player) {
      this.players.delete(player.id);
      
      // Remove from queue
      const queueIndex = this.waitingQueue.indexOf(player);
      if (queueIndex !== -1) {
          this.waitingQueue.splice(queueIndex, 1);
      }

      // End active game
      const game = this.findGameByPlayer(player.id);
      if (game) {
          this.io.to(game.id).emit(EVENTS.OPPONENT_LEFT);
          this.cleanupGame(game.id);
      }
  }

  findGameByPlayer(playerId) {
      for (const game of this.rooms.values()) {
          if (game.players.some(p => p.id === playerId)) {
              return game;
          }
      }
      return null;
  }

  cleanupGame(gameId) {
      this.rooms.delete(gameId);
  }
}
