const client = require('./client')

const templates = {
  rick: require('./templates')['user-rick'],
  sandra: require('./templates')['user-sandra']
}

// find agent user by last name
async function get (lastName) {
  try {
    const response = await client.user.getByLogin()
    return response.auxiliaryDataList.find(c => {
      return c.attributes.lastName__s === lastName
    })
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
    const url = `https://rest.cjp.cisco.com/aws/api/security/users/`

    const body = templates[agent]({
      id,
      userId,
      teamId,
      skillProfileId
    })

    const options = {
      method: 'PUT',
      headers: {
        Authorization: `${process.env.CJP_RS_API_KEY};tenantId=${process.env.CJP_TENANT_ID}`,
        From: process.env.CJP_FROM_ADDRESS
      },
      body
    }

    return fetch(url, options)
  } catch (e) {
    throw e
  }
}

module.exports = {
  get,
  modify
}