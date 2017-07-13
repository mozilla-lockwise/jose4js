/**
 *
 */

/* eslint-env mocha */

var assert = require("chai").assert;

const utf8 = require("../../lib/util/utf8");

const testdata = [
  {
    description: "simple ASCII",
    text: "hello there",
    data: new Uint8Array([104, 101, 108, 108, 111, 32, 116, 104, 101, 114, 101])
  },
  {
    description: "all emojis",
    text: "🌈➡🌟",
    data: new Uint8Array([240, 159, 140, 136, 226, 158, 161, 240, 159, 140, 159])
  },
  {
    description: "text + emojis",
    text: "🌈 hello ➡ there 🌟",
    data: new Uint8Array([240, 159, 140, 136, 32, 104, 101, 108, 108, 111, 32, 226, 158, 161, 32, 116, 104, 101, 114, 101, 32, 240, 159, 140, 159])
  }
];

describe("util/utf8", () => {
  for (let tc of testdata) {
    let { description, text, data} = tc;
    it(`encodes string => utf8 array: ${description}`, () => {
      let actual = utf8.encode(text);
      assert.deepEqual(actual, data);
    });
    it (`decodes utf8 array => string: ${description}`, () => {
      let actual = utf8.decode(data);
      assert.strictEqual(actual, text);
    });
  }
});
