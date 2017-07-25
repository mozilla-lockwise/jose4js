/*!
 *
 */

// TODO: parameterize webcypto implementation
let webcrypto;
if (require("is-node")) {
  webcrypto = new (require("node-webcrypto-ossl"))();
} else if ("undefined" !== typeof crypto) {
  webcrypto = crypto;
}

module.exports = webcrypto;
