import fs from "node:fs/promises";
import path from "node:path";

const input = process.argv[3];
const output = process.argv[2];

const files = await fs.readdir(input);

for (const file of files) {
  const parsed = path.parse(file);

  let cleanName = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let cleanExt = parsed.ext.toLowerCase();

  let readyFile = cleanName + cleanExt;

  let sourcePath = path.join(input, file);
  let finalPath = path.join(output, readyFile);

  await fs.copyFile(sourcePath, finalPath);
}
