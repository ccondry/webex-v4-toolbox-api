const express = require('express')
const router = express.Router()
const toolbox = require('../models/toolbox')

// provision user account
router.post('/', async (req, res, next) => {
  try {
    // mark user profile as provision started so scheduler will find it
    await toolbox.updateUser(req.user.id, {
      CiscoAppId: 'cisco-chat-bubble-app',
      DC: 'produs1.ciscoccservice.com',
      async: true,
      orgId: process.env.ORG_ID,
      provision: 'started'
    })
    // return OK
    return res.status(200).send()
  } catch (e) {
    console.log(`Failed to start user provision:`, e.message)
    return res.status(500).send(e.message)
  }
})

module.exports = router
