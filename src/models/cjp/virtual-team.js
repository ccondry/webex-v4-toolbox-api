const client = require('./client')
const templates = require('./templates')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// find existing chat queue by name
async function get (name) {
	const virtualTeams = await client.virtualTeam.list()
	return virtualTeams.auxiliaryDataList.find(c => {
    return c.attributes.name__s === name
	})
}

// create chat queue using provided name
async function create (data) {
  await client.virtualTeam.create(data)
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
    // wait for it to be created
    await sleep(4000)
    vteam = await get(name)
    console.log(`found new CJP ${type} virtual team named "${name}": ${vteam.id}`)
  }
  return vteam
}

async function addTeam (queueName, teamId) {
  try {
    const existing = await get(queueName)
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
    const group = groups.find(v => v.order === 1)
    // add user team ID to distribution groups
    group.agentGroups.push({teamId})
    existing.attributes.callDistributionGroups__s = JSON.stringify(groups)
    // console.log('new', JSON.stringify(existing, null, 2))
    // update queue on CJP
    const response = await cjp.client.virtualTeam.modify(existing.id, [existing])
    return response
  } catch (e) {
    throw e
  }
}

module.exports = {
  create,
  get,
  getOrCreate,
  addTeam
}