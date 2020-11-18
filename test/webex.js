require('dotenv').config()
const model = require('../src/models/control-hub/token')

async function main () {
  const token = await model.refresh()
  console.log('got refresh token:', token)
}

main().catch(e => console.log(e))