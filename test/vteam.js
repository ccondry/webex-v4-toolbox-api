require('dotenv').config()

const controlHub = require('../src/models/control-hub')

// Sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main (userId) {
  // wait for Webex Control Hub to sync the chat entry point from CJP
  let entryPointExists
  while (!entryPointExists) {
    // try to find agent and supervisor users
    try {
      entryPointExists = await controlHub.virtualTeam.get(`EP_Chat_${userId}`)
    } catch (e) {
      console.log(e)
      // wait 10 seconds before trying again
      console.log('waiting 10 seconds for Control Hub to sync the chat entry point')
      await sleep(10 * 1000)
    }
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