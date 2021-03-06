const client = require('./client')
const templates = require('./templates')
const log = require('../json-logger')
const utils = require('../../utils')

// find existing chat queue by name
async function get (name) {
	const virtualTeams = await client.virtualTeam.list()
	return virtualTeams.auxiliaryDataList.find(c => {
    return c.attributes.name__s === name
	})
}

// create chat queue using provided name
async function create (data) {
  log(`create-virtual-team-${data.attributes.name__s}`, data)
  return client.virtualTeam.create(data)
}

async function getOrCreate (type, name, teamId) {
  // build data from template and input name
  const data = templates[type](name, teamId)
  // find existing vteam
  let vteam = await get(name)
  if (vteam) {
    console.log(`found existing CJP ${type} virtual team named "${name}": ${vteam.id}`)
  } else {
    // vteam doesn't exist yet, so create it
    console.log(`CJP ${type} virtual team named "${name}" does not exist. Creating it now...`)
    await create(data)
    console.log(`created new CJP ${type} virtual team named "${name}"`)
    while (!vteam) {
      // wait for it to be created
      await utils.sleep(4000)
      vteam = await get(name)
    }
    console.log(`found new CJP ${type} virtual team named "${name}": ${vteam.id}`)
  }
  return vteam
}

async function addTeam (queueName, teamId) {
  try {
    const existing = await get(queueName)
    if (!existing) {
      throw Error(`virtual-team.addTeam could not find existing virtual team named ${queueName}`)
    }
    // fix attributes from GET data for using in PUT operation
    existing.attributes.tid__s = existing.attributes.tid
    existing.attributes.sid__s = existing.attributes.sid
    existing.attributes.cstts__l = existing.attributes.cstts
    
    delete existing.attributes.tid
    delete existing.attributes.sid
    delete existing.attributes.cstts
    
    // get existing call distribution groups
    const groups = JSON.parse(existing.attributes.callDistributionGroups__s)
    // console.log('groups', groups)
    // get the first distribution group
    const group = groups.find(v => v.order === 1)
    // add user team ID to distribution group if they are not already in it
    if (group.agentGroups.find(v => v.teamId === teamId)) {
      // already in the group
      console.log(`team "${teamId}" was already in call distribution group 1 of queue "${queueName}"`)
      return
    } else {
      // not in the group. add now.
      group.agentGroups.push({teamId})
      existing.attributes.callDistributionGroups__s = JSON.stringify(groups)
      // log json file
      log(`modify-virtual-team-${queueName}`, [existing])
      // update queue on CJP
      const response = await client.virtualTeam.modify(existing.id, [existing])
      console.log(`team "${teamId}" added to queue "${queueName}" call distribution group 1`)
      return response
    }
  } catch (e) {
    console.log(`failed to add team "${teamId}" to queue "${queueName}" call distribution group 1: ${e.message}`)
    throw e
  }
}


module.exports = {
  create,
  get,
  getOrCreate,
  addTeam
}