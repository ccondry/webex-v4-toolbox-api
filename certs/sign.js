const jwt = require('jsonwebtoken')
const fs = require('fs')
// load the private RSA key file
const key = fs.readFileSync('./certs/rsa-private.pem')

const jwtOptions = {
  algorithm: 'RS256'
  // expiresIn: process.env.jwt_expires_in
}
// const passphrase = process.env.jwt_rsa_passphrase
const passphrase = process.env.RSA_PASSPHRASE

const body = {
  application: 'metrics',
  grant: ['read:instances']
}
// sign new JWT token
const token = jwt.sign(body, {key, passphrase}, jwtOptions)
console.log(token)
