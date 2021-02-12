const globals = require('../globals')
const fetch = require('../fetch')
// control hub org ID
const orgId = process.env.ORG_ID

// email entry point ID
const emailEntryPoint = process.env.CJP_EMAIL_ENTRY_POINT_ID

// find treatment rule for specified user ID
async function list () {
  // get access token from cache
  const token = globals.get('webexV4ControlHubToken')
  const url = `https://treatment.produs1.ciscoccservice.com/treatment/v1/organization/${orgId}/entrypoint/${emailEntryPoint}/treatment`

  const options = {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    }
  }

  try {
    const response = await fetch(url, options)
    // console.log('list Control Hub email treatments:', response.treatments)
    return response.treatments
  } catch (e) {
    throw e
  }
}

// find treatment rule for specified user ID
async function findRule (name) {
  try {
    const rules = await list()
    return rules.find(rule => rule.name === name)
  } catch (e) {
    throw e
  }
}

// Create Treatment for user
async function create (userId) {
  const url = `https://treatment.produs1.ciscoccservice.com/treatment/v1/organization/${orgId}/entrypoint/${emailEntryPoint}/treatment`
  
  // get access token from cache
  const token = globals.get('webexV4ControlHubToken')
  
  //Send Body
  const body = {
    name: `route${userId}`,
    combinator: 'AND',
    rules: [
      { attribute: 'subject', operator: 'contains', keywords: [userId] },
    ],
    actionType: 'Queueing',
    action: `Q_Email_dCloud_${userId}`,
  }

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.access_token}`
    },
    body
  }

  return fetch(url, options)
}

// get treatments order
async function listOrder () {
  try {
    const url = `https://treatment.produs1.ciscoccservice.com/treatment/v1/organization/${orgId}/entrypoint/${emailEntryPoint}/treatmentOrder`

    // get access token from cache
    const token = globals.get('webexV4ControlHubToken')
    
    const options = {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    }

    const response = await fetch(url, options)
    return response.treatmentsOrder
  } catch (e) {
    throw e
  }
}

// Modify Treatment Order
async function modifyOrder (treatmentsOrder) {
  const url = `https://treatment.produs1.ciscoccservice.com/treatment/v1/organization/${orgId}/entrypoint/${emailEntryPoint}/treatmentOrder`

  // get access token from cache
  const token = globals.get('webexV4ControlHubToken')
  
  const body = {
    treatmentsOrder,
    defaultQueue: process.env.CJP_EMAIL_QUEUE_NAME,
  }

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.access_token}`
    },
    body
  }

  return fetch(url, options)
}

async function getOrCreate (userId) {
  try {
    // find existing email treatment rule for user
    let existing = await findRule(`route${userId}`)
    let treatmentId
    // create new email treatment rule if it doesn't exist
    if (existing) {
      // get the email treatment ID from the treatment object
      treatmentId = existing.uri.split('/').pop()
      console.log(`found existing Control Hub email treatment rule for user ${userId}: ${treatmentId}`)
    } else {
      // email treatment rule doesn't exist yet, so create it
      console.log(`Control Hub email treatment rule for user ${userId} does not exist. Creating it now...`)
      await create(userId)
      // get the newly created rule
      existing = await findRule(`route${userId}`)
      // get the email treatment ID from the treatment object
      treatmentId = existing.uri.split('/').pop()
      console.log(`created new Control Hub email treatment rule for user ${userId}: ${treatmentId}`)
    }
    // get the existing email treamtent ID order list
    const treatmentOrder = await listOrder()
    console.log(`got Control Hub email treatment order list: ${treatmentOrder.length} treatments`)
    // check if email treatment ID is already in the order list
    const index = treatmentOrder.findIndex(v => v === treatmentId)
    if (index >= 0) {
      console.log(`Control Hub email treatment rule ${treatmentId} for user ${userId} is already in the treatments order list: index ${index}`)
    } else {
      // not in the list
      console.log(`Control Hub email treatment rule ${treatmentId} for user ${userId} is not in the treatments order list. Adding it...`)
      // add email treatment ID to the list, and update on server
      treatmentOrder.push(treatmentId)
      await modifyOrder(treatmentOrder)
      console.log(`added Control Hub email treatment rule ${treatmentId} for user ${userId} to the treatments order list`)
    }
  } catch (e) {
    throw e
  }
}
    
module.exports = {
  getOrCreate
}
