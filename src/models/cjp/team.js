const client = require('./client')
const template = require('./templates').team
const log = require('../json-logger')

// Sleep
function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
    // log to file
    log(`create-team-${name}`, data)
    return client.team.create(data)
  } catch (e) {
    throw e
  }
}

async function getOrCreate (name) {
  try {
    const existing = await get(name)
    if (existing) {
      console.log('found existing user team', name)
      return existing
    } else {
      console.log('creating user team', name, '...')
      await create(name)
      // wait for it to exist
      let team
      while (!team) {
        await sleep(1000 * 4)
        team = await get(name)
      }
      return team
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