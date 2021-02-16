const {js2xml} = require('../../parsers')

function epTemplate ({
  name,
  entryPointDbId,
  orgName,
  tenantId,
  tenantName,
  queueDbId,
  entryPointId,
  parentId
}) {
  // const script = "<call-distribution-script name=\"EP_Chat_0703\" scriptid=\"1613064173547\" status=\"active\" start-date=\"1613001600000\" end-date=\"3187209600000\" execution-start-time-of-day=\"18000000\" execution-end-time-of-day=\"18000000\" repetition=\"daily\" xmlns=\"http://cha.transerainc.com/gen/cds\">\n  <day-of-week>sunday</day-of-week>\n  <day-of-week>monday</day-of-week>\n  <day-of-week>tuesday</day-of-week>\n  <day-of-week>wednesday</day-of-week>\n  <day-of-week>thursday</day-of-week>\n  <day-of-week>friday</day-of-week>\n  <day-of-week>saturday</day-of-week>\n  <vdn enterprise-id=\"166\" enterprise-name=\"dCloudProd2\" id=\"16563\" vteam-id=\"16563\" vteam-name=\"EP_Chat_0703\" uri=\"\" maximum-time-in-queue=\"0\" is-monitoring-permitted=\"false\" is-queuing-permitted=\"false\" is-recording-permitted=\"false\" is-retransfer-permitted=\"false\" overflow-uri=\"\">\n    <ivr-url park-url=\"http://localhost/dCloudProd2/dummy\" requeue-url=\"http://localhost:8080/dCloudProd2/\"/>\n  </vdn>\n  <call-flow-params>\n    <param name=\"Sales\" value=\"16562\" valueDataType=\"string\" qualifier=\"vteam\" description=\"(vteam, A valid VTeam.)\"/>\n  </call-flow-params>\n</call-distribution-script>"
  const scriptJson = {
    "call-distribution-script": {
      "@_name": name,
      "@_scriptid": "1613064173547",
      "@_status": "active",
      "@_start-date": "1613001600000",
      "@_end-date": "3187209600000",
      "@_execution-start-time-of-day": "18000000",
      "@_execution-end-time-of-day": "18000000",
      "@_repetition": "daily",
      "@_xmlns": "http://cha.transerainc.com/gen/cds",
      "day-of-week": [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ],
      "vdn": {
        "@_enterprise-id": tenantId,
        "@_enterprise-name": orgName,
        "@_id": entryPointDbId,
        "@_vteam-id": entryPointDbId,
        "@_vteam-name": name,
        "@_uri": "",
        "@_maximum-time-in-queue": "0",
        "@_is-monitoring-permitted": "false",
        "@_is-queuing-permitted": "false",
        "@_is-recording-permitted": "false",
        "@_is-retransfer-permitted": "false",
        "@_overflow-uri": "",
        "ivr-url": {
          "@_park-url": `http://localhost/${tenantName}/dummy`,
          "@_requeue-url": `http://localhost:8080/${tenantName}/`
        }
      },
      "call-flow-params": {
        "param": {
          "@_name": "Sales",
          "@_value": queueDbId,
          "@_valueDataType": "string",
          "@_qualifier": "vteam",
          "@_description": "(vteam, A valid VTeam.)"
        }
      }
    }
  }
  
  const scriptXml = js2xml(scriptJson)

  return {
    "auxiliaryDataType": "RESOURCES",
    "type": "routing-strategy",
    "attributes": {
      "mediaFileIds__sa": [
        "",
        "0"
      ],
      "legacyJscriptId__l": 0,
      "jscriptId__s": "0",
      "startTimestamp__l": 1613019600000,
      "legacyVirtualentryPointDbId__l": entryPointDbId,
      "name__s": name,
      "daily__i": 1,
      "monday__i": 1,
      "tuesday__i": 1,
      "wednesday__i": 1,
      "thursday__i": 1,
      "friday__i": 1,
      "saturday__i": 1,
      "sunday__i": 1,
      "strategyStatus__s": "active",
      "status__i": 1,
      "parentStrategyId__s": parentId,
      "script__s": scriptXml,
      "endDate__l": 3187209600000,
      // "virtualentryPointDbId__s": entryPointId,
      "virtualTeamId__s": entryPointId,
      "defaultFlag__i": 0,
      "grs__i": 0,
      "startDate__l": 1613001600000,
      "currentStatus__i": 0,
      "endTimestamp__l": 3187314000000,
      "defaultQueueDbId__l": 0,
      "_type__s": "routing-strategy",
      "cvaEnabled__i": 0,
      "startTime__l": 18000000,
      "endTime__l": 18000000
    }
  }
}

module.exports = epTemplate