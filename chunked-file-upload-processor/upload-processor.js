import { EventEmitter } from "node:events";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

class UploadProcessor extends EventEmitter {
  constructor(destDir) {
    super();

    this.destDir = destDir;
    this.buffer = Buffer.alloc(0);
    this.output = null;
    this.tempFile = null;
    this.finalFile = null;

    this.receivedBytes = 0;
  }

  async start(filename) {
    const ext = path.extname(filename).slice(1);
    const outputFolder = path.join(this.destDir, ext);

    await fsPromises.mkdir(outputFolder, {
      recursive: true,
    });

    this.finalFile = path.join(outputFolder, filename);
    this.tempFile = path.join(outputFolder, `${filename}.tmp`);
    this.output = fs.createWriteStream(this.tempFile);
  }

  ingest(rawBytes) {
    this.buffer = Buffer.concat([this.buffer, rawBytes]);

    while (this.buffer.length >= 4) {
      const dataLength = this.buffer.readUInt32BE(0);

      if (this.buffer.length >= 4 + dataLength) {
        const chunkData = this.buffer.subarray(4, 4 + dataLength);

        this.receivedBytes += dataLength;

        this.output.write(chunkData);

        this.emit("chunk", {
          bytes: dataLength,
        });

        this.emit("progress", {
          receivedBytes: this.receivedBytes,
        });

        this.buffer = this.buffer.subarray(4 + dataLength);
      } else {
        return;
      }
    }
  }

  async finish() {
    if (this.buffer.length !== 0) {
      throw new Error("Incomplete chunk");
    }

    await new Promise((resolve, reject) => {
      this.output.end(() => {
        resolve();
      });

      this.output.on("error", reject);
    });

    await fsPromises.rename(this.tempFile, this.finalFile);

    this.emit("complete", {
      path: this.finalFile,
    });
  }
}

export default UploadProcessor;
