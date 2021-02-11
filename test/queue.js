require('dotenv').config()

//cwcc Library
const cjp = require('../src/models/cjp/client')

// find routing strategy matching name
cjp.queue.list()
.then(r => {
  const d = r.auxiliaryDataList
  .filter(v => v.attributes.name__s.slice(-4) === '1234')
  // .map(v => {
  //   return {
  //     id: v.id,
  //     name: v.attributes.name__s
  //   }
  // })
  console.log(JSON.stringify(d, null, 2))
})
.catch(e => console.log(e))
