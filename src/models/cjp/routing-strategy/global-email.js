// this file adds a user's email queue to the global email queue routing strategy
const client = require('../client')

// gets the current email routing strategy
async function get (name) {
  const strategies = await client.routingStrategy.list()
  return strategies.auxiliaryDataList.find(strategy => {
    return strategy.attributes.name__s === name
  })
}

// gets the current routing strategy script
async function getScript (strategy) {
  return strategy.attributes.script__s
}

// find queue for userId in the provided XML routing strategy script
function findQueue (queues, userId) {
  // find the queue element in the routing strategy data
  return queues.find(element => {
    return element.attributes.name === `Q_Email_dCloud_${userId}`
  })
}

function parseQueues (script) {
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
  } catch (e) {
    throw e
  }
}

module.exports = async function (userId) {
  try {
    // name of the global email routing strategy (current)
    const strategyName = process.env.CJP_CURRENT_EMAIL_ROUTING_STRATEGY_NAME
    const strategy = await get(strategyName)
    if (!strategy) {
      throw Error(`No email routing strategy found matching ${strategyName}`)
    }
    // extract the routing strategy script
    const script = await getScript(strategy)
    // extract queues JSON array from routing strategy script
    const queues = parseQueues(script)
    // look for user's email queue in the routing strategy script
    const queue = findQueue(queues, userId)
    if (!queue) {
      // queue not in the existing routing strategy script
      // modify the existing routing strategy and current routing strategy
      const xml = addQueueXml(queues, userId, queue.id)
      await modifyTAM(process.env.CJP_EMAIL_ROUTING_STRATEGY_ID, xml)
      await modifyTAM(strategy.id, xml)
    }
  } catch (e) {
    throw e
  }
}
