const fetch = require('./fetch')

async function updateUser (userId, body) {
  try {
    const url = 'https://dcloud-collab-toolbox.cxdemo.net/api/v1/auth/app/user/' + userId
    const options = {
      headers: {
        Authorization: 'Bearer ' + process.env.TOOLBOX_JWT
      },
      method: 'POST',
      body
    }
    return fetch(url, options)
  } catch (e) {
    throw e
  }
}

async function findUsers (query, projection) {
  try {
    const url = 'https://dcloud-collab-toolbox.cxdemo.net/api/v1/auth/app/user/'
    const options = {
      headers: {
        Authorization: 'Bearer ' + process.env.TOOLBOX_JWT
      },
      query: {
        query: JSON.stringify(query),
        projection: JSON.stringify(projection)
      }
    }
    return fetch(url, options)
  } catch (e) {
    throw e
  }
}

async function updateDemoUsers (filter, updates) {
  try {
    const url = 'https://dcloud-collab-toolbox.cxdemo.net/api/v1/auth/app/demo/webex-v4prod/user'
    const options = {
      headers: {
        Authorization: 'Bearer ' + process.env.TOOLBOX_JWT
      },
      method: 'POST',
      body: {
        filter,
        updates
      }
    }
    return fetch(url, options)
  } catch (e) {
    throw e
  }
}

async function listGlobals (query) {
  try {
    const url = 'http://localhost:3032/api/v1/auth/app/global'
    // const url = 'https://dcloud-collab-toolbox.cxdemo.net/api/v1/auth/app/global'
    const options = {
      headers: {
        Authorization: 'Bearer ' + process.env.TOOLBOX_JWT
      },
      query
    }
    return fetch(url, options)
  } catch (e) {
    throw e
  }
}

module.exports = {
  updateUser,
  findUsers,
  updateDemoUsers,
  listGlobals
}