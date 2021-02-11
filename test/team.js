
require('dotenv').config()
const cjp = require('../src/models/cjp')

// async function main () {
//   try {
//     return await cjp.team.list()
//   } catch (e) {
//     throw e
//   }
// }

// const userId = '1234'
// const name = `T_dCloud_${userId}`
// console.log('name', name)
// cjp.team.create(name)
// .then(r => {
//   console.log('created?', r)
//   return main()
// })
// // main()
// .then(r => {
//   const existing = r.auxiliaryDataList.find(c => {
//     return c.attributes.name__s === name
//   })
//   console.log('done:', existing)
// })
// .catch(e => {
//   console.log('error', e.message)
// })

cjp.team.list()
.then(r => {
  const found = r.auxiliaryDataList.find(v => v.id === process.env.CJP_GLOBAL_TEAM_ID)
  console.log('found:', found)
})
.catch(e => {
  console.log('error', e.message)
})