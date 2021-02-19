// the module to provision users
const provision = require('./provision')
const deprovision = require('./deprovision')
const db = require('./db')
const ch = require('./control-hub/client')
const globals = require('./globals')
const teamsLogger = require('./teams-logger')
const ldap = require('./ldap')

// number of milliseconds to wait after completing the scheduled job before
// starting again
const throttle = 10 * 1000

// running state
let running = false

async function getProvisionStartedUsers () {
  // return array of users who need to be provisioned
  const query = {$or: [
    {'demo.webex-v4prod.provision': 'start'},
    {'demo.webex-v4prod.provision': 'starting'},
    {'demo.webex-v4prod.provision': 'started'},
  ]}
  const projection = {
    demo: false,
    password: false
  }
  return db.find('toolbox', 'users', query, projection)
}

async function getProvisionDeletingUsers () {
  try {
    // wait for globals to exist
    await Promise.resolve(globals.initialLoad)
    // return array users who need to be deprovisioned 
    const query = {$or: [
      {'demo.webex-v4prod.provision': 'delete'},
      {'demo.webex-v4prod.provision': 'deleting'}
    ]}
    const projection = {
      demo: false,
      password: false
    }
    const users = await db.find('toolbox', 'users', query, projection)
    // filter out any template user IDs
    const templateUsers = [
      globals.get('webexV4ChatQueueTemplateName').split('_').pop(),
      globals.get('webexV4EmailQueueTemplateName').split('_').pop(),
      globals.get('webexV4ChatEntryPointTemplateName').split('_').pop()
    ]
    return users.filter(v => {
      return !templateUsers.includes(v.id)
    })
  } catch (e) {
    throw e
  }
}

// find licensed users over the webexV4MaxUsers setting, and mark them 'deleting'
// so they will be deprovisioned
async function checkMaxUsers () {
  try {
    // wait for globals to exist
    await Promise.resolve(globals.initialLoad)
    // max number of users that can be provisioned. more than this will trigger
    // deprovision. this is number of toolbox users.
    const maxUsers = parseInt(globals.get('webexV4MaxUsers'))
  
    // find license usage in control hub
    const client = await ch.getClient()
    const licenseUsage = await client.org.getLicenseUsage()
    const cjpPremiumLicenses = licenseUsage[0].licenses.find(v => v.offerName === 'CJPPRM')
    // if license usage of CJP premium is > 95%
    // if (cjpPremiumLicenses.usage / cjpPremiumLicenses.volume >= 0.95) {
    // if (cjpPremiumLicenses.volume - cjpPremiumLicenses.usage <= 10) {
    // console.log('cjpPremiumLicenses.usage', cjpPremiumLicenses.usage)
    // console.log('maxUsers', maxUsers)
    if (cjpPremiumLicenses.usage > maxUsers) {
      // too full - need to deprovision some users
      // get all control hub users
      const allUsers = await client.user.listAll()
      // filter control hub users that do not have CJPPRM license
      const licensedUsers = allUsers.filter(user => {
        try {
          const regex = /\d{4}/
          // true if username contains 4-digit ID
          return user.userName.slice(8, 12).match(regex) &&
          user.licenseID.includes('CJPPRM_1cf76371-2fde-4f72-8122-b6a9d2f89c73')
        } catch (e) {
          return false
        }
      })
      // find user provision info for this demo
      const query = {'demo.webex-v4prod.lastAccess': {$exists: 1}, 'demo.webex-v4prod.provision': 'complete'}
      // const projection = {password: false}
      const projection = {id: true, 'demo.webex-v4prod.lastAccess': true}
      const provisionedUsers = await db.find('toolbox', 'users', query, projection)
      // console.log('provisionedUsers', provisionedUsers)
      // filter provisioned toolbox users to those with matching licensed control hub users
      const userMap = provisionedUsers.filter(user => {
        return licensedUsers.find(agent => user.id === agent.userName.slice(8, 12))
      })
      // sort by last access time descending
      userMap.sort((a, b) => {
        const aDate = new Date(a.demo['webex-v4prod'].lastAccess || 0)
        const bDate = new Date(b.demo['webex-v4prod'].lastAccess || 0)
        // descending
        return bDate - aDate
      })
      // console.log('userMap', userMap)
      // keep top users, return the rest
      // return userMap.slice(maxUsers)
      // set each of these users to deleting state
      const userIds = userMap.slice(maxUsers).map(v => v.id)
      const filter = {id: {$in: userIds}}
      const updates = {$set: {'demo.webex-v4prod.provision': 'deleting'}}
      return db.updateMany('toolbox', 'users', filter, updates)
    } else {
      // not full - return empty array
      // return []
    }
  } catch (e) {
    throw e
  }
}

// find license usage in control hub
async function getCurrentUserCount () {
  const client = await ch.getClient()
  const licenseUsage = await client.org.getLicenseUsage()
  const cjpPremiumLicenses = licenseUsage[0].licenses.find(v => v.offerName === 'CJPPRM')
  return cjpPremiumLicenses.usage
}

async function go () {
  // don't do anything if provisioning is already in progress
  // console.log('running =', running)
  if (!running) {
    running = true
    // console.log('running =', running)
    // check if there are too many users provisioned
    try {
      await checkMaxUsers()
    } catch (e) {
      console.log('failed to check max users:', e)
    }
    // get list of users to deprovision
    try {
      const users = await getProvisionDeletingUsers()
      if (users.length > 0) {
        console.log(`starting deprovision for ${users.length} users`)
      }
      for (const user of users) {
        await deprovision(user)
      }
    } catch (e) {
      console.log('deprovision error:', e)      
    }
    // get list of users to provision
    try {
      // wait for globals to exist
      let users = await getProvisionStartedUsers()
      if (users.length > 0) {
        // get max users number
        await Promise.resolve(globals.initialLoad)
        const maxUsers = parseInt(globals.get('webexV4MaxUsers'))
        const currentUserCount = await getCurrentUserCount()
        // check if provision amount would be too many
        if (currentUserCount / 2 + users.length > maxUsers) {
          // trim?
          const max = Math.floor(maxUsers - (currentUserCount / 2))
          users = users.slice(0, max)
        }
        console.log(`starting provision for ${users.length} users`)
        // provision all LDAP users first, so sync is easier
        for (const user of users) {
          await ldap.createUsers({userId: user.id})
        }
        // provision the rest of the user stuff in CJP and control hub
        for (const user of users) {
          await provision(user)
        }
      } else {
        // no users to provision
      }
    } catch (e) {
      const message = `provision error: ${e.message}`
      console.log(message)
      teamsLogger.log(message)
    }
    // stop running
    running = false
  }
}

go()

setInterval(go, throttle)

module.exports = {
  getProvisionDeletingUsers
}