/*!
 *
 */

// TODO: parameterize webcypto implementation
let webcrypto;
if (require("is-node")) {
  webcrypto = new (require("node-webcrypto-ossl"))();
} else {
  // assumes global {crypto} is a WebCrypto instance
  webcrypto = crypto;
}

module.exports = webcrypto;
