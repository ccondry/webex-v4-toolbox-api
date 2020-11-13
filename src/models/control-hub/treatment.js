const cache = require('../cache')
// control hub org ID
const chOrgId = process.env.ORG_ID

// email entry point ID
const emailEntryPoint = process.env.EMAIL_ENTRY_POINT_ID

// find treatment rule for specified user ID
async function list () {
  // get access token from cache
  const token = cache.getItem('acToken')
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
  const url = `https://treatment.produs1.ciscoccservice.com/treatment/v1/organization/${chOrgId}/entrypoint/${emailEntryPoint}/treatment`
  
  // get access token from cache
  const token = cache.getItem('acToken')
  
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
  const url = `https://treatment.produs1.ciscoccservice.com/treatment/v1/organization/${chOrgId}/entrypoint/${emailEntryPoint}/treatmentOrder`

  const body = {
    treatmentsOrder,
    defaultQueue: process.env.EMAIL_QUEUE_NAME,
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

module.exports = {
  create,
  findRule,
  getId,
  list,
  listRules,
  listOrder,
  modifyOrder
}
