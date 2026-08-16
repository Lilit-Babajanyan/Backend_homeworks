const Downloader = require("./downloader");

const downloader = new Downloader();

downloader.on("progress", (percentage) => {
  const hashes = percentage / 5;
  const dashes = 20 - hashes;

  let hashPart = "";
  let dashPart = "";

  for (let i = 0; i < hashes; i++) {
    hashPart = hashPart + "#";
  }

  for (let i = 0; i < dashes; i++) {
    dashPart = dashPart + "-";
  }

  const progressBar = "[" + hashPart + dashPart + "] " + percentage + "%";

  process.stdout.write("\r" + progressBar);
});

downloader.on("done", () => {
  process.stdout.write("\n");
  console.log("Download complete!");
});

downloader.start();
