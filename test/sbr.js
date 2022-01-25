require('dotenv').config()
const cjp = require('../src/models/cjp')
const globals = require('../src/models/globals')
const demoVersion = 'webexV' + require('../src/models/demo-version')

async function cleanQueue () {
  try {
    await Promise.resolve(globals.initialLoad)
    const client = cjp.client
    
    const queues = await client.virtualTeam.list()
    const queueName = globals.get(demoVersion + 'VoiceQueueName')
    const queue = queues.auxiliaryDataList.find(v => v.attributes.name__s === queueName)
    if (!queue) {
      throw Error(`queue "${queueName}" not found`)
    }
    // fix attributes from GET data for using in PUT operation
    queue.attributes.tid__s = queue.attributes.tid
    queue.attributes.sid__s = queue.attributes.sid
    queue.attributes.cstts__l = queue.attributes.cstts
    
    delete queue.attributes.tid
    delete queue.attributes.sid
    delete queue.attributes.cstts
  
    // get existing call distribution groups
    const groups = JSON.parse(queue.attributes.callDistributionGroups__s)
    // get the first distribution group
    const group = groups.find(v => v.order === 1)
    if (!group) {
      throw Error(`call distribution group 1 not found`)
    }
    // filter out all agent groups
    group.agentGroups = []
    queue.attributes.callDistributionGroups__s = JSON.stringify(groups)
    // update queue on CJP
    return client.virtualTeam.modify(queue.id, [queue])
  } catch (e) {
    throw e
  }
}

cleanQueue()
.then(r => process.exit(0))
.catch(e => console.log(e.message))