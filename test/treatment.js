require('dotenv').config()
const tokenLib = require('../src/models/control-hub/token')
const fetch = require('../src/models/fetch')

// control hub org ID
const orgId = process.env.ORG_ID

// email entry point ID
const emailEntryPoint = process.env.CJP_EMAIL_ENTRY_POINT_ID

// Create Treatment for user
async function get (userId) {
  const url = `https://treatment.produs1.ciscoccservice.com/treatment/v1/organization/${orgId}/entrypoint/${emailEntryPoint}/treatmentOrder`
  // treatmentOrder
  // get access token from cache
  const token = await tokenLib.get()

  const options = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  return fetch(url, options)
}

get()
.then(r => {
  console.log(r)
  process.exit(0)
})
.catch(e => {
  console.log(e)
  process.exit(1)
})