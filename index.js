const { buildAsyncIterator } = require("./build-async-iterator");
const { waitAndMessage } = require("./utils");

const promises = [
  waitAndMessage(1000, "hai"),
  waitAndMessage(2000, "hola"),
  waitAndMessage(3000, "hallo"),
];

const [asyncIterable, addPromise] = buildAsyncIterator(promises);

setTimeout(() => {
  addPromise(waitAndMessage(1000, "hallå"));
}, 4000);
setTimeout(() => {
  addPromise(waitAndMessage(1000, "hello"));
}, 6000);

(async () => {
  for await (const promise of asyncIterable) {
    console.log(promise);
  }
})();
