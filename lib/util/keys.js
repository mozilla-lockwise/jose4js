/*!
 *
 */

const HAVE_CRYPTOKEY = ("undefined" !== typeof CryptoKey);

function isKey(test) {
  if (!test) {
    return false;
  }
  if (HAVE_CRYPTOKEY && test instanceof test) {
    return true;
  }
  return ("CryptoKey" === Object.getPrototypeOf(test).constructor.name);
}

Object.assign(exports, {
  isKey: isKey
})
