// control hub org ID
const readOnlyTemplate = require('./templates/read-only')
// const enableCcTemplate = require('./templates/enable-cc')
// cache for the bearer token
const fetch = require('../../fetch')
const globals = require('../../globals')

const orgId = process.env.ORG_ID

function getToken () {
  return globals.get('webexV4ControlHubAccessToken')
}

// set user to read-only
async function setReadOnly ({
  name,
  email
}) {
  try {
    const url = `https://atlas-a.wbx2.com/admin/api/v1/organization/${orgId}/users/roles`

    const token = await getToken()
    
    const body = readOnlyTemplate(name, email)

    const options = {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body
    }

    await fetch(url, options)
  } catch (e) {
    throw e
  }
}

async function setRoles ({email, roles}) {
  try {
    const url = `https://atlas-a.wbx2.com/admin/api/v1/organization/${orgId}/users/contactCenterRoles`
    
    const token = await getToken()

    const body = {
      users: [{
        userRoles: roles,
        email
      }]
    }
    const options = {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body
    }

    await fetch(url, options)
  } catch (e) {
    throw e
  }
}

// enable sjeffers for Contact Center role
async function enableContactCenterSupervisor ({email}) {
  const roles = [
    {roleName: 'CJP_PREMIUM_AGENT', 'roleState': 'ACTIVE'},
    {roleName: 'CJP_SUPERVISOR', 'roleState': 'ACTIVE'}
  ]
  return setRoles({email, roles})
}

// enable sjeffers for Contact Center role
async function enableContactCenterAgent ({email}) {
  const roles = [
    {roleName: 'CJP_PREMIUM_AGENT', 'roleState': 'ACTIVE'},
    {roleName: 'CJP_SUPERVISOR', 'roleState': 'INACTIVE'}
  ]
  return setRoles({email, roles})
}

// enable user for Standard Contact Center role (used to reset role and try again)
async function enableStandardContactCenterAgent ({email}) {
  const roles = [
    {roleName: 'CJP_PREMIUM_AGENT', 'roleState': 'INACTIVE'},
    {roleName: 'CJP_SUPERVISOR', 'roleState': 'INACTIVE'},
    {roleName: 'CJP_STANDARD_AGENT', 'roleState': 'ACTIVE'}
  ]
  return setRoles({email, roles})
}

// enable user for Contact Center features
async function disableContactCenter ({email}) {
  const roles = [
    {roleName: 'CJP_PREMIUM_AGENT', 'roleState': 'INACTIVE'},
    {roleName: 'CJP_SUPERVISOR', 'roleState': 'INACTIVE'}
  ]
  return setRoles({email, roles})
}

// get user info
async function get (email) {
  try {
    const url = `https://identity.webex.com/identity/scim/${orgId}/v1/Users/${email}`

    const token = await getToken()

    const options = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    return fetch(url, options)
  } catch (e) {
    throw e
  }
}

// change user to a supervisor
async function makeSupervisor (id) {
  try {
    const url = `https://identity.webex.com/identity/scim/${orgId}/v1/Users/${id}`

    const token = await getToken()
    
    const body = {
      schemas: [
        'urn:scim:schemas:core:1.0',
        'urn:scim:schemas:extension:cisco:commonidentity:1.0'
      ],
      roles: [
        'cjp.premium_agent',
        'cjp.supervisor',
        'id_readonly_admin'
      ]
    }

    const options = {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body
    }

    return fetch(url, options)
  } catch (e) {
    throw e
  }
}

async function list () {
  const token = await getToken()
  console.log('token', token)
  const url = `https://identity.webex.com/identity/scim/${orgId}/v1/Users`
  const attributes = [
    'name',
    'userName',
    'userStatus',
    'entitlements',
    'displayName',
    'photos',
    'roles',
    'active',
    'adminTrainSiteNames',
    'trainSiteNames',
    'linkedTrainSiteNames',
    'licenseID',
    'userSettings',
    'userPreferences'
  ]
  // const filter = '(userType eq "user") and (roles eq "id_full_admin" or roles eq "id_device_admin" or roles eq "id_readonly_admin" or roles eq "id_user_admin" or roles eq "cjp.admin")'
  const filter = '(userType eq "user")'
  const options = {
    query: {
      attributes: attributes.join(','), 
      count: 100,
      filter,
      sortBy: 'name',
      sortOrder: 'ascending',
      startIndex: 0
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
  return fetch(url, options)
}

async function onboard (email) {
  const token = getToken()
  const url = `https://license-a.wbx2.com/license/api/v1/organization/${orgId}/users/onboard`
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: [{
      email,
      licenses: [
        {
          id: 'MS_fe3cfc81-8469-4929-8944-23e79e5d0d53',
          idOperation: 'ADD',
          properties: {}
        },
        {
          id: 'CJPPRM_1cf76371-2fde-4f72-8122-b6a9d2f89c73',
          idOperation: 'ADD',
          properties: {}
        }
      ],
      userEntitlements: [],
      extendedSiteAccounts: [],
      onboardMethod: null
    }]
  }
  return fetch(url, options)
}

module.exports = {
  enableContactCenterAgent,
  enableContactCenterSupervisor,
  enableStandardContactCenterAgent,
  disableContactCenter,
  setRoles,
  setReadOnly,
  get,
  makeSupervisor,
  list,
  onboard
}