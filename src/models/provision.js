const cjp = require('./cjp')
const controlHub = require('./control-hub')
const teamsNotifier = require('./teams-notifier')
const token = require('./control-hub/token')
const toolbox = require('./toolbox')
const session = require('./session')

const domain = process.env.DOMAIN

// Sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = async function (user) {
  // make sure there is a valid access token in the cache
  await token.refresh()
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
    // make sure we have a Control Hub token in cache first
    await token.refresh()
    console.log('got Control Hub refresh token')

    // wait for LDAP sync to complete
    let agentUserExists
    let supervisorUserExists
    while (!agentUserExists || !supervisorUserExists) {
      // try to find agent and supervisor users
      try {
        console.log('searching for', sandra.email, 'in Control Hub...')
        agentUserExists = await controlHub.user.get(sandra.email)
        console.log('found', sandra.email, 'in Control Hub.')
        console.log('searching for', rick.email, 'in Control Hub...')
        supervisorUserExists = await controlHub.user.get(rick.email)
        console.log('found', rick.email, 'in Control Hub.')
      } catch (e) {
        // wait 20 seconds before trying again
        await sleep(20 * 1000)
      }
    }

    // get or create CJP chat queue
    await cjp.virtualTeam.getOrCreate('chatQueue', `Q_Chat_dCloud_${userId}`)
    // await sleep(1000)
    
    // get or create CJP chat entry point
    const chatEntryPoint =  await cjp.virtualTeam.getOrCreate('chatEntryPoint', `EP_Chat_${userId}`)
    
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

    // set Rick user to read-only in Webex Control Hub
    await controlHub.user.setReadOnly({
      name: rick.name,
      email: rick.email
    })
    // console.log(`set Control Hub user ${rick.name} to Read Only`)
    // await sleep(1000)
    
    // reset control hub user license
    await controlHub.user.enableStandardContactCenterAgent({email: rick.email})
    // enable Rick for Contact Center Supervisor in Webex Control Hub
    await controlHub.user.enableContactCenterSupervisor({email: rick.email})
    console.log(`enabled Control Hub user ${rick.name} as Contact Center Supervisor`)
    // await sleep(3000)
  
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
    const emailQueue = await cjp.virtualTeam.getOrCreate('emailQueue', `Q_Email_dCloud_${userId}`)
    // await sleep(3000)
    
    // reset control hub user license
    await controlHub.user.enableStandardContactCenterAgent({email: sandra.email})
    // enable Sandra for Contact Center Agent 
    await controlHub.user.enableContactCenterAgent({email: sandra.email})
    console.log(`enabled Control Hub user ${sandra.name} for Contact Center Agent`)
    // await sleep(3000)
    
    // get CJP global agent team
    const team = await cjp.team.get(`T_dCloud_Voice`)
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
      teamId: team.id,
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
      teamId: team.id,
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

    // get/create global email routing strategy in CJP, referencing the
    // numerical ID of the user's email queue in CJP
    await cjp.routingStrategy.globalEmail(userId, emailQueue.attributes.dbId__l)
    
    // get/create user-specific routing strategies in CJP for chat and email
    await cjp.routingStrategy.user(userId)
    
    // set provision done in toolbox db
    await toolbox.updateUser(userId, {
      provisionStatus: 'complete'
    })

    // notify user on Teams
    await teamsNotifier.send(user)
  } catch (e) {
    throw e
  }
}