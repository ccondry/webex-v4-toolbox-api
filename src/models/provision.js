const cjp = require('./cjp')
const controlHub = require('./control-hub')
const teamsNotifier = require('./teams-notifier')
const toolbox = require('./toolbox')
const globals = require('./globals')
const ldap = require('./ldap')
const db = require('./db')
const provision = require('./new/template/provision')
const {xml2js, js2xml} = require('./parsers')

const domain = process.env.DOMAIN

// Sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = async function (user) {
  try {
    // make sure globals are initialized
    await Promise.resolve(globals.initialLoad)

    const userId = user.id

    // create Rick user details
    const rick = {
      firstName: 'Rick', 
      lastName: `Barrows${userId}`,
      name: `Rick Barrows${userId}`,
      email: `rbarrows${userId}@${domain}`
    }
    
    // create Sandra user details
    const sandra = {
      firstName: 'Sandra', 
      lastName: `Jefferson${userId}`,
      name: `Sandra Jefferson${userId}`,
      email: `sjeffers${userId}@${domain}`
    }

    // get globals
    const voiceQueueName = globals.get('webexV4VoiceQueueName')
    const globalTeamName = globals.get('webexV4GlobalTeamName')
    const siteId = globals.get('webexV4BroadCloudSiteId')

    // get the names of the templates from globals
    const chatQueueTemplateName = globals.get('webexV4ChatQueueTemplateName')
    const emailQueueTemplateName = globals.get('webexV4EmailQueueTemplateName')
    const chatEntryPointTemplateName = globals.get('webexV4ChatEntryPointTemplateName')
    const chatEntryPointRoutingStrategyTemplateName = globals.get('webexV4ChatEntryPointRoutingStrategyTemplateName')

    
    // start provisioning user
    // set default provision info
    const updates = {
      $set: {
        'demo.webex-v4prod.CiscoAppId': 'cisco-chat-bubble-app',
        'demo.webex-v4prod.DC': 'produs1.ciscoccservice.com',
        'demo.webex-v4prod.async': true,
        'demo.webex-v4prod.orgId': process.env.ORG_ID
      },
      $currentDate: {
        'demo.webex-v4prod.lastAccess': {$type: 'date'}
      }
    }
    await db.updateOne('toolbox', 'users', {id: userId}, updates)

    // provision LDAP users
    await ldap.createUsers({userId})

    // wait for LDAP sync to complete
    let chSandra
    let chRick
    while (!chSandra || !chRick) {
      // try to find agent and supervisor users
      try {
        console.log('searching for', sandra.email, 'in Control Hub...')
        chSandra = await controlHub.user.get(sandra.email)
        console.log('found', sandra.email, 'in Control Hub.')
        console.log('searching for', rick.email, 'in Control Hub...')
        chRick = await controlHub.user.get(rick.email)
        console.log('found', rick.email, 'in Control Hub.')
      } catch (e) {
        console.log('failed to find one of', sandra.email, 'or', rick.email, ':', e.message)
        // wait 20 seconds before trying again
        await sleep(20 * 1000)
      }
    }

    // get or create CJP user team for chat and email routing
    const userTeam = await cjp.team.getOrCreate(`T_dCloud_${userId}`)
    // add user team to main voice queue Q_Voice_dCloud
    await cjp.virtualTeam.addTeam(voiceQueueName, userTeam.id)

    // new template provision script
    // chat queue
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
            teamId: userTeam.id
          }]
        }]
        body.attributes.callDistributionGroups__s = JSON.stringify(distributionGroups)
      }
    })

    // get full chat queue details, for the dbId
    let chatQueue = await cjp.client.virtualTeam.get(chatQueueId)
        
    // wait for chat queue to exist
    let count = 0
    while (!chatQueue.attributes.dbId__l && count < 10) {
      await sleep(2000)
      chatQueue = await cjp.client.virtualTeam.get(chatQueueId)
      count++
    }
    if (!chatQueue.attributes.dbId__l) {
      throw Error(`chatQueue.attributes.dbId__l did not exist for virtual team with ID ${chatQueueId}, even after ${count} retries.`)
    }

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
            teamId: userTeam.id
          }]
        }]
        body.attributes.callDistributionGroups__s = JSON.stringify(distributionGroups)
      }
    })

    // get full email queue details, for the dbId
    let emailQueue = await cjp.client.virtualTeam.get(emailQueueId)

    // wait for email queue dbId to exist
    count = 0
    while (!emailQueue.attributes.dbId__l && count < 10) {
      await sleep(2000)
      emailQueue = await cjp.client.virtualTeam.get(emailQueueId)
      count++
    }
    if (!emailQueue.attributes.dbId__l) {
      throw Error(`emailQueue.attributes.dbId__l did not exist for virtual team with ID ${emailQueueId}, even after ${count} retries.`)
    }
    // chat entry point
    const chatEntryPointId = await provision({
      templateName: chatEntryPointTemplateName,
      name: 'EP_Chat_' + userId,
      type: 'virtualTeam',
      typeName: 'chat entry point'
    })

    // get chat entry point details, for the dbId
    let chatEntryPoint = await cjp.client.virtualTeam.get(chatEntryPointId)

    // wait for chat entry point dbId to exist
    count = 0
    while (!chatEntryPoint.attributes.dbId__l && count < 10) {
      await sleep(2000)
      chatEntryPoint = await cjp.client.virtualTeam.get(chatEntryPointId)
      count++
    }
    if (!chatEntryPoint.attributes.dbId__l) {
      throw Error(`chatEntryPoint.attributes.dbId__l did not exist for virtual team with ID ${chatEntryPointId}, even after ${count} retries.`)
    }

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

    // get or create the Webex Control Hub chat template
    const chatTemplate = await controlHub.chatTemplate.getOrCreate(userId, chatEntryPoint.id)
    // await sleep(3000)
  
    // Debug
    // console.log(chatTemplate)
    // const chatTemplates = await controlHub.chatTemplate.list()
    // console.log(chatTemplates)

    // add read-only admin role to Rick user in Webex Control Hub
    const ch = await controlHub.client.getClient()
    ch.user.modify({
      userId: chRick.id,
      roles: ['id_readonly_admin']
    })
    console.log(`set Control Hub user ${rick.name} to Read-Only Admin`)
    
    // reset control hub user license
    await controlHub.user.enableStandardContactCenterAgent({email: rick.email})
    // enable Rick for Contact Center Supervisor in Webex Control Hub
    await controlHub.user.enableContactCenterSupervisor({email: rick.email})
    console.log(`enabled Control Hub user ${rick.name} as Contact Center Supervisor`)
    // await sleep(3000)
    // enable user contact center licenses
    await controlHub.user.onboard(rick.email)

    // get Rick user object from Webex Control Hub
    rick.webex = await controlHub.user.get(rick.email)
    console.log(`got Control Hub user details for ${rick.name}: ${rick.webex.id}`)
    // await sleep(1000)

    // Debug
    // const webexRick = await controlHub.user.get(rick.email)
    // console.log(webexRick)
    
    // make Rick a supervisor in Webex Control Hub
    // await controlHub.user.makeSupervisor(rick.webex.id)
    // console.log(`set Control Hub user ${rick.name} role to Supervisor`)
    
    // reset control hub user roles
    await controlHub.user.enableStandardContactCenterAgent({email: sandra.email})
    // enable Sandra for Contact Center Agent role
    await controlHub.user.enableContactCenterAgent({email: sandra.email})
    console.log(`enabled Control Hub user ${sandra.name} for Contact Center Agent`)

    // enable user contact center licenses
    await controlHub.user.onboard(sandra.email)
    // await sleep(3000)
    
    // get CJP global agent team
    const team = await cjp.team.get(globalTeamName)
    // await sleep(3000)
    // sync CJP users to Webex Control Hub
    await controlHub.syncUsers()
    console.log('started CJP to Control Hub user sync')

    // get/create CJP voice skill profile for this user
    const skillProfile = await cjp.skillProfile.getOrCreate(`Skill_${userId}`, userId)
    // await sleep(1000)
    // const allCjpUsers = await cjp.user.list()
    // console.log('allCjpUsers', allCjpUsers.details.users)

    // get Rick's CJP user details
    rick.cjp = await cjp.user.get(rick.email)
    let retryCount = 0
    while (!rick.cjp) {
      console.log(`did not find ${rick.email} in CJP after ${retryCount} retries. Waiting and trying again...`)
      // wait
      await sleep(1000 * 20)
      // try again
      rick.cjp = await cjp.user.get(rick.email)
      retryCount++
    }
    console.log(`got CJP user details for ${rick.name}: ${rick.cjp.id} after ${retryCount} retries`)
    // await sleep(1000)
  
    // assign skill profile and team to Rick
    await cjp.user.modify({
      agent: 'rick',
      id: rick.cjp.id,
      userId,
      teamIds: [team.id, userTeam.id],
      skillProfileId: skillProfile.id
    })
    console.log(`assigned skill profile to CJP user ${rick.name}: ${skillProfile.id}`)
  
    // get Sandra's CJP user details
    sandra.cjp = await cjp.user.get(sandra.email)
    while (!sandra.cjp) {
      console.log('did not find', sandra.email, 'in CJP. Waiting and trying again...')
      // wait
      await sleep(1000 * 20)
      // try again
      sandra.cjp = await cjp.user.get(sandra.email)
    }
    console.log(`got CJP user details for ${sandra.name}: ${sandra.cjp.id}`)

    // assign skill profile and team to Sandra
    await cjp.user.modify({
      agent: 'sandra',
      id: sandra.cjp.id,
      userId,
      teamIds: [team.id, userTeam.id],
      skillProfileId: skillProfile.id
    })
    console.log(`assigned skill profile to CJP user ${sandra.name}: ${skillProfile.id}`)
  
    // set chat templateId on user details in toolbox db
    await toolbox.updateUser(userId, {
      templateId: chatTemplate.templateId
    })
    console.log(`updated toolbox user ${userId} demo.webex-v4prod configuration with templateId ${chatTemplate.templateId}`)
    
    // get/create email treatment in Webex Control Hub
    await controlHub.treatment.getOrCreate(userId)
    
    // get/create global email routing strategy in CJP, referencing the
    // numerical ID of the user's email queue in CJP
    await cjp.routingStrategy.globalEmail.provision(userId, emailQueue.attributes.dbId__l)

    // create/set agent extensions
    await ch.user.onboard({
      email: sandra.email,
      licenses: [{
        id: 'MS_fe3cfc81-8469-4929-8944-23e79e5d0d53',
        idOperation: 'ADD',
        properties: {}
      }, {
        id: 'BCSTD_2849849c-4384-4493-94e9-98ff206eaad6',
        idOperation: 'ADD',
        properties: {
          broadCloudSiteId: siteId,
          internalExtension: '80' + userId
        }
      }]
    })

    await ch.user.onboard({
      email: rick.email,
      licenses: [{
        id: 'MS_fe3cfc81-8469-4929-8944-23e79e5d0d53',
        idOperation: 'ADD',
        properties: {}
      }, {
        id: 'BCSTD_2849849c-4384-4493-94e9-98ff206eaad6',
        idOperation: 'ADD',
        properties: {
          broadCloudSiteId: siteId,
          internalExtension: '82' + userId
        }
      }]
    })

    // set provision done in toolbox db
    await toolbox.updateUser(userId, {
      provision: 'complete'
    })

    // notify user on Teams
    // await teamsNotifier.send(user)
    console.log('finished provisioning user', user.id)
  } catch (e) {
    throw e
  }
}