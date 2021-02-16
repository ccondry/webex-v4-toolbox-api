require('dotenv').config()

const cjp = require('../src/models/cjp')

async function main () {
  try {
    const existing = await cjp.virtualTeam.get(`Q_Voice_dCloud`)
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
    // get user team ID
    const team = await cjp.team.get('T_dCloud_3834')
    console.log('found team', team)
    const teamId = team.id
    // add user team ID to distribution groups
    group.agentGroups.push({teamId})
    existing.attributes.callDistributionGroups__s = JSON.stringify(groups)
    // console.log('new', JSON.stringify(existing, null, 2))
    // update queue on CJP
    return cjp.client.virtualTeam.modify(existing.id, [existing])
  } catch (e) {
    throw e
  }
}

main()
.then(r => {
  console.log(r)
  process.exit(0)
})
.catch(e => {
  console.log(e.message)
  process.exit(1)
})