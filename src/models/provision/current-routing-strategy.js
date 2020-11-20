const client = require('../cjp/client')

module.exports = {
  upsert
}

async function upsert (routingStrategy) {
  // console.log('currentRoutingStrategy.upsert')
  const name = 'Current-' + routingStrategy.attributes.name__s
  // find existing routing strategy
  try {
    const response = await client.routingStrategy.list()
    const summary = response.auxiliaryDataList.map(v => {
      return {
        id: v.id,
        name: v.attributes.name__s
      }
    })
    // console.log('found', response.auxiliaryDataList.length, 'existing current routing strategies. Searching for', name, '...')
    const items = response.auxiliaryDataList
    // find specific item
    const existing = items.find(v => v.attributes.name__s === name)
    if (existing) {
      console.log('found existing current routing strategy', name, ':', existing.id, ':')
      return existing
    } else {
      // no existing
      console.log('current routing strategy', name, 'not found. Creating new...')
    }
  } catch (e) {
    console.log('Failed while searching for existing current routing strategy', name, ':', e.message)
    throw e
  }

  // create new current routing strategy
  try {
    // copy routing strategy data
    const rs = JSON.parse(JSON.stringify(routingStrategy))
    // console.log(JSON.stringify(rs, null, 2))
    // modify name
    rs.attributes.name__s = 'Current-' + rs.attributes.name__s
    // modify current flag
    rs.attributes.currentStatus__i = 1
    // replace properties with correct name convention for the API
    rs.attributes.tid__s = rs.attributes.tid
    delete rs.attributes.tid

    rs.attributes.sid__s = rs.attributes.sid
    delete rs.attributes.sid

    rs.attributes.cstts__l = rs.attributes.cstts
    delete rs.attributes.cstts

    // set parent ID
    rs.attributes.parentStrategyId__s = rs.id

    // remove id
    delete rs.id
    // remove extra data
    delete rs.auxiliaryDataType
    delete rs.attributes._lmts__l
    delete rs.attributes.sid__s

    // console.log(JSON.stringify(rs, null, 2))
    // create current rs
    const response2 = await client.routingStrategy.create([rs])

    currentRsId = response2[0].links[0].href.split('/').pop()
    console.log('successfully created new current routing strategy', name, ':', currentRsId)
  } catch (e) {
    console.log('Failed to create new routing strategy', name, ':', e.message)
    throw e
  }

  // retrieve newly created routing strategy details
  try {
    console.log('retrieving new routing strategy', name, ':', currentRsId, '...')
    // get
    const item = await client.routingStrategy.get(currentRsId)
    console.log('details for new routing strategy retrieved successfully.')
    console.log('returning new routing strategy', name, ':', currentRsId)
    // return item
    return item
  } catch (e) {
    console.log('Failed to get routing strategy', name, ':', e.message)
    throw e
  }
}
