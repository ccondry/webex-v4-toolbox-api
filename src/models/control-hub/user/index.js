// control hub org ID
const readOnlyTemplate = require('./templates/read-only')
const enableCcTemplate = require('./templates/enable-cc')
// cache for the bearer token
const cache = require('../cache')

const orgId = process.env.ORG_ID

async function getToken () {
  try {
    const token = cache.getItem('accessToken')
    return token
  } catch (e) {
    throw e
  }
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

// enable user for Contact Center features
async function enableContactCenter ({
  givenName,
  familyName,
  displayName,
  email
}) {
  try {
    const url = `https://atlas-a.wbx2.com/admin/api/v1/organization/${orgId}/users/onboard?migrateUsers=true`
    
    const token = await getToken()

    const body = enableCcTemplate({
      givenName,
      familyName,
      displayName,
      email,
      msId: process.env.MS_ID,
      cjpPrmId: process.env.CJP_PRM_ID
    })

    const options = {
      method: 'POST',
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

module.exports = {
  enableContactCenter,
  setReadOnly,
  get,
  makeSupervisor
}