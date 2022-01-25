const fetch = require('./fetch')
const globals = require('./globals')
const demoVersion = 'webexV' + require('./demo-version')

async function send (user) {
  try {
    await sendToUser(user)
    await sendToStaff(user)
  } catch (e) {
    throw e
  }
}

// notify user
async function sendToUser (user) {
  try {
    let markdown = `***Hello ${user.firstName}***,<br> `
    markdown += `Your ***Cisco Webex Contact Center v4*** provisioning is now complete!<br><br> `
    markdown += `Please return to the dCloud Collaboration Toolbox to choose your vertical and access the demo. `
    markdown += `Please be sure to read the demo guide that details to run and use the demo. `
    markdown += `<br>Thank You!`
    
    const url = 'https://webexapis.com/v1/messages'
    const token = globals.get('toolbotToken')
    const options = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: {
        toPersonEmail: user.email,
        markdown
      }
    }
    // send to user
    await fetch(url, options)
  } catch (e) {
    console.log(`failed to notify user ${user.email} on Webex:`, e.message)
  }
}

// notify staff of provision
async function sendToStaff (user) {
  try {
    // prepare message
    let markdown = `${user.email} (${user.id}) has finished provisioning in the Webex CC v4 instant demo.`
    const url = 'https://webexapis.com/v1/messages'
    const token = globals.get('toolbotToken')
    const options = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: {
        roomId: globals.get(demoVersion + 'ProvisionRoomId'),
        markdown
      }
    }
    // send message
    await fetch(url, options)
  } catch (e) {
    console.log(`failed to notify staff of provision on Webex:`, e.message)
  }
}

// notify staff of deprovision
async function deprovision (user) {
  try {
    // prepare message
    let markdown = `${user.email} (${user.id}) licenses have been removed (deprovisioned) from the Webex CC v4 instant demo.`
    const url = 'https://webexapis.com/v1/messages'
    const token = globals.get('toolbotToken')
    const options = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: {
        roomId: globals.get(demoVersion + 'ProvisionRoomId'),
        markdown
      }
    }
    // send message
    await fetch(url, options)
  } catch (e) {
    console.log(`failed to notify staff of user ${user.email} deprovision on Webex: ${e.message}`)
  }
}

// notify staff of users marked for deprovision
async function markDeprovision (userIds) {
  if (!Array.isArray(userIds)) {
    console.error('teamsNotifier.markDeprovision was called without userIds array')
  }
  if (userIds.length === 0) {
    // no user IDs to act on. do nothing.
    return
  }
  console.log('markDeprovsion - userIds.length =', userIds.length)
  try {
    // prepare message
    let markdown = `Marking the following users for deprovision from the Webex CC v4 instant demo: \r\n* ${userIds.join('\r\n* ')}`
    const url = 'https://webexapis.com/v1/messages'
    const token = globals.get('toolbotToken')
    const options = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: {
        roomId: globals.get(demoVersion + 'ProvisionRoomId'),
        markdown
      }
    }
    // send message
    await fetch(url, options)
  } catch (e) {
    console.log(`failed to notify staff of marking users ${userIds.join(', ')} Webex CC v4 users for deprovision: ${e.message}`)
  }
}

module.exports = {
  send,
  deprovision,
  markDeprovision
}
