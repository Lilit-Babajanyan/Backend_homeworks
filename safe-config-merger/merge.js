import fs from "node:fs/promises";

const baseFile = "config.base.json";
const environment = process.argv[2];
const overrideFile = `config.${environment}.json`;
const finalFile = "merged.json";

async function read() {
  const data = await fs.readFile(baseFile, "utf8");

  const dataObj = JSON.parse(data);

  let overrideObj = {};

  try {
    const overrideData = await fs.readFile(overrideFile, "utf8");
    overrideObj = JSON.parse(overrideData);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`Warning! ${overrideFile} doesn't exist.`);
    } else {
      console.log(`Invalid JSON in ${overrideFile}: ${error.message}`);
      return;
    }
  }

  const res = deepMerge(dataObj, overrideObj);
  const json = JSON.stringify(res, null, 2);
  const tempFile = `${finalFile}.tmp`;

  await fs.writeFile(tempFile, json, "utf8");

  await fs.rename(tempFile, finalFile);
}

read();

function deepMerge(base, override) {
  if (
    typeof base === "object" &&
    typeof override === "object" &&
    base !== null &&
    override !== null &&
    !Array.isArray(base) &&
    !Array.isArray(override)
  ) {
    for (const key of Object.keys(override)) {
      if (
        typeof base[key] === "object" &&
        typeof override[key] === "object" &&
        base[key] !== null &&
        override[key] !== null &&
        !Array.isArray(base[key]) &&
        !Array.isArray(override[key])
      ) {
        base[key] = deepMerge(base[key], override[key]);
      } else {
        base[key] = override[key];
      }
    }

    return base;
  }

  return override;
}
