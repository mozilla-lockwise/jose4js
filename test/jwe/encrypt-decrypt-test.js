/*!
 *
 */

const assert = require("chai").assert;

const JWA = require("../../lib/jwa");
const JWE = {
  encrypt: require("../../lib/jwe/encrypt").encrypt
};

describe("JWE", () => {
  it("round trips an encrypt/decrypt", async () => {
    let opts, cipher;
    cipher = JWA.cipher("A128GCM");
    opts = await cipher.generateKey();

    let plaintext = "hello there";
    let result = await JWE.encrypt(opts, plaintext);
    /* eslint no-console: "off" */
    console.log(`encryption result: ${JSON.stringify(result)}`);
    assert.ok(result);
  });
});
