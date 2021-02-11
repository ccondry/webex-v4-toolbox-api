const express = require('express')
const router = express.Router()
const provision = require('../models/provision')
const toolbox = require('../models/toolbox')
const session = require('../models/session')

// provision user account
router.post('/', async (req, res, next) => {
  try {
    // get request JWT
    const jwt = req.headers.authorization.split(' ').pop()

    // find the dCloud session and send it a message to create the LDAP user
    // and CUCM phone
    await session.provision(jwt)

    // mark user profile as provision started so scheduler will find it
    await toolbox.updateUser(req.user.id, {
      CiscoAppId: 'cisco-chat-bubble-app',
      DC: 'produs1.ciscoccservice.com',
      async: true,
      orgId: process.env.ORG_ID
    })
    // return OK
    return res.status(200).send()
  } catch (e) {
    console.log(`Failed to start user provision:`, e.message)
    return res.status(500).send(e.message)
  }
})

// get provision status
router.get('/:id', async (req, res, next) => {
  try {
    // get provision status
    const status = model.status(req.params.id)
    if (status) {
      // return status
      return res.status(200).send({status})
    } else {
      // return 404
      return res.status(404).send({
        message: `Job ID ${req.params.id} not found.`
      })
    }
  } catch (e) {
    console.log(`Failed to provision user:`, e.message)
    return res.status(500).send(e.message)
  }
})

module.exports = router
