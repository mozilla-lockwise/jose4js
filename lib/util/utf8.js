/*!
 *
 */

var shim, TE, TD;

if ("undefined" === typeof TextEncoder || "undefined" === typeof TextDecoder) {
  shim = require("text-encoding-utf-8");
}
TE = ("undefined" !== typeof TextEncoder) ? TextEncoder : shim.TextEncoder;
TD = ("undefined" !== typeof TextDecoder) ? TextDecoder : shim.TextDecoder;

function encode(input) { return (new TE()).encode(input); }
function decode(input) { return (new TD()).decode(input); }

Object.assign(exports, {
  encode,
  decode
});
