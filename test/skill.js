require('dotenv').config()
const cjp = require('../src/models/cjp')

async function main () {
  try {
    return await cjp.skill.list()
  } catch (e) {
    throw e
  }
}

// go
main()
.then(r => {
  console.log('done:', JSON.stringify(r, null, 2))
})
.catch(e => {
  console.log('error', e.message)
})