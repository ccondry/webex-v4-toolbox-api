module.exports = function (name) {
	return [{
    type: 'team',
    attributes: {
      priority__i: 0,
      multimediaProfileId__s: process.env.CJP_MULTIMEDIA_PROFILE_ID,
      siteId__s: process.env.CJP_SITE_ID,
      capacity__l: 0,
      name__s: name,
      teamDn__s: '0',
      teamStatus__s: 'In Service',
      status__i: 1,
      _type__s: 'team',
      teamType__i: 1
    }
  }]
}
 