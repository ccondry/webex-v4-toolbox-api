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

async function main (username) {
  // console.log('now', now)
  // replace user account control bits
  const changeAccountExpires = new ldap.Change({
    operation: 'replace',
    modification: {
      accountExpires
    }
  })

  // set up changes we want to make to the user
  const changes = [
    changeAccountExpires
  ]

  // go
  const response = await client.changeUser({
    adminDn: process.env.LDAP_ADMIN_DN,
    adminPassword: process.env.LDAP_ADMIN_PASSWORD,
    username,
    changes
  })
  console.log('changeAccountExpires done')


  // modify group to add user to it
  try {
    await client.addToGroup({
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
      userDn: `CN=${username},${process.env.LDAP_BASE_DN}`,
      groupDn: process.env.LDAP_ACTIVE_GROUP_DN
    })
    console.log('add to group succeeded')
  } catch (e) {
    // check for EntryAlreadyExistsError
    console.log('add to group failed:', e.message)
    if (e.message.match(/DSID-031A11C4/)) {
      console.log(`${username} is already in ${process.env.LDAP_BASE_DN}`)
    } else {
       throw e
    }
  }

  try {
    await client.removeFromGroup({
      adminDn: process.env.LDAP_ADMIN_DN,
      adminPassword: process.env.LDAP_ADMIN_PASSWORD,
      userDn: `CN=${username},${process.env.LDAP_BASE_DN}`,
      groupDn: process.env.LDAP_ACTIVE_GROUP_DN
    })
    console.log('remove from group succeeded')
  } catch (e) {
    // check for WillNotPerform
    console.log('remove from group failed:', e.message)
    if (e.message.match(/DSID-031A1236/)) {
      console.log(`${username} is not in ${process.env.LDAP_BASE_DN}`)
    } else {
       throw e
    }
  }
}

// go
main('ccondry')
.then(rsp => {
  console.log('ldap done')
})
.catch(error => {
  console.log('ldap error', error.message)
})