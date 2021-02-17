require('dotenv').config()
const broadcloud = require('../src/models/broadcloud')

broadcloud.getSites()
.then(r => {
  console.log(r)
  process.exit(0)
})
.catch(e => {
  console.log(e.message)
  process.exit(1)
})