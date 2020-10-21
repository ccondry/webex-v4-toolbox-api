const ldap = require('../models/ldap')

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

module.exports = {
  async get (username) {
    try {
      const user = await ldap.getUser(username)
      return modUser(user)
    } catch (e) {
      throw e
    }
  },
  async list () {
    try {
      const users = await ldap.listUsers({})
      return users.map(modUser)
    } catch (e) {
      throw e
    }
  },
  async delete (username) {
    await ldap.deleteUser(username)
  },
  async enable (username) {
    await ldap.enableUser(username)
  },
  async disable (username) {
    await ldap.disableUser(username)
  },
  async create (username) {
    await ldap.deleteUser(username)
  }
}