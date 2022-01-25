require('dotenv').config()
const db = require('../src/models/db')
const demoVersionTag = require('../src/models/demo-version-tag')

// stop provisioning anyone who is queued for provision
const filter = {
  ['demo.webex-' + demoVersionTag + '.provision']: 'starting'
}
const updates = {
  $set: {
    ['demo.webex-' + demoVersionTag + '.provision']: ''
  }
}
db.updateMany('toolbox', 'users', filter, updates)
.then(r => console.log(r.result || r.results))
.catch(e => console.log(e.message))
