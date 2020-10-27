// scheduled jobs
// number of days after which an expired account should be deleted
const deleteAfter = process.env.DELETED_EXPIRED_AFTER || 90
// default to every 1 hour, modified in .env
const checkActiveUsersThrottle = 1000 * 60 * (process.env.CHECK_ACTIVE_THROTTLE || 60)
const checkExpiredUsersThrottle = 1000 * 60 * (process.env.CHECK_EXPIRED_THROTTLE || 60)
const ldap = require('./ldap')
const teamsLogger = require('./teams-logger')
const cms = require('./cms')

function isExpired (user) {
  const expiresUtc = (user.accountExpires - 116444736000000000) / 10000
  return expiresUtc <= Date.now()
}

function shouldDelete (user) {
  // console.log('should delete', user.sAMAccountName, '?')
  const expiresUtc = (user.accountExpires - 116444736000000000) / 10000
  const nowUtc = Date.now()
  const oldestUtc = nowUtc + (deleteAfter * 24 * 60 * 60 * 1000)
  // console.log('oldestUtc', oldestUtc)
  return expiresUtc < oldestUtc
}

async function checkExpiredUsers () {
  // console.log('check expired users')
  // find not in the active group
  const inactiveUsers = await ldap.listUsers({
    filter: `(&(objectClass=user)(!(memberOf=${process.env.LDAP_ACTIVE_GROUP_DN})))`
  })
  // console.log('found', inactiveUsers.length, 'inactive users')
  const failed = []
  let deletedCount = 0
  // check each user not in active group for deletion
  for (const user of inactiveUsers) {
    // should we delete user or remove them from Active group?
    if (shouldDelete(user)) {
      // user expired so long ago that we should delete them
      try {
        // delete the user in LDAP
        await ldap.deleteUser(user.cn)
        deletedCount++
      } catch (e) {
        // failed to delete from LDAP
        failed.push({
          username: user.sAMAccountName,
          message: e.message
        })
        console.log('Failed to delete', user.sAMAccountName, 'from LDAP:', e.message)
      }
    }
  }
  // log any failures
  if (failed.length > 0) {
    const message = `Failed to delete ${failed.length} of the ${inactiveUsers.length} accounts(s) that were expired for more than ${deletAfter} days:`
    console.log(message, failed.map(v => v.username))
    let markdown = message
    for (const f of failed) {
      markdown += `\r\n* **${f.username}** - ${f.message}`
    }
    teamsLogger.log({markdown})
  }
  // if any LDAP accounts were deleted, initiate a CMS-LDAP sync
  if (deletedCount > 0) {
    try {
      await cms.sync()
    } catch (e) {
      throw e
    }
  }
}

async function checkActiveUsers () {
  // find users in the active group
  const activeUsers = await ldap.listUsers({
    filter: `(&(objectClass=user)(memberOf=${process.env.LDAP_ACTIVE_GROUP_DN}))`
  })
  // console.log('found', activeUsers.length, 'active users')

  let expiredCount = 0
  // let activeCount = 0
  let successCount = 0
  const failed = []
  // check each user in active group for expiration
  for (const user of activeUsers) {
    // console.log(user.sAMAccountName, isExpired(user))
    // check if we should delete it
    if (isExpired(user)) {
      expiredCount++
      // not old enough to delete, so just remove user from Active group
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
      // activeCount++
    }
  }

  if (activeUsers.length) {
    // console.log(`Found ${expiredCount} expired account(s) out of ${activeUsers.length} active accounts(s). Checking again in ${throttle} minutes.`)
    // if (successCount > 0) {
      // console.log(`Successfully removed ${successCount} of the ${expiredCount} expired account(s). Checking again in ${throttle} minutes.`)
    // }
    if (failed.length > 0) {
      const message = `Failed to remove ${failed.length} of the ${expiredCount} expired account(s) from the Active group:`
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

  // if any LDAP accounts were removed from Active, initiate a CMS-LDAP sync
  if (successCount > 0) {
    try {
      await cms.sync()
    } catch (e) {
      throw e
    }
  }
}

async function start () {
  try {
    // check active LDAP users to see if they have expired. remove them from the
    // active group if they have expired.
    await checkActiveUsers()
    setInterval(checkActiveUsers, checkActiveUsersThrottle)

    // check expired users to see if they need to be deleted. delete them if so.
    await checkExpiredUsers()
    setInterval(checkExpiredUsers, checkExpiredUsersThrottle)
  } catch (e) {
    console.log(e)
    teamsLogger.log(`Failed to start checks for active and expired users: ${e.message}`)
  }
}

module.exports = {
  start
}