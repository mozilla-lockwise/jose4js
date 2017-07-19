/*!
 *
 */

const UTILS = require("./utils");
const KEYS = require("../util/keys");

function _setup() {
  let cfg = {};
  cfg.configure = (mode, opts) => {
    opts = opts || {};

    let header = {
      alg: "dir"
    };
    opts.header = Object.assign(opts.header || {}, header);

    return opts;
  };

  cfg = UTILS.defineOperation(cfg, "deriveKey", async (params) => {
    let key = params.key;
    // TODO: try to resovle a key
    if (!key) {
      throw new Error("missing content key");
    }
    if ("secret" !== key.type) {
      throw new Error("invalid content key");
    }

    return key;
  });
  cfg.deriveKey = async (opts) => {
    opts = cfg.configure("deriveKey", opts);

    if (!opts.key) {
      // TODO: try to resolve a key
      throw new Error("missing content key");
    }
    if ("secret" !== opts.key.type) {
      throw new Error("invalid content key");
    }

    return opts;
  };

  return cfg;
}

let ciphers = {
  "dir": _setup()
};

Object.assign(exports, {
  name: "dir",
  ciphers
});
