const fs = require('node:fs');
const path = require('node:path');

function readData(fileName) {
    const pathName = path.join(__dirname, '..', 'data', fileName);

    const data = fs.readFileSync(pathName, 'utf-8');

    return JSON.parse(data);
}

function writeData(fileName, data) {
    const pathName = path.join(__dirname, '..', 'data', fileName);

    fs.writeFileSync(
        pathName,
        JSON.stringify(data, null, 2)
    );
}

exports.readData = readData;
exports.writeData = writeData;