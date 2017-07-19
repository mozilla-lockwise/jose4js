/*!
 *
 */

function defineOp(cfg, mode, fn) {
  cfg[mode] = async (opts) => {
    let params = cfg.configure(mode, Object.assign({}, opts));
    let results = await fn(params);
    opts = Object.assign(opts || {}, results);

    return opts;
  };
  return cfg;
}

Object.assign(exports, {
  defineOperation: defineOp
});
