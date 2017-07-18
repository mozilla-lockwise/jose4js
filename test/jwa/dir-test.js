/*!
 *
 */

const assert = require("chai").assert;

const webcrypto = require("../../lib/util/webcrypto");
const DIR = require("../../lib/jwa/dir");

describe("jwa/dir", () => {
  describe("ciphers", () => {
    describe("dir", () => {
      let cipher = DIR.ciphers["dir"];

      it("configures for 'deriveKey'", () => {
        let opts;
        opts = cipher.configure("deriveKey");
        assert.deepEqual(opts.header, {
          "alg": "dir"
        });

        let orig = {};
        opts = cipher.configure("deriveKey", orig);
        assert.strictEqual(opts, orig);
        assert.deepEqual(opts.header, {
          "alg": "dir"
        });
      });

      it("'derives' the already given key", async () => {
        let key = await webcrypto.subtle.generateKey({name: "AES-GCM", length: 128}, true, ["encrypt", "decrypt"]);
        let orig = { key };
        let opts = await cipher.deriveKey(orig);
        assert.strictEqual(opts, orig);
        assert.strictEqual(opts.key, key);
      });
    });
  });
});
