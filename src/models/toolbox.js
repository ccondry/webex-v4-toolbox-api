const fetch = require('./fetch')

async function updateUser (userId, body) {
  try {
    const url = 'https://dcloud-collab-toolbox.cxdemo.net/api/v1/auth/app/user/' + userId
    const options = {
      Authorization: 'Bearer ' + process.env.TOOLBOX_JWT,
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
      Authorization: 'Bearer ' + process.env.TOOLBOX_JWT,
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
    const url = 'https://dcloud-collab-toolbox.cxdemo.net/api/v1/auth/app/demo/webex-v4prod/users'
    const options = {
      Authorization: 'Bearer ' + process.env.TOOLBOX_JWT,
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

module.exports = {
  updateUser,
  findUsers,
  updateDemoUsers
}