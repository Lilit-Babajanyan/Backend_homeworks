import fs from "node:fs/promises";
import path from "node:path";

const source = process.argv[2];
const destination = process.argv[3];

async function readFiles(folder) {
  const files = await fs.readdir(folder, { withFileTypes: true });

  for (let file of files) {
    if (file.isFile()) {
      const ext = path.extname(file.name);
      const parsed = path.parse(file.name);
      const base = path.basename(file.name);

      if (base[0] === ".") {
        const destFolder = path.join(destination, "hidden");

        await fs.mkdir(destFolder, { recursive: true });

        const destFile = path.join(destFolder, file.name);
        const sourceFile = path.join(folder, file.name);

        await fs.copyFile(sourceFile, destFile);
      } else if (ext === "") {
        const destFolder = path.join(destination, "no-extension");

        await fs.mkdir(destFolder, { recursive: true });

        const destFile = path.join(destFolder, file.name);
        const sourceFile = path.join(folder, file.name);

        await fs.copyFile(sourceFile, destFile);
      } else {
        const folderName = ext.slice(1);
        const destFolder = path.join(destination, folderName);

        await fs.mkdir(destFolder, { recursive: true });

        const destFile = path.join(destFolder, file.name);
        const sourceFile = path.join(folder, file.name);

        await fs.copyFile(sourceFile, destFile);
      }
    } else {
      const folderPath = path.join(folder, file.name);

      await readFiles(folderPath);
    }
  }
}

readFiles(source);
