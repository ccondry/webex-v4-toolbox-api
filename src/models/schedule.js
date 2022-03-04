// the module to provision users
const provision = require('./provision')
const deprovision = require('./deprovision')
const toolbox = require('./toolbox')
const ch = require('./control-hub/client')
const globals = require('./globals')
const teamsLogger = require('./teams-logger')
const ldap = require('./ldap')
const teamsNotifier = require('./teams-notifier')
const NodeCache = require('node-cache')

// caching for file GET requests
const cache = new NodeCache({
  // keep in cache forever
  stdTTL: 0,
  // create copies of data
  useClones: true
})

// number of milliseconds to wait after completing the scheduled job before
// starting again
const throttle = 40 * 1000

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
    console.log('checking max users using Control Hub...')
    // wait for globals to exist
    console.log('waiting for global variables to exist...')
    await Promise.resolve(globals.initialLoad)
    console.log('global variables are set.')
    // max number of users that can be provisioned. more than this will trigger
    // deprovision. this is number of toolbox users.
    const maxUsers = parseInt(globals.get('webexV4MaxUsers'))
    console.log('global variables webexV4MaxUsers is', maxUsers)
    // number of users to delete below the maxUser limit
    const maxUsersBuffer = parseInt(globals.get('webexV4MaxUsersBuffer'))
    console.log('global variables webexV4MaxUsersBuffer is', maxUsersBuffer)
    // find license usage in control hub
    const client = await ch.getClient()
    const licenseUsage = await getLicenseUsageCount()
    // delete 10 users below the max, so that old users can be cycled out when
    // new users are waiting to be provisioned and we are at max capacity
    if (licenseUsage / 2 > maxUsers - maxUsersBuffer) {
      // too full - need to deprovision some users
      // const qtyUsersToDeprovision = cjpPremiumLicenses.usage / 2 - maxUsers + maxUsersBuffer
      // console.log('max users has been reached. we need to mark', qtyUsersToDeprovision, 'for deprovision.')
      // get all control hub users
      console.log('getting all users list from cjp...')
      const allUsers = await client.user.listAll()
      console.log('got all users list from cjp:', allUsers.length, 'users.')
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
      console.log('licensedUsers count =', licensedUsers.length)
      // find user provision info for this demo
      const query = {
        'demo.webex-v4prod.lastAccess': {$exists: 1},
        'demo.webex-v4prod.provision': 'complete'
      }
      // const projection = {password: false}
      const projection = {id: 1, 'demo.webex-v4prod.lastAccess': 1}
      const provisionedUsers = await toolbox.findUsers(query, projection)
      console.log('found', provisionedUsers.length, 'users with complete webex provision and a last access time in the toolbox')
      // filter provisioned toolbox users to those with matching licensed control hub users
      const userMap = provisionedUsers.filter(user => {
        return licensedUsers.find(agent => user.id === agent.userName.slice(8, 12))
      })
      console.log(userMap.length, 'users in userMap')
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
      const qtyUsersToDeprovision = licensedUsers.length / 2 - maxUsers + maxUsersBuffer
      // only continue if quantity to deprovision is 1 or more
      if (qtyUsersToDeprovision < 1) {
        return
      }
      console.log('selecting', qtyUsersToDeprovision, 'users to deprovision...')
      // select the quantity of users to delete from the end of the list (users with last access)
      const userIds = userMap.slice(-1 * qtyUsersToDeprovision).map(v => v.id)
      console.log('user IDs to deprovision:', userIds)
      if (userIds.length === 0) {
        console.log('no users to deprovision at this time.')
        // no users to deprovision. done.
        return
      }
      const filter = {id: {$in: userIds}}
      const updates = {provision: 'delete'}
      // log to webex staff room
      teamsNotifier.markDeprovision(userIds)
      // update toolbox database
      toolbox.updateDemoUsers(filter, updates)
    } else {
      // not full - return empty array
      // return []
    }
  } catch (e) {
    throw e
  }
}

async function updateLicenseUsageCache () {
  try {
    const client = await ch.getClient()
    cache.set('licenseUsage', await client.org.getLicenseUsage())
  } catch (e) {
    throw e
  }
}

// find CJPPRM license usage in control hub
async function getLicenseUsageCount () {
  try {
    // check cache
    let licenseUsage = cache.get('licenseUsage')
    // if cache miss
    if (!licenseUsage) {
      // update cache
      await updateLicenseUsageCache()
      // get cache again
      licenseUsage = cache.get('licenseUsage')
    }
    
    // return cjpprm usage value from cache
    const cjpPremiumLicenses = licenseUsage[0].licenses.find(v => v.offerName === 'CJPPRM')
    return cjpPremiumLicenses.usage
  } catch (e) {
    throw e
  }
}

async function go () {
  // check if there are too many users provisioned
  try {
    await checkMaxUsers()
  } catch (e) {
    console.log('failed to check max users:', e)
  }
  console.log('done checking max users.')
  // get list of users to deprovision
  try {
    console.log('getProvisionDeletingUsers...')
    const users = await getProvisionDeletingUsers()
    console.log(users.length, 'users to deprovision.')
    if (users.length > 0) {
      console.log(`starting deprovision for ${users.length} users`)
    }
    for (const user of users) {
      await deprovision(user)
    }
  } catch (e) {
    console.log('deprovision error:', e.message)      
  }
  console.log('getProvisionDeletingUsers done.')
  // get list of users to provision
  try {
    // wait for globals to exist
    console.log('getProvisionStartedUsers...')
    let users = await getProvisionStartedUsers()
    console.log(users.length, 'users need to be provisioned.')
    // get max users number
    await Promise.resolve(globals.initialLoad)
    console.log('global variables are loaded.')
    const maxUsers = parseInt(globals.get('webexV4MaxUsers'), 10)
    const licenseUsageCount = await getLicenseUsageCount()
    console.log('licenseUsageCount =', licenseUsageCount)
    // check if provision amount would be too many
    if (licenseUsageCount / 2 + users.length > maxUsers) {
      console.log('current license users count', licenseUsageCount / 2 + users.length, 'is greater than max users value of', maxUsers)
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
        // update the license usage count
        updateLicenseUsageCache()
      }
    } else {
      // no users to provision
    }
  } catch (e) {
    const s = e.message
    const message = `provision error: ${s}`
    console.log(message)
    // outgoing network error message (probably from Atlas)
    const generalNetworkError = /getaddrinfo ENOTFOUND|getaddrinfo EAI_AGAIN|connect ETIMEDOUT|read ECONNRESET|504 Gateway Time-out|502 Bad Gateway/
    if (generalNetworkError.test(message)) {
      // just log to console
      // atlas-a.wbx2.com and dcloud-collab-toolbox.cxdemo.net give these
      // errors often and just need to retry in a moment
      console.log(message)
    } else {
      // send any other, unexpected errors to teams logger
      teamsLogger.log(message)
    }
  }
  console.log('provision check complete. next check in', Math.round(throttle / 1000), 'seconds.')
  // set timer to call this function again
  setTimeout(go, throttle)
}

go()

// setInterval(go, throttle)

module.exports = {
  getProvisionDeletingUsers
}