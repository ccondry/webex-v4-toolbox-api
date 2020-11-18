module.export = function ({
  nameRS,
  startDate,
  endDate,
  virtualDbId,
  virtualName,
  virtualId,
  virtualChatDbId,
}) {
  return [{
    type: "routing-strategy",
    attributes: {
      mediaFileIds__sa: ["", "0"],
      legacyJscriptId__l: 2212,
      jscriptId__s: "AXNehqic2lFHBsnxC9O5",
      startTimestamp__l: startDate,
      saturday__i: 1,
      legacyVirtualTeamId__l: virtualDbId,
      name__s: nameRS,
      thursday__i: 1,
      strategyStatus__s: "active",
      status__i: 1,
      script__s: `<call-distribution-script name=\"${nameRS}\" scriptid=\"${scriptId}\" status=\"active\" start-date=\"${startDate}\" end-date=\"${endDate}\" execution-start-time-of-day=\"18000000\" execution-end-time-of-day=\"18000000\" repetition=\"daily\" xmlns=\"http://cha.transerainc.com/gen/cds\">\n  <day-of-week>sunday</day-of-week>\n  <day-of-week>monday</day-of-week>\n  <day-of-week>tuesday</day-of-week>\n  <day-of-week>wednesday</day-of-week>\n  <day-of-week>thursday</day-of-week>\n  <day-of-week>friday</day-of-week>\n  <day-of-week>saturday</day-of-week>\n  <vdn enterprise-id=\"${tenantId}\" enterprise-name=\"${enterpriseName}\" id=\"${virtualDbId}\" vteam-id=\"${virtualDbId}\" vteam-name=\"${virtualName}\" uri=\"\" maximum-time-in-queue=\"0\" is-monitoring-permitted=\"false\" is-queuing-permitted=\"false\" is-recording-permitted=\"false\" is-retransfer-permitted=\"false\" overflow-uri=\"\">\n    <ivr-url park-url=\"http://localhost/${enterpriseName}/dummy\" requeue-url=\"http://localhost:8080/${enterpriseName}/\"/>\n  </vdn>\n  <call-flow-params>\n    <param name=\"Sales\" value=\"${virtualChatDbId}\" valueDataType=\"string\" qualifier=\"vteam\" description=\"(vteam, A valid VTeam.)\"/>\n  </call-flow-params>\n</call-distribution-script>`,
      endDate__l: endDate,
      daily__i: 1,
      tuesday__i: 1,
      virtualTeamId__s: virtualId,
      defaultFlag__i: 0,
      monday__i: 1,
      grs__i: 0,
      startDate__l: startDate,
      currentStatus__i: 0,
      friday__i: 1,
      endTimestamp__l: endDate,
      defaultQueueDbId__l: 0,
      _type__s: "routing-strategy",
      wednesday__i: 1,
      cvaEnabled__i: 0,
      sunday__i: 1,
      startTime__l: 18000000,
      endTime__l: 18000000
    }
  }]
}