const express = require('express')
const router = express.Router()
const provision = require('../models/provision')

// provision user account
router.post('/', async (req, res, next) => {
  try {
    // get request JWT
    const jwt = req.headers.authorization.split(' ').pop()

    // start provision actions
    provision(jwt)

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
