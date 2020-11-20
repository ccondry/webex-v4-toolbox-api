const client = require('../cjp/client')
const virtualTeamTemplate = require('./templates/virtual-team')
const sleep = require('../sleep')

module.exports = {
  upsert
}

async function upsert ({
  name,
  description = '',
  serviceLevelThreshold = 120,
  maxActiveCalls = 10,
  channelType = 1
}) {
  // console.log('virtualTeam.upsert', name)

  let virtualTeamId

  // find existing virtual team
  try {
    const response = await client.virtualTeam.list()
    const summary = response.auxiliaryDataList.map(v => {
      return {
        id: v.id,
        name: v.attributes.name__s
      }
    })
    // console.log('found', response.auxiliaryDataList.length, 'existing virtual teams. Searching for', name, '...')
    const virtualTeams = response.auxiliaryDataList
    // find specific virtual team
    const existingVirtualTeam = virtualTeams.find(v => v.attributes.name__s === name)
    if (existingVirtualTeam) {
      virtualTeamId = existingVirtualTeam.id
      // console.log('found existing virtual team', name, ':', virtualTeamId, ':', existingVirtualTeam.attributes.dbId__l)
      // console.log('updating existing virtual team', name, 'settings...')
      // update existing object
      try {

        const body = JSON.parse(JSON.stringify(existingVirtualTeam))
        body.attributes.name__s = name
        body.attributes.description__s = description
        body.attributes.serviceLevelThreshold__i = serviceLevelThreshold
        body.attributes.maximumActiveCalls__i = maxActiveCalls
        body.attributes.channelType__i = channelType

        body.attributes.tid__s = body.attributes.tid
        delete body.attributes.tid

        body.attributes.sid__s = body.attributes.sid
        delete body.attributes.sid

        body.attributes.cstts__l = body.attributes.cstts
        delete body.attributes.cstts

        await client.virtualTeam.modify(virtualTeamId, [body])
        console.log('successfully updated virtual team', name, ':', virtualTeamId)
      } catch (e) {
        console.log('failed to update virtual team', name, e.message)
        throw e
      }

      return existingVirtualTeam
    } else {
      // no existing virtual team
      console.log('virtual team', name, 'not found. Creating virtual team...')
    }
  } catch (e) {
    console.log('Failed to find existing virtual team', name, ':', e.message)
    throw e
  }

  // create new virtual team
  try {
    console.log('creating new virtual team', name, '...')
    // create virtual team template
    const body = virtualTeamTemplate({
      name,
      description,
      serviceLevelThreshold,
      maxActiveCalls,
      channelType
    })
    console.log('virtual team template:', body)
    // create virtual team
    const response = await client.virtualTeam.create(body)
    // check HTTP status inside the response
    if (response[0].code < 200 || response[0].code >= 300) {
      console.log('Failed to create new virtual team - status code', response[0].code, response[0])
      // HTTP error code
      throw Error('Failed to create new virtual team - status code ' + response[0].code, response[0])
    }
    console.log('successfully created new virtual team', name, ':', JSON.stringify(response, null, 2))
    // extract virtual team ID
    virtualTeamId = response[0].links[0].href.split('/').pop()
    console.log('Successfully created new virtual team', name, ':', virtualTeamId)
  } catch (e) {
    console.log('Failed to create new virtual team', name, ':', e.message)
    throw e
  }

  // retrieve newly created virtual team details
  try {
    console.log('waiting for new virtual team', name, ':', virtualTeamId, 'to have a dbid...')
    await sleep(process.env.API_THROTTLE || 3000)
    console.log('retrieving new virtual team', name, ':', virtualTeamId, '...')
    // get virtualTeam
    const virtualTeam = await client.virtualTeam.get(virtualTeamId)
    console.log('returning new virtual team', name, ':', virtualTeamId, ':')
    // return virtualTeam
    return virtualTeam
  } catch (e) {
    console.log('Failed to get virtual team', name, ':', e.message)
    throw e
  }
}
