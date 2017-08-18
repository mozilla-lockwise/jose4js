/*!
 *
 */

const BUFFERS = require("../util/buffers"),
      BASE64 = require("../util/base64"),
      UTF8 = require("../util/utf8");

const DOT = new Uint8Array([46]);

function separateHeader(members, origin) {
  if (!members || !members.length) {
    return null;
  }

  let result = {};
  members.forEach(m => {
    if (m in origin) {
      result[m] = origin[m];
    }
  });

  return result;
}
function assembleHeader(parts, protect) {
  parts = parts || [];
  protect = protect || [];
  let result = {};

  parts.forEach(h => {
    if (!h) { return; }
    if ("string" === typeof h) {
      h = JSON.parse(UTF8.decode(BASE64.decode(h)));
      protect.push(...Object.keys(h));
    }

    Object.assign(result, h);
  });

  return result;
}

function assembleAAD(base, add) {
  let srcs = [];
  if (base) {
    srcs.push(UTF8.encode(base));
  }
  if (add) {
    srcs.push(DOT);
    srcs.push(UTF8.encode(add));
  }

  return BUFFERS.concat(...srcs);
}

Object.assign(exports, {
  separateHeader,
  assembleHeader,
  assembleAAD
});
