const globals = require('./globals')
const fetch = require('./fetch')

const baseUrl = 'https://rialto.broadcloudpbx.com/enterpriseportalapi/v1.0/customers'

// get array of external phone numbers
async function getPhoneNumbers ({siteId, query}) {
  const defaultQuery = {
    // filter: 'status=unassigned',
    limit: 200,
    offset: 0,
    sort: 'phoneNumber'
  }
  // wait for globals to exist
  await Promise.resolve(globals.initialLoad)
  const customerId = globals.get('webexV4BroadCloudCustomerId')
  const token = globals.get('webexV4ControlHubToken').access_token
  const url = `${baseUrl}/${customerId}/sites/${siteId}/phoneassignments`
  const options = {
    query: {...defaultQuery, ...query},
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  return fetch(url, options)
}

// get array of internal extensions assigned to users
async function getExtensions ({siteId, query}) {
  // TODO get all, not just first 200
  const defaultQuery = {
    // filter: 'status=unassigned',
    limit: 200,
    offset: 0,
    sort: 'firstName'
  }
  // wait for globals to exist
  await Promise.resolve(globals.initialLoad)
  const customerId = globals.get('webexV4BroadCloudCustomerId')
  const token = globals.get('webexV4ControlHubToken').access_token
  const url = `${baseUrl}/${customerId}/sites/${siteId}/userassignments`
  const options = {
    query: {...defaultQuery, ...query},
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  return fetch(url, options)
}

// get array of sites
async function getSites () {
  // wait for globals to exist
  await Promise.resolve(globals.initialLoad)
  // get customer ID from globals
  const customerId = globals.get('webexV4BroadCloudCustomerId')
  const token = globals.get('webexV4ControlHubToken').access_token
  const url = `${baseUrl}/${customerId}/sites`
  const options = {
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  return fetch(url, options)
}

// check if extension is already in use
async function isAvailable ({siteId, extension}) {
  // wait for globals to exist
  await Promise.resolve(globals.initialLoad)
  // get customer ID from globals
  const customerId = globals.get('webexV4BroadCloudCustomerId')
  const token = globals.get('webexV4ControlHubToken').access_token
  const url = `${baseUrl}/${customerId}/sites/${siteId}/userassignments/extension/${extension}/duplicate`
  // console.log('url', url)
  const options = {
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
  try {
    const response = await fetch(url, options)
    return response.isDuplicate === null
  } catch (e) {
    if (e.status === 500) {
      // not available
      return false
    } else {
      throw e
    }
  }
}

// get site by name
async function getSite (name) {
  try {
    const sites = await getSites()
    return sites.results.find(site => site.name === name)
  } catch (e) {
    throw e
  }
}

// getSites()
// .then(site => isAvailable({siteId: site.id, extension: '10325'}))
// .then(r => {
//   console.log(r)
//   process.exit(0)
// })
// .catch(e => console.log(e.message))

module.exports = {
  getSite,
  getSites,
  isAvailable,
  getPhoneNumbers,
  getExtensions
}