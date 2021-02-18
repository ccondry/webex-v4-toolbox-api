// load environment file
require('dotenv').config()

const environment = require('./models/environment')
const teamsLogger = require('./models/teams-logger')

// start user provision/deprovision checking job
require('./models/schedule')

// log that this service has started
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const message = `${environment.name} version ${environment.version} service started on ${environment.hostname} in ${mode} mode.`
console.log(message)
teamsLogger.log(`service started on in ${mode} mode.`)
