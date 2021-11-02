const fetch = require('./fetch')

const urlBase = 'https://dcloud-collab-toolbox.cxdemo.net/api/v1/auth'
// const urlBase = 'http://localhost:3032/api/v1/auth'

async function updateUser (userId, body, ignoreAccessTime) {
  return updateDemoUsers({id: userId}, body, ignoreAccessTime)
}

async function findUsers (query = {}, projection = {}) {
  // console.log('findUsers', query, projection)
  try {
    const url = urlBase + '/app/user'
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

async function updateDemoUsers (filter, updates, ignoreAccessTime = false) {
  try {
    const url = urlBase + '/app/demo/webex-v4prod/users'
    const options = {
      headers: {
        Authorization: 'Bearer ' + process.env.TOOLBOX_JWT
      },
      method: 'POST',
      body: {
        filter,
        updates
      },
      query: {
        ignoreAccessTime
      }
    }
    return fetch(url, options)
  } catch (e) {
    throw e
  }
}

async function listGlobals (query) {
  try {
    const url = urlBase + '/app/global'
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