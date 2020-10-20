const express = require('express')
const router = express.Router()
const ldap = require('../models/ldap')

// get active directory account status
router.get('/', async (req, res, next) => {
  // console.log(`getting active directory status for ${req.user.sub}`)
  try {
    // const account = await ldap.getUser(req.user.sub)
    const user = await ldap.getUser(req.user.sub)
    // append enabled boolean from userAccountControl data
    user.enabled = (user.userAccountControl & 2) != 2
    try {
      user.admin = user.memberOf.includes(process.env.LDAP_ADMIN_GROUP_DN)
    } catch (e) {
      // continue
    }
    return res.status(200).send(user)
  } catch (e) {
    const message = `Failed to get active directory account status for ${req.user.sub}: ${e.message}`
    console.log(message)
    return res.status(500).send({message})
  }
})

// create active directory account 
router.post('/', async (req, res, next) => {
  // console.log(`creating active directory for ${req.user.sub}`)
  try {
    if (!req.body.dn) {
      const message = `'dn' is a required JSON property of the request body.`
      return res.status(400).send({message})
    }
    if (!req.body.password) {
      const message = `'password' is a required JSON property of the request body.`
      return res.status(400).send({message})
    }
    const body = {
      firstName: req.user.given_name,
      lastName: req.user.family_name,
      username: req.user.sub,
      commonName: req.user.sub,
      domain: process.env.LDAP_DOMAIN,
      telephoneNumber: req.body.dn,
      password: req.body.password,
      mail: req.user.email,
      description: 'dCloud Demo User',
      usersDn: process.env.LDAP_BASE_DN
    }
    // console.log('ldap.createUser:', body)
    await ldap.createUser(body)
    return res.status(200).send()
  } catch (e) {
    const message = `Failed to get active directory account status for ${req.user.sub}: ${e.message}`
    console.log(message)
    return res.status(500).send({message})
  }
})

// enable a disabled active directory account 
router.post('/enable', async (req, res, next) => {
  // console.log(`enabling active directory for ${req.user.sub}`)
  try {
    await ldap.enableUser(req.user.sub)
    return res.status(200).send()
  } catch (e) {
    const message = `Failed to enable active directory account for ${req.user.sub}: ${e.message}`
    console.log(message)
    return res.status(500).send({message})
  }
})

// diable an enabled active directory account 
router.post('/disable', async (req, res, next) => {
  // console.log(`disabling active directory for ${req.user.sub}`)
  try {
    await ldap.disableUser(req.user.sub)
    return res.status(200).send()
  } catch (e) {
    const message = `Failed to disable active directory account for ${req.user.sub}: ${e.message}`
    console.log(message)
    return res.status(500).send({message})
  }
})

module.exports = router
