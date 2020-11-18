const fetch = require('./fetch')
const convert = require('xml-js')

const client = require('./cjp/client')
const controlHub = require('./control-hub')

// routing strategy ID
const routingStrategyAWS = process.env.ROUTING_STRATEGY

// get relevant info from CJP email queue
async function getVirtualEmail (userId) {
  const name = `Q_Email_dCloud_${userId}`
  const queues = await client.virtualTeam.list()
  const queue = queues.auxiliaryDataList.find(queue => {
    return queue.attributes.name__s.includes(name)
  })
  if (queue) {
    return {
      id: queue.attributes.dbId__l,
      name: queue.attributes.name__s
    }
  } else {
    throw Error(`Could not find CJP email queue with name matching ${name}`)
  }
}

// gets the current email routing strategy
async function getEmailRoutingStrategy () {
  const name = process.env.CURRENT_ROUTING_STRATEGY_NAME
  const strategies = await client.routingStrategy.list()
  const strategy = strategies.auxiliaryDataList.find(strategy => {
    return strategy.attributes.name__s.includes(name)
  })
  if (strategy) {
    return strategy
  } else {
    throw Error(`no routing strategy found matching ${name}`)
  }
}

// gets the current routing strategy script
async function getRoutingStrategyScript (strategy) {
  return strategy.attributes.script__s
}

// find queue for userId in the provided XML routing strategy script
function findRoutingStrategyQueue (queues, userId) {
  // find the queue element in the routing strategy data
  return queues.find(element => {
    return element.attributes.name === `Q_Email_dCloud_${userId}`
  })
}

function parseRoutingStrategyQueues (script) {
  // convert routing strategy script XML to JSON
  const json = convert.xml2js(script, { compact: false, spaces: 1 })
  // extract relevant routing strategy queues data array
  return json.elements[0].elements[8].elements
}

function addQueueXml (queues, userId, queueId) {
  const entry = {
    type: 'element',
    name: 'param',
    attributes: {
      name: `Q_Email_dCloud_${userId}`,
      value: `${queueId}`,
      valueDataType: 'string',
      qualifier: 'vteam',
      description: '',
    }
  }
  // add new entry to existing array and conver to XML
  return convert.js2xml([entry, ...queues], { compact: false, spaces: 1 })
}

// Modify Email TAM
async function modifyTAM (id, xml) {
  const url = process.env.CJP_BASE_URL + '/api/auxiliary-data/resources/routing-strategy'

  const body = [{
    id,
    attributes: {
      script__s: xml
    }
  }]

  const options = {
    method: 'PUT',
    headers: {
      Authorization: `${process.env.CJP_RS_API_KEY};tenantId=${process.env.CJP_TENANT_ID}`,
      From: process.env.CJP_FROM_ADDRESS
    },
    body
  }

  try {
    await fetch(url, options)
  } catch (error) {
    throw error
  }
}

// provision a user
async function main (userId) {
  try {
    // find existing treatment rule for user
    const ruleName = await controlHub.treatment.findRule(userId)
    // create new treatment rule if it doesn't exist
    if (!ruleName) {
      await controlHub.treatment.create(userId)
    }
    // get the treatment ID for the user
    const treatmentId = await controlHub.treatment.getId(userId)
    // get the existing treamtent ID order list
    const treatments = await controlHub.treatment.listOrder(userId)
    // check if treatment ID is alread in the list
    if (!treatments.find(v => v === treatmentId)) {
      // not in the list
      // add treatment ID to the list, and update on server
      treatments.push(treatmentId)
      await treatments.modifyOrder(treatments)
    }
    // get the virtual team (queue) for this user
    const queue = await getVirtualEmail(userId)
    // get current routing strategy
    const strategy = await getEmailRoutingStrategy()
    if (!strategy) {
      throw Error(`no routing strategy found matching ${routingStrategyAWS}`)
    }
    // extract the routing strategy script
    const script = await getRoutingStrategyScript(strategy)
    // extract queues JSON array from routing strategy script
    const routingStrategyQueues = parseRoutingStrategyQueues(script)
    // look for user's email queue in the routing strategy script
    const routingStrategyQueue = findRoutingStrategyQueue(routingStrategyQueues, userId)
    if (!routingStrategyQueue) {
      const xml = addQueueXml(routingStrategyQueues, userId, queue.id)
      // queue not in the existing routing strategy script
      // modify the routing strategy and current routing strategy
      await modifyTAM(routingStrategyAWS, xml)
      await modifyTAM(strategy.id, xml)
    }
  } catch (e) {
    throw e
  }
}

module.exports = main