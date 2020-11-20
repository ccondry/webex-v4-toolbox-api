const client = require('../cjp/client')
const teamTemplate = require('./templates/team')
const sleep = require('../sleep')

module.exports = {
  upsert
}

async function upsert (teamName) {
  // console.log('team.upsert', teamName)
  // find existing team
  try {
    const response = await client.team.list()
    // console.log(response)
    // const summary = response.auxiliaryDataList.map(v => {
    //   return {
    //     id: v.id,
    //     name: v.attributes.name__s
    //   }
    // })
    // console.log('found', response.auxiliaryDataList.length, 'existing teams. Searching for', teamName, '...')
    const teams = response.auxiliaryDataList
    // find specific team
    let existingTeam = teams.find(v => v.attributes.name__s === teamName)
    if (existingTeam) {
      // console.log('found existing team', teamName, ':', existingTeam.id, ':', existingTeam.attributes.dbId__l)
      return existingTeam
    } else {
      // no existing team
      console.log('team', teamName, 'not found. Creating team...')
    }
  } catch (e) {
    console.log('Failed to find existing team', teamName, ':', e.message)
    throw e
  }

  // team not found - create new team
  let teamId
  try {
    // build team body
    const body = teamTemplate({name: teamName})
    // create team
    const response = await client.team.create(body)
    // extract new object ID from response
    teamId = response[0].links[0].href.split('/').pop()
    // log
    console.log('successfully created new team', teamName, ':', teamId)
  } catch (e) {
    console.log('Failed to create team', teamName, ':', e.message)
    throw e
  }

  // retrieve newly created team details
  try {
    console.log('waiting for new team', teamName, ':', teamId, 'to have a dbid...')
    await sleep(process.env.API_THROTTLE || 3000)
    console.log('retrieving new team', teamName, ':', teamId, '...')
    // get team
    const team = await client.team.get(teamId)
    console.log('returning new team', teamName, ':', teamId, ':', team.attributes.dbId__l)
    // return team
    return team
  } catch (e) {
    console.log('Failed to get new team', teamName, ':', e.message)
    throw e
  }
}
