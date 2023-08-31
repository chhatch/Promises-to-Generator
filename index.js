const { v4: uuidv4 } = require("uuid");

const waitAndMessage = (ms, msg) =>
  new Promise((resolve) => setTimeout(() => resolve(msg), ms));

const unpackedPromise = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return [promise, resolve, reject];
};

const promisesToHash = (promises) =>
  promises.reduce((hash, p) => {
    const id = uuidv4();
    hash[id] = p.then((result) => [id, result]);
    return hash;
  }, {});

const promises = [
  waitAndMessage(1000, "hai"),
  waitAndMessage(2000, "hola"),
  waitAndMessage(3000, "hallo"),
];

const buildAsyncIterator = (promises = [], timeout = 3000) => {
  const hash = promisesToHash(promises);
  let [pause, resume] = unpackedPromise();

  const updateHash = async () => {
    const [id, result] = await Promise.race(Object.values(hash));
    delete hash[id];
    return result;
  };

  const breakSymbol = Symbol("break");

  const generator = async function* () {
    while (true) {
      if (Object.keys(hash).length === 0) {
        console.log("waiting...");

        let timoutId;
        const timeoutPromise = new Promise((resolve) => {
          timoutId = setTimeout(() => resolve(breakSymbol), timeout);
        });

        const result = await Promise.race([pause, timeoutPromise]);

        if (result === breakSymbol) {
          console.log("timeout");
          break;
        }
        [pause, resume] = unpackedPromise();
      }

      yield updateHash();
    }
  };

  const addPromise = (p) => {
    const id = uuidv4();
    hash[id] = p.then((result) => {
      resume();
      return [id, result];
    });
    console.log("new promise added!");
  };

  return [generator(), addPromise];
};

const [asyncIterable, addPromise] = buildAsyncIterator(promises);

setTimeout(() => {
  addPromise(waitAndMessage(1000, "hello"));
}, 4000);

(async () => {
  for await (const promise of asyncIterable) {
    console.log(promise);
  }
})();
