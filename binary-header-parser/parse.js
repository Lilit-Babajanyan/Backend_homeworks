import fs from "node:fs";

const buffer = fs.readFileSync("records.bin");

if (
  buffer[0] !== 0x53 ||
  buffer[1] !== 0x4e ||
  buffer[2] !== 0x53 ||
  buffer[3] !== 0x52
) {
  throw new Error("Invalid file");
}

const version = buffer.readUInt8(4);

if (version !== 1) {
  throw new Error("Invalid version");
}

const recQuantity = buffer.readUInt16BE(5);

const headerSize = 7;
const recordSize = 9;
const checksumSize = 1;

const expectedSize = headerSize + recQuantity * recordSize + checksumSize;

if (buffer.length < expectedSize) {
  throw new Error("Invalid size of the buffer");
}

const records = [];

for (let i = 0; i < recQuantity; i++) {
  const offset = headerSize + i * recordSize;

  const timestamp = buffer.readUInt32BE(offset);

  const temperature = buffer.readFloatBE(offset + 4);

  const sensorId = buffer.readUInt8(offset + 8);

  records.push({
    timestamp: new Date(timestamp * 1000),
    temperature: temperature,
    sensorId: sensorId,
  });
}

let temperatureSum = 0;

for (const record of records) {
  temperatureSum += record.temperature;
}

const averageTemperature = temperatureSum / records.length;

const sensorCounts = {};

for (const record of records) {
  if (sensorCounts[record.sensorId]) {
    sensorCounts[record.sensorId]++;
  } else {
    sensorCounts[record.sensorId] = 1;
  }
}

let activeSensor = null;
let activeCount = 0;

for (const sensorId in sensorCounts) {
  if (sensorCounts[sensorId] > activeCount) {
    activeCount = sensorCounts[sensorId];
    activeSensor = sensorId;
  }
}

const checksumOffset = headerSize + recQuantity * recordSize;

const storedChecksum = buffer.readUInt8(checksumOffset);

let calculatedChecksum = 0;

for (let i = headerSize; i < headerSize + recQuantity * recordSize; i++) {
  calculatedChecksum += buffer[i];
}

calculatedChecksum = calculatedChecksum % 256;

if (calculatedChecksum !== storedChecksum) {
  console.log("Warning: checksum does not match");
}

console.log("File format valid (SNSR v1)");
console.log(`Records parsed: ${records.length}`);
console.log(`Average temperature: ${averageTemperature.toFixed(2)}°C`);
console.log(`Most active sensor: #${activeSensor} (${activeCount} readings)`);
