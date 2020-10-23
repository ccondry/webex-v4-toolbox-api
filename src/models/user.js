const ldap = require('../models/ldap')
const ldapjs = require('ldapjs')

// modify user object 
function modUser (user) {
  if (!user) {
    return user
  }
  // append enabled boolean from userAccountControl data
  const enabled = (user.userAccountControl & 2) != 2
  // append admin boolean
  // let admin
  // try {
  //   admin = user.memberOf.includes(process.env.LDAP_ADMIN_GROUP_DN)
  // } catch (e) {
  //   admin = false
  // }
  // append fullName
  const fullName = user.givenName + ' ' + user.sn

  return {
    ...user,
    fullName,
    enabled
  }
}

async function get (username) {
  try {
    const user = await ldap.getUser(username)
    return modUser(user)
  } catch (e) {
    throw e
  }
}

module.exports = {
  get,
  async list () {
    try {
      const users = await ldap.listUsers({})
      return users.map(modUser)
    } catch (e) {
      throw e
    }
  },
  async delete (username) {
    try {
      // get user CN
      const user = await get(username)
      // delete user from AD
      await ldap.deleteUser(user.cn)
    } catch (e) {
      throw e
    }
  },
  async enable (username) {
    return ldap.enableUser(username)
  },
  async disable (username) {
    return ldap.disableUser(username)
  },
  async create (username) {
    return ldap.createUser(username)
  },
  async extend (username, ms) {
    // calculate time
    const nowUtc = Date.now()
    const expiresUtc = nowUtc + ms
    const accountExpires = (10000 * expiresUtc) + 116444736000000000
    // create ldap change object
    const changeAccountExpires = new ldapjs.Change({
      operation: 'replace',
      modification: {
        accountExpires
      }
    })
    // set up changes we want to make to the user
    const changes = [changeAccountExpires]
    // change the user in ldap
    return ldap.changeUser({
      username,
      changes
    })
  }
}