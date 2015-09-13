var sodium = require('sodium').api
var fs = require('fs')
var html = fs.readFileSync(__dirname + '/../example.html')
var secretKey = Buffer(require('./keys.json').secretKey, 'base64')

var sig = sodium.crypto_sign_detached(html, secretKey)
console.log(sig.toString('base64'))
