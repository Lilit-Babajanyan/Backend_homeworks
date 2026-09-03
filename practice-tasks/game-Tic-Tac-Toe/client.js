import net from "node:net";
import readline from "node:readline";

const socket = net.connect({
  port: 6060,
  host: "127.0.0.1",
});

let symbol = null;

let currentTurn = null;

let gameOver = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

    handleMessage(message);
  }
});

function handleMessage(message) {
  const parts = message.split("|");

  const command = parts[0];
  const value = parts[1];

  if (command === "SYMBOL") {
    symbol = value;

    console.log(`You are ${symbol}.`);
  }

  if (command === "BOARD") {
    const cells = value.split(",");

    printBoard(cells);
  }

  if (command === "TURN") {
    currentTurn = value;

    if (currentTurn === symbol && !gameOver) {
      askForMove();
    } else {
      console.log("Waiting for opponent...");
    }
  }

  if (command === "REJECTED") {
    console.log(`Rejected: ${value}`);

    if (currentTurn === symbol && !gameOver) {
      askForMove();
    }
  }

  if (command === "WIN") {
    gameOver = true;

    if (value === symbol) {
      console.log("You won!");
    } else {
      console.log("You lost!");
    }

    rl.close();
    socket.end();
  }

  if (command === "DRAW") {
    gameOver = true;

    console.log("Draw!");

    rl.close();
    socket.end();
  }

  if (command === "OPPONENT_LEFT") {
    console.log("Opponent left the game.");

    gameOver = true;

    rl.close();
    socket.end();
  }
}

function printBoard(cells) {
  console.log("");

  console.log(` ${cells[0]} | ${cells[1]} | ${cells[2]}`);

  console.log("-----------");

  console.log(` ${cells[3]} | ${cells[4]} | ${cells[5]}`);

  console.log("-----------");

  console.log(` ${cells[6]} | ${cells[7]} | ${cells[8]}`);

  console.log("");
}

function askForMove() {
  rl.question("Your turn. Enter a cell (0-8): ", (answer) => {
    if (gameOver) {
      return;
    }

    socket.write(`MOVE|${answer}\n`);
  });
}

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("close", () => {
  console.log("Disconnected from server");

  rl.close();
});

socket.on("error", (error) => {
  console.log(`Socket error: ${error.message}`);
});
