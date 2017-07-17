/*!
 *
 */

const assert = require("chai").assert;

const BUFFERSs = require("../../lib/util/buffers");

describe("util/buffers", () => {
  const as_is = {
    "Uint8Array": new Uint8Array([0xa5]),
    "Uint8ClampedArray": new Uint8ClampedArray([0x5a])
  };
  const coerce = {
    "Int8Array": new Int8Array([-17]),
    "Int16Array": new Int16Array([-5953]),
    "Int32Array": new Int32Array([-1005117922]),
    "Uint16Array": new Uint16Array([42631]),
    "Uint32Array": new Uint32Array([576976]),
    "Float32Array": new Float32Array([3.402823466]),
    "Float64Array": new Float64Array([-3.402823466])
  };

  describe("isBuffer()", () => {
    let testdata = {};
    Object.keys(as_is).forEach(kind => (testdata[kind] = as_is[kind]));
    Object.keys(coerce).forEach(kind => (testdata[kind] = coerce[kind]));
    for (let kind of Object.keys(testdata)) {
      it(`Ensures that ${kind} is a buffer`, () => {
        let buf = testdata[kind];
        assert.ok(BUFFERSs.isBuffer(buf));
      });
    }
  });
  describe("asBuffer()", () => {
    for (let kind of Object.keys(as_is)) {
      it(`Returns ${kind} without modification`, () => {
        let expected = as_is[kind];
        let actual = BUFFERSs.asBuffer(expected);
        assert.strictEqual(actual, expected);
      });
    }
    for (let kind of Object.keys(coerce)) {
      it(`it wraps ${kind}'s ArrayBuffer`, () => {
        let src = coerce[kind];
        let actual = BUFFERSs.asBuffer(src);
        assert.instanceOf(actual, Uint8Array);
        assert.strictEqual(actual.buffer, src.buffer);
      });
    }
  });
});
