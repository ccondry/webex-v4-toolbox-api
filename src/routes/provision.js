const express = require('express')
const router = express.Router()
const model = require('../models/queue')
const session = require('../models/session')

// provision user account
router.post('/', async (req, res, next) => {
  try {
    // send message to the dCloud session to create the LDAP user and CUCM phone
    const jwt = req.headers.authorization.split(' ').pop()
    await session.provision(jwt)
    // add to the queue to be provisioned in CJP and Control Hub
    const id = model.push(req.user)
    return res.status(200).send({id})
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
