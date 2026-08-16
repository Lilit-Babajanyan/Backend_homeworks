import fs from "node:fs";

const stream = fs.createWriteStream("server.log");

const limitLines = 100000;

const levels = ["ERROR", "WARN", "INFO"];

const messages = [
  "Connection timed out",
  "Request handled in 42ms",
  "Retry attempt 2",
  "Database connection established",
  "User authenticated",
  "File not found",
];

for (let i = 0; i < limitLines; ++i) {
  const date = new Date();
  const timestamp = date.toISOString();

  const level = levels[Math.floor(Math.random() * levels.length)];

  const message = messages[Math.floor(Math.random() * messages.length)];

  const wholeLine = `${timestamp} [${level}] ${message}\n`;

  stream.write(wholeLine);
}

stream.end();
