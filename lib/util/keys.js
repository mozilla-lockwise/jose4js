/*!
 *
 */

const HAVE_CRYPTOKEY = ("undefined" !== typeof CryptoKey);

function isKey(test) {
  if (!test) {
    return false;
  }
  if (HAVE_CRYPTOKEY && test instanceof CryptoKey) {
    return true;
  }
  return ("CryptoKey" === Object.getPrototypeOf(test).constructor.name);
}
async function asKey(src) {
  if (isKey(src)) {
    return src;
  }
  if ("function" === typeof src) {
    return await src();
  }
  return await Promise.resolve(src);
}

Object.assign(exports, {
  isKey: isKey,
  asKey: asKey
});
