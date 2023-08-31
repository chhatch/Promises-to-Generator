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

module.exports = { waitAndMessage, unpackedPromise };
