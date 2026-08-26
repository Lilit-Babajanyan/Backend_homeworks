# Chat Application — Project Write-Up

## 1. Message Protocol and Framing

The chat application uses a simple **line-based text protocol** over TCP. Each message or command is represented as a text string and ends with a newline (`\n`). Since TCP is a stream protocol and does not preserve message boundaries, the server stores incoming data in a `buffer`. Whenever the buffer contains a newline, the server extracts everything before it as one complete message and processes it. This allows the application to correctly handle cases where multiple messages arrive together or a single message is split across multiple TCP packets.

The protocol supports regular chat messages as well as commands. Regular messages are broadcast to all other connected users, while commands start with `/` and are handled separately. For example, `/who` lists connected users, `/msg Lilit hello` sends a private message, and `/block Arman` blocks a user.

## 2. Additional Features

In addition to the basic chat functionality, I implemented several features from Section 4. The application supports **private messaging** using `/msg`, allowing users to communicate directly with another connected user. It also supports **user blocking** with `/block`, which prevents a blocked user from sending private messages. The `/who` command shows the currently connected users. I also implemented a **typing indicator**, which informs other users when someone is typing and when they stop typing. Finally, the server handles disconnections and automatically disconnects clients after a period of inactivity.

## 3. How to Run

The project requires **Node.js**. Start the server from the project directory:

```bash
node server.js
```

The server listens on port `3000`. Then open multiple terminal windows and run the client in each one:

```bash
node client.js
```

Enter a different username for each client. Once connected, users can exchange messages and use the available commands such as `/who`, `/msg`, `/block`, and `/quit`.
