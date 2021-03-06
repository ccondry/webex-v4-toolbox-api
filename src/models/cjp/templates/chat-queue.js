module.exports = function (name, teamId) {
	return [{
    type: 'virtual-team',
    attributes: {
      primaryPingUrl__s: '',
      overflowUri__s: '',
      isDedicated__i: 1,
      serviceLevelThreshold__i: 9999,
      name__s: name,
      recordingPauseDuration__i: 10,
      channelType__i: 4,
      status__i: 1,
      longitude__d: 0,
      pauseResumeEnabled__i: 0,
      latitude__d: 0,
      maxTimeInQueue__l: 9999,
      areaCodesToBlock__s: '',
      permitRecording__i: 0,
      billingGroup__s: '',
      acdDescription__s: '',
      backupPingUrl__s: '',
      metricsDataPrecedence__sa: [],
      mapGroup__s: '',
      vendorId__s: '',
      timezone__s: '',
      label__s: '',
      permitMonitoring__i: 0,
      acdType__s: 'seratel',
      dnTimeout__i: 60,
      type__i: 1,
      maximumActiveCalls__i: 4,
      _type__s: 'virtual-team',
      ivrRequeueUrl__s: 'http://localhost:8080/dCloudProd/',
      ccOneQueue__i: 1,
      callFlowScriptUrl__s: 'http://localhost:8080/dCloudProd/',
      permitParking__i: 0,
      checkAgentAvailability__i: 0,
      maximumDnRetries__i: 3,
      recordAllCalls__i: 0,
      description__s: '',
      blockAreaCodes__i: 0,
      callDistributionGroups__s: JSON.stringify([{
        order: 1,
        duration: 0,
        agentGroups:[{ teamId }]
      }])
    }
  }]
}
