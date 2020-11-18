module.exports = function ({
  givenName,
  familyName,
  displayName,
  email,
  msId,
  cjpPrmId
}) {
  return {
    users: [{
      email,
      licenses: [{
        id: msId,
        idOperation: 'ADD',
        properties: {}
      }, {
        id: cjpPrmId,
        idOperation: 'ADD',
        properties: {}
      }],
      userEntitlements: [],
      extendedSiteAccounts: [],
      onboardMethod: null,
      name: {
        givenName,
        familyName
      },
      displayName
    }]
  }
}
