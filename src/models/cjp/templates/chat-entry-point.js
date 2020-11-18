module.exports = function (name) {
	return [{
    type: 'virtual-team',
  	attributes: {
      primaryPingUrl__s: '',
      overflowUri__s: '',
      isDedicated__i: 1,
      serviceLevelThreshold__i: 9999,
      name__s: name,
      channelType__i: 4,
      status__i: 1,
      longitude__d: 0,
      latitude__d: 0,
      maxTimeInQueue__l: 0,
      areaCodesToBlock__s: '',
      billingGroup__s: '',
      acdDescription__s: '',
      backupPingUrl__s: '',
      metricsDataPrecedence__sa: [],
      ivrDnList__s: '',
      mapGroup__s: '',
      vendorId__s: '',
      timezone__s: '',
      socialChannelType__s: '0',
      label__s: '',
      acdType__s: 'seratel',
      dnTimeout__i: 60,
      type__i: 0,
      maximumActiveCalls__i: 4,
      _type__s: 'virtual-team',
      ivrRequeueUrl__s: 'http://localhost:8080/dCloudProd2/',
      ccOneQueue__i: 1,
      callFlowScriptUrl__s: 'http://localhost:8080/dCloudProd2/',
      maximumDnRetries__i: 3,
      description__s: '',
      blockAreaCodes__i: 0
		}
	}]
}
	

