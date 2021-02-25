const crypto = require('crypto')
const fs = require('fs')

// my private cert
const key = fs.readFileSync('./certs/rsa-private.pem')

module.exports = function (encryptedData) {
  return crypto.privateDecrypt(
    {
      key,
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(encryptedData, 'base64')
  )
}