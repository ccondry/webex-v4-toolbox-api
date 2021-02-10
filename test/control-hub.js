require('dotenv').config()
const globals = require('../src/models/globals')
const ch = require('../src/models/control-hub')

// load globals
Promise.resolve(globals.initialLoad)
.then(token => {
  // return ch.user.list()
  // both of these work
  // return ch.user.get('bbfb7247-bc41-4e29-a432-91c271485370')
  // return ch.user.get('rbarrows1234@cc1.dc-01.com')
  // return ch.user.get('rbarrows0609@cc1.dc-01.com')
  return ch.user.onboard('sjeffers1234@cc1.dc-01.com')
  // return ch.user.enableContactCenterAgent({email: 'sjeffers1234@cc1.dc-01.com'})
})
.then(r => {
  return ch.user.get('sjeffers1234@cc1.dc-01.com')
})
.then(r => console.log(r))
.catch(e => console.log(e))

// licenseID: [
//   'CJPPRM_1cf76371-2fde-4f72-8122-b6a9d2f89c73',
//   'MS_fe3cfc81-8469-4929-8944-23e79e5d0d53'
// ],
// entitlements: [
//   'spark',
//   'spark-admin',
//   'squared-fusion-mgmt',
//   'squared-room-moderation',
//   'webex-squared',
//   'cjp',
//   'cloud-contact-center-digital',
//   'cloud-contact-center'
// ],
// roles: [ 'id_readonly_admin', 'cjp.premium_agent', 'cjp.supervisor' ],