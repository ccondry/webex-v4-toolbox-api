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

async function getOrCreate (type, name) {
  // build data from template and input name
  const data = templates[type](name)
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

module.exports = {
  create,
  get,
  getOrCreate
}