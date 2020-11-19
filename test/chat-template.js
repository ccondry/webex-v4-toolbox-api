const orgId = 'f889c62e-d43a-45bf-a74d-cca4e91e493e'
const templateId = 'c772f5c0-d8bd-11ea-874d-fb6069813361'
const url = `https://cmm.produs1.ciscoccservice.com/cmm/v1/organization/${orgId}/template/${templateId}`
const icon = require('./icon')
const body = {
  "orgId": "f889c62e-d43a-45bf-a74d-cca4e91e493e",
  "templateId": "c772f5c0-d8bd-11ea-874d-fb6069813361",
  "name": "EP_Chat_0325",
  "mediaType": "chat",
  "configuration": {
    "mediaSpecificConfiguration": {
      "useOrgProfile": true,
      "useAgentRealName": false,
      "displayText": "dCloudProd2"
    },
    "mediaType": "chat",
    "pages": {
      "customerInformation": {
        "enabled": true,
        "fields": {
          "welcomeHeader": {
            "attributes": [
              {
                "name": "header",
                "value": "Welcome to"
              },
              {
                "name": "organization",
                "value": "dCloudProd2"
              }
            ]
          },
          "field1": {
            "attributes": [
              {
                "name": "required",
                "value": "required"
              },
              {
                "name": "category",
                "value": {
                  "text": "Customer Information",
                  "id": "customerInfo"
                }
              },
              {
                "name": "label",
                "value": "Name"
              },
              {
                "name": "hintText",
                "value": ""
              },
              {
                "name": "type",
                "value": {
                  "id": "name",
                  "text": "Name",
                  "dictionaryType": {
                    "fieldSet": "cisco.base.customer",
                    "fieldName": "Context_First_Name"
                  }
                },
                "categoryOptions": ""
              }
            ]
          },
          "field2": {
            "attributes": [
              {
                "name": "required",
                "value": "required"
              },
              {
                "name": "category",
                "value": {
                  "text": "Customer Information",
                  "id": "customerInfo"
                }
              },
              {
                "name": "label",
                "value": "Email"
              },
              {
                "name": "hintText",
                "value": "e.g. abc@xyz.com"
              },
              {
                "name": "type",
                "value": {
                  "id": "email",
                  "text": "Email",
                  "dictionaryType": {
                    "fieldSet": "cisco.base.customer",
                    "fieldName": "Context_Work_Email"
                  }
                },
                "categoryOptions": ""
              }
            ]
          },
          "field3": {
            "attributes": [
              {
                "name": "required",
                "value": "required"
              },
              {
                "name": "category",
                "value": {
                  "text": "Request Information",
                  "id": "requestInfo"
                }
              },
              {
                "name": "label",
                "value": "How may I assist you?"
              },
              {
                "name": "hintText",
                "value": "Select from the list or type"
              },
              {
                "name": "type",
                "value": {
                  "id": "category",
                  "text": "Category",
                  "dictionaryType": {
                    "fieldSet": "cisco.base.ccc.pod",
                    "fieldName": "category"
                  }
                },
                "categoryOptions": "Sales"
              }
            ]
          },
          "field4": {
            "attributes": [
              {
                "name": "required",
                "value": "optional"
              },
              {
                "name": "category",
                "value": {
                  "text": "Request Information",
                  "id": "requestInfo"
                }
              },
              {
                "name": "label",
                "value": "Additional Details"
              },
              {
                "name": "hintText",
                "value": "Describe the issue you are experiencing"
              },
              {
                "name": "type",
                "value": {
                  "id": "reason",
                  "text": "Reason",
                  "dictionaryType": {
                    "fieldSet": "cisco.base.ccc.pod",
                    "fieldName": "cccChatReason"
                  }
                },
                "categoryOptions": ""
              }
            ]
          }
        }
      },
      "agentUnavailable": {
        "enabled": false,
        "fields": {
          "agentUnavailableMessage": {
            "displayText": "Sorry, we are unavailable at the moment. Please try again later."
          }
        }
      },
      "offHours": {
        "enabled": false,
        "message": "We are currently offline. Please try again during our business hours.",
        "schedule": {
          "businessDays": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "open24Hours": true,
          "timings": {
            "startTime": "08:00 AM",
            "endTime": "04:00 PM"
          },
          "timezone": "America/New_York"
        }
      },
      "feedback": {
        "enabled": true,
        "fields": {
          "feedbackQuery": {
            "displayText": "Please rate your chat experience"
          },
          "comment": {
            "displayText": "Add comments",
            "dictionaryType": {
              "fieldSet": "cisco.base.rating",
              "fieldName": "cccRatingComments"
            }
          }
        }
      }
    },
    "proactivePrompt": {
      "enabled": false,
      "fields": {
        "promptTime": 30,
        "promptTitle": {
          "displayText": "dCloudProd2"
        },
        "promptMessage": {
          "message": "Chat with our solution specialists to help serve you better."
        }
      }
    },
    "virtualAssistant": {
      "enabled": true,
      "config": {
        "id": "1cc5c2d1-5984-4199-890c-75fa0c7e3330",
        "name": "cumulus-bot",
        "icon": icon
      },
      "welcomeMessage": "Hello, welcome to Cumulus.  My name is Nimbus, and I will be your assistant  How can I help you?"
    },
    "chatStatusMessages": {
      "messages": {
        "bubbleTitleMessage": null,
        "connectingMessage": {
          "displayText": "Connecting you to an Agent"
        },
        "waitingMessage": {
          "displayText": "Waiting for an Agent..."
        },
        "enterRoomMessage": {
          "displayText": "Agent has entered the chat room"
        },
        "leaveRoomMessage": {
          "displayText": "Agent has left the chat"
        },
        "chattingMessage": {
          "displayText": "Chat in progress..."
        }
      }
    },
    "routingLabel": "tam"
  },
  "createdTime": "2020-08-07T14:53:39.484Z",
  "lastUpdatedTime": "2020-08-07T14:58:22.149Z",
  "updatedBy": "dbed20d9-57b3-4a69-aa3f-d213d2baabc8",
  "uri": "/cmm/v1/organization/f889c62e-d43a-45bf-a74d-cca4e91e493e/template/c772f5c0-d8bd-11ea-874d-fb6069813361",
  "entryPoint": "AXPJaa0OTL-WqCpfkUAp"
}

const options = {
  method: 'PUT',
  headers: {
    Authorization
  },
  body
}

fetch(url, options)