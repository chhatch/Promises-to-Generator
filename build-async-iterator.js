const { unpackedPromise } = require("./utils");

const buildAsyncIterator = (promises = [], timeout = 3000) => {
  const results = [];
  let [pause, resume] = unpackedPromise();

  const breakSymbol = Symbol("break");

  const addPromise = (p) => {
    p.then((result) => {
      resume();
      results.push(result);
    });
  };

  promises.forEach(addPromise);

  const generator = async function* () {
    while (true) {
      if (results.length === 0) {
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve(breakSymbol), timeout);
        });

        const shouldBreak = await Promise.race([pause, timeoutPromise]);

        if (shouldBreak === breakSymbol) {
          break;
        }
        [pause, resume] = unpackedPromise();
      }

      yield results.shift();
    }
  };

  return [generator(), addPromise];
};

module.exports = { buildAsyncIterator };
