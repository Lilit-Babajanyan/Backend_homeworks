import net from "node:net";

const clients = new Map();

const server = net.createServer((socket) => {
  let username = null;
  let buffer = "";

  const blockList = new Set();
  socket.blockList = blockList;

  socket.write("Enter username: ");

  socket.on("error", (err) => {
    console.log(`Socket error: ${err.message}`);
    socket.destroy();
  });

  socket.on("close", () => {
    if (username !== null) {
      clients.delete(username);
      console.log(`${username} disconnected`);
    }
  });

  socket.on("data", (data) => {
    buffer += data.toString();

    while (buffer.includes("\n")) {
      const message = buffer.slice(0, buffer.indexOf("\n"));

      buffer = buffer.slice(buffer.indexOf("\n") + 1);

      if (username === null) {
        if (clients.has(message)) {
          socket.write("Username already taken. Try another: ");
          return;
        }

        username = message;
        clients.set(username, socket);

        console.log(`${username} connected`);
      } else if (message.startsWith("/")) {
        commandHandler(message, socket, username, blockList);
      } else {
        broadcast(message, socket, username);
      }
    }
  });

  socket.setTimeout(300000);

  socket.on("timeout", () => {
    socket.write("Disconnected due to inactivity.\n");
    socket.end();
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

function commandHandler(message, socket, username, blockList) {
  if (message === "/who") {
    const users = [...clients.keys()];

    socket.write(`Connected users: ${users.join(", ")}\n`);
  } else if (message === "/quit") {
    clients.delete(username);

    socket.write(`${username} disconnected\n`);

    socket.end();
  } else if (message === "/typing") {
    for (const targetSocket of clients.values()) {
      if (targetSocket !== socket) {
        targetSocket.write(`${username} is typing...\n`);
      }
    }
  } else if (message === "/typing-stop") {
    for (const targetSocket of clients.values()) {
      if (targetSocket !== socket) {
        targetSocket.write(`${username} stopped typing.\n`);
      }
    }
  } else if (message.startsWith("/block ")) {
    const target = message.slice(7);

    if (!clients.has(target)) {
      socket.write(`User "${target}" is not connected.\n`);
      return;
    }

    blockList.add(target);

    socket.write(`You blocked ${target}.\n`);
  } else if (message.startsWith("/msg ")) {
    const parts = message.split(" ");

    const target = parts[1];
    const privateMessage = parts.slice(2).join(" ");

    const targetSocket = clients.get(target);

    if (!targetSocket) {
      socket.write(`User "${target}" is not connected.\n`);
      return;
    }

    if (targetSocket.blockList.has(username)) {
      return;
    }

    targetSocket.write(`[DM from ${username}]: ${privateMessage}\n`);

    socket.write(`[you -> ${target}]: ${privateMessage}\n`);
  }
}

function broadcast(message, senderSocket, senderUsername) {
  for (const socket of clients.values()) {
    if (socket !== senderSocket) {
      socket.write(`[${senderUsername}]: ${message}\n`);
    }
  }
}
