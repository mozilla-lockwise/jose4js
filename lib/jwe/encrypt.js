/*!
 *
 */

const JWA = require("../jwa");
const BUFFERS = require("../util/buffers"),
      BASE64 = require("../util/base64"),
      UTF8 = require("../util/utf8"),
      UTILS = require("./utils");

function _configureKEKCipher(key) {
  let cipher = JWA.findByKey(key, "wrapKey");
  if (!cipher || !(cipher.wrapKey || cipher.deriveKey)) {
    cipher = undefined;
  }
  return cipher;
}
function _configureCEKCipher(key) {
  let cipher = JWA.findByKey(key, "encrypt");
  if (!cipher || !cipher.encrypt) {
    cipher = undefined;
  }
  return cipher;
}

/**
 *
 * **NOTE:** Either {opts.key} or the "alg" member of {opts.header} must
 * be present.
 *
 * @param {Object} opts The options used to encrypt
 * @param {CryptoKey} [opts.key] The [content] encryption key
 * @param {CryptoKey} [opts.wrappingKey] The key wrapping/encryption/agreement key
 * @param {Object} [opts.header] The JOSE header
 * @param {String[]} [opts.protect] The protected header members
 */
async function encrypt(opts, plaintext) {
  opts = Object.assign({}, opts);

  let [ cek, kek ] = await Promise.all([opts.key, opts.wrapKey]);

  // determine ciphers
  let header;
  header = opts.header || {};
  let kekCipher;
  if (kek) {
    kekCipher = _configureKEKCipher(kek);
  } else if (header.alg) {
    kekCipher = JWA.cipher(opts.header.alg);
  }
  if (!kekCipher && cek) {
    // assume "direct"
    kekCipher = JWA.cipher("dir");
  }
  if (!kekCipher) {
    throw new Error("missing key wrapping key");
  }
  if ("deriveKey" in kekCipher) {
    opts = await kekCipher.deriveKey(opts);
    cek = opts.key;
  }

  header = opts.header || {};
  let cekCipher;
  if (cek) {
    cekCipher = _configureCEKCipher(cek);
  } else if (header.enc) {
    cekCipher = JWA.cipher(opts.header.enc);
    opts.key = () => (cekCipher.generateKey());
  }
  // TODO: look for a default "enc"

  if (!cekCipher) {
    throw new Error("missing content key");
  }

  // let createCEK = async () => (opts.key || cekCipher.generateKey(opts));
  // assumes {wrapKey} is mutually exclusive from {deriveKey}
  if ("wrapKey" in kekCipher) {
    // kekCipher also configures {opts}
    // kekCipher triggers a create CEK -- somehow
    opts = await kekCipher.wrapKey(opts);
  }
  // configure cek
  opts = cekCipher.configure("encrypt", opts);

  // normalize & assemble headers
  let protect, unprotect, members = Object.keys(opts.header);
  if ("protect" in opts) {
    protect = opts.protect;
  } else {
    protect = "*";
  }

  if ("*" === protect) {
    protect = members;
  }
  protect = UTILS.separateHeader(protect, opts.header);
  unprotect = UTILS.separateHeader(unprotect, opts.header);

  if (unprotect) {
    opts.unprotected = unprotect;
  }
  if (protect) {
    protect = JSON.stringify(protect);
    protect = UTF8.encode(protect);
    protect = BASE64.encode(protect, true);
    opts.protected = protect;
  }

  // calculate aad
  if (opts.aad) {
    opts.aad = BASE64.encode(opts.aad, true);
  }
  opts.adata = UTILS.assembleAAD(opts.protected, opts.aad);

  // wrap w/ kek
  // encrypt w/ cek
  if ("string" === typeof plaintext) {
    plaintext = UTF8.encode(plaintext);
  }
  opts.plaintext = plaintext;
  opts = await cekCipher.encrypt(opts);

  // assemble result
  let result = {};
  ["protected", "unprotected", "encrypted_key", "iv", "aad", "ciphertext", "tag"].forEach(m => {
    let v = opts[m];
    if (undefined === v) { return; }
    result[m] = BUFFERS.isBuffer(v) ? BASE64.encode(v, true) : v;
  });

  return result;
}

Object.assign(exports, {
  encrypt
});
