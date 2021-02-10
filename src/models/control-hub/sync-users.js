// control hub org ID
const orgId = process.env.ORG_ID
// cache for the bearer token
const globals = require('../globals')
const fetch = require('../fetch')

async function getToken () {
  try {
    const token = globals.get('webexV4ControlHubAccessToken')
    return token
  } catch (e) {
    throw e
  }
}

// Sync CJP Users to Control Hub
module.exports = async function () {
  try {
    const url = 'https://ums.produs1.ciscoccservice.com/ums/users/v2/synchronize/' + orgId

    const token = await getToken()

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      redirect: 'follow'
    }
  
    await fetch(url, options)
  } catch (e) {
    throw e
  }
}
