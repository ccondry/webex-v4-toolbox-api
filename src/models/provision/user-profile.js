const sleep = require('../sleep')
const client = require('../cjp/client')

module.exports = {
  upsert
}

async function upsert (body) {
  const name = body.attributes.name__s
  // console.log('userProfile.upsert')

  // find existing user profile
  let existingUserProfile
  try {
    const response = await client.userProfile.list()
    const summary = response.auxiliaryDataList.map(v => {
      return {
        id: v.id,
        name: v.attributes.name__s
      }
    })
    // console.log('found', response.auxiliaryDataList.length, 'existing user profiles. Searching for', name, '...')
    const userProfiles = response.auxiliaryDataList
    // find specific user profile
    existingUserProfile = userProfiles.find(v => v.attributes.name__s === name)
  } catch (e) {
    console.log('Failed to find existing user profile', name, ':', e.message)
    throw e
  }
  let userProfileId

  // console.log('user profile template:', body)

  // did we find it?
  if (existingUserProfile) {
    userProfileId = existingUserProfile.id
    // console.log('found existing user profile', name, ':', userProfileId)
    // return existingUserProfile
    // console.log('updating existing user profile', name, 'settings...')
    // update existing object
    try {
      body.id = userProfileId
      body.auxiliaryDataType = 'USER_DATA'
      await client.userProfile.modify(userProfileId, [body])
      console.log('successfully updated user profile', name, ':', userProfileId)
    } catch (e) {
      console.log('failed to update user profile', name, e.message)
      throw e
    }
  } else {
    // no existing user profile
    // create new user profile
    console.log('user profile', name, 'not found. Creating new user profile', name, '...')
    try {
      // create user profile
      const response = await client.userProfile.create([body])
      // check HTTP status inside the response
      if (response[0].code < 200 || response[0].code >= 300) {
        console.log('Failed to create new user profile - status code', response[0].code, response[0])
        // HTTP error code
        throw Error('Failed to create new user profile - status code ' + response[0].code, response[0])
      }
      console.log('successfully created new user profile', name, ':', JSON.stringify(response, null, 2))
      // extract user profile ID
      userProfileId = response[0].links[0].href.split('/').pop()
      console.log('Successfully created new user profile', name, ':', userProfileId)
    } catch (e) {
      console.log('Failed to create new user profile', name, ':', e.message)
      throw e
    }
  }

  // retrieve newly created or modified user profile details
  try {
    // console.log('waiting for new user profile', name, ':', userProfileId, 'to update...')
    // wait for create/modify to be done
    await sleep(process.env.API_THROTTLE || 8000)
    // console.log('retrieving new user profile', name, ':', userProfileId, '...')
    // get userProfile
    const userProfile = await client.userProfile.get(userProfileId)
    // console.log('returning new user profile', name, ':', userProfileId)
    // return userProfile
    return userProfile
  } catch (e) {
    console.log('Failed to get user profile', name, ':', e.message)
    throw e
  }
}
