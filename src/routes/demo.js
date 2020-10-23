const express = require('express')
const router = express.Router()

// get demo environment info
router.get('/', async (req, res, next) => {
  try {
    return res.status(200).send({
      did: process.env.DID
    })
  } catch (e) {
    console.log(`Failed to get server info:`, e.message)
    return res.status(500).send(e.message)
  }
})

module.exports = router
