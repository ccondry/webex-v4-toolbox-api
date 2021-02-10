const client = require('./client')

async function get (name) {
  try {
    const skills = await list()
    return skills.find(v => {
      return v.attributes.name__s === name
    })
  } catch (e) {
    throw e 
  }
}

async function list () {
  try {
    const skills = await client.skill.list()
    return skills.auxiliaryDataList
  } catch (e) {
    throw e 
  }
}
module.exports = {
  get,
  list
}