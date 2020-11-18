// data template for creating a chat template in Webex Control Hub
module.exports = function (name, entryPoint) {
  return {
    name,
    configuration: {
      mediaType: 'chat',
      mediaSpecificConfiguration: {
        useOrgProfile: false,
        useAgentRealName: false,
        displayText: 'dCloudProd2'
      },
      proactivePrompt: {
        enabled: true,
        fields: {
          promptTime: 30,
          promptTitle: {
            displayText: 'Cumulus'
          },
          promptMessage: {
            message: 'Chat with our solution specialists to help serve you better.'
          }
        }
      },
      routingLabel: 'tam',
      expertVirtualAssistant: {
        id: '',
        name: ''
      },
      virtualAssistant: {
        enabled: true,
        config: {
          id: '1cc5c2d1-5984-4199-890c-75fa0c7e3330',
          name: 'cumulus-bot'
        },
        welcomeMessage: 'Hello, welcome to Cumulus.  My name is Nimbus, and I will be your assistant\u0021  How can I help you?'
      },
      pages: {
        customerInformation: {
          enabled: true,
          fields: {
            welcomeHeader: {
              attributes: [
                {
                  name: 'header',
                  value: 'Welcome to'
                },
                {
                  name: 'organization',
                  value: 'dCloudProd2'
                }
              ]
            },
            field1: {
              attributes: [
                {
                  name: 'required',
                  value: 'required'
                },
                {
                  name: 'category',
                  value: {
                    text: 'Customer Information',
                    id: 'customerInfo'
                  }
                },
                {
                  name: 'label',
                  value: 'Name'
                },
                {
                  name: 'hintText',
                  value: ''
                },
                {
                  name: 'type',
                  value: {
                    id: 'name',
                    text: 'Name',
                    dictionaryType: {
                      fieldSet: 'cisco.base.customer',
                      fieldName: 'Context_First_Name'
                    }
                  },
                  categoryOptions: ''
                }
              ]
            },
            field2: {
              attributes: [
                {
                  name: 'required',
                  value: 'required'
                },
                {
                  name: 'category',
                  value: {
                    text: 'Customer Information',
                    id: 'customerInfo'
                  }
                },
                {
                  name: 'label',
                  value: 'Email'
                },
                {
                  name: 'hintText',
                  value: 'e.g. abc@xyz.com'
                },
                {
                  name: 'type',
                  value: {
                    id: 'email',
                    text: 'Email',
                    dictionaryType: {
                      fieldSet: 'cisco.base.customer',
                      fieldName: 'Context_Work_Email'
                    }
                  },
                  categoryOptions: ''
                }
              ]
            },
            field3: {
              attributes: [
                {
                  name: 'required',
                  value: 'required'
                },
                {
                  name: 'category',
                  value: {
                    text: 'Request Information',
                    id: 'requestInfo'
                  }
                },
                {
                  name: 'label',
                  value: 'How may I assist you?'
                },
                {
                  name: 'hintText',
                  value: 'Select from the list or type'
                },
                {
                  name: 'type',
                  value: {
                    id: 'category',
                    text: 'Category',
                    dictionaryType: {
                      fieldSet: 'cisco.base.ccc.pod',
                      fieldName: 'category'
                    }
                  },
                  categoryOptions: 'Sales'
                }
              ]
            },
            field4: {
              attributes: [
                {
                  name: 'required',
                  value: 'optional'
                },
                {
                  name: 'category',
                  value: {
                    text: 'Request Information',
                    id: 'requestInfo'
                  }
                },
                {
                  name: 'label',
                  value: 'Additional Details'
                },
                {
                  name: 'hintText',
                  value: 'Describe the issue you are experiencing'
                },
                {
                  name: 'type',
                  value: {
                    id: 'reason',
                    text: 'Reason',
                    dictionaryType: {
                      fieldSet: 'cisco.base.ccc.pod',
                      fieldName: 'cccChatReason'
                    }
                  },
                  categoryOptions: ''
                }
              ]
            }
          }
        },
        agentUnavailable: {
          enabled: false,
          fields: {
            agentUnavailableMessage: {
              displayText: 'Sorry, we are unavailable at the moment. Please try again later.'
            }
          }
        },
        offHours: {
          enabled: true,
          message: 'We are currently offline. Please try again during our business hours.',
          schedule: {
            businessDays: [
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday'
            ],
            open24Hours: true,
            timings: {
              startTime: '08:00 AM',
              endTime: '04:00 PM'
            },
            timezone: 'America/New_York'
          }
        },
        feedback: {
          enabled: true,
          fields: {
            feedbackQuery: {
              displayText: 'Please rate your chat experience'
            },
            comment: {
              displayText: 'Add comments',
              dictionaryType: {
                fieldSet: 'cisco.base.rating',
                fieldName: 'cccRatingComments'
              }
            }
          }
        }
      },
      chatStatusMessages: {
        messages: {
          connectingMessage: {
            displayText: 'Connecting you to an Agent'
          },
          waitingMessage: {
            displayText: 'Waiting for an Agent...'
          },
          enterRoomMessage: {
            displayText: 'Agent has entered the chat room'
          },
          leaveRoomMessage: {
            displayText: 'Agent has left the chat'
          },
          chattingMessage: {
            displayText: 'Chat in progress...'
          }
        }
      }
    },
    entryPoint
  }
}