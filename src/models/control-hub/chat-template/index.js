// REST request library
const fetch = require('../../fetch')
// cache for the bearer token
const globals = require('../../globals')
// request body template for create function
const template = require('./template')
// const tokenLib = require('../token')
// webex org ID
const orgId = process.env.ORG_ID

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getToken () {
  try {
    const token = globals.get('webexV4ControlHubAccessToken')
    return token
  } catch (e) {
    throw e
  }
}

async function list () {
  try {
    const url = `https://cmm.produs1.ciscoccservice.com/cmm/v1/organization/${orgId}/template`
    const token = await getToken()
    const options = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      query: {
        mediaType: 'chat'
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
  console.log(`creating chat template "${name} with entry point ${entryPointId}`)
  try {
    const url = `https://cmm.produs1.ciscoccservice.com/cmm/v1/organization/${orgId}/template`
    const body = template(name, entryPointId)
    const token = await getToken()
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

// find existing, or create it if it doesn't exist
async function getOrCreate (userId, entryPointId) {
  try {
    const name = `EP_Chat_${userId}`
    // console.log(`searching for Control Hub chat template "${name}"...`)
    // look for existing chat template
    const existing = await get(name)
    // console.log(`done searching for Control Hub chat template "${name}".`)
    if (existing) {
      // existing.entryPoint: 'AXPJaa0OTL-WqCpfkUAp'
      console.log(`found existing Control Hub chat template named "${name}": ${existing.templateId}`)
      // return the existing chat template
      return existing
    } else {
      console.log(`Control Hub chat template "${name}" does not exist. Creating it now...`)
      // doesn't exist yet - create it
      await create(name, entryPointId)
      // wait for it to be created
      await sleep(4000)
      // and return the newly created template
      console.log(`getting new Control Hub chat template "${name}"...`)
      return await get(name)
    }
  } catch (e) {
    throw e
  }
}

module.exports = {
  list,
  getOrCreate
}