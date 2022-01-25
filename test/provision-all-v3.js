require('dotenv').config()
const db = require('../src/models/db')
const demoVersionTag = require('../src/models/demo-version-tag')

// provision all users in v4 who are provisioned in v3
const filter = {
  'demo.webex-v3prod.queueId': {$exists: 1}
}
const updates = {
  $set: {
    ['demo.webex-' + demoVersionTag + '.provision']: 'starting'
  }
}
db.updateMany('toolbox', 'users', filter, updates)
.then(r => console.log(r.result || r.results))
.catch(e => console.log(e.message))
