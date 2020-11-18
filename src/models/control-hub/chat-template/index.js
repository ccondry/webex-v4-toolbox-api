// REST request library
const fetch = require('../fetch')
// cache for the bearer token
const cache = require('../cache')
// request body template for create function
const template = require('./data-template')
// webex org ID
const orgId = process.env.ORG_ID

async function getToken () {
  try {
    const token = cache.getItem('accessToken')
    return token
  } catch (e) {
    throw e
  }
}

async function list () {
  try {
    const url = `https://chatc.produs1.ciscoccservice.com/chatc/v1/organization/${orgId}/template?mediaType=chat`
    const token = await getToken()
    const options = {
      headers: {
        authorization: `Bearer ${token}`
      }
    }
    return fetch(url, options)
  } catch (e) {
    throw e
  }
}

// get chat template by name
async function get (name) {
  try {
    const templates = await list()
    return templates.find(v => v.name === name)
  } catch (e) {
    throw e
  }
}

// create chat template
async function create (name, entryPointId) {
  try {
    const url = `https://cmm.produs1.ciscoccservice.com/cmm/v1/organization/${orgId}/template`
    const token = await getToken()
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: template(name, entryPointId),
      redirect: 'follow'
    }

    await fetch(url, options)
  } catch (e) {
    throw e
  }
}

// find existing, or create it if it doesn't exist
async function getOrCreate (userId, entryPointId) {
  try {
    const name = `EP_Chat_${userId}`
    // look for existing chat template
    const existing = await get(name)
    if (existing) {
      // return the existing chat template
      return existing
    } else {
      // doesn't exist yet - create it
      await create(name, entryPointId)
      // and return the newly created template
      return await get(name)
    }
  } catch (e) {
    throw e
  }
}

module.exports = {
  getOrCreate
}