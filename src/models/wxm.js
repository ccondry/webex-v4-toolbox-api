const fetch = require('./fetch')
const globals = require('./globals')

// map control hub user ID to username in WXM. enables users for the WXM gadget.
// users is an array of control hub user objects
async function mapUsers (orgId, users) {
  const url = 'https://api.getcloudcherry.com/api/account/UpdateExternalIdp/Bulk'
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + globals.get('wxmCreds')
    },
    body: {
      ExternalIdentityProviderName: 'webexci',
      IDPMapppings: users.map(user => {
        return {
          ExternalUserId: user.id,
          ExternalOrgId: orgId,
          ExternalEmailId: user.userName
        }
      })
    }
  }
  return fetch(url, options)
}

module.exports = {
  mapUsers
}