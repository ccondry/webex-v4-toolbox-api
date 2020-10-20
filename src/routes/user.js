const express = require('express')
const router = express.Router()
const ldap = require('../models/ldap')

// get single active directory account
router.get('/:username', async (req, res, next) => {
  try {
    // TODO authorize requesting user is admin
    const user = await ldap.getUser(req.params.username)
    return res.status(200).send(user)
  } catch (e) {
    const message = `Failed to get active directory user ${req.params.username} for ${req.user.sub}: ${e.message}`
    console.log(message)
    return res.status(500).send({message})
  }
})

module.exports = router
