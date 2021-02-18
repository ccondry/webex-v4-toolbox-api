const cjp = require('./cjp')
const controlHub = require('./control-hub')
const teamsNotifier = require('./teams-notifier')
const toolbox = require('./toolbox')
const globals = require('./globals')
const ldap = require('./ldap')
const db = require('./db')

const domain = process.env.DOMAIN

// Sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = async function (user) {
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

  try {
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
    await cjp.virtualTeam.addTeam(globals.get('webexV4VoiceQueueName'), userTeam.id)

    // get or create CJP chat queue
    const chatQueue = await cjp.virtualTeam.getOrCreate('chatQueue', `Q_Chat_dCloud_${userId}`, userTeam.id)
    // await sleep(1000)
    
    // get or create CJP chat entry point
    const chatEntryPoint = await cjp.virtualTeam.getOrCreate('chatEntryPoint', `EP_Chat_${userId}`)
    
    // wait for Webex Control Hub to sync the chat entry point from CJP
    // console.log('waiting 10 seconds for Control Hub to sync the chat entry point')
    // await sleep(10 * 1000)
    
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
    
    // get/create CJP email queue
    const emailQueue = await cjp.virtualTeam.getOrCreate('emailQueue', `Q_Email_dCloud_${userId}`, userTeam.id)
    // await sleep(3000)
    
    // reset control hub user roles
    await controlHub.user.enableStandardContactCenterAgent({email: sandra.email})
    // enable Sandra for Contact Center Agent role
    await controlHub.user.enableContactCenterAgent({email: sandra.email})
    console.log(`enabled Control Hub user ${sandra.name} for Contact Center Agent`)

    // enable user contact center licenses
    await controlHub.user.onboard(sandra.email)
    // await sleep(3000)
    
    // get CJP global agent team
    const team = await cjp.team.get(globals.get('webexV4GlobalTeamName'))
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
    
    // debug
    // console.log('emailQueue', emailQueue)

    // provision chat entry point routing strategy and current routing strategy
    await cjp.routingStrategy.user.provision({
      name: 'EP_Chat_' + userId,
      entryPointDbId: chatEntryPoint.attributes.dbId__l,
      queueDbId: chatQueue.attributes.dbId__l,
      tenantId: process.env.CJP_TENANT_ID,
      tenantName: process.env.CJP_ENTERPRISE_NAME,
      entryPointId: chatEntryPoint.id
    })

    // get/create global email routing strategy in CJP, referencing the
    // numerical ID of the user's email queue in CJP
    await cjp.routingStrategy.globalEmail.provision(userId, emailQueue.attributes.dbId__l)
    
    // create/set agent extensions
    const siteId = globals.get('webexV4BroadCloudSiteId')

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