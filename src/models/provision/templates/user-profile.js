module.exports = function ({
  name,
  queueId
}) {
  const permissions = {
    "AWX8rkB8VEprkAUKEc0V": {
      "permission": "1",
      "features": []
    },
    "AWX8rkBv_1uTFjV88RLy": {
      "permission": "1",
      "features": [{
        "name": "Analyzer Data Exchange",
        "permission": "0"
      }, {
        "name": "Business Rules",
        "permission": "0"
      }]
    },
    "AWX8rkAlsPDbm60ggdMq": {
      "permission": "2",
      "features": [{
        "name": "Barge-In",
        "permission": "1"
      }, {
        "name": "Mid-Call Monitor",
        "permission": "1"
      }, {
        "name": "Whisper Coach",
        "permission": "1"
      }, {
        "name": "Restricted Monitor Only",
        "permission": "1"
      }, {
        "name": "View Blind Monitor Requests",
        "permission": "1"
      }]
    },
    "AWX8rkBlVEprkAUKEc0U": {
      "permission": "1",
      "features": []
    },
    "AWX8rkCH_1uTFjV88RLz": {
      "permission": "1",
      "features": []
    },
    "AWX8rkAOVEprkAUKEc0T": {
      "permission": "1",
      "features": [{
        "name": "Monitored Calls",
        "permission": "1"
      }, {
        "name": "Threshold Alerts",
        "permission": "1"
      }, {
        "name": "Usage Metrics Report",
        "permission": "1"
      }]
    },
    "AWX8rkC0_1uTFjV88RL0": {
      "permission": "0",
      "features": [{
        "name": "MM Provisioning",
        "permission": "0"
      }, {
        "name": "MM Agent Desktop",
        "permission": "0"
      }]
    },
    "AWX8rj_2_1uTFjV88RLw": {
      "permission": "1",
      "features": [{
        "name": "Manage Entry Points/Queues",
        "permission": "1"
      }, {
        "name": "Manage Sites",
        "permission": "1"
      }, {
        "name": "Manage Teams",
        "permission": "1"
      }, {
        "name": "Manage User Profiles",
        "permission": "1"
      }, {
        "name": "Manage Users",
        "permission": "1"
      }, {
        "name": "Account Unlock",
        "permission": "1"
      }, {
        "name": "Password Reset",
        "permission": "1"
      }, {
        "name": "DN Mapping",
        "permission": "1"
      }, {
        "name": "Manage Dial Plans",
        "permission": "1"
      }, {
        "name": "Audit Trail",
        "permission": "1"
      }, {
        "name": "Portal Branding",
        "permission": "1"
      }, {
        "name": "Manage Tenants",
        "permission": "1"
      }, {
        "name": "Revoke API Key",
        "permission": "1"
      }]
    },
    "AWX8rkACVEprkAUKEc0S": {
      "permission": "1",
      "features": [{
        "name": "Agent State Change",
        "permission": "1"
      }, {
        "name": "Real-time Threshold Alerts",
        "permission": "1"
      }, {
        "name": "Web Callback Report",
        "permission": "1"
      }, {
        "name": "Map View",
        "permission": "0"
      }, {
        "name": "Summary View",
        "permission": "1"
      }]
    },
    "AWX8rkCSsPDbm60ggdMr": {
      "permission": "1",
      "features": [{
        "name": "Manage Recordings",
        "permission": "1"
      }, {
        "name": "Tags",
        "permission": "1"
      }, {
        "name": "Custom Attributes",
        "permission": "1"
      }, {
        "name": "Security Keys",
        "permission": "1"
      }]
    },
    "AWX8rkCoVEprkAUKEc0W": {
      "permission": "0",
      "features": []
    },
    "AWX8rkAb_1uTFjV88RLx": {
      "permission": "2",
      "features": [{
        "name": "Manage Call Flow Scripts",
        "permission": "1"
      }, {
        "name": "Manage Media Files",
        "permission": "1"
      }]
    },
    "AWX8rkCcsPDbm60ggdMs": {
      "permission": "1",
      "features": []
    }
  }

  // set manage call flow scripts permission
  if (process.env.MANAGE_CALL_FLOW_SCRIPTS_PERMISSION) {
    permissions['AWX8rkAb_1uTFjV88RLx'].permissions = process.env.MANAGE_CALL_FLOW_SCRIPTS_PERMISSION
  }

  const permissionsString = JSON.stringify(permissions)

  // const permissionsString = "{\"AWX8rkB8VEprkAUKEc0V\":{\"permission\":\"1\",\"features\":[]},\"AWX8rkBv_1uTFjV88RLy\":{\"permission\":\"1\",\"features\":[{\"name\":\"Analyzer Data Exchange\",\"permission\":\"0\"},{\"name\":\"Business Rules\",\"permission\":\"0\"}]},\"AWX8rkAlsPDbm60ggdMq\":{\"permission\":\"2\",\"features\":[{\"name\":\"Barge-In\",\"permission\":\"1\"},{\"name\":\"Mid-Call Monitor\",\"permission\":\"1\"},{\"name\":\"Whisper Coach\",\"permission\":\"1\"},{\"name\":\"Restricted Monitor Only\",\"permission\":\"1\"},{\"name\":\"View Blind Monitor Requests\",\"permission\":\"1\"}]},\"AWX8rkBlVEprkAUKEc0U\":{\"permission\":\"1\",\"features\":[]},\"AWX8rkCH_1uTFjV88RLz\":{\"permission\":\"1\",\"features\":[]},\"AWX8rkAOVEprkAUKEc0T\":{\"permission\":\"1\",\"features\":[{\"name\":\"Monitored Calls\",\"permission\":\"1\"},{\"name\":\"Threshold Alerts\",\"permission\":\"1\"},{\"name\":\"Usage Metrics Report\",\"permission\":\"1\"}]},\"AWX8rkC0_1uTFjV88RL0\":{\"permission\":\"0\",\"features\":[{\"name\":\"MM Provisioning\",\"permission\":\"0\"},{\"name\":\"MM Agent Desktop\",\"permission\":\"0\"}]},\"AWX8rj_2_1uTFjV88RLw\":{\"permission\":\"1\",\"features\":[{\"name\":\"Manage Entry Points/Queues\",\"permission\":\"1\"},{\"name\":\"Manage Sites\",\"permission\":\"1\"},{\"name\":\"Manage Teams\",\"permission\":\"1\"},{\"name\":\"Manage User Profiles\",\"permission\":\"1\"},{\"name\":\"Manage Users\",\"permission\":\"1\"},{\"name\":\"Account Unlock\",\"permission\":\"1\"},{\"name\":\"Password Reset\",\"permission\":\"1\"},{\"name\":\"DN Mapping\",\"permission\":\"1\"},{\"name\":\"Manage Dial Plans\",\"permission\":\"1\"},{\"name\":\"Audit Trail\",\"permission\":\"1\"},{\"name\":\"Portal Branding\",\"permission\":\"1\"},{\"name\":\"Manage Tenants\",\"permission\":\"1\"},{\"name\":\"Revoke API Key\",\"permission\":\"1\"}]},\"AWX8rkACVEprkAUKEc0S\":{\"permission\":\"1\",\"features\":[{\"name\":\"Agent State Change\",\"permission\":\"1\"},{\"name\":\"Real-time Threshold Alerts\",\"permission\":\"1\"},{\"name\":\"Web Callback Report\",\"permission\":\"1\"},{\"name\":\"Map View\",\"permission\":\"0\"},{\"name\":\"Summary View\",\"permission\":\"1\"}]},\"AWX8rkCSsPDbm60ggdMr\":{\"permission\":\"1\",\"features\":[{\"name\":\"Manage Recordings\",\"permission\":\"1\"},{\"name\":\"Tags\",\"permission\":\"1\"},{\"name\":\"Custom Attributes\",\"permission\":\"1\"},{\"name\":\"Security Keys\",\"permission\":\"1\"}]},\"AWX8rkCoVEprkAUKEc0W\":{\"permission\":\"0\",\"features\":[]},\"AWX8rkAb_1uTFjV88RLx\":{\"permission\":\"1\",\"features\":[{\"name\":\"Manage Call Flow Scripts\",\"permission\":\"1\"},{\"name\":\"Manage Media Files\",\"permission\":\"1\"}]},\"AWX8rkCcsPDbm60ggdMs\":{\"permission\":\"1\",\"features\":[]}}"

  return {
    "type": "user-profile",
    "attributes": {
      "allTeams__i": 1,
      "passwordPolicyId__s": "AWX8rlY5sPDbm60ggdPB",
      "tenantId__s": "",
      "name__s": name,
      "queues__sa": [
        queueId
      ],
      "status__i": 1,
      "allEntryPoints__i": 0,
      "_type__s": "user-profile",
      "modules__sa": [
        "AWX8rkB8VEprkAUKEc0V",
        "AWX8rkBv_1uTFjV88RLy",
        "AWX8rkAlsPDbm60ggdMq",
        "AWX8rkBlVEprkAUKEc0U",
        "AWX8rkCH_1uTFjV88RLz",
        "AWX8rkAOVEprkAUKEc0T",
        "AWX8rj_2_1uTFjV88RLw",
        "AWX8rkACVEprkAUKEc0S",
        "AWX8rkCSsPDbm60ggdMr",
        "AWX8rkAb_1uTFjV88RLx",
        "AWX8rkCcsPDbm60ggdMs"
      ],
      "tid__s": "1000148",
      "entryPoints__sa": [
        "AWyMOEESMcqfWX69tpCB"
      ],
      "teams__sa": [],
      "allModules__i": 0,
      "allSites__i": 1,
      "permissions__s": permissionsString,
      "description__s": "Supervisor with Agent capabilities but View Only Admin rights",
      "sites__sa": [],
      "allQueues__i": 0
    }
  }
}
