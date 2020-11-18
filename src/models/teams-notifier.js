const fetch = require('./fetch')
const globals = require('./globals')

// main log method
async function send (user) {
  try {
    const markdown = `***Hello ${user.firstName}***,<br>Your ***Cisco Webex Contact Center v4*** provisioning is now complete.!<br>Please go back the the dCloud Collaboration Toolbox to choose your vertical and access the demo. Please be sure to read the demo guide that details to run and use the demo.<br>Thank You!`
    const url = 'https://api.ciscospark.com/v1/messages'
    const token = await globals.getBotToken()
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
    await fetch(url, options)
  } catch (e) {
    console.log(`failed to notify user ${user.email} on Webex Teams:`, e.message)
  }
}

// define all levels as the same function for now
module.exports = {
  send
}
