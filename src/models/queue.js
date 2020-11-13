const uuid = require('uuid')
const db = require('./db')

async function provisionUser (user) {
  // TODO build actual provision code here
  const query = {username: user.username}
  // test
  const queueId = '5678'
  const templateId = 'c772f5c0-d8bd-11ea-874d-fb6069813361'
  // database updates
  const updates = {
    $set: {
      'demo.webex-v4': {
        vertical: 'travel',
        queueId,
        templateId,
        orgId: 'f889c62e-d43a-45bf-a74d-cca4e91e493e',
        DC: 'produs1.ciscoccservice.com',
        CiscoAppId: 'cisco-chat-bubble-app',
        appPrefix: '',
        async: true
      }
    }
  }
  try {
    // update user database
    await db.updateOne('toolbox', 'users', query, updates)
  } catch (e) {
    throw e
  }
}

// queue of users to provision, one at a time
class Queue {
  constructor () {
    this.queue = []
    this.jobs = {}
    this.isRunning = false
  }

  status (id) {
    return this.jobs[id]
  }

  // add user to queue to be provisioned
  push (user) {
    // generate a job ID
    const id = uuid.v4()
    this.queue.push({user, id})
    // start the runner if it's not running right now
    if (!this.isRunning) {
      this.run()
    }
    // return job ID to user
    return id
  }

  // main job runner function
  async run () {
    this.isRunning = true
    // any users in queue?
    while (this.queue.length) {
      // get first user in queue
      const current = this.queue.shift()
      // set job status
      this.jobs[current.id] = 'working'
      try {
        // do provision
        await provisionUser(current.user)
        // set job ID to done
        this.jobs[current.id] = 'success'
      } catch (e) {
        // set job ID to error
        this.jobs[current.id] = 'error'
      }
    }
    this.isRunning = false
  }
}

const queue = new Queue()

module.exports = queue