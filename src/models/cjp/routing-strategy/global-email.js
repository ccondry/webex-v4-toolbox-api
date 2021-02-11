// this file adds a user's email queue to the global email queue routing strategy
const client = require('../client')
const convert = require('xml-js')

// gets the current email routing strategy by name
async function get (name) {
  const strategies = await client.routingStrategy.list()
  return strategies.auxiliaryDataList.find(strategy => {
    return strategy.attributes.name__s === name
  })
}

// gets the current email routing strategy by ID
async function getById (id) {
  const strategies = await client.routingStrategy.list()
  return strategies.auxiliaryDataList.find(strategy => {
    return strategy.id === id
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
function addQueueXml (script, name, queueId) {
  const queues = parseQueues(script)
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
  const updatedQueues = [entry, ...queues]
  // console.log('updatedQueues json:', updatedQueues)

  // get full json of current script
  const json = convert.xml2js(script, { compact: false, spaces: 1 })
  // update the queues part
  json.elements[0].elements[8].elements = updatedQueues
  // convert back to XML and return
  return convert.js2xml(json, { compact: false, spaces: 1 })
}

// Modify an existing routing strategy, replacing its current XML script
async function modifyRoutingStrategy (id, newXml) {
  // get the current data
  const strategy = await getById(id)
  console.log('current strategy body:\r\n', strategy)
  // build body for the modify request
  const body = [strategy]
  // replace properties with correct name convention for the API
  strategy.attributes.tid__s = strategy.attributes.tid
  delete strategy.attributes.tid
  
  strategy.attributes.sid__s = strategy.attributes.sid
  delete strategy.attributes.sid

  strategy.attributes.cstts__l = strategy.attributes.cstts
  delete strategy.attributes.cstts

  // set parent ID
  strategy.attributes.parentStrategyId__s = strategy.id

  // remove extra data
  delete strategy.auxiliaryDataType
  delete strategy.attributes._lmts__l
  delete strategy.attributes.sid__s

  // set script xml
  strategy.attributes.script__s = newXml

  try {
    console.log('new strategy body:\r\n', body)
    await client.routingStrategy.modify(body)
  } catch (e) {
    // TODO fix this
    console.log(`Failed to modify routing strategy: ${e.message}`)
    // throw Error(`Failed to modify routing strategy: ${e.message}`)
  }
}

async function provision (userId, queueId) {
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
    // console.log('strategy', strategy)
    // extract the routing strategy script
    const script = await getScript(strategy)
    // console.log('existing script:\r\n', script)
    // extract queues JSON array from routing strategy script
    const queues = parseQueues(script)
    // console.log('CJP global email routing strategy queues:', queues)
    // look for user's email queue in the routing strategy script
    const queue = findQueue(queues, queueId)
    if (!queue) {
      console.log(`CJP global email routing strategy does not contain the email queue with ID "${queueId}". Adding it...`)
      // queue not in the existing routing strategy script
      // modify the existing global email routing strategy and current routing strategy
      // console.log('current queues:', queues)
      const xml = addQueueXml(script, name, queueId)
      // console.log('new XML:', xml)
      await modifyRoutingStrategy(process.env.CJP_EMAIL_ROUTING_STRATEGY_ID, xml)
      // TODO enable this
      // await modifyRoutingStrategy(strategy.id, xml)
      console.log(`added the email queue named "${name}" with ID "${queueId}" to the CJP global email routing strategy`)
    } else {
      console.log(`the email queue named "${name}" with ID "${queueId}" is already in the CJP global email routing strategy`)
    }
  } catch (e) {
    throw e
  }
}

module.exports = {
  provision,
  get,
  getScript,
  addQueueXml,
  findQueue,
  parseQueues
}
