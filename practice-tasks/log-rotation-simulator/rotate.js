import fs from "node:fs/promises";

const file = process.argv[2];

const limit = 200;

async function rotate() {
  try {
    const info = await fs.stat(file);

    if (info.size < limit) {
      console.log(
        `${file} is ${info.size} bytes -- under the limit, no rotation needed.`,
      );
      return;
    }

    const timestamp = new Date().toISOString();
    const archivedFile = "app-" + timestamp + ".log";

    await fs.rename(file, archivedFile);

    await fs.writeFile(file, "");

    console.log(`Rotated: ${file} -> ${archivedFile} (fresh log created)`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`No log file yet at ${file} -- nothing to rotate`);
      return;
    }

    throw error;
  }
}
await rotate();
