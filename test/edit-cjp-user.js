require('dotenv').config()
const cjp = require('../src/models/cjp/client')
async function main () {
  try {
    const response = await cjp.user.list()
    const users = response.details.users
    const user = users.find(v => v.attributes.login__s === 'sjeffers0325@cc1.dc-01.com')
    console.log(user)
    user.attributes.passwordLastModifiedTime__l = 0
    user.attributes.secretQuestion__s = null
    user.attributes.passwordPolicyId__s = null
    user.attributes.passwordHistoryData__s = ''
    user.attributes.extMultimediaProfileId__s = null
    user.password = null
    delete user.attributes.legacyPassword__s
    delete user.attributes.password__s
    delete user.attributes.sid__s
    delete user.attributes.sid  
    delete user.attributes.tid__s
    delete user.attributes.tid
    delete user.attributes.cstts__l
    console.log('modified user:', user)
    const response2 = await cjp.user.modify(user.id, user)
    console.log('done:', response2)
  } catch (e) {
    console.log(e)
  }
}

main()
