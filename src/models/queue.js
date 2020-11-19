// this is a queue of provision operations. processed one at a time in order.
const uuid = require('uuid')
// the module to provision users
const provision = require('./provision')

// queue of users to provision, one at a time
class Queue {
  constructor () {
    // the queue of users to provision
    this.queue = []
    // job IDs and their status
    this.jobs = {}
    // whether the job runner is working right now
    this.isRunning = false
  }

  // get the status of job by ID
  status (id) {
    return this.jobs[id]
  }

  // add user to queue to be provisioned
  push (user) {
    // generate a job ID
    const id = uuid.v4()
    // queue the job
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
    // start
    this.isRunning = true
    // any users in queue?
    while (this.queue.length) {
      // get first user in queue
      const current = this.queue.shift()
      // set job status
      this.jobs[current.id] = 'working'
      try {
        // do provision
        await provision(current.user)
        // set job ID to done
        this.jobs[current.id] = 'success'
      } catch (e) {
        // set job ID to error
        this.jobs[current.id] = 'error'
      }
    }
    // done
    this.isRunning = false
  }
}

// single instance of the Queue class
const queue = new Queue()

// expose the single instance of Queue
module.exports = queue