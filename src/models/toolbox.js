const db = require('./db')

async function updateUser (userId, queueId, templateId) {
  try {
    const query = {id: userId}
    const updates = {
      $set: {
        'demo.webex-v4prod.queueId': queueId,
        'demo.webex-v4prod.templateId': templateId
      }
    }
    db.updateOne('toolbox', 'users', query, updates)
  } catch (e) {
    throw e
  }
}

module.exports = {
  updateUser
}