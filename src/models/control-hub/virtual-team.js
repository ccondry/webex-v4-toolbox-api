const cache = require('../cache')
const fetch = require('../fetch')

async function get (name) {
  try {
    const url = `https://cms.produs1.ciscoccservice.com/cms/api/v2/auxiliary-data/resources/virtual-team`
    const token = cache.getItem('accessToken')
    const options = {
      headers: {
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
