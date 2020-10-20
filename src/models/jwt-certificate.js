const fs = require('fs')

// load the public cert for validating JWT
const cert_pub = fs.readFileSync(process.env.JWT_CERT_FILE)

module.exports = cert_pub
