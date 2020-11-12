const express = require('express')
const router = express.Router()

// get user provision info
router.get('/', async (req, res, next) => {
  try {
    return res.status(200).send({
      queue: '1234'
    })
  } catch (e) {
    console.log(`Failed to get user provision info:`, e.message)
    return res.status(500).send(e.message)
  }
})

// provision user account
router.post('/', async (req, res, next) => {
  try {
    return res.status(200).send()
  } catch (e) {
    console.log(`Failed to provision user:`, e.message)
    return res.status(500).send(e.message)
  }
})

module.exports = router
