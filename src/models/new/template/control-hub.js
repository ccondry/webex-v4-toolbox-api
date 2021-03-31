const ch = require('../../control-hub')
const teamsLogger = require('../../teams-logger')
const log = require('../../json-logger')
const sleep = require('../../../utils').sleep

async function provision ({
  name,
  templateName,
  typeName,
  type,
  modify,
  // the name of the ID parameter in the object
  idName = 'id'
}) {
  try {
    // provision client
    const client = await ch.client.get()
    // get all existing chat templates
    const existingList = await client.contactCenter[type].list()
    // find the template object in list
    const templateExists = existingList.find(v => v.name === templateName)
    // throw error if template not found
    if (!templateExists) {
      teamsLogger.log(`Control Hub ${typeName} provisioning template "${templateName}" is missing! please create it.`)
      throw Error(`could not provision "${name}" - ${typeName} provisioning template "${templateName}" is missing`)
    }

    // get full template data body
    const template = await client.contactCenter[type].get(templateExists[idName])
    // delete original ID
    delete template[idName]
    // set name
    template.name = name

    // check for existing user object
    const existing = existingList.find(v => v.name === name)
    // run any specific modifications to the data using caller-provided function
    if (typeof modify === 'function') {
      modify(template, existing)
    }
    if (existing) {
      // update existing user object
      console.log(`updating existing Control Hub ${typeName} ${existing.name} ${existing[idName]}...`)
      // set id using existing one
      template[idName] = existing[idName]
      // log modify request body to JSON file
      log(`modify-control-hub-${type}-${template.name}`, template)
      // modify on Control Hub
      await client.contactCenter[type].modify(existing[idName], template)
      console.log(`updated existing Control Hub ${typeName} ${existing.name} ${existing[idName]}.`)
      // return the item
      return existing
    } else {
      // doesn't exist yet - create it
      console.log(`creating new Control Hub ${typeName} ${name}...`)
      // log creation request body to JSON file
      log(`create-control-hub-${type}-${name}`, template)
      // create on Control Hub
      await client.contactCenter[type].create(template)
      // wait for it to exist
      let newExists
      let count = 0
      const maxCount = 10
      while (!newExists && count < maxCount) {
        await sleep(2000)
        const newList = await client.contactCenter[type].list()
        newExists = newList.find(v => v.name === name)
        count++
      }
      if (newExists) {
        console.log(`created new Control Hub ${typeName} ${name}: ${newExists[idName]}`)
        // return new template ID
        return newExists
      } else {
        throw Error(`failed to find new Control Hub ${typeName} ${name} after ${count} retries of searching after creating it.`)
      }
    }
    // done
  } catch (e) {
    throw e
  }
}

module.exports = provision