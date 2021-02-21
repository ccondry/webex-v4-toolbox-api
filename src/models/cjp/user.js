const client = require('./client')
const cleanTemplate = require('../clean-template')
const log = require('../json-logger')

// find agent user by login username
async function get (login) {
  try {
    console.log('cjp.user.getByLogin', login, '...')
    // const list = await client.user.list()
    // console.log('user list', list)
    const response = await client.user.getByLogin(login)
    // console.log('response', response)
    return response.auxiliaryDataList[0]
  } catch (e) {
    // not found - just return null
    return null
  }
}

// set skill profile ID and team IDs on agent
async function modify ({
  current,
  changes
}) {
  try {
    // clean current data
    const clean = cleanTemplate(current)
    // apply changes
    changes(clean)
    // log the modify request body to JSON file
    log(`modify-user-${clean.attributes.email__s}`, [clean])
    // modify with REST PUT
    return client.user.modify(clean.id, [clean])
  } catch (e) {
    console.log('failed to modify CJP user:', e.message)
    throw e
  }
}

// list agent users
async function list (login) {
  try {
    const users = await client.user.list()
    // console.log('user list', list)
    return users.details.users 
  } catch (e) {
    // not found - just return null
    return null
  }
}

module.exports = {
  get,
  modify,
  list
}