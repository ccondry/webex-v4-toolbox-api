const fetch = require('./fetch')
const globals = require('./globals')
const demoVersion = 'webexV' + require('./demo-version')

// map control hub user ID to username in WXM. enables users for the WXM gadget.
// users is an array of control hub user objects
async function mapUsers (users) {
  const url = 'https://api.getcloudcherry.com/api/account/UpdateExternalIdp/Bulk'

  const credentials = await globals.getAsync(demoVersion + 'WxmCredentials')
  const orgId = await globals.getAsync(demoVersion + 'ControlHubOrgId')
  const body = {
    ExternalIdentityProviderName: 'webexci',
    IDPMapppings: users.map(user => {
      return {
        ExternalUserId: user.id,
        ExternalOrgId: orgId,
        ExternalEmailId: user.userName
      }
    })
  }
  console.log(JSON.stringify(body, null, 2))
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + credentials,
    },
    body
  }
  return fetch(url, options)
}

module.exports = {
  mapUsers
}