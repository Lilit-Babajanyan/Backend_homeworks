import fs from "node:fs/promises";

const input = process.argv[2];
const output = process.argv[3];
const shift = Number(process.argv[4]);

const buffer = await fs.readFile(input);

for (let i = 0; i < buffer.length; i++) {
  let byte = buffer[i];

  if (byte >= 65 && byte <= 90) {
    let position = byte - 65;

    position = (position + shift) % 26;

    if (position < 0) {
      position += 26;
    }

    buffer[i] = position + 65;
  } else if (byte >= 97 && byte <= 122) {
    let position = byte - 97;

    position = (position + shift) % 26;

    if (position < 0) {
      position += 26;
    }

    buffer[i] = position + 97;
  }
}
await fs.writeFile(output, buffer);
