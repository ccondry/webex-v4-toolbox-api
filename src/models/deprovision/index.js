require('dotenv').config()
const ch = require('../control-hub/client')
const cjpClient = require('../cjp/client')
const toolbox = require('../toolbox')
// wrapper to translate the `await cjp.get()` call
const cjp = {
  async get () {
    return cjpClient
  }
}
const fetch = require('../fetch')
const globals = require('../globals')
// const https = require('https')
// const makeJwt = require('../make-jwt')
const routingStrategy = require('./routing-strategy')
// const ldap = require('../ldap')

// delete team
async function deleteTeam (name) {
  try {
    const client = await cjp.get()
    const teams = await client.team.list()
    const teamsToDelete = teams.auxiliaryDataList.filter(v => {
      return v.attributes.name__s === name
    })
    for (const team of teamsToDelete) {
      try {
        await client.team.delete(team.id)
        console.log(`successfully deleted user team ${team.attributes.name__s} (${team.id})`)
      } catch (e) {
        console.log(`failed to delete user team ${team.attributes.name__s} (${team.id}): ${e.message}`)
      }
    }
  } catch (e) {
    throw e
  } 
}

// get virtual teams (queues and entry points)
async function deleteVirtualTeam (name) {
  const client = await cjp.get()
  let queuesToDelete
  // find the queue first
  try {
    const queues = await client.virtualTeam.list()
    queuesToDelete = queues.auxiliaryDataList.filter(v => {
      return v.attributes.name__s === name
    })
  } catch (e) {
    console.log(`no virtual team named "${name}" found to delete.`)
    return
  }
  // found?
  if (queuesToDelete.length) {
    for (const queue of queuesToDelete) {
      console.log(`deleting virtual team ${queue.attributes.name__s} (${queue.id})...`)
      try {
        await client.virtualTeam.delete(queue.id)
        console.log(`virtual team ${queue.attributes.name__s} (${queue.id}) deleted.`)
      } catch (e) {
        console.log(`failed to delete virtual team ${queue.attributes.name__s} (${queue.id})`)
        throw e
      }
    }
  }
}

//Get the Chat Template ID needed for Cumulus Chat routing
async function findTemplates (name) {
  try {
    const client = await ch.get()
    const templates = await client.contactCenter.chatTemplate.list()
    const regex = new RegExp(name)
    return templates.filter(template => template.name.match(regex))
  } catch (error) {
    throw error
  }
}

//***************   DELETES  ********************** */
//Delete Chat Template
async function deleteChatTemplate (name) {
  try {
    const templates = await findTemplates(name)
    const client = await ch.get()
    for (const template of templates) {
      try {
        await client.contactCenter.chatTemplate.delete(template.templateId)
        console.log(`successfully deleted chat template ${template.name} (${template.templateId})`)
      } catch (e) {
        console.log(`failed to delete chat template ${template.name} (${template.templateId}): ${e.message}`)
      }

    }
  } catch (e) {
    throw e
  }
}

async function deleteSkillProfile (name) {
  try {
    // get CJP client library
    const client = await cjp.get()
    // get list of all skill profiles
    const profiles = await client.skillProfile.list()
    // find all profiles matching the input name
    const profilesToDelete = profiles.auxiliaryDataList.filter(v => {
      return v.attributes.name__s === name
    })
    // delete each one
    for (const profile of profilesToDelete) {
      try {
        await client.skillProfile.delete(profile.id)
        console.log(`successfully deleted skill profile ${profile.attributes.name__s} (${profile.id})`)
      } catch (e) {
        console.log(`failed to delete skill profile ${profile.attributes.name__s} (${profile.id})`)
      }
    }
  } catch (e) {
    throw e
  }
}

// delete email treatment rule
async function deleteTreatmentRule (name) {
  try {
    await Promise.resolve(globals.initialLoad)
    const entryPointId = globals.get('webexV4EmailEntryPointId')
    const client = await ch.get()
    let rules
    try {
      // console.log('getting email treatment rules list for entry point ID', entryPointId)
      rules = await client.contactCenter.treatment.list(entryPointId)
    } catch (e) {
      console.log('failed to get email treatment rules list:', e.message)
      throw e
    }
    const rulesToDelete = rules.filter(v => {
      return v.name === name
    })

    // console.log('rulesToDelete', rulesToDelete)
    for (const rule of rulesToDelete) {
      // get ID from the end of the URI
      const id = rule.uri.split('/').pop()
      try {
        // delete it ({entryPointId, id})
        await client.contactCenter.treatment.delete({entryPointId, id})
        console.log(`successfully deleted email treatment rule ${rule.name} (${id})`)
      } catch (e) {
        console.log(`failed to delete email treatment rule ${rule.name} (${id}): ${e.message}`)
      }
    }
  } catch (e) {
    throw e
  } 
}

async function getInstance (query) {
  try {
    const url = 'https://dcloud-collab-toolbox-rtp.cxdemo.net/api/v1/auth/instance'
    const instances = await fetch({url, query})
    if (instances.length) {
      return instances[0]
    } else {
      throw Error(`no instance found matching ${JSON.stringify(query)}`)
    }
  } catch (e) {
    throw e
  }
}

async function unlicense (userId) {
  try {
    const client = await ch.get()
    const rickEmail = `rbarrows${userId}@cc1.dc-01.com`
    const sandraEmail = `sjeffers${userId}@cc1.dc-01.com`
    const licenses = [{
      id: 'MS_fe3cfc81-8469-4929-8944-23e79e5d0d53',
      idOperation: 'REMOVE',
      properties: {}
    }, {
      id: 'CJPPRM_1cf76371-2fde-4f72-8122-b6a9d2f89c73',
      idOperation: 'REMOVE',
      properties: {}
    }, {
      id: 'CJPSTD_878e22e8-30e4-4d8e-8309-78f17f6c7240',
      idOperation: 'REMOVE',
      properties: {}
    }, {
      id: 'BCSTD_2849849c-4384-4493-94e9-98ff206eaad6',
      idOperation: 'REMOVE',
      properties: {}
    }, {
      id: 'BCBAS_2cd77112-4bee-4391-a3d3-ffede396cd5e',
      idOperation: 'REMOVE',
      properties: {}
    }]
  
    await client.user.onboard({
      email: rickEmail,
      licenses
    })
    console.log('removed licenses from', rickEmail)
    await client.user.onboard({
      email: sandraEmail,
      licenses
    })
    console.log('removed licenses from', sandraEmail)
  } catch (e) {
    throw e
  }
}

async function removeRoles (userId) {
  try {
    const client = await ch.get()
    const rickEmail = `rbarrows${userId}@cc1.dc-01.com`
    const sandraEmail = `sjeffers${userId}@cc1.dc-01.com`
    const roles = [
      {roleName: 'CJP_PREMIUM_AGENT', 'roleState': 'INACTIVE'},
      {roleName: 'CJP_SUPERVISOR', 'roleState': 'INACTIVE'},
      {roleName: 'CJP_STANDARD_AGENT', 'roleState': 'INACTIVE'}
    ]
    await client.contactCenter.role.modify({
      email: rickEmail,
      roles
    })
    console.log('removed roles from', rickEmail)
    await client.contactCenter.role.modify({
      email: sandraEmail,
      roles
    })
    console.log('removed roles from', sandraEmail)
  } catch (e) {
    throw e
  }
}

// remove team from global voice queue distribution group
async function removeVoiceQueueTeam (teamName) {
  try {
    await Promise.resolve(globals.initialLoad)
    const queueName = globals.get('webexV4VoiceQueueName')
    const client = await cjp.get()
    const teams = await client.team.list()
    const team = teams.auxiliaryDataList.find(v => v.attributes.name__s === teamName)
    if (!team) {
      // throw Error(`team "${teamName}" not found`)
      return
    }
    const queues = await client.virtualTeam.list()
    const queue = queues.auxiliaryDataList.find(v => v.attributes.name__s === queueName)
    if (!queue) {
      throw Error(`queue "${queueName}" not found`)
    }
    // fix attributes from GET data for using in PUT operation
    queue.attributes.tid__s = queue.attributes.tid
    queue.attributes.sid__s = queue.attributes.sid
    queue.attributes.cstts__l = queue.attributes.cstts
    
    delete queue.attributes.tid
    delete queue.attributes.sid
    delete queue.attributes.cstts

    // get existing call distribution groups
    const groups = JSON.parse(queue.attributes.callDistributionGroups__s)
    // get the first distribution group
    const group = groups.find(v => v.order === 1)
    if (!group) {
      throw Error(`call distribution group 1 not found`)
    }
    // filter out the agent groups matching the team ID
    group.agentGroups = group.agentGroups.filter(v => v.teamId !== team.id)
    queue.attributes.callDistributionGroups__s = JSON.stringify(groups)
    // update queue on CJP
    await client.virtualTeam.modify(queue.id, [queue])
    console.log(`successfully removed team "${teamName}" (${team.id}) from the global voice queue "${queue.attributes.name__s}" (${queue.id})`)
  } catch (e) {
    // console.log(`failed to remove team "${teamName}" from the global voice queue:`, e.message)
    throw e
  }
}

async function main (user) {
  if (!user.id || !user.id.length === 4) {
    throw Error(`will not deprovision user ${user.email} with invalid user ID "${user.id}"`)
  }
  const userId = user.id
  try {
    console.log(`deprovisioning user ${userId}...`)
    // chat queue
    try {
      console.log(`checking chat queues...`)
      await deleteVirtualTeam(`Q_Chat_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete virtual team Q_Chat_dCloud_${userId}:`, e.message)
      throw e
    }

    // voice queue
    try {
      console.log(`checking voice queues...`)
      await deleteVirtualTeam(`Q_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete virtual team Q_dCloud_${userId}:`, e.message)
      throw e
    }

    // remove team from global voice queue
    try {
      console.log(`checking global voice queue distribution groups...`)
      await removeVoiceQueueTeam(`T_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to remove team T_dCloud_${userId} from global voice queue distribution groups:`, e.message)
      throw e
    }

    // email queue
    try {
      console.log(`checking email queues...`)
      await deleteVirtualTeam(`Q_Email_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete virtual team Q_Email_dCloud_${userId}:`, e.message)
      throw e
    }
    
    // chat entry point
    try {
      console.log(`checking chat entry points...`)
      await deleteVirtualTeam(`EP_Chat_${userId}`)
    } catch (e) {
      console.log(`failed to delete virtual team EP_Chat_${userId}:`, e.message)
      throw e
    }
    
    // user team
    try {
      console.log(`checking teams...`)
      await deleteTeam(`T_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete team T_dCloud_${userId}:`, e.message)
      throw e
    }
    

    // Chat Template
    try {
      console.log(`checking chat templates...`)
      await deleteChatTemplate(`EP_Chat_${userId}`)
    } catch (e) {
      console.log('failed to delete chat template:', e.message)
      throw e
    }
    

    // Routing Strategies
    // chat queue
    try {
      console.log(`checking chat queue routing strategies...`)
      await routingStrategy.delete(`RS_Chat_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy RS_Chat_${userId}:`, e.message)
      throw e
    }

    try {
      console.log(`checking chat queue current routing strategies...`)
      await routingStrategy.delete(`Current-RS_Chat_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy Current-RS_EP_Chat_${userId}:`, e.message)
      throw e
    }

    // chat queue again
    try {
      console.log(`checking another format of chat queue routing strategies...`)
      await routingStrategy.delete(`RS_Chat_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy RS_Chat_dCloud_${userId}:`, e.message)
      throw e
    }
    
    try {
      console.log(`checking another format of chat queue current routing strategies...`)
      await routingStrategy.delete(`Current-RS_Chat_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy Current-RS_Chat_dCloud_${userId}:`, e.message)
      throw e
    }
    
    // chat entry point
    try {
      console.log(`checking chat entry point routing strategies...`)
      await routingStrategy.delete(`RS_EP_Chat_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy RS_EP_Chat_${userId}:`, e.message)
      throw e
    }

    try {
      console.log(`checking chat entry point current routing strategies...`)
      await routingStrategy.delete(`Current-RS_EP_Chat_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy Current-RS_EP_Chat_${userId}:`, e.message)
      throw e
    }
    
    // chat entry point again
    try {
      console.log(`checking another format of chat entry point routing strategies...`)
      await routingStrategy.delete(`EP_Chat_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy EP_Chat_${userId}:`, e.message)
      throw e
    }

    try {
      console.log(`checking another format of chat entry point current routing strategies...`)
      await routingStrategy.delete(`Current-EP_Chat_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy Current-EP_Chat_${userId}:`, e.message)
      throw e
    }

    // email routing strategy
    try {
      console.log(`checking email queue routing strategies...`)
      await routingStrategy.delete(`RS_Email_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy RS_Email_dCloud_${userId}:`, e.message)
      throw e
    }
    
    try {
      console.log(`checking email queue current routing strategies...`)
      await routingStrategy.delete(`Current-RS_Email_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy Current-RS_Email_dCloud_${userId}:`, e.message)
      throw e
    }
    
    // voice queue
    try {
      console.log(`checking voice queue routing strategies...`)
      await routingStrategy.delete(`RS_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy RS_dCloud_${userId}:`, e.message)
      throw e
    }

    try {
      console.log(`checking voice queue current routing strategies...`)
      await routingStrategy.delete(`Current-RS_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete routing strategy Current-RS_dCloud_${userId}:`, e.message)
      throw e
    }

    // Skill Profiles
    try {
      console.log(`checking skill profiles...`)
      await deleteSkillProfile(`Skill_${userId}`)
    } catch (e) {
      console.log(`failed to delete skill profile Skill_${userId}:`, e.message)
      throw e
    }

    // email treatment rule
    try {
      console.log(`checking email treatment rules...`)
      await deleteTreatmentRule(`route${userId}`)
    } catch (e) {
      console.log(`failed to delete email treatment rule Rule${userId}:`, e.message)
      throw e
    }

    // email routing strategy queue
    try {
      console.log(`checking global email routing strategy...`)
      await routingStrategy.globalEmail.delete(`Q_Email_dCloud_${userId}`)
    } catch (e) {
      console.log(`failed to delete queue Q_Email_dCloud_${userId} from the global email routing strategy:`, e.message)
      throw e
    }

    // delete LDAP users
    // try {
    //   console.log(`checking ldap users...`)
    //   await ldap.deleteUsers(userId)
    // } catch (e) {
    //   console.log(`failed to delete ldap users for user ${userId}:`, e.message)
    //   throw e
    // }

    // unlicense control hub users
    try {
      console.log(`checking control hub user licenses...`)
      await unlicense(userId)
    } catch (e) {
      console.log(`failed to delete control hub user licenses:`, e.message)
      throw e
    }

    // remove roles from control hub users
    try {
      console.log(`checking control hub user roles...`)
      await removeRoles(userId)
    } catch (e) {
      console.log(`failed to delete control hub user roles:`, e.message)
      throw e
    }

    // remove provision info from database
    try {
      console.log(`setting user provision info to not provisioned for webex-v4prod...`)
      await toolbox.updateUser(userId, {provision: 'deleted'})
      console.log(`successfully set user provision info to not provisioned for webex-v4prod`)
    } catch (e) {
      console.log(`failed to set user provision info to not provisioned for webex-v4prod:`, e.message)
      throw e
    }
    console.log(`finished deprovisioning user ${userId}`)
  } catch (e) {
    console.log(`failed to deprovision user ${userId}:`, e.message)
    throw e
  }
}

module.exports = main