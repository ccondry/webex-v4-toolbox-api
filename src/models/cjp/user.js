const client = require('./client')
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
    // const clean = cleanTemplate(current)
    const copy = JSON.parse(JSON.stringify(current))
    // null aux data type
    copy.auxiliaryDataType = null
    // update last modified timestamp
    copy.attributes._lmts__l = new Date().getTime()

    // move sid to sid__s
    copy.attributes.sid__s = copy.attributes.sid
    delete copy.attributes.sid

    // move tid to tid__s
    copy.attributes.tid__s = copy.attributes.tid
    delete copy.attributes.tid

    // move cstts to cstts__l
    copy.attributes.cstts__l = copy.attributes.cstts
    delete copy.attributes.cstts

    // apply caller changes
    changes(copy)
    // log the modify request body to JSON file
    log(`modify-user-${copy.attributes.email__s}`, copy)
    // modify with REST PUT - DO NOT PUT IN ARRAY
    return client.user.modify(copy.id, copy)
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