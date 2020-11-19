const client = require('./client')
const templates = require('./templates')

// find agent user by last name
async function get (login) {
  try {
    const response = await client.user.getByLogin(login)
    return response.auxiliaryDataList[0]
  } catch (e) {
    throw e
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