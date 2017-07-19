/*!
 *
 */

const JWA = require("../jwa");
const BASE64 = require("../util/BASE64"),
      UTF8 = require("../util/UTF8"),
      BUFFERS = require("../util/BUFFERS");

const DOT = new Uint8Array([46]);

function _assembleHeader(members, origin) {
  if (!members || !members.length) {
    return null;
  }

  let result = {};
  members.forEach(m => {
    if (m in origin) {
      result[m] = origin[m];
    }
  });

  return result;
}
function _assembleAAD(base, add) {
  let srcs = [];
  if (base) {
    srcs.push(UTF8.encode(base));
  }
  if (add) {
    srcs.push(DOT);
    srcs.push(UTF8.encode(add));
  }

  return BUFFERS.concat(...srcs);
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
    kekCipher = JWA.findByKey(kek, "wrapKey");
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
    cekCipher = JWA.findByKey(cek, "encrypt");
    if (!cekCipher || !cekCipher.encrypt) {
      throw new Error("invalid content encryption key");
    }
  } else if (header.enc) {
    cekCipher = JWA.cipher(opts.header.enc);
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
  protect = _assembleHeader(protect, opts.header);
  unprotect = _assembleHeader(unprotect, opts.header);

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
  opts.adata = _assembleAAD(opts.protected, opts.aad);

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
