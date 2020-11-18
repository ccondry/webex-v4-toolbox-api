const template = require('./templates').skillProfile

async function create (name, userId) {
  try {
    client.skillProfile.create(template(name, userId))
  } catch (e) {
    throw e 
  }
}

async function get (name) {
  try {
    const skillProfiles = await client.skillProfile.list()
    return skillProfiles.auxiliaryDataList.find(v => {
      return v.attributes.name__s === name
    })
  } catch (e) {
    throw e 
  }
}

async function getOrCreate (name, userId) {
  try {
    const existing = await get(name)
    if (existing) {
      return existing
    } else {
      await create(name, userId)
      return await get(name)
    }
  } catch (e) {
    throw e
  }
}

module.exports = {
  getOrCreate
}