import fs from "node:fs";
import path from "node:path";

const CHUNK_SIZE = 1024;

const sourceFile = process.argv[2];

const sourceReading = fs.createReadStream(sourceFile, {
  highWaterMark: CHUNK_SIZE,
});

const outputFolder = path.dirname(sourceFile);
const outputFilePath = path.join(outputFolder, "photo.jpg.chunked");

const outputWriting = fs.createWriteStream(outputFilePath);

sourceReading.on("data", (chunk) => {
  const header = Buffer.alloc(4);

  header.writeUInt32BE(chunk.length);

  outputWriting.write(header);
  outputWriting.write(chunk);
});

sourceReading.on("end", () => {
  outputWriting.end();
});
