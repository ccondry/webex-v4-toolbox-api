const client = require('./client')
const templates = require('./templates')

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

// set skill profile ID and team ID on agent
async function modify ({
  agent,
  id,
  userId,
  teamId,
  skillProfileId
}) {
  try {
    const body = templates[agent]({
      id,
      userId,
      teamId,
      skillProfileId
    })
    // id is actually ignored in this modify method
    return client.user.modify(id, body)
  } catch (e) {
    throw e
  }
}

module.exports = {
  get,
  modify
}