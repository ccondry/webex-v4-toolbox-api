const template = require('./templates').skillProfile
const client = require('./client')

async function create (name, userId) {
  try {
    await client.skillProfile.create(template(name, userId))
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
      // get the new skill profile details
      existing = await get(name)
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