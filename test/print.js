const userId = '0325'
const chatTemplateId = 'abcd'
const ccDomain = 'cc.dc-01.com'
const msId = '$msId'
const cjpPrmId = '$cjpPrmId'

let body = `{"users":[{"email":"rbarrows${userId}@${ccDomain}","licenses":[{"id":"${msId}","idOperation":"ADD","properties":{}},{"id":"${cjpPrmId}","idOperation":"ADD","properties":{}}],"userEntitlements":[],"extendedSiteAccounts":[],"onboardMethod":null,"name":{"givenName":"Rick","familyName":"Barrows${userId}"},"displayName":null}]}`;
console.log(JSON.stringify(JSON.parse(body), null, 2))