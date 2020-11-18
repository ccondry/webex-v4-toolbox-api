const cache = require('../cache')
// control hub org ID
const orgId = process.env.ORG_ID

// email entry point ID
const emailEntryPoint = process.env.CJP_EMAIL_ENTRY_POINT_ID

// find treatment rule for specified user ID
async function list () {
  // get access token from cache
  const token = cache.getItem('accessToken')
  const url = `https://treatment.produs1.ciscoccservice.com/treatment/v1/organization/${orgId}/entrypoint/${emailEntryPoint}/treatment`

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, options)
    return response
  } catch (e) {
    throw e
  }
}

// find treatment rule for specified user ID
async function listRules () {
  try {
    const response = await list()
    return response.treatments
  } catch (e) {
    throw e
  }
}

// find treatment rule for specified user ID
async function findRule (userId) {
  try {
    const rules = await listRules()
    const rule = rules.find(rule => rule.name.includes(`route${userId}`))
    // find it?
    if (rule) {
      return rule
    } else {
      throw Error(`No treatment rule found for user ${userId}`)
    }
  } catch (e) {
    throw e
  }
}

// Create Treatment for user
async function create (userId) {
  const url = `https://treatment.produs1.ciscoccservice.com/treatment/v1/organization/${orgId}/entrypoint/${emailEntryPoint}/treatment`
  
  // get access token from cache
  const token = cache.getItem('accessToken')
  
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
      Authorization: `Bearer ${token}`
    },
    body
  }

  return fetch(url, options)
}

// get user's treatment ID
async function getId (userId) {
  try {
    const rule = await findRule(userId)
    return rule.uri.split('/').pop()
  } catch (e) {
    throw e
  }
}

// get treatments order
async function listOrder (userId) {
  try {
    const treatments = await list()
    return treatments.treatmentsOrder
  } catch (e) {
    throw e
  }
}

// Modify Treatment Order
async function modifyOrder (treatmentsOrder) {
  const url = `https://treatment.produs1.ciscoccservice.com/treatment/v1/organization/${orgId}/entrypoint/${emailEntryPoint}/treatmentOrder`

  const body = {
    treatmentsOrder,
    defaultQueue: process.env.CJP_EMAIL_QUEUE_NAME,
  }

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body
  }

  return fetch(url, options)
}

async function getOrCreate (userId) {
  // find existing email treatment rule for user
  const existing = await findRule(userId)
  // create new email treatment rule if it doesn't exist
  if (!existing) {
    await create(userId)
  }
  // get the email treatment ID for the user
  const treatmentId = await getId(userId)
  // get the existing email treamtent ID order list
  const treatments = await listOrder(userId)
  // check if email treatment ID is alread in the list
  if (!treatments.find(v => v === treatmentId)) {
    // not in the list
    // add email treatment ID to the list, and update on server
    treatments.push(treatmentId)
    await modifyOrder(treatments)
  }
}

module.exports = {
  getOrCreate
}
