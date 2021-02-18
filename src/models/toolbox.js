const db = require('./db')

async function updateUser (userId, data) {

  try {
    const query = {id: userId}
    const updates = {
      $set: {},
      $currentDate: {
        'demo.webex-v4prod.lastAccess': {$type: 'date'}
      }
    }

    for (const key of Object.keys(data)) {
      updates.$set['demo.webex-v4prod.' + key] = data[key]
    }

    db.updateOne('toolbox', 'users', query, updates)
  } catch (e) {
    throw e
  }
}

module.exports = {
  updateUser
}