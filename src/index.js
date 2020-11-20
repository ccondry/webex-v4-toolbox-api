// load environment file
require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const expressJwt = require('express-jwt')
const requestIp = require('request-ip')

const environment = require('./models/environment')
const jwtCert = require('./models/jwt-certificate')
const teamsLogger = require('./models/teams-logger')

// start access token refresh schedule
require('./models/control-hub/token')

// start user provision loop
require('./models/schedule')

// set up Node.js HTTP port
const port = process.env.NODE_PORT

// JWT path exceptions - these paths can be used without a JWT required
const urlBase = '/api/v1/webex-v4'

const exceptions = {
  path: [{
    // this application version
    url: new RegExp(urlBase + '/version', 'i'),
    methods: ['GET']
  }]
}

// init express app, and configure it
const app = express()
// parse JSON body into req.body, up to 256kb
app.use(bodyParser.json({limit: '256kb'}))
// enable CORS
app.use(cors())
// get remote IP address of request client as req.clientIp
app.use(requestIp.mw())
// require valid JWT for all paths unless in the exceptins list, and parse JWT payload into req.user
app.use(expressJwt({ secret: jwtCert }).unless(exceptions))

// run this code on every request
app.use(async function (req, res, next) {
  // continue processing
  next()
})

// error handling when JWT validation fails
app.use(function(err, req, res, next) {
  try {
    if (err) {
      // console.error(err.message)
      // return status to user
      return res.status(err.status).send(err.message)
    } else {
      // no errors
    }
  } catch (e) {
    console.log(e.message)
  }

  // continue processing
  next()
})

/*****
Routes
*****/

// get this API version
app.use(urlBase + '/version', require('./routes/version'))

// user provisioning in webex v4 demo
app.use(urlBase + '/provision', require('./routes/provision'))

// start listening
app.listen(port, () => {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
  const message = `${environment.name} version ${environment.version} service started on ${environment.hostname}. Listening on port ${port} in ${mode} mode.`
  console.log(message)
  teamsLogger.log(`service started on port ${port} in ${mode} mode.`)
})
