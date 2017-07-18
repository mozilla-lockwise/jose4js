/*!
 *
 */

const assert = require("chai").assert;

const AESGCM = require("../../lib/jwa/aes-gcm");
const base64 = require("../../lib/util/base64");
const webcrypto = require("../../lib/util/webcrypto");

describe("jwa/aes-gcm", () => {
  let testdata = {
    "A128GCM": {
      alg: "A128GCM",
      length: 128,
      cases: [
        {
          // 128-bit key, 0-bit AAD
          description: "128-bit key, 0-bit AAD, 96-bit IV, 128-bit TAG",
          key: "6YtyqYgahMprduD0Pmhkeg",
          iv: "iyMpn94XQFPz1lK6",
          adata: "",
          plaintext: "KChqMhKTJTw-CqJwSieAMg",
          ciphertext: "Wjwc8Zhdu4vtgYA2_dWrQg",
          tag: "I8erD5UrcJHNMkg1BDtetQ"
        },
        // 128-bit key, 128-bit AAD
        {
          description: "128-bit key, 128-bit AAD, 96-bit IV, 128-bit TAG",
          key: "gW45BwQQzyGEkE2gPqUHWg",
          iv: "MsNnozYmE7J_w-Z-",
          adata: "8qMHKO2HTuApg8KUQ108Fg",
          plaintext: "7K_pbGehZGdE8ciR9eaUJw",
          ciphertext: "VS6-AS57z5D873Evg0To8Q",
          tag: "7Krp_GgnakWrDKPLndlTnw"
        }
      ]
    },
    "A256GCM": {
      alg: "A256GCM",
      length: 256,
      cases: [
        // 256-bit key, 0-bit AAD
        {
          description: "256-bit key, 0-bit AAD, 96-bit IV, 128-bit TAG",
          key: "TI6_4UROwbLVA8aYZlmvLJT6_pRfcsHoSGpaz-24oPg",
          iv: "RzNg4K0kiJlZhYmV",
          plaintext: "d4m0HLPuVIgUygs4jBCzQw",
          ciphertext: "0seBEKx-jxB8DfBXC9fJDA",
          adata: "",
          tag: "wmo3m22Y7yhS6tjOg6gzpw"
        },
        // 256-bit key, 128-bit AAD
        {
          description: "256-bit key, 128-bit AAD, 96-bit IV, 128-bit TAG",
          key: "VONS6h2Ev-ZKEBEJYRH752aK0iA9kCoBRYw7vYW_zhQ",
          iv: "33w7ygA5bQwBhJXZ",
          plaintext: "hfw9-tm1qNMljk_ERXG9Ow",
          ciphertext: "Qm4O_Gk7e-HzAY233bt-TQ",
          adata: "fpaNcbUMHxH9AB8_70nQRQ",
          tag: "7oJXeVvmoRZNfh0tbKx3pw"
        }
      ]
    }
  };

  before(async () => {
    let all = [];
    Object.keys(testdata).forEach(alg => {
      let algset = testdata[alg].cases.map(async (tc) => {
        // decode all the things
        ["key", "iv", "plaintext", "ciphertext", "adata", "tag"].forEach(k => {
          tc[k] = base64.decode(tc[k]);
        });

        // convert to a key
        tc.key = await webcrypto.subtle.importKey("raw", tc.key, "AES-GCM", true, ["encrypt", "decrypt"]);
      });
      all = all.concat(algset);
    });

    return Promise.all(all);
  });

  describe("ciphers", () => {
    Object.keys(testdata).forEach(alg => {
      describe(alg, () => {
        let details = testdata[alg];
        let cipher = AESGCM.ciphers[alg];

        it("configures options for 'encrypt'", () => {
          let opts;
          opts = cipher.configure("encrypt");
          assert.typeOf(opts, "object");
          assert.deepEqual(opts.algorithm, {
            name: "AES-GCM",
            length: details.length,
            tagLength: 128
          });
          assert.deepEqual(opts.header, {
            enc: alg
          });
          assert.instanceOf(opts.iv, Uint8Array);

          let orig = {};
          opts = cipher.configure("encrypt", orig);
          assert.strictEqual(opts, orig);
          assert.typeOf(opts, "object");
          assert.deepEqual(opts.algorithm, {
            name: "AES-GCM",
            length: details.length,
            tagLength: 128
          });
          assert.deepEqual(opts.header, {
            enc: alg
          });
          assert.instanceOf(opts.iv, Uint8Array);

          let iv = new Uint8Array(12);
          orig = { iv };
          opts = cipher.configure("encrypt", orig);
          assert.strictEqual(opts, orig);
          assert.strictEqual(opts.iv, iv);
          assert.typeOf(opts, "object");
          assert.deepEqual(opts.algorithm, {
            name: "AES-GCM",
            length: details.length,
            tagLength: 128
          });
          assert.deepEqual(opts.header, {
            enc: alg
          });
        });
        it("configures options for 'decrypt'", () => {
          let opts;
          opts = cipher.configure("decrypt");
          assert.typeOf(opts, "object");
          assert.doesNotHaveAnyKeys(opts, [ "iv "]);
          assert.deepEqual(opts.algorithm, {
            name: "AES-GCM",
            length: details.length,
            tagLength: 128
          });
          assert.deepEqual(opts.header, {
            enc: alg
          });

          let orig = {};
          opts = cipher.configure("decrypt", orig);
          assert.strictEqual(opts, orig);
          assert.doesNotHaveAnyKeys(opts, [ "iv "]);
          assert.typeOf(opts, "object");
          assert.deepEqual(opts.algorithm, {
            name: "AES-GCM",
            length: details.length,
            tagLength: 128
          });
          assert.deepEqual(opts.header, {
            enc: alg
          });

          let iv = new Uint8Array(12);
          orig = { iv };
          opts = cipher.configure("decrypt", orig);
          assert.strictEqual(opts, orig);
          assert.strictEqual(opts.iv, iv);
          assert.typeOf(opts, "object");
          assert.deepEqual(opts.algorithm, {
            name: "AES-GCM",
            length: details.length,
            tagLength: 128
          });
          assert.deepEqual(opts.header, {
            enc: alg
          });
        });

        for (let tc of details.cases) {
          let { description } = tc;
          it(`encrypts (${description})`, async () => {
            let opts = Object.assign({}, tc);
            let results = await cipher.encrypt(opts);
            let expected = {
              ciphertext: tc.ciphertext,
              tag: tc.tag
            };
            for (let e of Object.keys(expected)) {
              assert.deepEqual(results[e], expected[e]);
            }
          });
          it(`decrypts (${description})`, async () => {
            let opts = Object.assign({}, tc);
            let results = await cipher.decrypt(opts);
            let expected = {
              plaintext: tc.plaintext
            };
            for (let e of Object.keys(expected)) {
              assert.deepEqual(results[e], expected[e]);
            }
          });
        }
      });
    });
  });

  describe("map", () => {
    it("maps a AES-GCM (key + mode) to an alg id", async () => {
      let alg, key, params;

      params = { name: "AES-GCM", length: 128 };
      key = await webcrypto.subtle.generateKey(params, true, ["encrypt", "decrypt"]);
      alg = AESGCM.map(key, "encrypt");
      assert.strictEqual(alg, "A128GCM");
      alg = AESGCM.map(key, "decrypt");
      assert.strictEqual(alg, "A128GCM");

      params.length = 256;
      key = await webcrypto.subtle.generateKey(params, true, ["encrypt", "decrypt"]);
      alg = AESGCM.map(key, "encrypt");
      assert.strictEqual(alg, "A256GCM");
      alg = AESGCM.map(key, "decrypt");
      assert.strictEqual(alg, "A256GCM");
    });
    it("maps a AES-GCM (key + bad mode) to nothing", async () => {
      let alg, key, params;

      params = { name: "AES-GCM", length: 128 };
      key = await webcrypto.subtle.generateKey(params, true, ["encrypt", "encrypt"]);
      alg = AESGCM.map(key, "wrapKey");
      assert.strictEqual(alg, "");
      alg = AESGCM.map(key, "unwrapKey");
      assert.strictEqual(alg, "");
    });
    it("maps a AES-GCM (wrapping key + mode) to nothing", async () => {
      let alg, key, params;

      params = { name: "AES-GCM", length: 128 };
      key = await webcrypto.subtle.generateKey(params, true, ["wrapKey", "unwrapKey"]);
      alg = AESGCM.map(key, "encrypt");
      assert.strictEqual(alg, "");
      alg = AESGCM.map(key, "decrypt");
      assert.strictEqual(alg, "");
    });
    it("maps a AES-GCM key to an alg id", async () => {
      let alg, key, params;

      params = { name: "AES-GCM", length: 128 };
      key = await webcrypto.subtle.generateKey(params, true, ["encrypt", "decrypt"]);
      alg = AESGCM.map(key);
      assert.strictEqual(alg, "A128GCM");

      params.length = 256;
      key = await webcrypto.subtle.generateKey(params, true, ["encrypt", "decrypt"]);
      alg = AESGCM.map(key);
      assert.strictEqual(alg, "A256GCM");
    });
    it("maps a AES-GCM wrapping key to nothing", async () => {
      let alg, key, params;

      params = { name: "AES-GCM", length: 128 };
      key = await webcrypto.subtle.generateKey(params, true, ["wrapKey", "unwrapKey"]);
      alg = AESGCM.map(key);
      assert.strictEqual(alg, "");
    });
    it("maps a HMAC key to nothing", async () => {
      let alg, key, params;

      params = { name: "HMAC", hash: "SHA-256", length: 256 };
      key = await webcrypto.subtle.generateKey(params, true, ["sign", "verify"]);
      alg = AESGCM.map(key);
      assert.strictEqual(alg, "");
    });
  });
});
