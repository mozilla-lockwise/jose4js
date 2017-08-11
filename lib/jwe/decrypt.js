/*!
 *
 */

const JWA = require("../jwa");
const BASE64 = require("../util/base64"),
      UTILS = require("./utils");

async function decrypt(opts, jwe) {
  opts = Object.assign({}, opts);

  if (!jwe) {
    throw new Error("invalid input");
  }

  // normalize input
  if ("string" === typeof jwe) {
    // convert compact to flattened JSON
    jwe = jwe.split(".");
    jwe = {
      protected: jwe[0],
      encrypted_key: jwe[1],
      iv: jwe[2],
      ciphertext: jwe[3],
      tag: [4]
    };
  }
  // assume {jwe} is a flattened JSON

  let params = {
    wrappingKey: opts.wrappingKey,
    key: opts.key
  };
  // decode binary fields
  ["iv", "ciphertext", "tag"].forEach(m => {
    let v = jwe[m];
    if (!v) {
      return;
    }
    v = BASE64.decode(v);
    params[m] = v;
  });

  // analyze header
  params.header = UTILS.assembleHeader([opts.header, jwe.unprotected, jwe.protected], params.protected = []);
  let kekCipher, cekCipher;
  kekCipher = JWA.cipher(params.header.alg);
  cekCipher = JWA.cipher(params.header.enc);

  // TODO: assume a default KEK cipher?
  if (!kekCipher) {
    throw new Error("invalid key management cipher");
  }
  // TODO: assume a default CEK cipher?
  if (!cekCipher) {
    throw new Error("invalid content encryption cipner");
  }

  // assume {wrapKey} is mutually exclusive from {deriveKey}
  if ("deriveKey" in kekCipher) {
    params = await kekCipher.deriveKey(params);
  } else if ("unwrapKey" in kekCipher) {
    throw new Error("not implemented yet");
  } else {
    throw new Error("invalid key management cipher");
  }

  params.adata = UTILS.assembleAAD(jwe.protected, jwe.aad);

  // should have a key, so let's to decrypt!
  params = await cekCipher.decrypt(params);
  let { header, protected, key, plaintext } = params;

  return {
    header,
    protected,
    key,
    plaintext
  };
}

Object.assign(exports, {
  decrypt
});
