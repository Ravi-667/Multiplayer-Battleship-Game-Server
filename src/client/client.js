import io from 'socket.io-client';
import { EVENTS, SHIP_TYPES, CELL_STATE, BOARD_SIZE, GAME_STATE } from '../../shared/constants.js';
import { renderBoard, renderOpponentBoard } from './ui/renderer.js';
import { askForOrientation, askForCoordinates, askMainMenu } from './ui/input.js';

const socket = io('http://localhost:3000');

// Local State
let myBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(CELL_STATE.EMPTY));
let opponentBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(CELL_STATE.EMPTY));
let shipsToPlace = Object.values(SHIP_TYPES); 
let currentShipIndex = 0;
let isMyTurn = false;
let gameActive = false;

console.log('Connecting to server...');

socket.on(EVENTS.CONNECT, () => {
  console.log(`Connected (ID: ${socket.id})`);
  showMainMenu();
});

socket.on('status', (msg) => {
    console.log(`\n[SERVER]: ${msg}`);
});

socket.on(EVENTS.GAME_START, () => {
    console.log('\nGame Started! Prepare to deploy your fleet.');
    gameActive = true;
    startShipPlacement();
});

socket.on('ship_placed', ({ ship, x, y, orientation }) => {
   // Server confirmed placement
   // Update local board purely for visual feedback (though server holds truth)
   // We actually placed it speculatively or we can just update visually.
   // To keep it simple, we'll update our local grid when we "decide" to place, 
   // but strictly we should wait for success.
   
   // Actually, let's just re-render in the placement loop.
});

socket.on(EVENTS.PLAYER_READY, () => {
    console.log('All ships placed! Waiting for opponent...');
});

socket.on(EVENTS.GAME_UPDATE, ({ state, currentTurn }) => {
    if (state === GAME_STATE.PLAYING) {
        renderDualBoards();
        isMyTurn = (currentTurn === socket.id);
        
        if (isMyTurn) {
            console.log("\n>>> IT'S YOUR TURN! <<<");
            takeShot();
        } else {
            console.log("\nWaiting for opponent's move...");
        }
    }
});

socket.on(EVENTS.SHOT_RESULT, ({ shooter, x, y, result, sunkShip }) => {
    if (shooter === socket.id) {
        // My shot
        console.log(`\nYou fired at (${x}, ${y}) -> ${result}`);
        if (result === 'HIT' || result === 'SUNK') {
            opponentBoard[y][x] = CELL_STATE.HIT;
        } else if (result === 'MISS') {
            opponentBoard[y][x] = CELL_STATE.MISS;
        }
        
        if (sunkShip) {
            console.log(`\n*** YOU SUNK A ${sunkShip.toUpperCase()}! ***`);
        }
    } else {
        // Opponent shot at me
        console.log(`\nOpponent fired at (${x}, ${y}) -> ${result}`);
        if (result === 'HIT' || result === 'SUNK') {
            myBoard[y][x] = CELL_STATE.HIT;
        } else if (result === 'MISS') {
            myBoard[y][x] = CELL_STATE.MISS;
        }
        
        if (sunkShip) {
            console.log(`\n*** YOUR ${sunkShip.toUpperCase()} WAS SUNK! ***`);
        }
    }
});

socket.on(EVENTS.GAME_OVER, ({ winner }) => {
    gameActive = false;
    renderDualBoards();
    if (winner === socket.id) {
        console.log('\nVICTORY! You won the battle!');
    } else {
        console.log('\nDEFEAT! Your fleet was destroyed.');
    }
    console.log('\nExiting game...');
    process.exit(0);
});

socket.on(EVENTS.OPPONENT_LEFT, () => {
    console.log('\nOpponent disconnected. You win by default!');
    process.exit(0);
});

socket.on(EVENTS.ERROR, (msg) => {
    console.error(`\n[ERROR]: ${msg}`);
    // If error during placement, retry current ship? 
    // For simplicity, we might just print it.
    if (!gameActive) showMainMenu();
});

async function showMainMenu() {
    const action = await askMainMenu();
    if (action === 'JOIN') {
        socket.emit(EVENTS.JOIN_GAME);
    } else {
        process.exit(0);
    }
}

async function startShipPlacement() {
    console.log('\n--- Deployment Phase ---');
    // We iterate through ships locally
    // Important: Reset local boards for new game
    myBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(CELL_STATE.EMPTY));
    opponentBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(CELL_STATE.EMPTY));
    
    // Recursive placement to handle errors/retries
    placeNextShip(0);
}

async function placeNextShip(index) {
    if (index >= shipsToPlace.length) {
        console.log('Fleet deployed! Waiting for server confirmation...');
        return; 
    }

    const ship = shipsToPlace[index];
    console.log(`\nPlacing ${ship.name} (Size: ${ship.size})`);
    renderBoard(myBoard);

    const { x, y } = await askForCoordinates(`Enter coordinates for ${ship.name} (x y):`);
    const orientation = await askForOrientation();

    // Optimistically update local board for visual feedback logic
    // But better: send to server, wait for ack? 
    // For this simple CLI, we'll send, assume success, but if server errors, we might desync.
    // Better: Helper to validate locally first to avoid roundtrip errors.
    
    if (canPlaceLocally(ship, x, y, orientation)) {
        updateLocalBoard(ship, x, y, orientation);
        socket.emit(EVENTS.PLACE_SHIP, { type: ship.name, x, y, orientation });
        placeNextShip(index + 1);
    } else {
        console.log('Invalid placement (out of bounds or overlap). Try again.');
        placeNextShip(index);
    }
}

function canPlaceLocally(ship, x, y, orientation) {
    // Simple local check matching server logic
    if (orientation === 'H') {
        if (x + ship.size > BOARD_SIZE) return false;
        for (let i = 0; i < ship.size; i++) if (myBoard[y][x+i] !== CELL_STATE.EMPTY) return false;
    } else {
        if (y + ship.size > BOARD_SIZE) return false;
        for (let i = 0; i < ship.size; i++) if (myBoard[y+i][x] !== CELL_STATE.EMPTY) return false;
    }
    return true;
}

function updateLocalBoard(ship, x, y, orientation) {
    for (let i = 0; i < ship.size; i++) {
        if (orientation === 'H') myBoard[y][x+i] = CELL_STATE.SHIP;
        else myBoard[y+i][x] = CELL_STATE.SHIP;
    }
}

async function takeShot() {
    const { x, y } = await askForCoordinates('Enter coordinates to fire (x y):');
    socket.emit(EVENTS.FIRE_SHOT, { x, y });
}

function renderDualBoards() {
    console.clear();
    renderBoard(myBoard, 'YOUR FLEET');
    renderOpponentBoard(opponentBoard, 'ENEMY WATERS');
}
