import TaskQueue from "./task-queue.js";

const queue = new TaskQueue(2);

queue.on("job:start", ({ id }) => {
  console.log(`start ${id}`);
});

queue.on("job:complete", ({ id, result }) => {
  console.log(`done ${id} -> ${result}`);
});

queue.on("job:error", ({ id, error }) => {
  console.log(`failed ${id}: ${error.message}`);
});

queue.on("queue:empty", () => {
  console.log("all jobs finished");
});

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

queue.add("A", async () => {
  await delay(300);
  return "result-A";
});

queue.add("B", async () => {
  await delay(100);
  return "result-B";
});

queue.add("C", async () => {
  await delay(200);
  throw new Error("boom");
});

queue.add("D", async () => {
  await delay(50);
  return "result-D";
});

queue.add("E", async () => {
  await delay(150);
  return "result-E";
});
