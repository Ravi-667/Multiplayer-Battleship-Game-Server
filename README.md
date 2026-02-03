# Multiplayer Battleship Game Server

A real-time, low-latency Multiplayer Battleship game server built with **Node.js**, **Socket.io**, and a **Terminal (CLI) Client**.

## Features
- **Real-time Multiplayer**: Play against another human over a socket connection.
- **Matchmaking**: automatically pairs players into game rooms.
- **Server-Authoritative Logic**: The server manages the board state, validates moves, and prevents cheating.
- **Terminal Client**: A retro-style CLI interface with ASCII art board rendering.
- **Concurrency**: Supports multiple game sessions running simultaneously.

## Prerequisites
- Node.js (v14 or higher)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Ravi-667/Multiplayer-Battleship-Game-Server.git
   cd Multiplayer-Battleship-Game-Server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## How to Play

### 1. Start the Server
Open a terminal and run:
```bash
npm run start:server
```
The server will start on `http://localhost:3000`.

### 2. Start Clients (Players)
You need two separate terminal windows to simulate two players.

**Player 1:**
```bash
npm run start:client
```
- Select **Join Game** from the menu.
- You will wait in the queue until Player 2 joins.

**Player 2:**
Open a new terminal window:
```bash
npm run start:client
```
- Select **Join Game**.
- The game will start immediately!

### 3. Gameplay Loop
1.  **Deployment**: Each player places their fleet (Carrier, Battleship, Cruiser, Submarine, Destroyer).
    - Enter coordinates as `x y` (e.g., `0 0`).
    - Choose orientation (Horizontal/Vertical).
2.  **Battle**: Players take turns firing shots.
    - Enter coordinates `x y` to fire.
    - `X` = HIT, `O` = MISS.
3.  **Victory**: The first player to sink all opponent ships wins!

## Project Structure
- `src/server/`: Game server logic (Matchmaking, Board state, Game loop).
- `src/client/`: Terminal user interface and input handling.
- `src/shared/`: Shared constants and event names.

## Technology Stack
- **Runtime**: Node.js
- **Networking**: Socket.io (WebSockets with fallback)
- **Input**: Inquirer.js
- **Logic**: Custom server-side validation