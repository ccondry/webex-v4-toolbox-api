require('dotenv').config()
const db = require('../src/models/db')

// stop provisioning anyone who is queued for provision
const filter = {
  'demo.webex-v4prod.provision': 'starting'
}
const updates = {
  $set: {
    'demo.webex-v4prod.provision': ''
  }
}
db.updateMany('toolbox', 'users', filter, updates)
.then(r => console.log(r.result || r.results))
.catch(e => console.log(e.message))
