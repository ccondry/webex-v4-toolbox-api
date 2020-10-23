require('dotenv').config()
// ldap library
const ldap = require('ldapjs')
const ldapClient = require('simple-ldap-client')

// set up ldap client
const client = new ldapClient(process.env.LDAP_URL, process.env.LDAP_BASE_DN)

// 1603448000105
// const nowUtc = new Date().getTime()
const nowUtc = Date.now()
// add 12 hours
// const expiresUtc = nowUtc + (12 * 60 * 60 * 1000)
const accountExpires = (10000 * nowUtc) + 116444736000000000

// console.log('now', now)
// replace user account control bits
const changeAccountExpires = new ldap.Change({
  operation: 'replace',
  modification: {
    accountExpires
  }
})

// set up changes we want to make to the user
const changes = [changeAccountExpires]

// ldapChanges.constants.disabled: UF_ACCOUNTDISABLE,
  // passwordNotRequired: UF_PASSWD_NOTREQD,
  // passwordCantChange: UF_PASSWD_CANT_CHANGE,
  // normalAccount: UF_NORMAL_ACCOUNT,
  // dontExpirePassword: UF_DONT_EXPIRE_PASSWD,
  // passwordExpired: UF_PASSWORD_EXPIRED

// go
client.changeUser({
  adminDn: process.env.LDAP_ADMIN_DN,
  adminPassword: process.env.LDAP_ADMIN_PASSWORD,
  username: 'ccondry',
  changes
})
.then(rsp => {
  console.log('done', rsp)
})
.catch(error => {
  console.log('error', error)
})
