const demoVersionNumber = require('./demo-version')
let demoVersion = 'v' + demoVersionNumber
// v6 or v4prod
if (demoVersionNumber === '4') {
  demoVersion += 'prod'
}

module.exports = demoVersion