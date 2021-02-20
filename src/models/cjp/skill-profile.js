const template = require('./templates').skillProfile
const client = require('./client')
const utils = require('../../utils')
const log = require('../json-logger')

async function create (name, userId) {
  try {
    const body = template(name, userId)
    log(`create-skill-profile-${name}`, body)
    await client.skillProfile.create(body)
  } catch (e) {
    throw e 
  }
}

async function get (name) {
  try {
    const skillProfiles = await list()
    return skillProfiles.find(v => {
      return v.attributes.name__s === name
    })
  } catch (e) {
    throw e 
  }
}

async function list () {
  try {
    const skillProfiles = await client.skillProfile.list()
    return skillProfiles.auxiliaryDataList
  } catch (e) {
    throw e 
  }
}

async function getOrCreate (name, userId) {
  try {
    // look for existing skill profile
    let existing = await get(name)
    if (existing) {
      console.log(`found existing CJP skill profile named "${name}": ${existing.id}`)
    } else {
      // skill profile doesn't exist yet, so create it
      console.log(`CJP skill profile "${name}" does not exist. Creating it now...`)
      await create(name, userId)
      // wait for new skill profile to exist
      while (!existing) {
        // wait a moment
        await utils.sleep(5000)
        // get the new skill profile details
        existing = await get(name)
      }
      console.log(`created new CJP skill profile named "${name}": ${existing.id}`)
    }
    // return skill profile
    return existing
  } catch (e) {
    throw e
  }
}
  
module.exports = {
  getOrCreate,
  get,
  create,
  list
}