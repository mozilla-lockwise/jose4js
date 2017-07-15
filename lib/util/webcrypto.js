/*!
 *
 */

// TODO: parameterize webcypto implementation
let webcrypto;
if ("undefined" !== typeof crypto) {
  webcrypto = crypto;
} else {
  webcrypto = new (require("node-webcrypto-ossl"))();
}

module.exports = webcrypto;
