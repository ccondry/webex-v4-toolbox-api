require('dotenv').config()

const cjp = require('../src/models/cjp')
const controlHub = require('../src/models/control-hub')
const teamsNotifier = require('../src/models/teams-notifier')
const token = require('../src/models/control-hub/token')
const toolbox = require('../src/models/toolbox')
const session = require('../src/models/session')
const sleep = require('../src/utils').sleep

const domain = process.env.DOMAIN

// go
main({
  id: '0325',
  username: 'ccondry',
  email: 'ccondry@cisco.com',
  firstName: 'Coty'
}).then(r =>{
  process.exit(0)
}).catch(e => console.log(e))

async function main (user, userJwt) {
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
    console.log('got Control Hub refresh token')

    // find the dCloud session and send it a message to create the LDAP user
    // and CUCM phone
    await session.provision(userJwt)

    // wait for LDAP sync to complete
    let chSandra
    let chRick
    while (!chSandra || !chRick) {
      // try to find agent and supervisor users
      try {
        chSandra = await controlHub.user.get(sandra.email)
        chRick = await controlHub.user.get(rick.email)
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

    // add read-only admin role to Rick user in Webex Control Hub
    const ch = await controlHub.client.getClient()
    ch.user.modify({
      userId: chRick.id,
      roles: ['id_readonly_admin']
    })
    console.log(`set Control Hub user ${rick.name} to Read-Only Admin`)
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
    
    // get CJP global agent team
    const team = await cjp.team.get(`T_dCloud_Voice`)
    // await sleep(3000)
    // sync CJP users to Webex Control Hub
    await controlHub.syncUsers()
    console.log('started CJP to Control Hub user sync')

    // get/create CJP voice skill profile for this user
    const skillProfile = await cjp.skillProfile.getOrCreate(`Skill_${userId}`, userId)
    // await sleep(1000)
  
    // get Rick's CJP user details
    rick.cjp = await cjp.user.get(`Barrows${userId}`)
    console.log(`got CJP user details for ${rick.name}: ${rick.cjp.id}`)
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
    sandra.cjp = await cjp.user.get(`Jefferson${userId}`)
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
    await cjp.routingStrategy.globalEmail.provision(userId, emailQueue.attributes.dbId__l)
    
    // get/create user-specific routing strategies in CJP for chat and email
    await cjp.routingStrategy.user(userId)
  
    // notify user on Teams
    await teamsNotifier.send(user)
  } catch (e) {
    throw e
  }
}