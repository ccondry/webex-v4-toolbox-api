const express = require('express')
const router = express.Router()
const isAdmin = require('../models/is-admin')
const model = require('../models/user')
const teamsLogger = require('../models/teams-logger')

// make LDAP filter from JSON object
function jsonToFilter (json) {
  let ret = '('
  if (typeof json.$and === 'object') {
    const keys = Object.keys(json.$and)
    if (keys.length) {
      ret += `&`
      for (const key of keys) {
        const value = json.$and[key]
        ret += `(${key}=${value})`
      }
    }
  }
  ret += ')'
  return ret
}

// create active directory user for JWT user
router.post('/', async (req, res, next) => {
  // console.log(`creating active directory for ${req.user.sub}`)
  try {
    if (!req.body.dn) {
      const message = `You didn't provide a call ID.`
      return res.status(400).send({message})
    }
    if (!req.body.password) {
      const message = `You didn't provide a password.`
      return res.status(400).send({message})
    }
    // check that the dn is not in use as a telephoneNumber already
    try {
      const filter = jsonToFilter({
        $and: {
          objectClass: 'user',
          telephoneNumber: req.body.dn,
          objectcategory: 'person'
        }
      })
      const existing = await model.list({filter})
      if (existing.length) {
        const message = `The call ID '${req.body.dn}' is already in use.`
        return res.status(409).send({message})
      }
    } catch (e) {
      const message = `Failed during call ID conflict check: ${e.message}`
      console.log(message)
      teamsLogger.log(message)
      return res.status(500).send({message: e.message})
    }

    const fullName = `${req.user.given_name} ${req.user.family_name}`
    const body = {
      givenName: req.user.given_name,
      sn: req.user.family_name,
      name: fullName, 
      samAccountName: req.user.sub,
      userPrincipalName: `${req.user.sub}@${process.env.LDAP_DOMAIN}`,
      cn: fullName,
      displayName: fullName,
      domain: process.env.LDAP_DOMAIN,
      telephoneNumber: req.body.dn,
      objectClass: ["top", "person", "organizationalPerson", "user"],
      mail: req.user.email,
      description: 'dCloud Demo User'
    }
    const dn = `CN=${fullName},${process.env.LDAP_BASE_DN}`

    // create new user in LDAP / AD
    await model.create(dn, body, req.body.password)
    return res.status(200).send()
  } catch (e) {
    const message = `Failed to create active directory account for ${req.user.sub}: ${e.message}`
    console.log(message)
    teamsLogger.log(message)
    return res.status(500).send({message: e.message})
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
    console.log(message, e)
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
