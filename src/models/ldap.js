const ldapClient = require('simple-ldap-client')

// set up ldap client
const ldap = new ldapClient(process.env.LDAP_URL, process.env.LDAP_BASE_DN)

const attributes = [
  'objectGUID',
  'name',
  'sAMAccountName',
  'cn',
  'memberOf',
  'memberof',
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
  'userAccountControl',
  'accountExpires'
]

async function deleteUser (cn) {
  // console.log('delete user', cn)
  try {
    const params = {
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
      userDn: `CN=${cn},${process.env.LDAP_BASE_DN}`
      // userDn: username
    }
    await ldap.deleteUser(params)
  } catch (error) {
    console.log('failed to delete LDAP user:', error.message)
    throw error
  }
}

async function disableUser (username) {
  try {
    const params = {
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
      username
    }
    await ldap.disableUser(params)
  } catch (error) {
    console.log('failed to disable LDAP user:', error.message)
    throw error
  }
}

async function enableUser (username) {
  try {
    const params = {
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
      username
    }
    await ldap.enableUser(params)
  } catch (error) {
    console.log('failed to enable LDAP user:', error.message)
    throw error
  }
}

async function listUsers ({
  filter = '(&(objectClass=user)(objectcategory=person))'
}) {
  return ldap.listUsers({
    adminDn: process.env.LDAP_ADMIN_DN,
    adminPassword: process.env.LDAP_ADMIN_PASSWORD,
    filter,
    attributes,
    searchDn: process.env.LDAP_BASE_DN
  })
}

async function addToGroup (body) {
  const userDn = body.userDn
  const groupDn = body.groupDn
  // console.log('request to add LDAP user', userDn, 'to group', groupDn)
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
    // console.log('failed to add LDAP user', userDn, 'to group', groupDn, ':', error.message)
    throw error
  }
}

async function removeFromGroup ({userDn, groupDn}) {
  try {
    await ldap.removeFromGroup({
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
      userDn,
      groupDn
    })
    // done
    return
  } catch (rejectMessage) {
    // failed
    // console.log('failed to remove LDAP user', userDn, 'from group', groupDn, ':', error.message)
    throw Error(rejectMessage)
  }
}

async function getUser (username) {
  // console.log('request to get user', username)
  // const domain = process.env.LDAP_DOMAIN
  // const upn = username + '@' + domain

  try {
    // console.log('running ldap.adminGetUser...')
    const user = await ldap.adminGetUser({
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
      username,
      attributes
    })
    return user
  } catch (e) {
    console.log(e)
    // failed
    console.log('failed to get LDAP user', username, e.message)
    throw new Error('failed to get LDAP user ' + username + ':' + e.message)
  }
}

async function resetPassword (body) {
  try {
    if (!body.newPassword) {
      const error = 'newPassword is required to reset a password'
      // console.log(error)
      throw new Error(error)
    }
    if (
      (!body.userDn || body.userDn === '') &&
      (!body.upn || body.upn === '') &&
      (!body.username || body.username === '') &&
      (!body.email || body.email === '')
    ) {
      const error = 'userDn, upn, username, or email is required to reset a password'
      // console.log(error)
      throw new Error(error)
    }
    const adminCreds = {
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
    }
    // mix in credentials with user request data, and send request
    let params = Object.assign({}, adminCreds, body)
    await ldap.resetPassword(params)
    // console.log('password reset successfully for ' + user)
    return
  } catch (error) {
    // ... erroror checks
    // console.log(error)
    throw new Error(error)
  }
}

async function changePassword (body) {
  // console.log('password change request received for username ' + body.username)
  try {
    await ldap.changePassword({
      username: body.username,
      newPassword: body.newPassword,
      oldPassword: body.oldPassword
    })

    console.log('password change successful for username ' + body.username)
    return
  } catch (error) {
    // console.log(error)
    throw new Error(error)
  }
}

function _createUser (adminCreds, dn, body) {
  return new Promise((resolve, reject) => {
    // create client connection
    const client = ldap.getClient()
    // catch LDAP connection errors
    client.on('connectError', function (err) {
      console.log('Error connecting to LDAP:', err)
      reject(err)
    })
    // login to LDAP
    client.bind(adminCreds.adminDn, adminCreds.adminPassword, (err) => {
      if (err) {
        console.log(err)
        client.destroy()
        return reject(err)
      }
      body.objectClass = body.objectClass || ["top", "person", "organizationalPerson", "user"]
      console.log('really creating LDAP user', dn, body)
      // create new user
      client.add(dn, body, (err2, user) => {
        client.destroy()
        console.log(err2)
        if (err2) reject(err2)
        resolve(user)
      })
    })
  })
}

async function createUser (dn, body, newPassword) {
  console.log('creating LDAP user', dn, body)
  try {
    // console.log('creating new LDAP user', body.username, '...')
    const adminCreds = {
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD
    }

    // create the user
    try {
      await _createUser(adminCreds, dn, body)
      // console.log('successfully created new LDAP user')
    } catch (e) {
      if (e.message.includes('ENTRY_EXISTS')) {
        // continue if ldap account exists
        console.log('LDAP user already exists. continuing.')
      } else {
        throw e
      }
    }
    // set new user password
    await ldap.resetPassword({...adminCreds, newPassword})
    // enable new user
    await ldap.enableUser(adminCreds)
    // set new user expiration to 12 hours from now
    // await user.extend(body.sAMAccountName, 12 * 60 * 60 * 1000)
    // calculate time
    const nowUtc = Date.now()
    const expiresUtc = nowUtc + 12 * 60 * 60 * 1000
    const accountExpires = (10000 * expiresUtc) + 116444736000000000
    // update user accountExpires attribute
    await ldap.changeUser({
      username,
      operation: 'replace',
      modification: {
        accountExpires
      }
    })
    return
  } catch (error) {
    // console.log('failed to create LDAP user:', error.message)
    throw error
  }
}

async function changeUser ({username, operation, modification}) {
  // set up changes we want to make to the user
  const change = new ldap.ldapjs.Change({
    operation,
    modification
  })

  // change the user expiration in ldap
  await ldap.changeUser({
    username,
    changes: [change]
  })

  return ldap.changeUser({
    adminDn: process.env.LDAP_ADMIN_DN,
    adminPassword: process.env.LDAP_ADMIN_PASSWORD,
    username,
    changes
  })
}

module.exports = {
  getUser,
  resetPassword,
  changePassword,
  createUser,
  addToGroup,
  removeFromGroup,
  listUsers,
  enableUser,
  disableUser,
  deleteUser,
  client: ldap,
  changeUser
}
