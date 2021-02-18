// create a valid template in CJP that provision can copy from
const cjp = require('../../cjp')

// return a clean copy of a template JSON that can be modified
function cleanTemplate (template) {
  const copy = JSON.parse(JSON.stringify(template))
  
  // move timestamps to properly-named attributes, and update to current time
  const now = new Date().getTime()
  copy.attributes._lmts__l = now
  copy.attributes.cstts__l = now
  delete copy.attributes.cstts
  
  // move tenant ID to properly-named attribute
  copy.attributes.tid__s = copy.attributes.tid
  delete copy.attributes.tid

  // remove template's original IDs
  delete copy.id
  delete copy.attributes.sid

  // remove db ID as it will be generated
  delete copy.attributes.dbId__l

  return copy  
}

async function provision ({
  templateName,
  name,
  typeName,
  type,
  modify
}) {
  try {
    // cjp library
    const client = cjp.client
    // get the template from CJP
    const existingList = (await client[type].list()).auxiliaryDataList
    const template = existingList.find(v => v.attributes.name__s === templateName)
    // throw error if template not found
    if (!template) {
      teamsLogger.log(`${typeName} provisioning template "${templateName}" is missing! please create it.`)
      throw Error(`could not provision "${name}" - ${typeName} provisioning template "${templateName}" is missing`)
    }
    
    const newBody = cleanTemplate(template)
    // set name
    newBody.attributes.name__s = name

    // update or create on CJP
    // check for existing 
    const existing = existingList.find(v => v.attributes.name__s === name)
    // run any specific modifications to the data
    if (typeof modify === 'function') {
      modify(newBody, existing)
    }
    if (existing) {
      // update
      console.log(`updating existing ${typeName} ${existing.attributes.name__s} ${existing.id}...`)
      // set id of existing
      newBody.id = existing.id
      await client[type].modify(existing.id, [newBody])
      console.log(`updated existing ${typeName} ${existing.attributes.name__s} ${existing.id}.`)
      return existing.id
    } else {
      // create
      console.log(`creating new ${typeName} ${newBody.attributes.name__s}...`)
      const response = await client[type].create([newBody])
      const newId = response[0].links[0].href.split('/').pop()
      console.log(`created new ${typeName} ${newBody.attributes.name__s}: ${newId}.`)
      return newId
    }
    // done
  } catch (e) {
    throw e
  }
}

module.exports = provision