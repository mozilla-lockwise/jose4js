/*!
 *
 */

let ciphers = {};

let managers = ["aes-gcm"].map(name => require(`./${name}`));
managers.forEach(mgr => Object.assign(ciphers, mgr.ciphers));

exports.cipher = alg => {
  return ciphers[alg];
};
