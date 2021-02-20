// create a valid template in CJP that provision can copy from
const cjp = require('../../cjp')
const teamsLogger = require('../../teams-logger')
const log = require('../../json-logger')
const sleep = require('../../../utils').sleep

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
      // log modify request body to JSON file
      log(`modify-${type}-${newBody.attributes.name__s}`, [newBody])
      // modify on CJP
      await client[type].modify(existing.id, [newBody])
      console.log(`updated existing ${typeName} ${existing.attributes.name__s} ${existing.id}.`)
      // return the item's ID
      return existing
    } else {
      // create
      console.log(`creating new ${typeName} ${newBody.attributes.name__s}...`)
      // log creation request body to JSON file
      log(`create-${type}-${newBody.attributes.name__s}`, [newBody])
      // create on CJP
      const response = await client[type].create([newBody])
      // get new ID from response
      newBody.id = response[0].links[0].href.split('/').pop()
      console.log(`created new ${typeName} ${newBody.attributes.name__s}: ${newBody.id}.`)
      // wait for virtual team dbId to exist before returning
      if (type === 'virtualTeam') {
        // get full virtualTeam details, for the dbId
        let details = await cjp.client[type].get(newBody.id)
            
        // wait for virtualTeam dbId__l attribute to exist
        retryCount = 0
        while (!details.attributes.dbId__l) {
          await sleep(2000)
          details = await cjp.client[type].get(newBody.id)
          retryCount++
          // log every 20th retry
          if (retryCount % 20 === 0) {
            console.log(`retry number ${retryCount} of search for dbId of ${typeName} "${name}" (${newBody.id})`)
          }
        }
        // done
        newBody = details
        console.log(`found cjp ${typeName} ${details.attributes.name__s} (${newBody.id}) dbId after ${retryCount} retries.`)
      }
      // return new body
      return newBody
    }
    // done
  } catch (e) {
    throw e
  }
}

module.exports = provision