module.exports = function ({
  id,
  userId,
  teamId,
  skillProfileId
}) {
  return {
    id,
    auxiliaryDataType: null,
    type: 'user',
    attributes: {
      lastName__s: `Barrows${userId}`,
      historicalReportsEnabled__i: 0,
      multimediaProfileId__s: 'AXNt1GpBBvHuTr-DwpOM',
      mobile__s: '',
      externalId__s: '',
      work__s: '',
      status__i: 1,
      sid: id,
      city__s: '',
      login__s: `rbarrows${userId}@${process.env.DOMAIN}`,
      profileId__s: 'AXN3oxebKK6zpaSDzvpF',
      invalidAttempts__i: 0,
      street__s: '',
      postalCode__s: '',
      agentProfileId__s: 'AXNehq5V2lFHBsnxC9Qr',
      locked__i: 0,
      country__s: '',
      siteId__s: 'AXNehqhY2lFHBsnxC9O0',
      email__s: `rbarrows${userId}@${process.env.DOMAIN}`,
      _type__s: 'user',
      passwordHistoryData__s: '',
      state__s: '',
      firstName__s: 'Rick',
      defaultDn__s: '',
      callCenterEnabled__i: 1,
      teamIds__sa: [
        'AXP3w-_zvzzZ5gULgAvh',
        teamId
      ],
      skillProfileId__s: skillProfileId
    }
  }
}