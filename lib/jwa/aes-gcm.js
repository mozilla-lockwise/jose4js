/*!
 *
 */

const webcrypto = require("../util/webcrypto");

function _setup(alg) {
  let parts = /^A(128|192|256)(GCM)$/g.exec(alg);
  let name = "AES-GCM",
      length = parseInt(parts[1]),
      tagLength = 128,
      modes = ["encrypt", "decrypt"];

  function prepareAlgorithm(algorithm, iv, additionalData) {
    return Object.assign(algorithm || {}, {
      name,
      iv,
      additionalData,
      tagLength
    });
  }

  let cfg = {};
  cfg.configure = (mode, opts) => {
    opts = opts || {};

    let algorithm = {
      name,
      length,
      tagLength
    };
    opts.algorithm = Object.assign(opts.algorithm || {}, algorithm);

    if (!opts.iv && "encrypt" === mode) {
      opts.iv = webcrypto.getRandomValues(new Uint8Array(12));
    }

    let header = {
      enc: alg
    };
    opts.header = Object.assign(opts.header || {}, header);

    return opts;
  };

  cfg.generateKey = async (opts) => {
    let { algorithm, extractable = true, usages = modes } = cfg.configure("generateKey", opts);

    let key = await webcrypto.subtle.generateKey(algorithm, extractable, usages);
    Object.assign(opts, { key: key });

    return opts;
  };
  cfg.encrypt = async (opts) => {
    let { algorithm, key, iv, aad, plaintext } = cfg.configure("encrypt", opts);
    algorithm =  prepareAlgorithm(algorithm, iv, aad);

    let ctext = await webcrypto.subtle.encrypt(algorithm, key, plaintext);
    ctext = new Uint8Array(ctext);
    let start = ctext.length - (tagLength / 8),
        ciphertext = ctext.subarray(0, start),
        tag = ctext.subarray(start);

    return { ciphertext, tag };
  };
  cfg.decrypt = async (opts) => {
    let { algorithm, key, iv, aad, ciphertext, tag } = cfg.configure("decrypt", opts);
    algorithm =  prepareAlgorithm(algorithm, iv, aad);

    let ctext = new Uint8Array(ciphertext.length + (tagLength / 8));
    ctext.set(ciphertext, 0);
    ctext.set(tag, ciphertext.length);

    let plaintext = await webcrypto.subtle.decrypt(algorithm, key, ctext);
    plaintext = new Uint8Array(plaintext);
    return {
      plaintext
    };
  };

  return cfg;
}

const CIPHERS = {};
["A128GCM", "A192GCM", "A256GCM"].forEach(a => (CIPHERS[a] = _setup(a)));

const USAGES = ["encrypt", "decrypt"];
function map(key, mode) {
  let { name, length = 128 } = key.algorithm;
  if ("AES-GCM" === name) {
    if ("string" === typeof mode) {
      mode = [mode];
    } else if (!mode) {
      mode = USAGES;
    }
    mode = key.usages.filter(u => (mode.indexOf(u) !== -1))[0];
    switch (mode) {
      case "encrypt":
        /* eslint no-fallthrough: "off" */
      case "decrypt":
        return `A${length}GCM`;
    }
  }
  return "";
}

exports.ciphers = CIPHERS;
exports.map = map;
