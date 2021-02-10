require('dotenv').config()
const cjp = require('../src/models/cjp')
cjp.user.list()
.then(allCjpUsers => {
  console.log('allCjpUsers', allCjpUsers.map(v => {
    return {
      id: v.id,
      login: v.attributes.login__s,
      skill: v.attributes.skillProfileId__s
    }
  }))
  // const rick = allCjpUsers.find(v => v.attributes.login === 'rbarrows1234@cc1.dc-01.com')
  // console.log('rick', rick)
})
.catch(e => console.log('error', e))
