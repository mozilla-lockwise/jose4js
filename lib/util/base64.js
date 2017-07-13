/*!
 *
 */

// value -> point tables
const B64  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
      B64U = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function encode(input, urlsafe) {
  // {input} is TypedArray or ArrayBuffer
  if (input instanceof ArrayBuffer) {
    input = new Uint8Array(input);
  } else if (input instanceof Uint8Array || input instanceof Uint8ClampedArray) {
    // DO NOTHING
  } else if ("buffer" in input && "byteLength" in input && "byteOffset" in input) {
    // assume this is a TypedArray
    input = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  } else {
    throw new TypeError("invalid input");
  }

  let output = [];
  let dict = urlsafe ? B64U : B64,
      pad = urlsafe ? "" : "=",
      idx;
  for (idx = 0; input.length > idx; idx += 3) {
    let chunk = [];

    chunk[0] = (input[idx] >> 2) & 0x3f;
    chunk[1] = ((input[idx] << 4) & 0x3f) |
               (((input[idx+1] | 0) >> 4) & 0x3f);
    chunk[2] = (((input[idx+1] | 0) << 2) & 0x3f) |
               (((input[idx+2] | 0) >> 6) & 0x3f);
    chunk[3] = (input[idx+2] | 0) & 0x3f;
    chunk = chunk.map(v => dict.charAt(v));
    output.push(...chunk);
  }
  // adjust output
  let rem = idx - input.length;
  rem = [rem - 2, rem - 1].map((r, i) => {
    let c = output[output.length - 2 + i];
    return (0 <= r) ? pad : c;
  });
  output.splice(output.length - 2, 2, ...rem);

  return output.join("");
}
function urlEncode(input) {
  return encode(input, true);
}

// point -> value table
const CODES = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, 62, -1, 63,
  52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
  -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, 63,
  -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
];
function decode(input) {
  input = input || "";
  if ("string" !== typeof input) {
    throw new TypeError("invalid input");
  }

  // calculate output size
  let len = input.length;
  if ("=" === input[len - 1]) {
    len--;
  }
  if ("=" === input[len - 1]) {
    len--;
  }
  len = 0 | ((len * 3) / 4);

  let output = new Uint8Array(len);
  let idx, jdx;
  for (idx = 0, jdx = 0; input.length > idx; idx += 4, jdx += 3) {
    let chunk = [
      CODES[input.charCodeAt(idx)],
      CODES[input.charCodeAt(idx+1)],
      CODES[input.charCodeAt(idx+2)],
      CODES[input.charCodeAt(idx+3)]
    ];
    output[jdx] = ((chunk[0] << 2) & 0xfc) | ((chunk[1] >> 4) & 0x0f);
    output[jdx + 1] = ((chunk[1] << 4) & 0xf0) | ((chunk[2] >> 2) & 0x3f);
    output[jdx + 2] = ((chunk[2] << 6) & 0xc0) | (chunk[3] & 0x3f);
  }

  return output;
}

Object.assign(exports, {
  encode,
  urlEncode,
  decode
});
