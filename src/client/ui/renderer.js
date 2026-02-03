import { BOARD_SIZE, CELL_STATE } from '../../shared/constants.js';

export const renderBoard = (grid, title = 'Your Board') => {
  console.log(`\n--- ${title} ---`);
  console.log('  ' + Array.from({ length: BOARD_SIZE }, (_, i) => i).join(' ')); // Column headers

  for (let r = 0; r < BOARD_SIZE; r++) {
    const rowStr = grid[r].map(cell => {
      switch (cell) {
        case CELL_STATE.EMPTY: return '.';
        case CELL_STATE.SHIP: return 'S'; // 'S' for your ships
        case CELL_STATE.HIT: return 'X';  // 'X' for hit
        case CELL_STATE.MISS: return 'O'; // 'O' for miss
        default: return '?';
      }
    }).join(' ');
    console.log(`${r} ${rowStr}`);
  }
};

export const renderOpponentBoard = (grid, title = 'Opponent Board') => {
    // For opponent, we usually hide ships (Fog of War), but here we just render what we know.
    // Client logic should ideally pass a "view" of the board where unknown ships are EMPTY.
    // But since server sends "MISS" or "HIT", we can just render those.
    // "SHIP" states on opponent board shouldn't be visible unless sunk, but let's assume
    // the server doesn't send SHIP positions for the opponent grid (it sends hits/misses).
    
    console.log(`\n--- ${title} ---`);
    console.log('  ' + Array.from({ length: BOARD_SIZE }, (_, i) => i).join(' ')); 

    for (let r = 0; r < BOARD_SIZE; r++) {
        const rowStr = grid[r].map(cell => {
          switch (cell) {
            case CELL_STATE.HIT: return 'X';
            case CELL_STATE.MISS: return 'O';
            case CELL_STATE.SHIP: return '.'; // HIDE ships
            default: return '.';
          }
        }).join(' ');
        console.log(`${r} ${rowStr}`);
      }
};
