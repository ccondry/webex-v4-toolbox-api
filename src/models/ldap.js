const ldapClient = require('simple-ldap-client')
const getHash = require('./get-hash')
const toolbox = require('./toolbox')
// set up ldap client
const ldap = new ldapClient(process.env.LDAP_URL, process.env.LDAP_BASE_DN)
const userSearchDn = process.env.LDAP_USER_SEARCH_DN || 'OU=Sync2Webex,DC=dcloud,DC=cisco,DC=com'
const attributes = [
  'objectGUID',
  'name',
  'sAMAccountName',
  'memberOf',
  'primaryGroupID',
  'description',
  'physicalDeliveryOfficeName',
  'distinguishedName',
  'mail',
  'userPrincipalName',
  'whenChanged',
  'whenCreated',
  'givenName',
  'sn',
  'telephoneNumber',
  'userAccountControl'
]

// list users in our search DN
async function listUsers ({
  attributes = [
    'objectGUID',
    'name',
    'sAMAccountName',
    'memberOf',
    'primaryGroupID',
    'description',
    'physicalDeliveryOfficeName',
    'distinguishedName',
    'mail',
    'userPrincipalName',
    'whenChanged',
    'whenCreated',
    'givenName',
    'sn',
    'telephoneNumber',
    'userAccountControl'
  ],
  filter = '(&(objectClass=user)(objectcategory=person))'
}) {
  return ldap.listUsers({
    adminDn: process.env.LDAP_ADMIN_DN,
    adminPassword: process.env.LDAP_ADMIN_PASSWORD,
    filter,
    attributes,
    searchDn: process.env.LDAP_USER_SEARCH_DN
  })
}

// add a user 
async function addToGroup (body) {
  const userDn = body.userDn
  const groupDn = body.groupDn
  console.log('request to add LDAP user', userDn, 'to group', groupDn)
  try {
    await ldap.addToGroup({
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
      userDn,
      groupDn
    })
    // done
    return
  } catch (error) {
    // failed
    console.log('failed to add LDAP user', userDn, 'to group', groupDn, ':', error.message)
    throw error
  }
}

async function getUser (username) {
  console.log('request to get user', username)
  const domain = process.env.LDAP_DOMAIN
  const upn = username + '@' + domain

  try {
    console.log('running ldap.adminGetUser...')
    const user = await ldap.adminGetUser({
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
      upn,
      attributes
    })
    console.log('ldap.adminGetUser finished.')
    if (user) {
      // respond OK with user info
      return user
    } else {
      throw new Error('No LDAP user found matching ' + upn)
    }
  } catch (e) {
    // failed
    console.log('failed to get LDAP user', upn, e.message)
    throw new Error('failed to get LDAP user ' + upn + ':' + e.message)
  }
}

async function resetPassword (body) {
  try {
    if (!body.newPassword) {
      const error = 'newPassword is required to reset a password'
      console.log(error)
      throw new Error(error)
    }
    if (
      (!body.userDn || body.userDn === '') &&
      (!body.upn || body.upn === '') &&
      (!body.username || body.username === '') &&
      (!body.email || body.email === '')
    ) {
      const error = 'userDn, upn, username, or email is required to reset a password'
      console.log(error)
      throw new Error(error)
    }
    const user = body.userDn || body.upn || body.username || body.email
    console.log('password reset request received for ' + user)

    const adminCreds = {
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
    }
    // mix in credentials with user request data, and send request
    let params = Object.assign({}, adminCreds, body)
    await ldap.resetPassword(params)
    console.log('password reset successfully for ' + user)
    return
  } catch (error) {
    // ... erroror checks
    console.log(error)
    throw new Error(error)
  }
}

async function changePassword (body) {
  console.log('password change request received for username ' + body.username)
  try {
    await ldap.changePassword({
      username: body.username,
      newPassword: body.newPassword,
      oldPassword: body.oldPassword
    })

    console.log('password change successful for username ' + body.username)
    return
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

async function createUser (body) {
  try {
    console.log('creating new LDAP user', body.username, '...')
    const adminCreds = {
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD
    }
    // mix in credentials with user request data, and send request
    let params = Object.assign({}, adminCreds, body)
    // remove any undefined or empty string values
    const keys = Object.keys(params)
    for (const key of keys) {
      if (typeof params[key] === 'undefined' || params[key].length === 0) {
        delete params[key]
      }
    }
    console.log('creating new LDAP user...')
    // create the user
    try {
      await ldap.createUser(params)
      console.log('successfully created new LDAP user')
    } catch (e) {
      if (e.message.includes('ENTRY_EXISTS')) {
        // continue if ldap account exists
        console.log('LDAP user already exists. continuing.')
      } else {
        throw e
      }
    }
    console.log('resetting the LDAP user password...')
    params.newPassword = params.password
    await ldap.resetPassword(params)
    console.log('successfully reset password for LDAP user. enabling user account...')
    await ldap.enableUser(params)
    console.log('successfully enabled LDAP user account. done creating user.')
    return
  } catch (error) {
    console.log('failed to create LDAP user:', error.message)
    throw error
  }
}

async function lockUser ({username, lock}) {
  console.log('received request to lock/unlock user account')
  // validate input
  if (!username) {
    // invalid input
    const message = 'could not lock/unlock user account. username is a required query parameter.'
    console.log(message, 'query =', query)
    throw new Error(message)
  }
  try {
    // lock or unlock?
    const operation = lock ? 'lock' : 'unlock'
    const options = {
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
      username
    }
    if (lock) {
      // lock
      await ldap.disable(options)
      console.log('successfully locked (disabled) LDAP account for', username)
      return
    } else {
      // unlock
      await ldap.enable(options)
      console.log('successfully unlocked (enabled) LDAP account for', username)
      return
    }
  } catch (e) {
    console.log(e)
    throw new Error(e)
  }
}

async function createUsers ({
  user,
  password = 'C1sco12345'
}) {
  const userId = user.id
  try {
    await createUser({
      firstName: 'Rick Barrows',
      lastName: userId,
      username: 'rbarrows' + userId,
      commonName: 'Rick ' + userId,
      domain: process.env.DOMAIN,
      physicalDeliveryOfficeName: userId,
      telephoneNumber: '82' + userId,
      userId,
      email: 'rbarrows' + userId + '@' + process.env.DOMAIN,
      description: 'Rick ' + userId,
      usersDn: process.env.LDAP_USER_SEARCH_DN,
      password
    })

    console.log(`LDAP provision successful for user Rick ${userId}`)
    
    await createUser({
      firstName: 'Sandra Jefferson' ,
      lastName: userId,
      username: 'sjeffers' + userId,
      commonName: 'Sandra ' + userId,
      domain: process.env.DOMAIN,
      physicalDeliveryOfficeName: userId,
      telephoneNumber: '80' + userId,
      userId,
      email: 'sjeffers' + userId + '@' + process.env.DOMAIN,
      description: 'Sandra ' + userId,
      usersDn: process.env.LDAP_USER_SEARCH_DN,
      password
    })
    
    console.log(`LDAP provision successful for user Sandra ${userId}`)
    if (user.demo && user.demo['webex-v4prod'] && user.demo['webex-v4prod'].password) {
      // create username from hash of user email
      const username = getHash(user.email)
      await createUser({
        firstName: user.firstName,
        lastName: user.lastName,
        username,
        commonName: `${user.firstName} ${user.lastName}`,
        domain: process.env.DOMAIN,
        physicalDeliveryOfficeName: user.id,
        email: user.email,
        description: 'user ' + user.id,
        usersDn: process.env.LDAP_VPN_USER_SEARCH_DN,
        password: await decrypt(user.demo['webex-v4prod'].password)
      })
      console.log(`LDAP provision successful for VPN user ${user.firstName} ${user.lastName} (${user.id})`)
      // store username hash in user object
      await toolbox.updateUser(userId, {
        vpnUsername: username
      })
    }
  } catch (e) {
    console.log('Failed LDAP provision for user', userId, ':', e.message)
  }
}

async function deleteUser (cn, searchDn) {
  return ldap.deleteUser({
    adminDn: process.env.LDAP_ADMIN_DN,
    adminPassword: process.env.LDAP_ADMIN_PASSWORD,
    userDn: `CN=${cn},${searchDn || userSearchDn}`
  })
}

async function deleteUsers (user) {
  try {
    try {
      await deleteUser('Rick ' + user.id)
    } catch (e) {
      if (e.message.match('NO_OBJECT')) {
        // continue - user already deleted
      } else {
        throw e
      }
    }
    try {
      await deleteUser('Sandra ' + user.id)
    } catch (e) {
      if (e.message.match('NO_OBJECT')) {
        // continue - user already deleted
      } else {
        throw e
      }
    }
    try {
      await deleteUser(getHash(user.email), process.env.LDAP_VPN_USER_SEARCH_DN)
    } catch (e) {
      if (e.message.match('NO_OBJECT')) {
        // continue - user already deleted
      } else {
        throw e
      }
    }
    // done
    console.log('successfully deprovisioned LDAP users in dCloud Webex CC v4 dCloud session.')
  } catch (e) {
    console.log('failed to deprovision LDAP users in dCloud Webex CC v4 dCloud session:', e.message)
    throw e
  }
}

module.exports = {
  // su,
  getUser,
  resetPassword,
  changePassword,
  createUser,
  createUsers,
  addToGroup,
  lockUser,
  listUsers,
  deleteUser,
  deleteUsers
}