const globals = require('../globals')
const fetch = require('../fetch')

async function get (name) {
  try {
    const url = `https://cms.produs1.ciscoccservice.com/cms/api/v2/auxiliary-data/resources/virtual-team`
    const token = globals.get('webexV4ControlHubAccessToken')
    // console.log('token', token)
    const options = {
      headers: {
        method: 'GET',
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        Referer: 'https://admin.webex.com/',
        Authorization: `Bearer ${token}`
      }
    }
    const response = await fetch(url, options)
    return response.auxiliaryDataList.find(v => v.attributes.name__s === name)
  } catch (e) {
    throw e 
  }
}

module.exports = {
  get
}
