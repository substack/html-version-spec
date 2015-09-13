var sodium = require('sodium').api
var keys = sodium.crypto_sign_keypair()
console.log(JSON.stringify({
  publicKey: keys.publicKey.toString('base64'),
  secretKey: keys.secretKey.toString('base64')
}, null, 2))
