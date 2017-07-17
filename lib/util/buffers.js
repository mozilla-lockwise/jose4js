/*!
 *
 */


const BUFFER_TYPES = [
  Uint8Array,
  Uint8ClampedArray
];
const VIEW_TYPES = [
  Uint16Array,
  Uint32Array,
  Int8Array,
  Int16Array,
  Int32Array,
  Float32Array,
  Float64Array
];

function _isBufferOf(src, types) {
  let result = false;
  for (let t of types) {
    result = result | (src instanceof t);
  }
  return result;
}

function isBuffer(src) {
  let result = false;
  result = result |
           _isBufferOf(src, BUFFER_TYPES) |
           _isBufferOf(src, VIEW_TYPES);
  return result;
}

function asBuffer(src) {
  if (src instanceof ArrayBuffer) {
    // raw arraybuffer
    src = new Uint8Array(src);
  } else if (_isBufferOf(src, VIEW_TYPES)) {
    // view over arraybuffer
    src = new Uint8Array(src.buffer, src.byteOffset, src.byteLength);
  } else if (_isBufferOf(src, BUFFER_TYPES)) {
    // identity
  } else {
    throw new TypeError("invalid source type");
  }

  return src;
}

function concat(...sources) {
  let length = 0, start = 0;
  if (0 === sources.length) {
    return new Uint8Array([]);
  }
  if (1 === sources.length) {
    return asBuffer(sources[0]);
  }

  for (let s of sources) {
    length += s.length;
  }
  let dest = new Uint8Array(length);
  for (let s of sources) {
    s = asBuffer(s);
    dest.set(s, start);
    start += s.length;
  }
  return dest;
}

Object.assign(exports, {
  isBuffer,
  asBuffer,
  concat
});
