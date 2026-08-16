import fs from "node:fs";

const recQuantity = 10;

const records = [
  {
    timestamp: 1755259200,
    temperature: 21.5,
    sensorId: 1,
  },
  {
    timestamp: 1755259300,
    temperature: 22.1,
    sensorId: 2,
  },
  {
    timestamp: 1755259400,
    temperature: 20.8,
    sensorId: 3,
  },
  {
    timestamp: 1755259500,
    temperature: 21.9,
    sensorId: 1,
  },
  {
    timestamp: 1755259600,
    temperature: 22.4,
    sensorId: 2,
  },
  {
    timestamp: 1755259700,
    temperature: 23.0,
    sensorId: 3,
  },
  {
    timestamp: 1755259800,
    temperature: 21.7,
    sensorId: 1,
  },
  {
    timestamp: 1755259900,
    temperature: 22.8,
    sensorId: 2,
  },
  {
    timestamp: 1755260000,
    temperature: 20.9,
    sensorId: 3,
  },
  {
    timestamp: 1755260100,
    temperature: 21.5,
    sensorId: 1,
  },
];

const headerSize = 7;
const recordSize = 9;
const checksumSize = 1;

const bufferSize = headerSize + recQuantity * recordSize + checksumSize;

const buffer = Buffer.alloc(bufferSize);

buffer.write("SNSR", 0, 4, "ascii");
buffer.writeUInt8(1, 4);
buffer.writeUInt16BE(recQuantity, 5);

for (let i = 0; i < records.length; ++i) {
  const record = records[i];

  const offset = headerSize + i * recordSize;

  buffer.writeUInt32BE(record.timestamp, offset);

  buffer.writeFloatBE(record.temperature, offset + 4);

  buffer.writeUInt8(record.sensorId, offset + 8);
}

let checksum = 0;

for (let i = headerSize; i < headerSize + recQuantity * recordSize; i++) {
  checksum += buffer[i];
}

checksum = checksum % 256;

const checksumOffset = headerSize + recQuantity * recordSize;

buffer.writeUInt8(checksum, checksumOffset);

fs.writeFileSync("records.bin", buffer);
