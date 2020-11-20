const client = require('../cjp/client')
const routingStrategyTemplate = require('./templates/routing-strategy')
const sleep = require('../sleep')

module.exports = {
  upsert
}

async function upsert ({
  name,
  virtualTeamId,
  virtualTeamDbId,
  virtualTeamName,
  teamId,
  teamName
}) {
  // console.log('routingStrategy.upsert', name)

  // find existing routing strategy
  try {
    const response = await client.routingStrategy.list()
    const summary = response.auxiliaryDataList.map(v => {
      return {
        id: v.id,
        name: v.attributes.name__s
      }
    })
    // console.log('found', response.auxiliaryDataList.length, 'existing routing strategies. Searching for', name, '...')
    const items = response.auxiliaryDataList
    // find specific item
    const existing = items.find(v => v.attributes.name__s === name)
    if (existing) {
      console.log('found existing routing strategy', name, ':', existing.id, ':')
      return existing
    } else {
      // no existing
      console.log('routing strategy', name, 'not found. Creating new...')
    }
  } catch (e) {
    console.log('Failed while searching for existing routing strategy', name, ':', e.message)
    throw e
  }

  // create new
  let id
  let currentRsId
  try {
    console.log('creating new routing strategy', name, '...')
    // build from template
    const body = routingStrategyTemplate({
      name,
      virtualTeamId,
      virtualTeamDbId,
      virtualTeamName,
      teamId,
      teamName
    })
    // console.log('routing strategy template:', body)
    // create new
    const response = await client.routingStrategy.create(body)
    // console.log('successfully created new routing strategy', name, ':', JSON.stringify(response, null, 2))
    // extract routing strategy ID
    id = response[0].links[0].href.split('/').pop()
    console.log('Successfully created new routing strategy', name, ':', id)
    // return routingStrategy
    // console.log('waiting before getting new routing strategy details...')
    await sleep(process.env.API_THROTTLE || 8000)
    // get new routing strategy details
    const rs = await client.routingStrategy.get(id)
    return rs
    // // console.log(JSON.stringify(rs, null, 2))
    // // modify name
    // rs.attributes.name__s = 'Current-' + rs.attributes.name__s
    // // modify current flag
    // rs.attributes.currentStatus__i = 1
    // // replace properties with correct name convention for the API
    // rs.attributes.tid__s = rs.attributes.tid
    // delete rs.attributes.tid
    //
    // rs.attributes.sid__s = rs.attributes.sid
    // delete rs.attributes.sid
    //
    // rs.attributes.cstts__l = rs.attributes.cstts
    // delete rs.attributes.cstts
    //
    // // set parent ID
    // rs.attributes.parentStrategyId__s = id
    //
    // // console.log(JSON.stringify(rs, null, 2))
    // // create current rs
    // const response2 = await client.routingStrategy.create([rs])
    //
    // currentRsId = response2[0].links[0].href.split('/').pop()
    // console.log('successfully created new current routing strategy', body[0].attributes.name__s, ':', currentRsId)
  } catch (e) {
    console.log('Failed to create new routing strategy', name, ':', e.message)
    throw e
  }

  // retrieve newly created routing strategy details
  try {
    console.log('retrieving new routing strategy', name, ':', id, '...')
    // get
    const item = await client.routingStrategy.get(id)
    console.log('details for new routing strategy retrieved successfully.')
    console.log('returning new routing strategy', name, ':', id)
    // return item
    return item
  } catch (e) {
    console.log('Failed to get routing strategy', name, ':', e.message)
    throw e
  }
}
