require('dotenv').config
const ch = require('../src/models/control-hub')

ch.user.setRoles({
  email: 'rbarrows1234@cc1.dc-01.com',
  roles: [{roleName: 'CJP_PREMIUM_AGENT', roleState: 'ACTIVE'}]
})
.then(r => console.log('success:', r))
.catch(e => console.log('error:', e))