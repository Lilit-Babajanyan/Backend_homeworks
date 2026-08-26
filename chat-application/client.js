import net from "node:net";

const socket = net.createConnection({
  port: 3000,
  host: "127.0.0.1",
});

socket.on("data", (data) => {
  console.log(data.toString());
});

socket.on("error", (err) => {
  console.log(`Socket error: ${err.message}`);
});

socket.on("close", () => {
  console.log("Disconnected from server");

  if (process.stdin.isRaw) {
    process.stdin.setRawMode(false);
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();

let message = "";
let isTyping = false;
let usernameEntered = false;

process.stdin.on("data", (data) => {
  const letter = data.toString();

  // Ctrl+C
  if (letter === "\u0003") {
    process.stdin.setRawMode(false);
    socket.end();
    return;
  }

  // Enter
  if (letter === "\r" || letter === "\n") {
    if (message.length > 0) {
      socket.write(message + "\n");
    }

    // Handle username
    if (!usernameEntered) {
      usernameEntered = true;
    } else {
      // Enter during chat = stop typing
      if (isTyping) {
        socket.write("/typing-stop\n");
        isTyping = false;
      }
    }

    message = "";
    process.stdout.write("\n");
    return;
  }

  // Backspace
  if (letter === "\u007f") {
    if (message.length > 0) {
      message = message.slice(0, -1);
      process.stdout.write("\b \b");
    }
    return;
  }

  message += letter;
  process.stdout.write(letter);

  if (usernameEntered && !isTyping) {
    socket.write("/typing\n");
    isTyping = true;
  }
});
