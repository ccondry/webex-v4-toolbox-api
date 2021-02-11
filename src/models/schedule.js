// the module to provision users
const provision = require('./provision')
const db = require('./db')

// TODO increase this
const throttle = 10 * 1000

// running state
let running = false

async function getProvisionStartedUsers () {
  // users need to be provisioned if they have org ID set but queue ID
  // and template ID have not been set (or have been unset)
  const query = {
    $and: [
      {'demo.webex-v4prod.orgId': process.env.ORG_ID},
      {'provisionStatus': {$ne: 'complete'}}
    ]
  }
  const projection = {
    demo: false,
    password: false
  }
  return db.find('toolbox', 'users', query, projection)
}

async function go () {
  // don't do anything if provisioning is already in progress
  // console.log('running =', running)
  if (!running) {
    running = true
    // console.log('running =', running)
    // get list of users to provision
    try {
      const users = await getProvisionStartedUsers()
      if (users.length > 0) {
        console.log(`starting provision for ${users.length} users`)
      }
      for (const user of users) {
        await provision(user)
      }
    } catch (e) {
      console.log('provision error:', e)      
    } finally {
      running = false
    }
  }
}

go()

setInterval(go, throttle)

module.exports = {}