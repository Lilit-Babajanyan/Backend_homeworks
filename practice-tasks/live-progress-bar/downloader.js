const EventEmitter = require("node:events");

class Downloader extends EventEmitter {
  constructor() {
    super();
  }

  start() {
    let step = 0;

    const interval = setInterval(() => {
      step = step + 1;

      const percentage = step * 10;

      this.emit("progress", percentage);

      if (step === 10) {
        clearInterval(interval);
        this.emit("done");
      }
    }, 500);
  }
}

module.exports = Downloader;
