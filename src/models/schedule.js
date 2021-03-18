// the module to provision users
const provision = require('./provision')
const deprovision = require('./deprovision')
const toolbox = require('./toolbox')
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
  // return array of users with a user ID who need to be provisioned
  const query = {
    $and: [{
      $or: [
        {'demo.webex-v4prod.provision': 'start'},
        {'demo.webex-v4prod.provision': 'starting'},
        {'demo.webex-v4prod.provision': 'started'}
      ]
    }, {
      id: {$exists: true}
    }]
  }
  return toolbox.findUsers(query)
}

async function getProvisionDeletingUsers () {
  try {
    // wait for globals to exist
    await Promise.resolve(globals.initialLoad)
    // return array users with a user ID who need to be deprovisioned 
    const query = {
      $and: [{
        $or: [
          {'demo.webex-v4prod.provision': 'delete'},
          {'demo.webex-v4prod.provision': 'deleting'}
        ]
      }, {
        id: {$exists: true}
      }]
    }
    const users = await toolbox.findUsers(query)
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
    // number of users to delete below the maxUser limit
    const maxUsersBuffer = parseInt(globals.get('webexV4MaxUsersBuffer'))
    // find license usage in control hub
    const client = await ch.getClient()
    const licenseUsage = await client.org.getLicenseUsage()
    const cjpPremiumLicenses = licenseUsage[0].licenses.find(v => v.offerName === 'CJPPRM')
    // if license usage of CJP premium is > 95%
    // if (cjpPremiumLicenses.usage / cjpPremiumLicenses.volume >= 0.95) {
    // if (cjpPremiumLicenses.volume - cjpPremiumLicenses.usage <= 10) {
    // console.log('cjpPremiumLicenses.usage', cjpPremiumLicenses.usage)
    // console.log('maxUsers', maxUsers)
    // delete 10 users below the max, so that old users can be cycled out when
    // new users are waiting to be provisioned and we are at max capacity
    if (cjpPremiumLicenses.usage / 2 > maxUsers - maxUsersBuffer) {
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
      const query = {
        'demo.webex-v4prod.lastAccess': {$exists: 1},
        'demo.webex-v4prod.provision': 'complete'
      }
      // const projection = {password: false}
      const projection = {id: true, 'demo.webex-v4prod.lastAccess': true}
      const provisionedUsers = await toolbox.findUsers(query, projection)
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
      // set each of these users to delete state
      const userIds = userMap.slice(maxUsers - maxUsersBuffer).map(v => v.id)
      const filter = {id: {$in: userIds}}
      const updates = {provision: 'delete'}
      return toolbox.updateUsers(filter, updates)
    } else {
      // not full - return empty array
      // return []
    }
  } catch (e) {
    throw e
  }
}

// find license usage in control hub
async function getLicenseUsageCount () {
  const client = await ch.getClient()
  const licenseUsage = await client.org.getLicenseUsage()
  const cjpPremiumLicenses = licenseUsage[0].licenses.find(v => v.offerName === 'CJPPRM')
  return cjpPremiumLicenses.usage
}

async function go () {
  // don't do anything if provisioning is already in progress
  if (!running) {
    running = true
    // check if there are too many users provisioned
    try {
      await checkMaxUsers()
    } catch (e) {
      console.log('failed to check max users:', e.message)
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
      console.log('deprovision error:', e.message)      
    }
    // get list of users to provision
    try {
      // wait for globals to exist
      let users = await getProvisionStartedUsers()
      // get max users number
      await Promise.resolve(globals.initialLoad)
      const maxUsers = parseInt(globals.get('webexV4MaxUsers'))
      const licenseUsageCount = await getLicenseUsageCount()
      // check if provision amount would be too many
      if (licenseUsageCount / 2 + users.length > maxUsers) {
        // trim?
        const max = Math.floor(maxUsers - (licenseUsageCount / 2))
        users = users.slice(0, max)
      }
      if (users.length > 0) {
        console.log(`starting provision for ${users.length} users`)
        const errorUsers = []
        // provision LDAP users
        for (const user of users) {
          // create rbarrowsXXXX, sjeffersXXXX, and VPN LDAP accounts
          try {
            await ldap.createUsers({user})
          } catch (e) {
            console.log('ldap.createUsers error:', e.message)
            // error from LDAP that the new user's VPN password is not valid
            // (too short, etc.)
            const ldapPasswordError = /DSID-031A12D2/
            console.log('ldapPasswordError.test(e.message)', ldapPasswordError.test(e.message))
            if (ldapPasswordError.test(e.message)) {
              console.log('user password is invalid. updating user provision with error...')
              // user's password is not valid for LDAP to set their VPN user
              // password update user provision data so toolbox can notify user
              const updates = {
                provision: 'error',
                error: 'Invalid password. Please provision using a VPN password that is 10 or more characters.',
              }
              // update the user with the error
              toolbox.updateUser(user.id, updates)
              .then(r => {
                console.log('updated user', user.id, 'with invalid password provision error.')
              }).catch(e2 => {
                console.log('failed to update user', user.id, 'with invalid password provision error:', e2.message)
              })
              // mark user should not be provisioned in CJP and control hub
              errorUsers.push(user.id)
              // continue with next user
              continue
            }
          }
        }
        // provision the rest of the user stuff in CJP and control hub?
        if (process.env.PROVISION_ALL === 'true') {
          // filter out any users who had an error during LDAP provisioning
          const successfulUsers = users.filter(v => !errorUsers.includes(v.id))
          for (const user of successfulUsers) {
            await provision(user)
          }
        }
      } else {
        // no users to provision
      }
    } catch (e) {
      const s = e.message
      const message = `provision error: ${s}`
      console.log(message)
      // outgoing network error message (probably from Atlas)
      const generalNetworkError = /getaddrinfo ENOTFOUND|getaddrinfo EAI_AGAIN|connect ETIMEDOUT|504 Gateway Time-out/
      if (generalNetworkError.test(message)) {
        // just log to console - atlas-a.wbx2.com and
        // dcloud-collab-toolbox.cxdemo.net give these errors often and just
        // need to retry in a moment
      } else {
        // send any unexpected errors to teams logger
        teamsLogger.log(message)
      }
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