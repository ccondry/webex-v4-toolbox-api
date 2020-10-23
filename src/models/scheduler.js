// scheduled jobs
// default to every 1 hour, modified in .env
const throttle = process.env.CHECK_EXPIRED_THROTTLE || 60
const checkExpiredUsersThrottle = 1000 * 60 * throttle
const ldap = require('./ldap')
const teamsLogger = require('./teams-logger')

function isExpired (user) {
  const expiresUtc = (user.accountExpires - 116444736000000000) / 10000
  return expiresUtc <= Date.now()
}

async function checkExpiredUsers () {
  // find users in the active group
  const activeUsers = await ldap.listUsers({
    filter: `(&(objectClass=user)(memberOf=${process.env.LDAP_ACTIVE_GROUP_DN}))`
  })
  // console.log('found', activeUsers.length, 'active users')

  let expiredCount = 0
  let activeCount = 0
  let successCount = 0
  const failed = []
  // check each user in active group for expiration
  for (const user of activeUsers) {
    // console.log(user.sAMAccountName, isExpired(user))
    if (isExpired(user)) {
      expiredCount++
      // remove user from group
      try {
        await ldap.removeFromGroup({
          userDn: user.dn,
          groupDn: process.env.LDAP_ACTIVE_GROUP_DN
        })
        successCount++
        // console.log('Removed', user.sAMAccountName, 'from Active group')
      } catch (e) {
        failed.push({
          username: user.sAMAccountName,
          message: e.message
        })
        console.log('Failed to remove', user.sAMAccountName, 'from Active group:', e.message)
      }
    } else {
      activeCount++
    }
  }

  if (activeUsers.length) {
    // console.log(`Found ${expiredCount} expired account(s) out of ${activeUsers.length} active accounts(s). Checking again in ${throttle} minutes.`)
    if (successCount > 0) {
      // console.log(`Successfully removed ${successCount} of the ${expiredCount} expired account(s). Checking again in ${throttle} minutes.`)
    }
    if (failed.length > 0) {
      const message = `Failed to remove ${failed.length} of the ${expiredCount} expired account(s):`
      console.log(message, failed.map(v => v.username))
      let markdown = message
      for (const f of failed) {
        markdown += `\r\n* **${f.username}** - ${f.message}`
      }
      teamsLogger.log({markdown})
    }
  } else {
    // console.log(`Found no active accounts. Checking again in ${throttle} minutes.`)
  }
}

function start () {
  // check all LDAP users to see if they have expired. remove them from active
  // group if they have expired.
  checkExpiredUsers()
  setInterval(checkExpiredUsers, checkExpiredUsersThrottle)
}

module.exports = {
  start
}