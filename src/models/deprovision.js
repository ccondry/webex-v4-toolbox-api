const fetch = require('./fetch')
const client = require('./cjp/client')
// storage for access-token
const globals = require('./globals')

//Control Hub Org Id
const orgId = process.env.ORG_ID

// delete team
async function deleteTeam (name) {
  try {
    const teams = await client.team.list()
    const team = teams.auxiliaryDataList.find(v => {
      return v.attributes.name__s.includes(name)
    })
    await client.team.delete(team.id)
  } catch (e) {
    throw e
  } 
}

// get virtual teams (queues and entry points)
async function deleteVirtualTeam (name) {
  let queue
  // find the queue first
  try {
    const queues = await client.virtualTeam.list()
    queue = queues.auxiliaryDataList.find(v => {
      return v.attributes.name__s.includes(name)
    })
  } catch (e) {
    console.log(`failed to delete virtual team ${name} - could not find it`)
  }
  // found?
  if (queue && queue.id) {
    console.log(`deleting virtual team ${name} (${queue.id})...`)
    try {
      await client.virtualTeam.delete(queue.id)
      console.log(`virtual team ${name} (${queue.id}) deleted.`)
    } catch (e) {
      console.log(`failed to delete virtual team ${name} (${queue.id})`)
      throw e
    }
  }
}

//Get the Chat Template ID needed for Cumulus Chat routing
async function findTemplate (userId) {
  try {
    const token =  globals.get('webexV4ControlHubAccessToken')
    const url = `https://chatc.produs1.ciscoccservice.com/chatc/v1/organization/${orgId}/template?mediaType=chat`
    const options = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      referrer: 'https://admin.webex.com/services/cjp/features'
    }
    const templates = await fetch(url, options)
    const regex = new RegExp(`EP_Chat_${userId}`)
    return templates.find(template => template.name.match(regex))
  } catch (error) {
    throw error
  }
}

//***************   DELETES  ********************** */
//Delete Chat Template
async function deleteChatTemplate (userId) {
  try {
    const template = await findTemplate(userId)
    const token =  globals.get('webexV4ControlHubAccessToken')
    const url = `https://cmm.produs1.ciscoccservice.com/cmm/v1/organization/${orgId}/template/${template.templateId}`

    const options = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    return fetch(url, options)
  } catch (e) {
    throw e
  }
}

// Delete Routing Strategies
async function deleteRS (name) {
  try {
    const strategies = await client.routingStrategy.list()
    const strategy = strategies.auxiliaryDataList.find(v => {
      return v.attributes.name__s.includes(name)
    })
    await client.virtualTeam.delete(strategy.id)
  } catch (e) {
    throw e
  }
}

async function main(userId) {
  try {
    console.log(`deprovisioning user ${userId}...`)
    // chat queue
    try {
      await deleteVirtualTeam(`Q_Chat_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete virtual team Q_Chat_dCloud_${userId}:`, e.message)
    }

    // voice queue
    try {
      await deleteVirtualTeam(`Q_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete virtual team Q_dCloud_${userId}:`, e.message)
    }

    // email queue
    try {
      await deleteVirtualTeam(`Q_Email_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete virtual team Q_Email_dCloud_${userId}:`, e.message)
    }
    
    // chat entry point
    try {
      await deleteVirtualTeam(`EP_Chat_${userId}`)
    } catch (e) {
      console.log(`failed to delete virtual team EP_Chat_${userId}:`, e.message)
    }
    
    
    try {
      await deleteTeam(`T_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete team T_dCloud_${userId}:`, e.message)
    }
    

    //Chat Template *************************
    try {
      await deleteChatTemplate(userId)
    } catch (e) {
      console.log('failed to delete chat template:', e.message)
    }
    

    //Routing Strategies *************************
    try {
      await deleteRS(`RS_Chat_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy RS_Chat_${userId}:`, e.message)
    }
    
    try {
      await deleteRS(`RS_EP_Chat_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy RS_EP_Chat_${userId}:`, e.message)
    }
    
    try {
      await deleteRS(`RS_Chat_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy RS_Chat_dCloud_${userId}:`, e.message)
    }
    
    try {
      await deleteRS(`RS_Email_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy RS_Email_dCloud_${userId}:`, e.message)
    }
    
    try {
      await deleteRS(`RS_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy RS_dCloud_${userId}:`, e.message)
    }

    console.log(`finished deprovisioning user ${userId}`)
  } catch (e) {
    console.log(`failed to deprovision user ${userId}:`, e.message)
  }
}

module.exports = main