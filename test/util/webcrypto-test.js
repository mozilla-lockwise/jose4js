/*!
 *
 */

const assert = require("chai").assert;

const webcrypto = require("../../lib/util/webcrypto");

describe("util/webcrypto", () => {
  it("tests existence", () => {
    assert.exists(webcrypto);
    assert.typeOf(webcrypto.getRandomValues, "function");
    assert.typeOf(webcrypto.subtle, "object");
  });
});
