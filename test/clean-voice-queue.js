// remove team IDs for teams that no longer exist from the global voice queue
// call distribution group
require('dotenv').config()
const globals = require('../src/models/globals')
// get the CJP client library
const client = require('../src/models/cjp/client')

async function main () {
  try {
    // get the global voice queue name from globals
    const queueName = await globals.getAsync('webexV4VoiceQueueName')
    // get list of all currently-existing teams
    const teams = await client.team.list()
    // find the global voice queue object
    const queues = await client.virtualTeam.list()
    const queue = queues.auxiliaryDataList.find(v => {
      return v.attributes.name__s === queueName
    })
    if (!queue) {
      throw Error(`queue "${queueName}" not found`)
    }

    // parse the existing call distribution groups JSON of the global voice
    // queue
    const groups = JSON.parse(queue.attributes.callDistributionGroups__s)
    // get the first distribution group
    const group = groups.find(v => v.order === 1)
    if (!group) {
      // there should be 1 distribution group
      throw Error(`call distribution group 1 not found`)
    }
    // how many teams are in the queue right now
    const originalCount = group.agentGroups.length
    // filter out the teams that no longer exist
    group.agentGroups = group.agentGroups.filter(v => {
      return teams.find(team => team.id === v.teamId)
    })
    // how many teams are in the queue now that we filtered it
    const newCount = group.agentGroups.length
    if (originalCount === newCount) {
      // no changes, so nothing to do
      console.log(`all ${originalCount} teams in the global voice queue "${queue.attributes.name__s}" (${queue.id}) are existing teams.`)
      return
    } else {
      // team count changed. update queue on the CJP server.
      // transition queue attributes from GET data to PUT data
      queue.attributes.tid__s = queue.attributes.tid
      queue.attributes.sid__s = queue.attributes.sid
      queue.attributes.cstts__l = queue.attributes.cstts
      delete queue.attributes.tid
      delete queue.attributes.sid
      delete queue.attributes.cstts
      // update attributes with new stringified JSON
      queue.attributes.callDistributionGroups__s = JSON.stringify(groups)
      // update queue using REST request to CJP
      // await client.virtualTeam.modify(queue.id, [queue])
      // done
      console.log(`successfully removed ${originalCount - newCount} old teams from the global voice queue "${queue.attributes.name__s}" (${queue.id})`)
    }
  } catch (e) {
    console.log(`failed to remove old teams from the global voice queue: ${e.message}`)
    throw e
  }
}

main()