// control hub org ID
const orgId = process.env.ORG_ID
// cache for the bearer token
const cache = require('../cache')

async function getToken () {
  try {
    const token = cache.getItem('accessToken')
    return token
  } catch (e) {
    throw e
  }
}

// Sync CJP Users to Control Hub
module.exports = async function () {
  try {
    const url = "https://ums.produs1.ciscoccservice.com/ums/users/synchronize"

    const token = await getToken()

    const body = {orgId}

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body,
      redirect: 'follow'
    }
  
    await fetch(url, options)
  } catch (e) {
    throw e
  }
}
