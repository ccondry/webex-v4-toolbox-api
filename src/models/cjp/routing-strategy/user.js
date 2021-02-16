const client = require('../client')
const epTemplate = require('./template')
const sleep = require('../../sleep')

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
  let strategies = await client.routingStrategy.list()
  let rs = strategies.auxiliaryDataList.find(strategy => {
    return strategy.attributes.name__s === name
  })
  if (!rs) {
    // create
    const response = await client.routingStrategy.create(rsTemplate)
    console.log('create routing strategy response:', response)
  }
  while (!rs) {
    // wait for it to be created
    await sleep(4000)
    // try to find it
    strategies = await client.routingStrategy.list()
    rs = strategies.auxiliaryDataList.find(strategy => {
      return strategy.attributes.name__s === name
    })
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
  let currentRs = strategies.auxiliaryDataList.find(strategy => {
    return strategy.attributes.name__s === 'Current_' + name
  })
  if (!currentRs) {
    // create
    const response = await client.routingStrategy.create(currentRsTemplate)
    console.log('create current routing strategy response:', response)
  }
  while (!currentRs) {
    // wait for it to be created
    await sleep(4000)
    // try to find it
    strategies = await client.routingStrategy.list()
    currentRs = strategies.auxiliaryDataList.find(strategy => {
      return strategy.attributes.name__s === 'Current_' + name
    })
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