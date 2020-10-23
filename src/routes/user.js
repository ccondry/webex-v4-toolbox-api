const express = require('express')
const router = express.Router()
const isAdmin = require('../models/is-admin')
const model = require('../models/user')
const teamsLogger = require('../models/teams-logger')

// create active directory user for JWT user
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
    // create new user in LDAP / AD
    await model.create(body)
    // set user expiration to 12 hours
    await model.extend(req.user.sub, 12 * 60 * 60 * 1000)
    return res.status(200).send()
  } catch (e) {
    const message = `Failed to create active directory account for ${req.user.sub}: ${e.message}`
    console.log(message)
    teamsLogger.log(message)
    return res.status(500).send({message})
  }
})

// list active directory users
router.get('/', async (req, res, next) => {
  try {
    // authorize client 
    if (!isAdmin(req.user)) {
      const message = 'You are not an admin.'
      return res.status(403).send({message})
    }
    // get users from AD
    const users = await model.list()
    // return to client
    return res.status(200).send(users)
  } catch (e) {
    const message = `Failed to list active directory users for ${req.user.sub}: ${e.message}`
    console.log(message)
    teamsLogger.log(message)
    return res.status(500).send({message})
  }
})

// get single active directory user
router.get('/:username', async (req, res, next) => {
  try {
    // authorize client 
    if (!isAdmin(req.user) && req.params.username !== req.user.sub) {
      const message = 'This is not your account and you are not an admin.'
      return res.status(403).send({message})
    }
    // get user from AD
    const user = await model.get(req.params.username)
    // return to client
    return res.status(200).send(user)
  } catch (e) {
    const message = `Failed to get active directory user ${req.params.username} for ${req.user.sub}: ${e.message}`
    console.log(message)
    teamsLogger.log(message)
    return res.status(500).send({message})
  }
})

// set active directory user password
router.post('/:username/password', async (req, res, next) => {
  try {
    // authorize client 
    if (!isAdmin(req.user) && req.params.username !== req.user.sub) {
      const message = 'This is not your account and you are not an admin.'
      return res.status(403).send({message})
    }
    // set password in AD
    await model.setPassword(req.body.username, req.body.password)
    // return to client
    return res.status(200).send()
  } catch (e) {
    // DSID-031A1236 will not perform
    if (e.message.match(/DSID-031A1236/)) {
      // invalid password requirements
      const message = 'Your new password did not meet the minimum requirements.'
      return res.status(400).send({message})
    } else {
      const message = `Failed to set active directory password on ${req.params.username} for ${req.user.sub}: ${e.message}`
      console.log(message)
      teamsLogger.log(message)
      return res.status(500).send({message})
    }
  }
})

// delete single active directory user
router.delete('/:username', async (req, res, next) => {
  try {
    // authorize client 
    if (!isAdmin(req.user)) {
      const message = 'You are not an admin.'
      return res.status(403).send({message})
    }
    // delete user from AD
    await model.delete(req.params.username)
    // respond to client
    return res.status(200).send()
  } catch (e) {
    const message = `Failed to delete active directory user ${req.params.username} for ${req.user.sub}: ${e.message}`
    console.log(message)
    teamsLogger.log(message)
    return res.status(500).send({message})
  }
})

// disable single active directory user
// router.post('/:username/disable', async (req, res, next) => {
//   try {
//     // authorize client 
//     if (!isAdmin(req.user)) {
//       const message = 'You are not an admin.'
//       return res.status(403).send({message})
//     }
//     // disable user in AD
//     await model.disable(req.params.username)
//     // respond to client
//     return res.status(200).send()
//   } catch (e) {
//     const message = `Failed to disable active directory user ${req.params.username} for ${req.user.sub}: ${e.message}`
//     console.log(message)
//     teamsLogger.log(message)
//     return res.status(500).send({message})
//   }
// })

// enable single active directory user
// router.post('/:username/enable', async (req, res, next) => {
//   try {
//     // authorize client 
//     if (!isAdmin(req.user)) {
//       const message = 'You are not an admin.'
//       return res.status(403).send({message})
//     }
//     // disable user in AD
//     await model.enable(req.params.username)
//     // respond to client
//     return res.status(200).send()
//   } catch (e) {
//     const message = `Failed to enable active directory user ${req.params.username} for ${req.user.sub}: ${e.message}`
//     console.log(message)
//     teamsLogger.log(message)
//     return res.status(500).send({message})
//   }
// })

// extend accountExpires on single active directory user
router.post('/:username/extend', async (req, res, next) => {
  try {
    // authorize client 
    if (!isAdmin(req.user) && req.params.username !== req.user.sub) {
      const message = 'This is not your account and you are not an admin.'
      return res.status(403).send({message})
    }
    // edit user in AD using time in milliseconds
    await model.extend(req.params.username, req.body.hour * 60 * 60 * 1000)
    // respond to client
    return res.status(200).send()
  } catch (e) {
    const message = `Failed to extend accountExpires on active directory user ${req.params.username} for ${req.user.sub}: ${e.message}`
    console.log(message)
    teamsLogger.log(message)
    return res.status(500).send({message})
  }
})

module.exports = router
