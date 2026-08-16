import fs from "node:fs";

const stream = fs.createReadStream("server.log");

let leftover = "";

let linesQuantity = 0;
let errorQuantity = 0;
let warnQuantity = 0;
let infoQuantity = 0;

let lastErrorTime = null;
let longestGap = 0;

stream.on("data", (chunk) => {
  const text = chunk.toString();

  const combined = leftover + text;

  const lines = combined.split("\n");

  leftover = lines.pop();

  for (const line of lines) {
    linesQuantity++;

    if (line.includes("[ERROR]")) {
      errorQuantity++;

      const timestampText = line.substring(0, 20);

      const currErrorTime = Date.parse(timestampText);

      if (lastErrorTime !== null) {
        const diff = currErrorTime - lastErrorTime;

        const gap = diff / 1000;

        if (gap > longestGap) {
          longestGap = gap;
        }
      }

      lastErrorTime = currErrorTime;
    }

    if (line.includes("[WARN]")) {
      warnQuantity++;
    }

    if (line.includes("[INFO]")) {
      infoQuantity++;
    }
  }
});

stream.on("end", () => {
  if (leftover.length > 0) {
    linesQuantity++;

    if (leftover.includes("[ERROR]")) {
      errorQuantity++;

      const timestampText = leftover.substring(0, 20);

      const currErrorTime = Date.parse(timestampText);

      if (lastErrorTime !== null) {
        const diff = currErrorTime - lastErrorTime;

        const gap = diff / 1000;

        if (gap > longestGap) {
          longestGap = gap;
        }
      }

      lastErrorTime = currErrorTime;
    }

    if (leftover.includes("[WARN]")) {
      warnQuantity++;
    }

    if (leftover.includes("[INFO]")) {
      infoQuantity++;
    }
  }

  console.log(`Lines processed: ${linesQuantity}`);
  console.log(`ERROR: ${errorQuantity}`);
  console.log(`WARN: ${warnQuantity}`);
  console.log(`INFO: ${infoQuantity}`);
  console.log(`Longest gap between ERRORs: ${longestGap} seconds`);
});
