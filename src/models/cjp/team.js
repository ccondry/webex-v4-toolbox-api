const client = require('./client')
const template = require('./templates').team

async function list () {
	try {
    return client.team.list()
  } catch (e) {
    throw e
  }
}

async function get (name) {
  try {
    const teams = await list()
    return teams.auxiliaryDataList.find(c => {
      return c.attributes.name__s === name
    })
  } catch (e) {
    throw e
  }
}

async function create (name) {
  try {
    const data = template(name)
    return client.team.create(data)
  } catch (e) {
    throw e
  }
}

async function getOrCreate (name) {
  try {
    const existing = await get(name)
    if (existing) {
      return existing
    } else {
      await create(name)
      return await get(name)
    }
  } catch (e) {
    throw e
  }
}

module.exports = {
  getOrCreate,
  get,
  list,
  create
}