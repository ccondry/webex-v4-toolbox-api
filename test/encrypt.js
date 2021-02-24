const crypto = require("crypto")
const fs = require('fs')

// my private cert
const myCert = fs.readFileSync('./certs/rsa-private.pem')
// remote public cert
const remoteCert = fs.readFileSync('./certs/rsa-public.pem')
// This is the data we want to encrypt
const data = 'my secret data'

const encryptedData = crypto.publicEncrypt(
	{
		key: remoteCert,
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: 'sha256',
	},
	// We convert the data string to a buffer using `Buffer.from`
	Buffer.from(data)
)

// The encrypted data is in the form of bytes, so we print it in base64 format
// so that it's displayed in a more readable form
const base64 = encryptedData.toString('base64')
console.log('encypted data:', base64)

const decryptedData = crypto.privateDecrypt(
	{
		key: myCert,
		// In order to decrypt the data, we need to specify the
		// same hashing function and padding scheme that we used to
		// encrypt the data in the previous step
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: "sha256",
	},
	encryptedData
)

// The decrypted data is of the Buffer type, which we can convert to a
// string to reveal the original data
console.log('decrypted data:', decryptedData.toString())