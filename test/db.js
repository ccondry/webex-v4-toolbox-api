const db = require('../src/models/db')

// provision all users in v4 who are provisioned in v3
const filter = {
  'demo.webex-v3prod.queueId': {$exists: 1}
}
const updates = {
  $set: {
    'demo.webex-v4prod.provision': 'starting'
  }
}
db.updateMany('toolbox', 'users', filter, updates)
.then(r => console.log(r.result || r.results))
.catch(e => console.log(e.message))
