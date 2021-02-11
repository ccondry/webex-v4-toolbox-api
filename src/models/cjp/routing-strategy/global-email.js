// this file adds a user's email queue to the global email queue routing strategy
const client = require('../client')
const convert = require('xml-js')

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
function findQueue (queues, id) {
  // find the queue element in the routing strategy data
  return queues.find(element => {
    return element.attributes.value === String(id)
  })
}

function parseQueues (script) {
  // convert routing strategy script XML to JSON
  const json = convert.xml2js(script, { compact: false, spaces: 1 })
  // extract relevant routing strategy queues data array
  return json.elements[0].elements[8].elements
}

// add new user email queue to the global email routing strategy queues list in XML
function addQueueXml (queues, name, queueId) {
  const entry = {
    type: 'element',
    name: 'param',
    attributes: {
      name,
      value: String(queueId),
      valueDataType: 'string',
      qualifier: 'vteam',
      description: '',
    }
  }
  // add new entry to existing array and conver to XML
  return convert.js2xml([entry, ...queues], { compact: false, spaces: 1 })
}

// Modify Email TAM
async function modifyRoutingStrategy (id, xml) {
  const body = [{
    id,
    attributes: {
      script__s: xml
    }
  }]

  try {
    await client.routingStrategy.modify(body)
  } catch (e) {
    // TODO fix this
    console.log(`Failed to modify routing strategy: ${e.message}`)
    // throw Error(`Failed to modify routing strategy: ${e.message}`)
  }
}

module.exports = async function (userId, queueId) {
  try {
    const name = `Q_Email_dCloud_${userId}`
    console.log(`provisioning CJP user email queue named "${name}" with ID "${queueId}" into global email routing strategy... `)
    // name of the global email routing strategy (current)
    const strategyName = process.env.CJP_CURRENT_EMAIL_ROUTING_STRATEGY_NAME
    // get the global email routing strategy
    const strategy = await get(strategyName)
    if (!strategy) {
      // cannot continue without the global email routing strategy
      throw Error(`No CJP global email routing strategy found named "${strategyName}"`)
    }
    // extract the routing strategy script
    const script = await getScript(strategy)
    // extract queues JSON array from routing strategy script
    const queues = parseQueues(script)
    // console.log('CJP global email routing strategy queues:', queues)
    // look for user's email queue in the routing strategy script
    const queue = findQueue(queues, queueId)
    if (!queue) {
      console.log(`CJP global email routing strategy does not contain the email queue with ID "${queueId}". Adding it...`)
      // queue not in the existing routing strategy script
      // modify the existing routing strategy and current routing strategy
      const xml = addQueueXml(queues, name, queueId)
      await modifyRoutingStrategy(process.env.CJP_EMAIL_ROUTING_STRATEGY_ID, xml)
      await modifyRoutingStrategy(strategy.id, xml)
      console.log(`added the email queue named "${name}" with ID "${queueId}" to the CJP global email routing strategy`)
    } else {
      console.log(`the email queue named "${name}" with ID "${queueId}" is already in the CJP global email routing strategy`)
    }
  } catch (e) {
    throw e
  }
}
