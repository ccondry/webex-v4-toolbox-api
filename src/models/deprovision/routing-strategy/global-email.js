const cjpClient = require('../../cjp/client')
// wrapper for compatibility
const cjp = {
  get () {
    return cjpClient
  }
}
const globals = require('../../globals')
const teamsLogger = require('../../teams-logger')
// const convert = require('xml-js')
const {xml2js, js2xml} = require('../../parsers')

// get a routing strategy by name
async function get (name) {
  // get CJP client
  const client = await cjp.get()
  // get list of all routing strategies
  const strategies = await client.routingStrategy.list()
  // find by name
  return strategies.auxiliaryDataList.find(strategy => {
    return strategy.attributes.name__s === name
  })
}

// delete email routing strategy rule
async function deleteQueue (name) {
  try {
    await Promise.resolve(globals.initialLoad)
    if (!globals.get('webexV4CjpEmailRoutingStrategyName')) {
      // cannot continue without routing strategy name
      const message = 'global value "webexV4CjpEmailRoutingStrategyName" is missing'
      teamsLogger.log(message)
      throw Error(message)
    }
    // name of the global email routing strategy
    const strategyName = globals.get('webexV4CjpEmailRoutingStrategyName')
    // get the current global email routing strategy
    const strategy = await get('Current-' + strategyName)
    if (!strategy) {
      // cannot continue without the global email routing strategy
      const message = `No CJP global email routing strategy found named "Current-${strategyName}"`
      teamsLogger.log(message)
      throw Error(message)
    }
    // extract the routing strategy script
    const script = strategy.attributes.script__s
    // extract queues JSON array from routing strategy script
    // const json = convert.xml2js(script, { compact: false, spaces: 1 })
    const json = xml2js(script)
    // console.log('Current email routing strategy JSON:', json)
    // extract queues from converted XML
    // const queues = json.elements[0].elements[8].elements
    const queues = json['call-distribution-script']['call-flow-params']['param']
    // look for any matching user email queue names in the routing strategy script
    let index = queues.findIndex(v => v['@_name'] === name)
    let count = 0
    while (index >= 0) {
      count++
      // delete it from queues JSON
      queues.splice(index, 1)
      // look for more
      index = queues.findIndex(v => v['@_name'] === name)
    }
    if (count > 0) {
      // updates were made to routing strategy. save changes to CJP server.
      // convert modified json back to XML
      // const xml = convert.js2xml(json, { compact: false, spaces: 1 })
      const xml = js2xml(json)
      // modify current routing strategy
      await modifyRoutingStrategy(strategy.id, xml)
      // modify parent routing strategy
      await modifyRoutingStrategy(strategy.attributes.parentStrategyId__s, xml)
      console.log(`successfully removed ${count} email queue(s) named "${name}" from the CJP global email routing strategy ${strategyName}`)
    }
  } catch (e) {
    throw e
  }
}

// Modify an existing routing strategy, replacing its current XML script
async function modifyRoutingStrategy (id, newXml) {
  try {
    // get CJP client
    const client = await cjp.get()
    // get the current data
    const strategy = await client.routingStrategy.get(id)
    if (!strategy) {
      throw Error(`routing strategy with ID ${id} not found`)
    }
    // build body for the modify request
    const body = [strategy]
    // replace properties with correct name convention for the API
    strategy.attributes.tid__s = strategy.attributes.tid
    strategy.attributes.sid__s = strategy.attributes.sid
    strategy.attributes.cstts__l = strategy.attributes.cstts
    
    delete strategy.attributes.tid
    delete strategy.attributes.sid
    delete strategy.attributes.cstts

    // set script xml
    strategy.attributes.script__s = newXml
    
    // send modify request
    await client.routingStrategy.modify(id, body)
  } catch (e) {
    console.log(`Failed to modify routing strategy with ID ${id}: ${e.message}`)
    throw e
  }
}

module.exports = {
  delete: deleteQueue
}