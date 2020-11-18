const client = require('../../client')
const templates = require('./templates')

// find existing chat queue by name
async function get (name) {
	const virtualTeams = await client.virtualTeam.list()
	return virtualTeams.auxiliaryDataList.find(c => {
    return c.attributes.name__s.includes(name)
	})
}

// create chat queue using provided name
async function create (data) {
  await client.virtualTeam.create(data)
}

async function getOrCreate (type, name) {
  // build data from template and input name
  const data = templates[type](name)
  // find existing vteam
  let vteam = await get(name)
  if (vteam) {
    console.log(`found existing CJP virtual team named "${name}": ${vteam.id}`)
  } else {
    // vteam doesn't exist yet, so create it
    await create(name, data)
    vteam = await get(name)
    console.log(`created new CJP virtual team named "${name}": ${vteam.id}`)
  }
  return vteam
}

module.exports = {
  create,
  get,
  getOrCreate
}