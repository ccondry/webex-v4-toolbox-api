require('dotenv').config()
const db = require('../src/models/db')

async function getProvisionStartedUsers () {
  // users need to be provisioned if they have org ID set but queue ID
  // and template ID have not been set (or have been unset)
  const query = {
    $and: [
      {'demo.webex-v4prod.orgId': process.env.ORG_ID},
      {
        $or: [
          {'demo.webex-v4prod.queueId': {exists: false}},
          {'demo.webex-v4prod.queueId': {$eq: ''}},
          {'demo.webex-v4prod.queueId': {$eq: null}},
          {'demo.webex-v4prod.templateId': {exists: false}},
          {'demo.webex-v4prod.templateId': {$eq: ''}},
          {'demo.webex-v4prod.templateId': {$eq: null}}
        ]
      }
    ]
  }
  const projection = {
    demo: false,
    password: false
  }
  return db.find('toolbox', 'users', query, projection)
}

// running state
let running = false

async function go () {
  // don't do anything if provisioning is already in progress
  if (!running) {
    running = true
    // get list of users to provision
    try {
      const users = await getProvisionStartedUsers()
      console.log(users)
    } catch (e) {
      console.log('provision error:', e)      
    } finally {
      running = false
    }
  }
}

go()
