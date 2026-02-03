export const EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_GAME: 'join_game',
  GAME_START: 'game_start',
  PLACE_SHIP: 'place_ship',
  PLAYER_READY: 'player_ready',
  FIRE_SHOT: 'fire_shot',
  SHOT_RESULT: 'shot_result',
  GAME_OVER: 'game_over',
  OPPONENT_LEFT: 'opponent_left',
  ERROR: 'error'
};

export const BOARD_SIZE = 10;

export const SHIP_TYPES = {
  CARRIER: { name: 'Carrier', size: 5 },
  BATTLESHIP: { name: 'Battleship', size: 4 },
  CRUISER: { name: 'Cruiser', size: 3 },
  SUBMARINE: { name: 'Submarine', size: 3 },
  DESTROYER: { name: 'Destroyer', size: 2 },
};

export const CELL_STATE = {
  EMPTY: 0,
  SHIP: 1,
  HIT: 2,
  MISS: 3,
};

export const ORIENTATION = {
  HORIZONTAL: 'H',
  VERTICAL: 'V',
};

export const GAME_STATE = {
  WAITING: 'WAITING',
  PLACING_SHIPS: 'PLACING_SHIPS',
  PLAYING: 'PLAYING',
  FINISHED: 'FINISHED',
};
