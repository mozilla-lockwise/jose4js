/*!
 *
 */

let ciphers = {};

let managers = ["aes-gcm"].map(name => require(`./${name}`));
managers.forEach(mgr => Object.assign(ciphers, mgr.ciphers));

exports.findByKey = (key, mode) => {
  let mgr = managers[key.algorithm.name];
  if (!mgr) { return null; }
  return ciphers[mgr.map(key, mode)];
}

exports.cipher = alg => {
  return ciphers[alg];
};
