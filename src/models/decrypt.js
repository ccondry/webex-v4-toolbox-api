const crypto = require('crypto')
const fs = require('fs')
// const path = require('path')

// my private cert
const key = fs.readFileSync('./certs/rsa-private.pem')

module.exports = function (encryptedData) {
  // console.log('encryptedData', encryptedData)
  const buf = Buffer.from(encryptedData, 'base64')
  // console.log('buf', buf)
  const decrypted = crypto.privateDecrypt(
    {
      key,
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    buf
  )
  // console.log('decrypted', decrypted)
  const utf8 = decrypted.toString('utf8')
  // console.log('utf8', utf8)
  return utf8
}