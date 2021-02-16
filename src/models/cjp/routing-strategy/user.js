const client = require('../client')
const epTemplate = require('./template')

async function provision ({
  name,
  entryPointDbId,
  queueDbId,
  tenantId,
  tenantName,
  entryPointId
}) {
  const rsTemplate = epTemplate({
    name,
    entryPointDbId,
    queueDbId,
    tenantId,
    tenantName,
    entryPointId
  })
  // console.log(rsTemplate)
  let list = await client.routingStrategy.list()
  let rs = list.find(v => v.attributes.name__s === name)
  if (!rs) {
    // create
    const response = await client.routingStrategy.create(rsTemplate)
    console.log('create routing strategy response:', response)
  }
  while (!rs) {
    // wait for it to be created
    await sleep(4000)
    // try to find it
    list = await client.routingStrategy.list()
    rs = list.find(v => v.attributes.name__s === name)
  }
  
  // create current RS body
  const currentRsTemplate = epTemplate({
    name: 'Current_' + name,
    entryPointDbId,
    queueDbId,
    tenantId,
    tenantName,
    entryPointId,
    parentId: rs.id
  })
  // search for current routing strategy
  let currentRs = list.find(v => v.attributes.name__s === 'Current_' + name)
  if (!currentRs) {
    // create
    const response = await client.routingStrategy.create(currentRsTemplate)
    console.log('create current routing strategy response:', response)
  }
  while (!currentRs) {
    // wait for it to be created
    await sleep(4000)
    // try to find it
    list = await client.routingStrategy.list()
    currentRs = list.find(v => v.attributes.name__s === 'Current_' + name)
  }
  
  // done
  return {
    rs,
    currentRs
  }
}

module.exports = {
  provision
}