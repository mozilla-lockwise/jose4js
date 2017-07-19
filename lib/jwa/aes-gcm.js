/*!
 *
 */

const webcrypto = require("../util/webcrypto");
const UTILS = require("./utils");

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

  cfg = UTILS.defineOperation(cfg, "generateKey", async (params) => {
    let { algorithm, extractable = true, usages = modes } = params;

    let key = await webcrypto.subtle.generateKey(algorithm, extractable, usages);

    return { key };
  });
  cfg = UTILS.defineOperation(cfg, "encrypt", async (params) => {
    let { algorithm, key, iv, adata, plaintext } = params;
    algorithm =  prepareAlgorithm(algorithm, iv, adata);

    let ctext = await webcrypto.subtle.encrypt(algorithm, key, plaintext);
    ctext = new Uint8Array(ctext);

    let start = ctext.length - (tagLength / 8),
        ciphertext = ctext.subarray(0, start),
        tag = ctext.subarray(start);

    return { ciphertext, tag };
  });
  cfg = UTILS.defineOperation(cfg, "decrypt", async (params) => {
    let { algorithm, key, iv, adata, ciphertext, tag } = params;
    algorithm =  prepareAlgorithm(algorithm, iv, adata);

    let ctext = new Uint8Array(ciphertext.length + (tagLength / 8));
    ctext.set(ciphertext, 0);
    ctext.set(tag, ciphertext.length);

    let plaintext = await webcrypto.subtle.decrypt(algorithm, key, ctext);
    plaintext = new Uint8Array(plaintext);

    return { plaintext };
  });

  return cfg;
}

let ciphers = {};
["A128GCM", "A192GCM", "A256GCM"].forEach(a => (ciphers[a] = _setup(a)));

const USAGES = ["encrypt", "decrypt"];
function map(key, mode) {
  return supports(key, mode)[0] || "";
}

function supports(key, modes) {
  let { name, length = 128 } = key.algorithm;
  if ("AES-GCM" === name) {
    if ("string" === typeof modes) {
      modes = [modes];
    } else if (!modes) {
      modes = USAGES;
    }
    modes = key.usages.filter(u => (modes.indexOf(u) !== -1));

    let algs = new Set();
    modes.forEach(m => {
      let a;
      switch (m) {
        case "encrypt":
          /* eslint no-fallthrough: "off" */
        case "decrypt":
          a = `A${length}GCM`;
          break;
      }
      if (a) {
        algs.add(a);
      }
    });
    algs = [...algs];

    return algs;
  }
  return [];
}

Object.assign(exports, {
  name: "AES-GCM",
  ciphers,
  map,
  supports
});
