const lib = require('webex-control-hub')
const globals = require('../globals')
const demoVersion = 'webexV' + require('../demo-version')

async function getClient () {
  try {
    // make sure globals have loaded
    await Promise.resolve(globals.initialLoad)
    return new lib({
      orgId: globals.get(demoVersion + 'ControlHubOrgId'),
      accessToken: globals.get(demoVersion + 'ControlHubToken').access_token
    })
  } catch (e) {
    throw e
  }
}
module.exports = {
  // get a control hub client with current access token
  get: getClient,
  getClient
}