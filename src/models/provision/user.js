const sleep = require('../sleep')
const client = require('../cjp/client')

module.exports = {
  upsert
}

async function upsert (body) {
  // console.log('user.upsert')
  // find existing user
  const username = body.attributes.login__s
  let existingUser
  try {
    // console.log('looking for existing user', username, '...')
    const response = await client.user.getByLogin(username)
    if (response.auxiliaryMetadata.numberOfRecords === 0) {
      // 0 records
      console.log('no existing user found matching username', username)
      // continue after this try block
    } else if (response.auxiliaryMetadata.numberOfRecords === 1) {
      // 1 record
      existingUser = response.auxiliaryDataList[0]
      // console.log('found existing user', username, ':', existingUser.id)
      // console.log(JSON.stringify(existingUser, null, 2))
      // return existingUser
    } else {
      // more than 1
      console.log('found more than one user record:', response)
      // cannot continue
      throw Error('found ' + response.auxiliaryMetadata.numberOfRecords + ' users. Cannot continue provision.')
    }
  } catch (e) {
    console.log('failed while trying to find existing user', username, ':', e.message)
    throw e
  }

  let userId
  if (existingUser) {
    // user exists
    userId = existingUser.id
    // console.log('updating user', username, ':', userId, '...')
    // update user
    try {
      // set ID on body
      body.id = userId
      await client.user.modify(userId, body)
      console.log('successfully updated user', username)
    } catch (e) {
      console.log('failed to update user', username, e.message)
      throw e
    }
  } else {
    // not exist - create new user
    try {
      console.log('creating new user', username, '...')
      // console.log('user template:', body)
      // create user
      // const response = 
      await client.user.create(body)
      console.log('successfully created new user', username)
      // extract user ID
      // userId = response[0].links[0].href.split('/').pop()
      // console.log('Successfully created new user', username, ':', userId)
    } catch (e) {
      console.log('failed to create new user', username, ':', e.message)
      throw e
    }
  }

  // retrieve newly created or modified user details
  try {
    // wait for create/modify to be done
    await sleep(process.env.API_THROTTLE || 8000)
    // console.log('retrieving new user', username, ':', userId, '...')
    // get user
    const user = await client.user.get(userId)
    // console.log('returning new user', username, ':', userId)
    // return user
    return user.details.user
  } catch (e) {
    console.log('failed to get user', username, ':', e.message)
    throw e
  }
}
