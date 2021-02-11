require('dotenv').config()
const id = process.env.CJP_EMAIL_ROUTING_STRATEGY_ID
const cjp = require('../src/models/cjp/client')

async function main () {
  try {
    const current = await cjp.routingStrategy.get(id)
    
    current.attributes.tid__s = current.attributes.tid
    current.attributes.sid__s = current.attributes.sid
    current.attributes.cstts__l = current.attributes.cstts
    
    delete current.attributes.tid
    delete current.attributes.sid
    delete current.attributes.cstts

    // console.log(current)
    await cjp.routingStrategy.modify(id, [current])
  } catch (e) {
    console.log(e.message)
  }
}

main()