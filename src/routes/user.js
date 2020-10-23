const express = require('express')
const router = express.Router()
const isAdmin = require('../models/is-admin')
const model = require('../models/user')

// list active directory users
router.get('/', async (req, res, next) => {
  try {
    // authorize client 
    if (!isAdmin(req.user)) {
      const message = 'You do not have permission to access this resource.'
      return res.status(403).send({message})
    }
    // get users from AD
    const users = await model.list()
    // return to client
    return res.status(200).send(users)
  } catch (e) {
    const message = `Failed to list active directory users for ${req.user.sub}: ${e.message}`
    console.log(message)
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
    return res.status(500).send({message})
  }
})

// delete single active directory user
router.delete('/:username', async (req, res, next) => {
  try {
    // authorize client 
    if (!isAdmin(req.user)) {
      const message = 'You do not have permission to access this resource.'
      return res.status(403).send({message})
    }
    // delete user from AD
    await model.delete(req.params.username)
    // respond to client
    return res.status(200).send()
  } catch (e) {
    const message = `Failed to delete active directory user ${req.params.username} for ${req.user.sub}: ${e.message}`
    console.log(message)
    return res.status(500).send({message})
  }
})

// disable single active directory user
router.post('/:username/disable', async (req, res, next) => {
  try {
    // authorize client 
    if (!isAdmin(req.user)) {
      const message = 'You do not have permission to access this resource.'
      return res.status(403).send({message})
    }
    // disable user in AD
    await model.disable(req.params.username)
    // respond to client
    return res.status(200).send()
  } catch (e) {
    const message = `Failed to disable active directory user ${req.params.username} for ${req.user.sub}: ${e.message}`
    console.log(message)
    return res.status(500).send({message})
  }
})

// enable single active directory user
router.post('/:username/enable', async (req, res, next) => {
  try {
    // authorize client 
    if (!isAdmin(req.user)) {
      const message = 'You do not have permission to access this resource.'
      return res.status(403).send({message})
    }
    // disable user in AD
    await model.enable(req.params.username)
    // respond to client
    return res.status(200).send()
  } catch (e) {
    const message = `Failed to enable active directory user ${req.params.username} for ${req.user.sub}: ${e.message}`
    console.log(message)
    return res.status(500).send({message})
  }
})

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
    return res.status(500).send({message})
  }
})

module.exports = router
