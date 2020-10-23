const ldap = require('../models/ldap')
const ldapjs = require('ldapjs')

// modify user object return data
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

// get one LDAP user
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
  // list all LDAP users
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
  // enable LDAP user
  async enable (username) {
    return ldap.enableUser(username)
  },
  // disable LDAP user
  async disable (username) {
    return ldap.disableUser(username)
  },
  // create LDAP user
  async create (user) {
    return ldap.createUser(user)
  },
  // set LDAP user accountExpires time to current time + ms milliseconds
  // also puts user back into the 'active' LDAP group, if they are not in it
  async extend (username, ms) {
    // calculate time
    const nowUtc = Date.now()
    const expiresUtc = nowUtc + ms
    const accountExpires = (10000 * expiresUtc) + 116444736000000000
    // create ldap change object
    try {
      const changeAccountExpires = new ldapjs.Change({
        operation: 'replace',
        modification: {
          accountExpires
        }
      })
      const addMemberOf = new ldapjs.Change({
        operation: 'add',
        modification: {
          memberOf: process.env.LDAP_ACTIVE_GROUP_DN
        }
      })

      // set up changes we want to make to the user
      const changes = [
        changeAccountExpires,
        addMemberOf
      ]

      // change the user in ldap and return the results
      return ldap.changeUser({
        username,
        changes
      })
    } catch (e) {
      throw e
    }
  }
}