import fs from "node:fs";
import UploadProcessor from "./upload-processor.js";

const processor = new UploadProcessor("./uploads");

const readStream = fs.createReadStream("photo.jpg.chunked", {
  highWaterMark: 512,
});

await processor.start("photo.jpg");

readStream.on("data", (chunkedPhoto) => {
  processor.ingest(chunkedPhoto);
});

processor.on("chunk", ({ bytes }) => {
  console.log(`Chunk received: ${bytes} bytes`);
});

processor.on("progress", ({ receivedBytes }) => {
  console.log(`Received: ${receivedBytes} bytes`);
});

processor.on("complete", ({ path }) => {
  console.log(`Saved to: ${path}`);
});

readStream.on("end", () => {
  processor.finish();
});
