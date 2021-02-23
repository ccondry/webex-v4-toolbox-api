require('dotenv').config()
const cjp = require('../src/models/cjp/client')

async function user () {
  const response = await cjp[type].list()
  const items = response.details.users
  const dupes = items.filter(a => {
    // find any items where the dbId is the same
    const duplicates = items.filter(b => {
      // return a.attributes.dbId__l === b.attributes.dbId__l
      // return a.id === b.id
      return a.attributes.login__s === b.attributes.login__s
    })
    if (duplicates.length > 1) {
      return true
    } else {
      return false
    }
  })

  return dupes
}
  
async function main (type = 'team') {
  const response = await cjp[type].list()
  const items = response.auxiliaryDataList
  const dupes = items.filter(a => {
    // find any items where the dbId is the same
    const duplicates = items.filter(b => {
      // return true
      // return a.attributes.dbId__l === b.attributes.dbId__l
      return a.id === b.id ||
      a.attributes.name__s === b.attributes.name__s
    })
    if (duplicates.length > 1) {
      return true
    } else {
      return false
    }
  })

  return dupes
}
  
// user
// .then(dupes => {
//   console.log('user dupes', dupes.length)
// })
// .catch(e => console.log('error', e))

const type = 'userProfile'

main(type)
.then(dupes => {
  console.log(type, 'dupes', dupes.length)
})
.catch(e => console.log('error', e))
