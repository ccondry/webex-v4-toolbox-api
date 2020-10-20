const express = require('express')
const router = express.Router()
const ldap = require('../models/ldap')

// get active directory account status
router.get('/', async (req, res, next) => {
  try {
    // console.log(`user ${req.user.sub} requesting active directory users list`)
    const users = await ldap.listUsers({})
    for (const user of users) {
      // append enabled boolean from userAccountControl data
      user.enabled = (user.userAccountControl & 2) != 2

      // append admin boolean
      try {
        user.admin = user.memberOf.includes(process.env.LDAP_ADMIN_GROUP_DN)
      } catch (e) {
        // continue
      }

      // append fullName
      user.fullName = user.givenName + ' ' + user.sn
    }
    return res.status(200).send(users)
  } catch (e) {
    const message = `Failed to list active directory users for ${req.user.sub}: ${e.message}`
    console.log(message)
    return res.status(500).send({message})
  }
})

module.exports = router
