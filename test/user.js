require('dotenv').config()

const cjp = require('../src/models/cjp')

// Sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main (userId) {
  try {
    // go
    const user = await cjp.user.get('rbarrows0325@cc1.dc-01.com')
    return user 
  } catch (e) {
    console.log(e)
    // wait 10 seconds before trying again
    console.log('waiting 10 seconds for Control Hub to sync the chat entry point')
    await sleep(10 * 1000)
  }
}

main('0325')
.then(r => {
  console.log(r)
  process.exit(0)
})
.catch(e => {
  console.log(e)
  process.exit(1)
})