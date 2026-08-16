import { EventEmitter } from "node:events";

class TaskQueue extends EventEmitter {
  #queue = [];
  #running = 0;
  #emptyEmit = true;

  constructor(concurrency) {
    super();

    this.concurrency = concurrency;
  }

  add(id, jobFn) {
    const job = {
      id: id,
      jobFn: jobFn,
    };

    this.#queue.push(job);

    this.#emptyEmit = false;

    this.#runNext();
  }

  async #runNext() {
    if (this.#running >= this.concurrency) {
      return;
    }

    if (this.#queue.length === 0) {
      if (this.#running === 0 && !this.#emptyEmit) {
        this.#emptyEmit = true;

        this.emit("queue:empty");
      }

      return;
    }

    const job = this.#queue.shift();

    this.#running++;

    this.emit("job:start", {
      id: job.id,
    });

    try {
      const result = await job.jobFn();

      this.emit("job:complete", {
        id: job.id,
        result: result,
      });

      this.#running--;

      this.#runNext();
    } catch (error) {
      this.emit("job:error", {
        id: job.id,
        error: error,
      });

      this.#running--;

      this.#runNext();
    }
  }
}

export default TaskQueue;
