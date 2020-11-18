const express = require('express')
const router = express.Router()
const model = require('../models/queue')

// provision user account
router.post('/', async (req, res, next) => {
  try {
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
