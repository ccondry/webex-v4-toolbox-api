require('dotenv').config()
const provision = require('../src/models/new/template/provision')
const cjp = require('../src/models/cjp/client')
const globals = require('../src/models/globals')
const {xml2js, js2xml} = require('../src/models/parsers')

async function main (userId) {
  // get user team ID
  const teamList = await cjp.team.list()
  const team = teamList.auxiliaryDataList.find(v => v.attributes.name__s === 'T_dCloud_' + userId)
  const teamId = team.id

  // wait for globals to init
  await Promise.resolve(globals.initialLoad)
  // get the names of the templates from globals
  const chatQueueTemplateName = globals.get('webexV4ChatQueueTemplateName')
  const emailQueueTemplateName = globals.get('webexV4EmailQueueTemplateName')
  const chatEntryPointTemplateName = globals.get('webexV4ChatEntryPointTemplateName')
  const chatEntryPointRoutingStrategyTemplateName = globals.get('webexV4ChatEntryPointRoutingStrategyTemplateName')

  // // chat queue
  const chatQueueId = await provision({
    templateName: chatQueueTemplateName,
    name: 'Q_Chat_dCloud_' + userId,
    type: 'virtualTeam',
    typeName: 'chat queue',
    modify: (body) => {
      // apply these modifications to the template data
      const distributionGroups = [{
        order: 1,
        duration: 0,
        agentGroups: [{
          teamId
        }]
      }]
      body.attributes.callDistributionGroups__s = JSON.stringify(distributionGroups)
    }
  })

  // get full chat queue details, for the dbId
  const chatQueue = await cjp.virtualTeam.get(chatQueueId)

  // email queue
  const emailQueueId = await provision({
    templateName: emailQueueTemplateName,
    name: 'Q_Email_dCloud_' + userId,
    type: 'virtualTeam',
    typeName: 'email queue',
    modify: (body) => {
      // apply these modifications to the template data
      const distributionGroups = [{
        order: 1,
        duration: 0,
        agentGroups: [{
          teamId
        }]
      }]
      body.attributes.callDistributionGroups__s = JSON.stringify(distributionGroups)
    }
  })

  // get full email queue details, for the dbId
  const emailQueue = await cjp.virtualTeam.get(emailQueueId)

  // chat entry point
  const chatEntryPointId = await provision({
    templateName: chatEntryPointTemplateName,
    name: 'EP_Chat_' + userId,
    type: 'virtualTeam',
    typeName: 'chat entry point'
  })

  // get chat entry point details, for the dbId
  const chatEntryPoint = await cjp.virtualTeam.get(chatEntryPointId)

  // chat entry point routing strategy
  await provision({
    templateName: chatEntryPointRoutingStrategyTemplateName,
    name: 'EP_Chat_' + userId,
    type: 'routingStrategy',
    typeName: 'chat entry point routing strategy',
    modify: (body) => {
      // set script
      const json = xml2js(body.attributes.script__s)
      // get current time in milliseconds
      const now = new Date().getTime()
      const startOfToday = Math.floor(now / 1000 / 86400) * 86400 * 1000
      json['call-distribution-script']['@_name'] = 'EP_Chat_' + userId
      json['call-distribution-script']['@_scriptid'] = now
      // start date is start of day today in milliseconds
      json['call-distribution-script']['@_start-date'] = startOfToday
      // chat entry point ID
      json['call-distribution-script']['vdn']['@_id'] = chatEntryPoint.attributes.dbId__l
      // chat entry point db ID
      json['call-distribution-script']['vdn']['@_vteam-id'] = chatEntryPoint.attributes.dbId__l
      // chat entry point name
      json['call-distribution-script']['vdn']['@_vteam-name'] = 'EP_Chat_' + userId
      // chat queue db ID
      json['call-distribution-script']['call-flow-params']['param']['@_value'] = chatQueue.attributes.dbId__l
      // convert script back to xml
      body.attributes.script__s = js2xml(json)
      // chat entry point db ID
      body.attributes.legacyVirtualTeamId__l = chatEntryPoint.attributes.dbId__l
      // chat entry point ID
      body.attributes.virtualTeamId__s = chatEntryPointId
    }
  })

  // chat entry point current routing strategy
  await provision({
    templateName: 'Current-' + chatEntryPointRoutingStrategyTemplateName,
    name: 'Current-EP_Chat_' + userId,
    type: 'routingStrategy',
    typeName: 'chat entry point current routing strategy',
    modify: (body) => {
      // set script
      const json = xml2js(body.attributes.script__s)
      // get current time in milliseconds
      const now = new Date().getTime()
      json['call-distribution-script']['@_name'] = 'Current-EP_Chat_' + userId
      json['call-distribution-script']['@_scriptid'] = now
      // start date is start of day today in milliseconds
      const startOfToday = Math.floor(now / 1000 / 86400) * 86400 * 1000
      json['call-distribution-script']['@_start-date'] = startOfToday
      json['call-distribution-script']['@_end-date'] = startOfToday
      // chat entry point ID
      json['call-distribution-script']['vdn']['@_id'] = chatEntryPoint.attributes.dbId__l
      // chat entry point db ID
      json['call-distribution-script']['vdn']['@_vteam-id'] = chatEntryPoint.attributes.dbId__l
      // chat entry point name
      json['call-distribution-script']['vdn']['@_vteam-name'] = 'Current-EP_Chat_' + userId
      // chat queue db ID
      json['call-distribution-script']['call-flow-params']['param']['@_value'] = chatQueue.attributes.dbId__l
      // convert script back to xml
      body.attributes.script__s = js2xml(json)
      // chat entry point db ID
      body.attributes.legacyVirtualTeamId__l = chatEntryPoint.attributes.dbId__l
      // chat entry point ID
      body.attributes.virtualTeamId__s = chatEntryPointId
    }
  })
}

main('0325')
.then(r => process.exit(0))
.catch(e => console.log('error:', e.message))