const fs = require("node:fs");

const file = process.argv[2];

const stream = fs.createReadStream(file);

let bytes = 0;
let words = 0;
let prevWhitespace = true;

stream.on("data", (buffer) => {
  bytes += buffer.length;

  let i = 0;

  while (i < buffer.length) {
    const byte = buffer[i];

    const isWhitespace =
      byte === 32 || byte === 9 || byte === 10 || byte === 13;

    if (!isWhitespace && prevWhitespace) {
      words++;
    }

    prevWhitespace = isWhitespace;

    i++;
  }
});

stream.on("end", () => {
  console.log(`Words: ${words}`);
  console.log(`Bytes processed: ${bytes}`);
});
