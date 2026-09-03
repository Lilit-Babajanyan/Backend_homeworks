import net from "node:net";

const server = net.createServer();

const players = [];

let board = ["_", "_", "_", "_", "_", "_", "_", "_", "_"];

let currentTurn = "X";

let gameStarted = false;

let gameOver = false;

server.on("connection", (socket) => {
  if (players.length >= 2) {
    socket.write("server is full\n");
    socket.end();
    return;
  }

  players.push(socket);

  if (players.length === 2) {
    console.log("Game starting");

    gameStarted = true;

    players[0].symbol = "X";
    players[1].symbol = "O";

    players[0].write("SYMBOL|X\n");
    players[1].write("SYMBOL|O\n");

    sendBoard();

    players[0].write("TURN|X\n");
    players[1].write("TURN|X\n");
  }

  let buffer = "";

  socket.on("data", (data) => {
    buffer += data.toString();

    while (buffer.includes("\n")) {
      const index = buffer.indexOf("\n");

      const message = buffer.slice(0, index).trim();

      buffer = buffer.slice(index + 1);

      if (message.length === 0) {
        continue;
      }

      handleMessage(message, socket);
    }
  });

  socket.on("close", () => {
    console.log("Player disconnected");

    const playerIndex = players.indexOf(socket);

    if (playerIndex !== -1) {
      players.splice(playerIndex, 1);
    }

    if (gameStarted && !gameOver) {
      for (const player of players) {
        player.write("OPPONENT_LEFT\n");
      }
    }

    resetGame();
  });

  socket.on("error", (error) => {
    console.log(`Socket error: ${error.message}`);
  });
});

function handleMessage(message, socket) {
  if (!gameStarted || gameOver) {
    return;
  }

  const parts = message.split("|");

  const command = parts[0];
  const value = parts[1];

  if (command !== "MOVE") {
    socket.write("REJECTED|invalid command\n");
    return;
  }

  const cell = Number(value);

  if (!Number.isInteger(cell) || cell < 0 || cell > 8) {
    socket.write("REJECTED|invalid cell\n");
    return;
  }

  if (socket.symbol !== currentTurn) {
    socket.write("REJECTED|not your turn\n");
    return;
  }

  if (board[cell] !== "_") {
    socket.write("REJECTED|cell is occupied\n");
    return;
  }

  board[cell] = socket.symbol;

  sendBoard();

  if (winner(socket.symbol)) {
    gameOver = true;

    for (const player of players) {
      player.write(`WIN|${socket.symbol}\n`);
    }

    return;
  }

  if (!board.includes("_")) {
    gameOver = true;

    for (const player of players) {
      player.write("DRAW\n");
    }

    return;
  }

  if (currentTurn === "X") {
    currentTurn = "O";
  } else {
    currentTurn = "X";
  }

  for (const player of players) {
    player.write(`TURN|${currentTurn}\n`);
  }
}

function sendBoard() {
  const boardMessage = `BOARD|${board.join(",")}\n`;

  for (const player of players) {
    player.write(boardMessage);
  }
}

function winner(symbol) {
  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const line of winningLines) {
    const a = line[0];
    const b = line[1];
    const c = line[2];

    if (board[a] === symbol && board[b] === symbol && board[c] === symbol) {
      return true;
    }
  }

  return false;
}

function resetGame() {
  players.length = 0;

  board = ["_", "_", "_", "_", "_", "_", "_", "_", "_"];

  currentTurn = "X";

  gameStarted = false;

  gameOver = false;
}

server.listen(6060, () => {
  console.log("Server listening on :6060");
});
