const express = require('express')
const router = express.Router()
const ldap = require('../models/ldap')

// get active directory account status
router.get('/', async (req, res, next) => {
  console.log(`getting active directory status for ${req.user.sub}`)
  try {
    // const account = await ldap.getUser(req.user.sub)
    const account = await ldap.listUsers({})
    return res.status(200).send(account)
  } catch (e) {
    const message = `Failed to get active directory account status for ${req.user.sub}: ${e.message}`
    console.log(message)
    return res.status(500).send({message})
  }
})

module.exports = router
