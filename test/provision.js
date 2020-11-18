// const client = require('../src/models/cjp/client')
const cjp = require('../src/models/cjp')
const controlHub = require('../src/models/control-hub')
const teamsNotifier = require('../src/models/teams-notifier')

const domain = process.env.DOMAIN

// go
main('0325').catch(e => console.log(e))

async function main (userId) {
  // start provisioning user
  
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

  // get or create CJP chat queue
  const chatQueue = await cjp.virtualTeam.getOrCreate('chatQueue', `Q_Chat_dCloud_${userId}`)
  console.log('chat queue', chatQueue)
  await sleep(1000)

  // get or create CJP chat entry point
  // const chatEntryPoint =  await cjp.virtualTeam.getOrCreate('chatEntryPoint', `EP_Chat_${userId}`)
  // await sleep(1000)
  
  // // wait for Webex Control Hub to sync the chat entry point from CJP
  // await sleep(8000)
  
  // // get or create the Webex Control Hub chat template
  // const chatTemplate = await controlHub.chatTemplate.getOrCreate(userId, chatEntryPoint.id)
  // await sleep(3000)

  // // set Rick user to read-only in Webex Control Hub
  // await controlHub.user.setReadOnly({
  //   name: rick.name,
  //   email: rick.email
  // })
  // await sleep(1000)

  // // enable Rick for Contact Center in Webex Control Hub
  // await controlHub.user.enableContactCenter({
  //   givenName: rick.firstName,
  //   familyName: rick.lastName,
  //   displayName: rick.name,
  //   email: rick.email
  // })
  // await sleep(3000)

  // // get Rick user ID from Webex Control Hub
  // rick.webexId = (await controlHub.user.get(rick.email)).id
  // await sleep(1000)
  
  // // make Rick a supervisor in Webex Control Hub
  // await controlHub.user.makeSupervisor(rick.webexId)
  
  // // get/create CJP voice queue
  // const voiceQueue = await cjp.virtualTeam.getOrCreate('voiceQueue', `Q_dCloud_${userId}`)
  // await sleep(1000)
  
  // // get/create CJP email queue
  // const emailQueue = await cjp.virtualTeam.getOrCreate('emailQueue', `Q_Email_dCloud_${userId}`)
  // await sleep(3000)

  // await controlHub.user.enableContactCenter({
  //   givenName: sandra.firstName,
  //   familyName: sandra.lastName,
  //   displayName: sandra.name,
  //   email: sandra.email
  // })
  // await sleep(3000)
  
  // // get/create CJP agent team
  // const team = await cjp.team.getOrCreate(`T_dCloud_${userId}`)
  // await sleep(3000)
  
  // // sync CJP users to Webex Control Hub
  // await controlHub.syncUsers()

  // // get/create CJP skill profile
  // const skillProfile = await cjp.skillProfile.getOrCreate(`Skill_${userId}`, userId)
  // await sleep(1000)

  // // get Rick's CJP user details
  // rick.cjp = await cjp.user.get(`Barrows${userId}`)
  // await sleep(1000)

  // // assign skill profile to Rick
  // await cjp.user.modify({
  //   agent: 'rick',
  //   id: rick.cjp.id,
  //   userId,
  //   teamId: team.id,
  //   skillProfileId: skillProfile.id
  // })

  // // get Sandra's CJP user details
  // sandra.cjp = await cjp.user.get(`Jefferson${userId}`)
  
  // // assign skill profile to Sandra
  // await cjp.user.modify({
  //   agent: 'sandra',
  //   id: sandra.cjp.id,
  //   userId,
  //   teamId: team.id,
  //   skillProfileId: skillProfile.id
  // })

  // // TODO
  // // set voice queueId and chat templateId on user details in toolbox db
  // // "queueId":"${voiceQueId}","templateId":"${tId}"}`;
  // // await updateUserIds(); // TOOLBOX
  // console.log('update toolbox user:', voiceQueue.id, chatTemplate.id)

  // // get/create email treatment in Webex Control Hub
  // await controlHub.treatment.getOrCreate(userId)
  
  // // get/create global email routing strategy in CJP
  // await cjp.routingStrategy.globalEmail(userId)
  
  // // get/create user-specific routing strategies in CJP for chat, email, voice
  // await cjp.routingStrategy.user(userId)

  // notify user on Teams
  await teamsNotifier.send(userId)
}