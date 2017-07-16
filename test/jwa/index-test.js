/*!
 *
 */

const assert = require("chai").assert;

const JWA = require("../../lib/jwa");

describe("JWA", () => {
  const testAlgs = {
    "A128GCM": ["configure", "generateKey", "encrypt", "decrypt"],
    "A256GCM": ["configure", "generateKey", "encrypt", "decrypt"]
  };

  describe("cipher", () => {
    for (let alg of Object.keys(testAlgs)) {
      it(`has an alg for ${alg}`, () => {
        let cipher = JWA.cipher(alg);
        assert.exists(cipher);
        for (let m of testAlgs[alg]) {
          assert.typeOf(cipher[m], "function");
        }
      });
    }
  });

  describe("findByKey", () => {
    for (let alg of Object.keys(testAlgs)) {
      it(`can find a key for ${alg}`, async () => {
        let cipher = JWA.cipher(alg);
        let opts = cipher.configure();
        let { key } = await cipher.generateKey(opts);

        let found = JWA.findByKey(key);
        assert.strictEqual(found, cipher);
      });
    }
  });
});
