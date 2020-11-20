// this file provisions routing strategies for chat, email, voice for a user
// use moment for generating date strings
const moment = require('moment')

// cwcc Library
const client = require('../client')

// Static
const tenantId = process.env.CJP_TENANT_ID
const enterpriseName = 'dCloudProd2'
const siteId = '292'

//Sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// find routing strategy matching name
async function getRoutingStrategy (name) {
  try {
    const response = await client.routingStrategy.list()
    return response.auxiliaryDataList.find(c => {
      return c.attributes.name__s === name
    })
  } catch (error) {   
    console.log('got nothing')  
  }
}

// Chat EP
async function getChatEpIds (userId) {
  try {
    const entryPoints = await client.virtualTeam.list()
    // console.log('entryPoints', entryPoints.auxiliaryDataList.map(v => v.attributes.name__s))
    return entryPoints.auxiliaryDataList.find(c => {
      return c.attributes.name__s === `EP_Chat_${userId}`
    })
  } catch (e) {
    console.log(e)
  }
}

// Chat Queue
async function getChatQueueIds (userId) {
  try {
    const response = await client.virtualTeam.list()
    return response.auxiliaryDataList.find(c => {
      return c.attributes.name__s === `Q_Chat_dCloud_${userId}`
    })
  } catch (e) {
    console.log(e)
  }
}

// Email Queue
async function getEmailQueueIds (userId) {
  try {
    const response = await client.virtualTeam.list()
    return response.auxiliaryDataList.find((c) => {
      return c.attributes.name__s === (`Q_Email_dCloud_${userId}`)
    })
  } catch (e) {
    console.log(e)
  }
}

// Voice Queue
async function getVoiceQueueIds (userId) {
  try {
    const response = await client.virtualTeam.list()
    return response.auxiliaryDataList.find(c => {
      return c.attributes.name__s === `Q_dCloud_${userId}`
    })
  } catch (e) {
    console.log(e)
  }
}

// Team
async function getTeamIds (userId) {
  try {
    const response = await client.team.list()
    return response.auxiliaryDataList.find(c => {
      return c.attributes.name__s === `T_dCloud_${userId}`
    })
  } catch (error) {
    console.log(error)
  }
}

async function createEPChatRS({
  nameRS,
  virtualDbId,
  virtualName,
  virtualId,
  virtualChatDbId,
}) {
  // generate script ID
  const scriptId = Date.now()
  // start date is 0000 today
  const startDate = moment().startOf('day').format('x')
  // end date is 2400 in 10 years from today
  const endDate = moment().add(10, 'y').endOf('day').format('x')
  // create body
  const body = [{
    type: "routing-strategy",
    attributes: {
      mediaFileIds__sa: ["", "0"],
      legacyJscriptId__l: 2212,
      jscriptId__s: "AXNehqic2lFHBsnxC9O5",
      startTimestamp__l: startDate,
      saturday__i: 1,
      legacyVirtualTeamId__l: virtualDbId,
      name__s: nameRS,
      thursday__i: 1,
      strategyStatus__s: "active",
      status__i: 1,
      script__s: `<call-distribution-script name=\"${nameRS}\" scriptid=\"${scriptId}\" status=\"active\" start-date=\"${startDate}\" end-date=\"${endDate}\" execution-start-time-of-day=\"18000000\" execution-end-time-of-day=\"18000000\" repetition=\"daily\" xmlns=\"http://cha.transerainc.com/gen/cds\">\n  <day-of-week>sunday</day-of-week>\n  <day-of-week>monday</day-of-week>\n  <day-of-week>tuesday</day-of-week>\n  <day-of-week>wednesday</day-of-week>\n  <day-of-week>thursday</day-of-week>\n  <day-of-week>friday</day-of-week>\n  <day-of-week>saturday</day-of-week>\n  <vdn enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" id=\"${virtualDbId}\" vteam-id=\"${virtualDbId}\" vteam-name=\"${virtualName}\" uri=\"\" maximum-time-in-queue=\"0\" is-monitoring-permitted=\"false\" is-queuing-permitted=\"false\" is-recording-permitted=\"false\" is-retransfer-permitted=\"false\" overflow-uri=\"\">\n    <ivr-url park-url=\"http://localhost/${enterpriseName}/dummy\" requeue-url=\"http://localhost:8080/${enterpriseName}/\"/>\n  </vdn>\n  <call-flow-params>\n    <param name=\"Sales\" value=\"${virtualChatDbId}\" valueDataType=\"string\" qualifier=\"vteam\" description=\"(vteam, A valid VTeam.)\"/>\n  </call-flow-params>\n</call-distribution-script>`,
      endDate__l: endDate,
      daily__i: 1,
      tuesday__i: 1,
      virtualTeamId__s: virtualId,
      defaultFlag__i: 0,
      monday__i: 1,
      grs__i: 0,
      startDate__l: startDate,
      currentStatus__i: 0,
      friday__i: 1,
      endTimestamp__l: endDate,
      defaultQueueDbId__l: 0,
      _type__s: "routing-strategy",
      wednesday__i: 1,
      cvaEnabled__i: 0,
      sunday__i: 1,
      startTime__l: 18000000,
      endTime__l: 18000000
    }
  }]

  try {
    await client.routingStrategy.create(body)
  } catch (e) {
    throw e
  }
}

// get the parent routing strategy by name (not the current routing strategy)
async function getParent (name) {
  const expName = /^((?!Current).)*$/gm

  try {
    const response = await client.routingStrategy.list()
    return response.auxiliaryDataList.find(c => {
      return (
        c.attributes.name__s.match(expName) &&
        c.attributes.name__s.match(name)
      )
    })
  } catch (e) {
    console.log(e)
  }
}

async function createEPCurrentChatRS ({
  nameRS,
  virtualDbId,
  virtualName,
  virtualId,
  virtualChatDbId,
  parentId
}) {
  // generate script ID
  const scriptId = Date.now()
  // start date is 0000 today
  const startDate = moment().startOf('day').format('x')
  // end date is 2400 in 10 years from today
  const endDate = moment().add(10, 'y').endOf('day').format('x')
  // create body
  const body = [{
    type: "routing-strategy",
    attributes: {
      mediaFileIds__sa: ["", "0"],
      legacyJscriptId__l: 2212,
      parentStrategyId__s: parentId,
      jscriptId__s: "AXNehqic2lFHBsnxC9O5",
      startTimestamp__l: startDate,
      saturday__i: 1,
      legacyVirtualTeamId__l: virtualDbId,
      name__s: "Current-" + nameRS,
      thursday__i: 1,
      strategyStatus__s: "active",
      status__i: 1,
      script__s: `<call-distribution-script name=\"${nameRS}\" scriptid=\"${scriptId}\" status=\"active\" start-date=\"${startDate}\" end-date=\"${endDate}\" execution-start-time-of-day=\"18000000\" execution-end-time-of-day=\"18000000\" repetition=\"daily\" xmlns=\"http://cha.transerainc.com/gen/cds\">\n  <day-of-week>sunday</day-of-week>\n  <day-of-week>monday</day-of-week>\n  <day-of-week>tuesday</day-of-week>\n  <day-of-week>wednesday</day-of-week>\n  <day-of-week>thursday</day-of-week>\n  <day-of-week>friday</day-of-week>\n  <day-of-week>saturday</day-of-week>\n  <vdn enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" id=\"${virtualDbId}\" vteam-id=\"${virtualDbId}\" vteam-name=\"${virtualName}\" uri=\"\" maximum-time-in-queue=\"0\" is-monitoring-permitted=\"false\" is-queuing-permitted=\"false\" is-recording-permitted=\"false\" is-retransfer-permitted=\"false\" overflow-uri=\"\">\n    <ivr-url park-url=\"http://localhost/${enterpriseName}/dummy\" requeue-url=\"http://localhost:8080/${enterpriseName}/\"/>\n  </vdn>\n  <call-flow-params>\n    <param name=\"Sales\" value=\"${virtualChatDbId}\" valueDataType=\"string\" qualifier=\"vteam\" description=\"(vteam, A valid VTeam.)\"/>\n  </call-flow-params>\n</call-distribution-script>`,
      endDate__l: endDate,
      daily__i: 1,
      tuesday__i: 1,
      virtualTeamId__s: virtualId,
      defaultFlag__i: 0,
      monday__i: 1,
      grs__i: 0,
      startDate__l: startDate,
      currentStatus__i: 1,
      friday__i: 1,
      endTimestamp__l: endDate,
      defaultQueueDbId__l: 0,
      _type__s: "routing-strategy",
      wednesday__i: 1,
      cvaEnabled__i: 0,
      sunday__i: 1,
      startTime__l: 18000000,
      endTime__l: 18000000,
    }
  }]

  try {
    await client.routingStrategy.create(body)
  } catch (e) {
    throw e
  }
}

//For Chat and Email RS
async function createQRS({
  nameRS,
  virtualDbId,
  virtualName,
  virtualId,
  virtualTeamName,
  virtualTeamDbId
}) {
  // generate script ID
  const scriptId = Date.now()
  // start date is 0000 today
  const startDate = moment().startOf('day').format('x')
  // end date is 2400 in 10 years from today
  const endDate = moment().add(10, 'y').endOf('day').format('x')
  // create body
  const body = [{
    type: "routing-strategy",
    attributes: {
      mediaFileIds__sa: ["", "0"],
      legacyJscriptId__l: 0,
      jscriptId__s: "AXNehqip2lFHBsnxC9O6",
      startTimestamp__l: startDate,
      saturday__i: 1,
      legacyVirtualTeamId__l: virtualDbId,
      name__s: nameRS,
      thursday__i: 1,
      strategyStatus__s: "active",
      status__i: 1,
      script__s: `<call-distribution-script name="${nameRS}" scriptid="${scriptId}" status="active" start-date="${startDate}" end-date="${endDate}" execution-start-time-of-day="18000000" execution-end-time-of-day="18000000" repetition=\"daily\" xmlns=\"http://cha.transerainc.com/gen/cds\">\n  <day-of-week>sunday</day-of-week>\n  <day-of-week>monday</day-of-week>\n  <day-of-week>tuesday</day-of-week>\n  <day-of-week>wednesday</day-of-week>\n  <day-of-week>thursday</day-of-week>\n  <day-of-week>friday</day-of-week>\n  <day-of-week>saturday</day-of-week>\n  <vdn enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" id=\"${virtualDbId}\" vteam-id=\"${virtualDbId}\" vteam-name=\"${virtualName}\" uri=\"\" maximum-time-in-queue=\"3600\" is-monitoring-permitted=\"false\" is-queuing-permitted=\"false\" is-recording-permitted=\"false\" is-retransfer-permitted=\"false\" overflow-uri=\"\" algorithm=\"longest-waiting-agent-based\" num-ring-no-answer-retries=\"3\" num-teams-to-try-for-other-failures=\"3\">\n    <ivr-url park-url=\"http://localhost/${enterpriseName}/dummy\" requeue-url=\"http://localhost:8080/${enterpriseName}/\"/>\n    <load-balance>\n      <cycle number=\"1\">\n        <agent-group id=\"${virtualTeamDbId}\" name=\"${virtualTeamName}\" display-name=\"${virtualTeamName}\" enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" site-id=\"${siteId}\" site-name=\"Site-1\" site-display-name=\"Site-1\" capacity=\"0\" status=\"active\" uri=\"0\" priority=\"0\"/>\n      </cycle>\n    </load-balance>\n  </vdn>\n  <call-flow-params/>\n</call-distribution-script>`,
      endDate__l: endDate,
      daily__i: 1,
      tuesday__i: 1,
      virtualTeamId__s: virtualId,
      defaultFlag__i: 0,
      monday__i: 1,
      grs__i: 0,
      startDate__l: startDate,
      currentStatus__i: 0,
      friday__i: 1,
      endTimestamp__l: 1911096000000,
      defaultQueueDbId__l: 0,
      _type__s: "routing-strategy",
      wednesday__i: 1,
      cvaEnabled__i: 0,
      sunday__i: 1,
      startTime__l: 18000000,
      endTime__l: 18000000
    }
  }]

  try {
    await client.routingStrategy.create(body)
  } catch (e) {
    throw e
  }
}

async function createQCurrentRS({
  nameRS,
  virtualDbId,
  virtualName,
  virtualId,
  virtualTeamName,
  virtualTeamDbId,
  parentId
}) {
  // generate script ID
  const scriptId = Date.now()
  // start date is 0000 today
  const startDate = moment().startOf('day').format('x')
  // end date is 2400 in 10 years from today
  const endDate = moment().add(10, 'y').endOf('day').format('x')
  // create body
  const body = [{
    type: "routing-strategy",
    attributes: {
      mediaFileIds__sa: ["", "0"],
      legacyJscriptId__l: 0,
      parentStrategyId__s: parentId,
      jscriptId__s: "AXNehqip2lFHBsnxC9O6",
      startTimestamp__l: startDate,
      saturday__i: 1,
      legacyVirtualTeamId__l: virtualDbId,
      name__s: "Current-" + nameRS,
      thursday__i: 1,
      strategyStatus__s: "active",
      status__i: 1,
      script__s: `<call-distribution-script name="${nameRS}" scriptid="${scriptId}" status="active" start-date="${startDate}" end-date="${endDate}" execution-start-time-of-day="18000000" execution-end-time-of-day="18000000" repetition=\"daily\" xmlns=\"http://cha.transerainc.com/gen/cds\">\n  <day-of-week>sunday</day-of-week>\n  <day-of-week>monday</day-of-week>\n  <day-of-week>tuesday</day-of-week>\n  <day-of-week>wednesday</day-of-week>\n  <day-of-week>thursday</day-of-week>\n  <day-of-week>friday</day-of-week>\n  <day-of-week>saturday</day-of-week>\n  <vdn enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" id=\"${virtualDbId}\" vteam-id=\"${virtualDbId}\" vteam-name=\"${virtualName}\" uri=\"\" maximum-time-in-queue=\"3600\" is-monitoring-permitted=\"false\" is-queuing-permitted=\"false\" is-recording-permitted=\"false\" is-retransfer-permitted=\"false\" overflow-uri=\"\" algorithm=\"longest-waiting-agent-based\" num-ring-no-answer-retries=\"3\" num-teams-to-try-for-other-failures=\"3\">\n    <ivr-url park-url=\"http://localhost/${enterpriseName}/dummy\" requeue-url=\"http://localhost:8080/${enterpriseName}/\"/>\n    <load-balance>\n      <cycle number=\"1\">\n        <agent-group id=\"${virtualTeamDbId}\" name=\"${virtualTeamName}\" display-name=\"${virtualTeamName}\" enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" site-id=\"${siteId}\" site-name=\"Site-1\" site-display-name=\"Site-1\" capacity=\"0\" status=\"active\" uri=\"0\" priority=\"0\"/>\n      </cycle>\n    </load-balance>\n  </vdn>\n  <call-flow-params/>\n</call-distribution-script>`,
      endDate__l: endDate,
      daily__i: 1,
      tuesday__i: 1,
      virtualTeamId__s: virtualId,
      defaultFlag__i: 0,
      monday__i: 1,
      grs__i: 0,
      startDate__l: startDate,
      currentStatus__i: 1,
      friday__i: 1,
      endTimestamp__l: 1911096000000,
      defaultQueueDbId__l: 0,
      _type__s: "routing-strategy",
      wednesday__i: 1,
      cvaEnabled__i: 0,
      sunday__i: 1,
      startTime__l: 18000000,
      endTime__l: 18000000
    }
  }]

  try {
    await client.routingStrategy.create(body)
  } catch (e) {
    throw e
  }
}

//For Voice RS
async function createQVoiceRS({
  nameRS,
  virtualDbId,
  virtualName,
  virtualId,
  virtualTeamName,
  virtualTeamDbId
}) {
  // generate script ID
  // TODO use this in script?
  const scriptId = Date.now()
  // start date is 0000 today
  const startDate = moment().startOf('day').format('x')
  // end date is 2400 in 10 years from today
  const endDate = moment().add(10, 'y').endOf('day').format('x')
  // create body
  const body = [{
    type: "routing-strategy",
    attributes: {
      mediaFileIds__sa: ["AXNehqkD2lFHBsnxC9O9", "AXNehqkD2lFHBsnxC9O9"],
      legacyJscriptId__l: 0,
      jscriptId__s: "AXNzs-wmqpoMAE1mZ75X",
      startTimestamp__l: startDate,
      saturday__i: 1,
      legacyVirtualTeamId__l: virtualDbId,
      name__s: nameRS,
      thursday__i: 1,
      strategyStatus__s: "active",
      status__i: 1,
      script__s: `<call-distribution-script name=\"${nameRS}\" scriptid=\"${scriptId}\" status=\"active\" start-date=\"${startDate}\" end-date=\"${endDate}\" execution-start-time-of-day=\"18000000\" execution-end-time-of-day=\"18000000\" repetition=\"daily\" xmlns=\"http://cha.transerainc.com/gen/cds\">\n  <day-of-week>sunday</day-of-week>\n  <day-of-week>monday</day-of-week>\n  <day-of-week>tuesday</day-of-week>\n  <day-of-week>wednesday</day-of-week>\n  <day-of-week>thursday</day-of-week>\n  <day-of-week>friday</day-of-week>\n  <day-of-week>saturday</day-of-week>\n  <vdn enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" id=\"${virtualDbId}\" vteam-id=\"${virtualDbId}\" vteam-name=\"${virtualName}\" uri=\"\" maximum-time-in-queue=\"3600\" is-monitoring-permitted=\"true\" is-queuing-permitted=\"true\" is-recording-permitted=\"true\" is-retransfer-permitted=\"false\" overflow-uri=\"\" algorithm=\"longest-waiting-agent-based\" num-ring-no-answer-retries=\"3\" num-teams-to-try-for-other-failures=\"3\">\n    <ivr-url park-url=\"http://localhost/${enterpriseName}/defaultmusic_on_hold.wav\" requeue-url=\"http://localhost:8080/${enterpriseName}/\"/>\n    <load-balance>\n      <cycle number=\"1\">\n        <agent-group id=\"${virtualTeamDbId}\" name=\"${virtualTeamName}\" display-name=\"${virtualTeamName}\" enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" site-id=\"${siteId}\" site-name=\"Site-1\" site-display-name=\"Site-1\" capacity=\"0\" status=\"active\" uri=\"0\" priority=\"0\"/>\n      </cycle>\n    </load-balance>\n  </vdn>\n  <call-flow-params>\n    <param name=\"MIQ2\" value=\"defaultmusic_on_hold.wav\" valueDataType=\"string\" qualifier=\"mediaFile\" description=\"(mediaFile, A valid media file.)\"/>\n  </call-flow-params>\n</call-distribution-script>`,
      endDate__l: endDate,
      daily__i: 1,
      tuesday__i: 1,
      virtualTeamId__s: virtualId,
      defaultFlag__i: 0,
      monday__i: 1,
      grs__i: 0,
      startDate__l: startDate,
      currentStatus__i: 0,
      friday__i: 1,
      endTimestamp__l: 1911009600000,
      defaultQueueDbId__l: 0,
      _type__s: "routing-strategy",
      wednesday__i: 1,
      cvaEnabled__i: 0,
      sunday__i: 1,
      startTime__l: 18000000,
      endTime__l: 18000000
    }
  }]

  try {
    await client.routingStrategy.create(body)
  } catch (e) {
    throw e
  }
}

//For Voice Current RS
async function createQVoiceCurrentRS({
  nameRS,
  virtualDbId,
  virtualName,
  virtualId,
  virtualTeamName,
  virtualTeamDbId,
  parentId
}) {
  // generate script ID
  const scriptId = Date.now()
  // start date is 0000 today
  const startDate = moment().startOf('day').format('x')
  // end date is 2400 in 10 years from today
  const endDate = moment().add(10, 'y').endOf('day').format('x')
  // create body
  const body = [{
    type: "routing-strategy",
    attributes: {
      mediaFileIds__sa: ["AXNehqkD2lFHBsnxC9O9", "AXNehqkD2lFHBsnxC9O9"],
      legacyJscriptId__l: 0,
      parentStrategyId__s: parentId,
      jscriptId__s: "AXNzs-wmqpoMAE1mZ75X",
      startTimestamp__l: startDate,
      saturday__i: 1,
      legacyVirtualTeamId__l: virtualDbId,
      name__s: "Current-" + nameRS,
      thursday__i: 1,
      strategyStatus__s: "active",
      status__i: 1,
      script__s: `<call-distribution-script name=\"${nameRS}\" scriptid=\"${scriptId}\" status=\"active\" start-date=\"${startDate}\" end-date=\"${endDate}\" execution-start-time-of-day=\"18000000\" execution-end-time-of-day=\"18000000\" repetition=\"daily\" xmlns=\"http://cha.transerainc.com/gen/cds\">\n  <day-of-week>sunday</day-of-week>\n  <day-of-week>monday</day-of-week>\n  <day-of-week>tuesday</day-of-week>\n  <day-of-week>wednesday</day-of-week>\n  <day-of-week>thursday</day-of-week>\n  <day-of-week>friday</day-of-week>\n  <day-of-week>saturday</day-of-week>\n  <vdn enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" id=\"${virtualDbId}\" vteam-id=\"${virtualDbId}\" vteam-name=\"${virtualName}\" uri=\"\" maximum-time-in-queue=\"3600\" is-monitoring-permitted=\"true\" is-queuing-permitted=\"true\" is-recording-permitted=\"true\" is-retransfer-permitted=\"false\" overflow-uri=\"\" algorithm=\"longest-waiting-agent-based\" num-ring-no-answer-retries=\"3\" num-teams-to-try-for-other-failures=\"3\">\n    <ivr-url park-url=\"http://localhost/${enterpriseName}/defaultmusic_on_hold.wav\" requeue-url=\"http://localhost:8080/${enterpriseName}/\"/>\n    <load-balance>\n      <cycle number=\"1\">\n        <agent-group id=\"${virtualTeamDbId}\" name=\"${virtualTeamName}\" display-name=\"${virtualTeamName}\" enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" site-id=\"${siteId}\" site-name=\"Site-1\" site-display-name=\"Site-1\" capacity=\"0\" status=\"active\" uri=\"0\" priority=\"0\"/>\n      </cycle>\n    </load-balance>\n  </vdn>\n  <call-flow-params>\n    <param name=\"MIQ2\" value=\"defaultmusic_on_hold.wav\" valueDataType=\"string\" qualifier=\"mediaFile\" description=\"(mediaFile, A valid media file.)\"/>\n  </call-flow-params>\n</call-distribution-script>`,
      endDate__l: endDate,
      daily__i: 1,
      tuesday__i: 1,
      virtualTeamId__s: virtualId,
      defaultFlag__i: 0,
      monday__i: 1,
      grs__i: 0,
      startDate__l: startDate,
      currentStatus__i: 1,
      friday__i: 1,
      endTimestamp__l: 1911009600000,
      defaultQueueDbId__l: 0,
      _type__s: "routing-strategy",
      wednesday__i: 1,
      cvaEnabled__i: 0,
      sunday__i: 1,
      startTime__l: 18000000,
      endTime__l: 18000000
    }
  }]

  try {
    await client.routingStrategy.create(body)
  } catch (e) {
    throw e
  }
}

module.exports = async function (userId) {
  try {
    console.log(`provisioning CJP routing strategies for user ${userId}...`)
    // get chat entry point
    const chatEp = await getChatEpIds(userId)
    const virtualEPChatId = chatEp.id
    const virtualEPChatDbId = chatEp.attributes.dbId__l
    const virtualEPChatName = chatEp.attributes.name__s
    
    // get chat queue
    const chatQueue = await getChatQueueIds(userId)
    const virtualChatId = chatQueue.id
    const virtualChatDbId = chatQueue.attributes.dbId__l
    const virtualChatName = chatQueue.attributes.name__s
    
    // get email queue
    const emailQueue = await getEmailQueueIds(userId)
    const virtualEmailId = emailQueue.id
    const virtualEmailDbId = emailQueue.attributes.dbId__l
    const virtualEmailName = emailQueue.attributes.name__s
  
    // get voice queue
    const voiceQueue = await getVoiceQueueIds(userId)
    const virtualVoiceId = voiceQueue.id
    const virtualVoiceDbId = voiceQueue.attributes.dbId__l
    const virtualVoiceName = voiceQueue.attributes.name__s
  
    // get team IDs
    const team = await getTeamIds(userId)
    // const virtualTeamId = team.id
    const virtualTeamDbId = team.attributes.dbId__l
    const virtualTeamName = team.attributes.name__s
  
    // find existing routing strateg
    const chatEpRs = await getRoutingStrategy(`RS_EP_Chat_${userId}`)
    if (!chatEpRs) {
      // chat EP RS does not exist yet. create chat RS and chat current RS
      // CHAT Entry Point routing strategy
      await sleep(1000)
      await createEPChatRS({
        nameRS: `RS_EP_Chat_${userId}`,
        virtualDbId: virtualEPChatDbId,
        virtualName: virtualEPChatName,
        virtualId: virtualEPChatId,
        virtualChatDbId: virtualChatDbId,
      })
      await sleep(1000)
      const chatEpRsParent = await getParent(`RS_EP_Chat_${userId}`)
      await sleep(1000)
      await createEPCurrentChatRS({
        nameRS: `RS_EP_Chat_${userId}`,
        virtualDbId: virtualEPChatDbId,
        virtualName: virtualEPChatName,
        virtualId: virtualEPChatId,
        virtualChatDbId: virtualChatDbId,
        parentId: chatEpRsParent.id
      })
    }
  
    const chatRs = await getRoutingStrategy(`RS_Chat_dCloud_${userId}`)
    if (!chatRs) {
      // chat RS does not exist yet. create it and current.
      //CHAT QUEUE routing strategy
      await sleep(1000)
      await createQRS({
        nameRS: `RS_Chat_dCloud_${userId}`,
        virtualDbId: virtualChatDbId,
        virtualName: virtualChatName,
        virtualId: virtualChatId,
        virtualTeamName: virtualTeamName,
        virtualTeamDbId: virtualTeamDbId
      })
      await sleep(1000)
      const chatQueueRsParent = await getParent(`RS_Chat_dCloud_${userId}`)
      await sleep(1000)
      await createQCurrentRS({
        nameRS: `RS_Chat_dCloud_${userId}`,
        virtualDbId: virtualChatDbId,
        virtualName: virtualChatName,
        virtualId: virtualChatId,
        virtualTeamName: virtualTeamName,
        virtualTeamDbId: virtualTeamDbId,
        parentId: chatQueueRsParent.id
      })
    }
  
    const emailRs = await getRoutingStrategy(`RS_Email_dCloud_${userId}`)
    if (!emailRs) {
      // email RS does not exist yet. create it and current.
      //Email QUEUE routing strategy
      await sleep(1000)
      await createQRS({
        nameRS: `RS_Email_dCloud_${userId}`,
        virtualDbId: virtualEmailDbId,
        virtualName: virtualEmailName,
        virtualId: virtualEmailId,
        virtualTeamName: virtualTeamName,
        virtualTeamDbId: virtualTeamDbId
      })
      await sleep(1000)
      const emailQueueRsParent = await getParent(`RS_Email_dCloud_${userId}`)
      await sleep(1000)
      await createQCurrentRS({
        nameRS: `RS_Email_dCloud_${userId}`,
        virtualDbId: virtualEmailDbId,
        virtualName: virtualEmailName,
        virtualId: virtualEmailId,
        virtualTeamName: virtualTeamName,
        virtualTeamDbId: virtualTeamDbId,
        parentId: emailQueueRsParent.id
      })
    }
  
    const voiceRs = await getRoutingStrategy(`RS_dCloud_${userId}`)
    if (!voiceRs) {
      // voice RS does not exist yet. create it and current.
      //Voice QUEUE routing strategy
      await sleep(1000)
      await createQVoiceRS({
        nameRS: `RS_dCloud_${userId}`,
        virtualDbId: virtualVoiceDbId,
        virtualName: virtualVoiceName,
        virtualId: virtualVoiceId,
        virtualTeamName: virtualTeamName,
        virtualTeamDbId: virtualTeamDbId
      })
      await sleep(1000)
      const voiceQueueRsParent = await getParent(`RS_dCloud_${userId}`)
      await sleep(1000)
      await createQVoiceCurrentRS({
        nameRS: `RS_dCloud_${userId}`,
        virtualDbId: virtualVoiceDbId,
        virtualName: virtualVoiceName,
        virtualId: virtualVoiceId,
        virtualTeamName: virtualTeamName,
        virtualTeamDbId: virtualTeamDbId,
        parentId: voiceQueueRsParent.id
      })
    }
  } catch (e) {
    throw e
  }
}
