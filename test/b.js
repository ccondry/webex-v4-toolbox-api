require('dotenv').config()
require('../src/models/schedule')

// const db = require('../src/models/db')
// const ch = require('../src/models/control-hub/client')

// async function getProvisionDeletingUsers () {
//   try {
//     // find license usage in control hub
//     const client = await ch.getClient()
//     const licenseUsage = await client.org.getLicenseUsage()
//     // console.log('licenseUsage', licenseUsage)
//     const cjpPremiumLicenses = licenseUsage[0].licenses.find(v => v.offerName === 'CJPPRM')

//     // console.log('cjpPremiumLicenses', cjpPremiumLicenses)
//     // if license usage of CJP premium is > 95%
//     // if (cjpPremiumLicenses.usage / cjpPremiumLicenses.volume >= 0.95) {

//     // const full = cjpPremiumLicenses.volume - cjpPremiumLicenses.usage <= 10
//     const full = true
//     if (full) {
//       // too full - need to deprovision some users
//       // get all control hub users
//       const allUsers = await client.user.listAll()
//       // filter control hub users that do not have CJPPRM license
//       const licensedUsers = allUsers.filter(user => {
//         try {
//           const regex = /\d{4}/
//           // true if username contains 4-digit ID
//           return user.userName.slice(8, 12).match(regex) &&
//           // and user has CJP Premium license assigned
//           user.licenseID.includes('CJPPRM_1cf76371-2fde-4f72-8122-b6a9d2f89c73')
//         } catch (e) {
//           return false
//         }
//       })
//       // find user provision info for this demo, sorted by most recent lastAccess first
//       const query = {demo: 'webex', version: 'v4prod', lastAccess: {$exists: 1}}
//       const projection = {}
//       const provisionedUsers = await db.find('toolbox', 'provision', query, projection)
//       console.log('provisionedUsers', provisionedUsers)
//       const userMap = licensedUsers.map(user => {
//         // find matching provision info
//         const userId = user.userName.slice(8, 12)
//         console.log('userId', userId)
//         const provision = provisionedUsers.find(v => v.id === userId)
//         const ret = {
//           username: user.userName,
//           id: user.id,
//           licenses: user.licenseID
//         }
//         if (provision) {
//           ret.lastAccess = provision.lastAccess
//         }
//         return ret
//       })
//       // sort by last access time
//       userMap.sort((a, b) => new Date(b.lastAccess || 0) - new Date(b.lastAccess || 0))
//       console.log('userMap', userMap)
//     }
//   } catch (e) {
//     console.log('error', e.message)
//   }
// }

// getProvisionDeletingUsers()