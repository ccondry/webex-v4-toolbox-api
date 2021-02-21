require('dotenv').config()
const client = require('../src/models/cjp/client')
// set skill profile ID and team IDs on agent
async function modify (email) {
  try {
    // find existing
    const users = await client.user.list()
    const existing = users.details.users.find(v => v.attributes.email__s === email)
    console.log('existing', existing)
    existing.attributes._lmts__l = new Date().getTime()
    existing.attributes.cstts__l = existing.attributes.cstts
    existing.attributes.tid__s = existing.attributes.tid
    existing.attributes.street__s = 'test1'
    // existing.attributes.sid__s = existing.attributes.sid
    delete existing.attributes.cstts
    delete existing.attributes.tid
    delete existing.attributes.sid
    delete existing.password
    // console.log(existing)
    // clean current data
    // const clean = cleanTemplate(current)
    // const copy = JSON.parse(JSON.stringify(current))
    // // apply changes
    // changes(copy)
    // copy.auxiliaryDataType = null
    // copy.attributes._lmts__l = new Date().getTime()
    // delete copy.attributes.tid
    // delete copy.attributes.sid
    // // copy.id = current.id
    // // copy.attributes.sid__s = current.id
    // // log the modify request body to JSON file
    // log(`modify-user-${copy.attributes.email__s}`, [copy])

    // // modify with REST PUT
    await client.user.modify(existing.id, existing)
    console.log('success')
    process.exit(0)
  } catch (e) {
    console.log('failed to modify CJP user:', e.message)
    throw e
  }
}

modify('rbarrows0325@cc1.dc-01.com')
.catch(e => {})