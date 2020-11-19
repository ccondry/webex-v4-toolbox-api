require('dotenv').config()

const cjp = require('./cjp')
const controlHub = require('./control-hub')
const teamsNotifier = require('./teams-notifier')
const token = controlHub.token
const toolbox = require('./toolbox')

const domain = process.env.DOMAIN

// Sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = async function (user) {
  const userId = user.id
  const rick = {
    firstName: 'Rick', 
    lastName: `Barrows${userId}`,
    name: `Rick Barrows${userId}`,
    email: `rbarrows${userId}@${domain}`
  }

  const sandra = {
    firstName: 'Sandra', 
    lastName: `Jefferson${userId}`,
    name: `Sandra Jefferson${userId}`,
    email: `sjeffers${userId}@${domain}`
  }

  try {
    // make sure there is a valid access token in the cache
    await token.refresh()

    // start provisioning user
    // make sure we have a Control Hub token in cache first
    await token.refresh()
    console.log('got Control Hub refresh token')

    // wait for LDAP sync to complete
    let agentUserExists
    let supervisorUserExists
    while (!agentUserExists || !supervisorUserExists) {
      // try to find agent and supervisor users
      try {
        agentUserExists = await controlHub.user.get(sandra.email)
        supervisorUserExists = await controlHub.user.get(rick.email)
      } catch (e) {
        // wait 20 seconds before trying again
        await sleep(20 * 1000)
      }
    }

    // get or create CJP chat queue
    await cjp.virtualTeam.getOrCreate('chatQueue', `Q_Chat_dCloud_${userId}`)
    
    // get or create CJP chat entry point
    const chatEntryPoint =  await cjp.virtualTeam.getOrCreate('chatEntryPoint', `EP_Chat_${userId}`)
    
    // wait for Webex Control Hub to sync the chat entry point from CJP
    // let entryPointExists
    // while (!entryPointExists) {
    //   // try to find agent and supervisor users
    //   try {
    //     entryPointExists = await controlHub.virtualTeam.get(`EP_Chat_${userId}`)
    //   } catch (e) {
    //     // wait 10 seconds before trying again
    //     console.log('waiting 10 seconds for Control Hub to sync the chat entry point')
    //     await sleep(10 * 1000)
    //   }
    // }

    // wait for Webex Control Hub to sync the chat entry point from CJP
    await sleep(10 * 1000)

    // get or create the Webex Control Hub chat template
    const chatTemplate = await controlHub.chatTemplate.getOrCreate(userId, chatEntryPoint.id)
  
    // Debug
    // console.log(chatTemplate)
    // const chatTemplates = await controlHub.chatTemplate.list()
    // console.log(chatTemplates)

    // set Rick user to read-only in Webex Control Hub
    await controlHub.user.setReadOnly({
      name: rick.name,
      email: rick.email
    })
    console.log(`set Control Hub user ${rick.name} to Read Only`)
    // await sleep(1000)
  
    // enable Rick for Contact Center in Webex Control Hub
    await controlHub.user.enableContactCenter({
      givenName: rick.firstName,
      familyName: rick.lastName,
      displayName: rick.name,
      email: rick.email
    })
    console.log(`enabled Control Hub user ${rick.name} for Contact Center`)
    // await sleep(3000)
  
    // get Rick user object from Webex Control Hub
    rick.webex = await controlHub.user.get(rick.email)
    console.log(`got Control Hub user details for ${rick.name}: ${rick.webex.id}`)
    // await sleep(1000)

    // Debug
    // const webexRick = await controlHub.user.get(rick.email)
    // console.log(webexRick)
    
    // make Rick a supervisor in Webex Control Hub
    await controlHub.user.makeSupervisor(rick.webex.id)
    console.log(`set Control Hub user ${rick.name} role to Supervisor`)
    
    // get/create CJP voice queue
    const voiceQueue = await cjp.virtualTeam.getOrCreate('voiceQueue', `Q_dCloud_${userId}`)
    // await sleep(1000)
    
    // get/create CJP email queue
    const emailQueue = await cjp.virtualTeam.getOrCreate('emailQueue', `Q_Email_dCloud_${userId}`)
    // await sleep(3000)
  
    await controlHub.user.enableContactCenter({
      givenName: sandra.firstName,
      familyName: sandra.lastName,
      displayName: sandra.name,
      email: sandra.email
    })
    console.log(`enabled Control Hub user ${sandra.name} for Contact Center`)
    // await sleep(3000)
    
    // get/create CJP agent team
    const team = await cjp.team.getOrCreate(`T_dCloud_${userId}`)
    // await sleep(3000)
    // sync CJP users to Webex Control Hub
    await controlHub.syncUsers()
    console.log('started CJP to Control Hub user sync')

    // get/create CJP skill profile
    const skillProfile = await cjp.skillProfile.getOrCreate(`Skill_${userId}`, userId)
    // await sleep(1000)
  
    // get Rick's CJP user details
    rick.cjp = await cjp.user.get(`Barrows${userId}`)
    console.log(`got CJP user details for ${rick.name}: ${rick.cjp.id}`)
    // await sleep(1000)
  
    // assign skill profile to Rick
    await cjp.user.modify({
      agent: 'rick',
      id: rick.cjp.id,
      userId,
      teamId: team.id,
      skillProfileId: skillProfile.id
    })
    console.log(`assigned skill profile to CJP user ${rick.name}: ${skillProfile.id}`)
  
    // get Sandra's CJP user details
    sandra.cjp = await cjp.user.get(`Jefferson${userId}`)
    console.log(`got CJP user details for ${sandra.name}: ${sandra.cjp.id}`)

    // assign skill profile to Sandra
    await cjp.user.modify({
      agent: 'sandra',
      id: sandra.cjp.id,
      userId,
      teamId: team.id,
      skillProfileId: skillProfile.id
    })
    console.log(`assigned skill profile to CJP user ${sandra.name}: ${skillProfile.id}`)
  
    // set voice queueId and chat templateId on user details in toolbox db
    await toolbox.updateUser(userId, voiceQueue.id, chatTemplate.templateId)
    console.log(`updated toolbox user ${userId} demo.webex-v4prod configuration with queueId ${voiceQueue.id} and templateId ${chatTemplate.templateId}`)
    
    // get/create email treatment in Webex Control Hub
    await controlHub.treatment.getOrCreate(userId)
    
    // debug
    // console.log('emailQueue', emailQueue)

    // get/create global email routing strategy in CJP, referencing the
    // numerical ID of the user's email queue in CJP
    await cjp.routingStrategy.globalEmail(userId, emailQueue.attributes.dbId__l)
    
    // get/create user-specific routing strategies in CJP for chat, email, voice
    await cjp.routingStrategy.user(userId)
  
    // notify user on Teams
    await teamsNotifier.send(user)
  } catch (e) {
    throw e
  }
}